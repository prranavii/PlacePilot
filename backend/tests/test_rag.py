import pytest
from sqlalchemy.orm import Session
from app.rag.embeddings import embedding_service
from app.rag.memory import save_memory, search_memory
from app.models.user import User

def test_embedding_service_dimension():
    text = "Dijkstra topological sort complexity"
    vec = embedding_service.get_embedding(text)
    assert isinstance(vec, list)
    assert len(vec) == 384
    # Elements should be floats
    assert all(isinstance(x, float) for x in vec)

def test_rag_save_and_hybrid_search(client, db: Session):
    # Register test user
    client.post(
        "/api/v1/auth/register",
        json={"email": "ragtest@placepilot.ai", "password": "password123", "full_name": "RAG Student"}
    )
    user = db.query(User).filter(User.email == "ragtest@placepilot.ai").first()
    assert user is not None
    
    # Save memories with different semantic topics
    save_memory(
        db=db,
        user_id=user.id,
        content_type="note",
        content="I failed graphs during mock interview because I forgot cycle checking in DFS."
    )
    save_memory(
        db=db,
        user_id=user.id,
        content_type="note",
        content="B+ Trees are utilized by databases for physical index disk layouts."
    )
    
    # Search for graph-related query
    graph_results = search_memory(db=db, user_id=user.id, query="cycle detection DFS", limit=1)
    assert len(graph_results) == 1
    assert "cycle checking in DFS" in graph_results[0].content
    
    # Search for database-related query
    db_results = search_memory(db=db, user_id=user.id, query="database indexes layout", limit=1)
    assert len(db_results) == 1
    assert "B+ Trees" in db_results[0].content

import logging
import uuid
from typing import List, Optional
import numpy as np
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.config import settings
from app.models.placement_memory import PlacementMemory
from app.rag.embeddings import embedding_service

logger = logging.getLogger(__name__)

def save_memory(
    db: Session,
    user_id: uuid.UUID,
    content_type: str,
    content: str,
    application_id: Optional[uuid.UUID] = None,
    metadata_info: Optional[dict] = None
) -> PlacementMemory:
    """
    Generates embedding and saves structured content into the PlacementMemory RAG database.
    """
    try:
        embedding = embedding_service.get_embedding(content)
    except Exception as e:
        logger.error(f"Failed to generate embedding for memory: {e}")
        embedding = [0.0] * 384
        
    db_memory = PlacementMemory(
        user_id=user_id,
        application_id=application_id,
        content_type=content_type,
        content=content,
        embedding=embedding,
        metadata_info=metadata_info or {}
    )
    db.add(db_memory)
    db.commit()
    db.refresh(db_memory)
    logger.info(f"Saved memory log. Type: '{content_type}', Length: {len(content)}")
    return db_memory

def search_memory(
    db: Session,
    user_id: uuid.UUID,
    query: str,
    limit: int = 5
) -> List[PlacementMemory]:
    """
    Searches placement memory using vector similarity. Supports native pgvector when running PostgreSQL
    and fell back to in-memory NumPy cosine similarity calculation when running on SQLite.
    """
    if not query or not query.strip():
        return []

    try:
        query_embedding = embedding_service.get_embedding(query)
    except Exception as e:
        logger.error(f"Failed to encode search query: {e}")
        return []

    # 1. Fallback local Python search if using SQLite
    if settings.DATABASE_URL.startswith("sqlite"):
        all_memories = db.query(PlacementMemory).filter(PlacementMemory.user_id == user_id).all()
        if not all_memories:
            return []

        scored_memories = []
        
        # Check if the embedding model loaded as fallback
        is_fallback = (embedding_service.model == "fallback")

        if is_fallback:
            logger.debug("Executing token-overlap matching because embedding model is in fallback mode.")
            # Extract query terms
            q_words = [w.strip(",.?!()\"'").lower() for w in query.split() if len(w.strip()) > 2]
            for mem in all_memories:
                m_words = [w.strip(",.?!()\"'").lower() for w in mem.content.split() if len(w.strip()) > 2]
                
                matches = 0
                for qw in q_words:
                    # Match if query word is a substring of memory word or vice-versa (basic stemming)
                    if any(qw in mw or mw in qw for mw in m_words):
                        matches += 1
                        
                score = matches / len(q_words) if q_words else 0.0
                scored_memories.append((score, mem))
        else:

            logger.debug("Executing local NumPy-based semantic vector cosine search.")
            q_vec = np.array(query_embedding)
            q_norm = np.linalg.norm(q_vec)

            for mem in all_memories:
                if not mem.embedding:
                    continue
                
                m_vec = np.array(mem.embedding)
                m_norm = np.linalg.norm(m_vec)
                
                if q_norm > 0 and m_norm > 0:
                    sim = float(np.dot(q_vec, m_vec) / (q_norm * m_norm))
                else:
                    sim = 0.0
                    
                scored_memories.append((sim, mem))

        # Sort by score descending
        scored_memories.sort(key=lambda x: x[0], reverse=True)
        return [mem for _, mem in scored_memories[:limit]]


    # 2. Optimized SQL pgvector distance search
    else:
        logger.debug("Executing SQL pgvector semantic distance query.")
        # Cosine distance in pgvector: <=> operator. Order by distance asc (most similar first)
        results = db.query(PlacementMemory).filter(
            PlacementMemory.user_id == user_id
        ).order_by(
            PlacementMemory.embedding.cosine_distance(query_embedding)
        ).limit(limit).all()
        return results

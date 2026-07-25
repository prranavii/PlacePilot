import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.placement_memory import PlacementMemory
from app.schemas.memory import MemoryOut
from app.rag.memory import search_memory
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/memory", tags=["memory"])

@router.get("", response_model=List[MemoryOut])
def read_memories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    memories = db.query(PlacementMemory).filter(PlacementMemory.user_id == current_user.id).order_by(PlacementMemory.created_at.desc()).all()
    return memories

@router.get("/search", response_model=List[MemoryOut])
def search_vector_memories(
    q: str = Query(..., min_length=1, description="Semantic query text"),
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Execute RAG semantic similarity search
    results = search_memory(db=db, user_id=current_user.id, query=q, limit=limit)
    return results

@router.delete("/{id}", response_model=MemoryOut)
def delete_memory_log(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    mem = db.query(PlacementMemory).filter(PlacementMemory.id == id).first()
    if not mem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Memory log not found.")
    if mem.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")
        
    db.delete(mem)
    db.commit()
    return mem

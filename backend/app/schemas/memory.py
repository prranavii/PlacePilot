import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class MemoryOut(BaseModel):
    id: uuid.UUID
    application_id: Optional[uuid.UUID] = None
    content_type: str
    content: str
    metadata_info: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

class MemorySearchQuery(BaseModel):
    query: str = Field(..., min_length=1)
    limit: int = Field(5, ge=1, le=20)

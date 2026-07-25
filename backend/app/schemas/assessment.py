import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class AssessmentBase(BaseModel):
    test_date: datetime
    platform: Optional[str] = None
    duration_mins: Optional[int] = None
    topic: Optional[str] = None
    score: Optional[float] = None
    status: str = Field("Completed", description="Completed, Passed, Failed, Pending")
    questions_encountered: Optional[List[Dict[str, Any]]] = None # [{"question": "...", "solved": bool, "topic": "..."}]
    weaknesses_identified: Optional[List[str]] = None
    notes: Optional[str] = None

class AssessmentCreate(AssessmentBase):
    application_id: uuid.UUID

class AssessmentUpdate(BaseModel):
    test_date: Optional[datetime] = None
    platform: Optional[str] = None
    duration_mins: Optional[int] = None
    topic: Optional[str] = None
    score: Optional[float] = None
    status: Optional[str] = None
    questions_encountered: Optional[List[Dict[str, Any]]] = None
    weaknesses_identified: Optional[List[str]] = None
    notes: Optional[str] = None

class AssessmentOut(AssessmentBase):
    id: uuid.UUID
    application_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True

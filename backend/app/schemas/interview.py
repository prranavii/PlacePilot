import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class InterviewBase(BaseModel):
    round_number: int = Field(1, ge=1)
    round_type: str = Field("Technical", description="Technical, HR, CS Fundamentals, DSA, Managerial")
    date: datetime
    status: str = Field("Completed", description="Scheduled, Completed, Cancelled")
    notes: Optional[str] = None
    
    # Feedback & Evaluation
    feedback: Optional[str] = None
    technical_score: Optional[float] = Field(None, ge=0.0, le=10.0)
    communication_score: Optional[float] = Field(None, ge=0.0, le=10.0)
    conceptual_depth: Optional[float] = Field(None, ge=0.0, le=10.0)
    problem_solving_score: Optional[float] = Field(None, ge=0.0, le=10.0)
    
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    missed_concepts: Optional[List[str]] = None
    recommendations: Optional[str] = None
    is_mock: bool = False

class InterviewCreate(InterviewBase):
    application_id: Optional[uuid.UUID] = None

class InterviewUpdate(BaseModel):
    round_number: Optional[int] = None
    round_type: Optional[str] = None
    date: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    feedback: Optional[str] = None
    technical_score: Optional[float] = None
    communication_score: Optional[float] = None
    conceptual_depth: Optional[float] = None
    problem_solving_score: Optional[float] = None
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    missed_concepts: Optional[List[str]] = None
    recommendations: Optional[str] = None

class InterviewOut(InterviewBase):
    id: uuid.UUID
    application_id: Optional[uuid.UUID]
    user_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True

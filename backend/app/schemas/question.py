import uuid
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field

class QuestionBase(BaseModel):
    company_name: Optional[str] = None
    role: Optional[str] = None
    round_type: Optional[str] = None
    topic: str = Field(..., min_length=1)
    subtopic: Optional[str] = None
    difficulty: str = Field("Medium", description="Easy, Medium, Hard")
    question_text: str = Field(..., min_length=1)
    source: str = Field("real_interview", description="real_interview, mock, OA, online_prep")
    date_encountered: Optional[date] = None
    solved: bool = True
    confidence_level: int = Field(3, ge=1, le=5)
    user_notes: Optional[str] = None
    ai_explanation: Optional[str] = None
    last_revised: Optional[date] = None
    revision_count: int = 0

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    company_name: Optional[str] = None
    role: Optional[str] = None
    round_type: Optional[str] = None
    topic: Optional[str] = None
    subtopic: Optional[str] = None
    difficulty: Optional[str] = None
    question_text: Optional[str] = None
    source: Optional[str] = None
    date_encountered: Optional[date] = None
    solved: Optional[bool] = None
    confidence_level: Optional[int] = None
    user_notes: Optional[str] = None
    ai_explanation: Optional[str] = None
    last_revised: Optional[date] = None
    revision_count: Optional[int] = None

class QuestionOut(QuestionBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True


import uuid
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, Field

class TopicPerformanceBase(BaseModel):
    category: str = Field(..., description="DSA, Java, CS Fundamentals, System Design, etc.")
    topic_name: str = Field(..., description="Arrays, DBMS indexing, Graphs, etc.")
    attempts: int = Field(0, ge=0)
    success_rate: float = Field(0.0, ge=0.0, le=1.0)
    confidence_level: int = Field(3, ge=1, le=5)
    mock_performance_score: float = Field(0.0, ge=0.0, le=100.0)
    interview_performance_score: float = Field(0.0, ge=0.0, le=100.0)
    last_revised: Optional[date] = None
    weakness_frequency: int = Field(0, ge=0)
    readiness_score: float = Field(50.0, ge=0.0, le=100.0)

class TopicPerformanceCreate(TopicPerformanceBase):
    pass

class TopicPerformanceUpdate(BaseModel):
    category: Optional[str] = None
    topic_name: Optional[str] = None
    attempts: Optional[int] = None
    success_rate: Optional[float] = None
    confidence_level: Optional[int] = None
    mock_performance_score: Optional[float] = None
    interview_performance_score: Optional[float] = None
    last_revised: Optional[date] = None
    weakness_frequency: Optional[int] = None
    readiness_score: Optional[float] = None

class TopicPerformanceOut(TopicPerformanceBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

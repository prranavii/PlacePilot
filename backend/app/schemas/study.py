import uuid
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field

# Study Task Schemas
class StudyTaskBase(BaseModel):
    title: str = Field(..., min_length=1)
    topic: Optional[str] = None
    company_name: Optional[str] = None
    priority: str = Field("Medium", description="Low, Medium, High")
    estimated_duration_mins: Optional[int] = None
    deadline: Optional[date] = None
    status: str = Field("Todo", description="Todo, In_Progress, Completed")
    source_reason: Optional[str] = None
    ai_generated: bool = False

class StudyTaskCreate(StudyTaskBase):
    application_id: Optional[uuid.UUID] = None

class StudyTaskUpdate(BaseModel):
    title: Optional[str] = None
    topic: Optional[str] = None
    company_name: Optional[str] = None
    priority: Optional[str] = None
    estimated_duration_mins: Optional[int] = None
    deadline: Optional[date] = None
    status: Optional[str] = None
    source_reason: Optional[str] = None
    ai_generated: Optional[bool] = None

class StudyTaskOut(StudyTaskBase):
    id: uuid.UUID
    user_id: uuid.UUID
    study_plan_id: Optional[uuid.UUID]
    application_id: Optional[uuid.UUID]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Study Plan Schemas
class StudyPlanBase(BaseModel):
    title: str = "Interview Preparation Plan"
    target_date: Optional[date] = None
    readiness_at_generation: float = 50.0
    weak_areas: Optional[List[str]] = None
    today_mission: Optional[List[str]] = None
    ai_insight: Optional[str] = None
    active: bool = True

class StudyPlanCreate(StudyPlanBase):
    application_id: uuid.UUID

class StudyPlanUpdate(BaseModel):
    title: Optional[str] = None
    target_date: Optional[date] = None
    readiness_at_generation: Optional[float] = None
    weak_areas: Optional[List[str]] = None
    today_mission: Optional[List[str]] = None
    ai_insight: Optional[str] = None
    active: Optional[bool] = None

class StudyPlanOut(StudyPlanBase):
    id: uuid.UUID
    application_id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    tasks: List[StudyTaskOut] = []

    class Config:
        from_attributes = True

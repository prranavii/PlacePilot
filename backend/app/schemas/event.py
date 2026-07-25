import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class ApplicationEventBase(BaseModel):
    event_type: str = Field(..., description="OA Scheduled, Interview Scheduled, Offer Received, etc.")
    event_date: datetime
    status: str = Field("Scheduled", description="Scheduled, Completed, Cancelled")
    details: Optional[str] = None

class ApplicationEventCreate(ApplicationEventBase):
    application_id: uuid.UUID

class ApplicationEventUpdate(BaseModel):
    event_type: Optional[str] = None
    event_date: Optional[datetime] = None
    status: Optional[str] = None
    details: Optional[str] = None

class ApplicationEventOut(ApplicationEventBase):
    id: uuid.UUID
    application_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

import uuid
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field, HttpUrl

class ApplicationBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=255)
    role: str = Field(..., min_length=1, max_length=255)
    job_description: Optional[str] = None
    package_ctc: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    application_source: Optional[str] = None
    application_url: Optional[str] = None
    date_applied: Optional[date] = None
    deadline: Optional[date] = None
    current_stage: str = Field("Applied", description="Wishlist, Applied, Shortlisted, Online Assessment, Technical Interview, HR Interview, Offer, Rejected, Withdrawn")
    notes: Optional[str] = None
    priority: str = Field("Medium", description="Low, Medium, High")
    resume_version: Optional[str] = None
    skills_required: Optional[List[str]] = None
    personal_readiness: int = Field(50, ge=0, le=100)

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    company_name: Optional[str] = None
    role: Optional[str] = None
    job_description: Optional[str] = None
    package_ctc: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    application_source: Optional[str] = None
    application_url: Optional[str] = None
    date_applied: Optional[date] = None
    deadline: Optional[date] = None
    current_stage: Optional[str] = None
    notes: Optional[str] = None
    priority: Optional[str] = None
    resume_version: Optional[str] = None
    skills_required: Optional[List[str]] = None
    personal_readiness: Optional[int] = None

class ApplicationOut(ApplicationBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


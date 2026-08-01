import uuid
from datetime import datetime, date, timezone
from typing import Optional, List
from sqlalchemy import String, Text, Float, Date, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base

class StudyPlan(Base):
    __tablename__ = "study_plans"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    application_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), default="Interview Preparation Plan")
    target_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    readiness_at_generation: Mapped[float] = mapped_column(Float, default=50.0)
    
    weak_areas: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True) # e.g. ["Graph BFS", "DBMS Indexing"]
    today_mission: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True) # e.g. ["Solve 2 Graph problems", "Revise Indexing"]
    study_plan: Mapped[Optional[List[dict]]] = mapped_column(JSON, nullable=True)
    ai_insight: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    application = relationship("Application", back_populates="study_plans")
    tasks = relationship("StudyTask", back_populates="study_plan", cascade="all, delete-orphan")

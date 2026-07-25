import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy import String, Text, Integer, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base

class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    application_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    test_date: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    platform: Mapped[Optional[str]] = mapped_column(String(100), nullable=True) # HackerRank, CodeSignal, Mettl, etc.
    duration_mins: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    topic: Mapped[Optional[str]] = mapped_column(String(255), nullable=True) # DSA, Aptitude, CS Core
    score: Mapped[Optional[float]] = mapped_column(Float, nullable=True) # percentage or absolute score
    status: Mapped[str] = mapped_column(String(50), default="Completed") # Passed, Failed, Pending, Evaluated
    
    questions_encountered: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, nullable=True) # List of dicts: {"question": "...", "solved": bool, "topic": "..."}
    weaknesses_identified: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    application = relationship("Application", back_populates="assessments")

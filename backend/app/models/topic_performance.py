import uuid
from datetime import datetime, date, timezone
from typing import Optional
from sqlalchemy import String, Integer, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base

class TopicPerformance(Base):
    __tablename__ = "topic_performances"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False) # e.g. "DSA", "Java", "CS Fundamentals"
    topic_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True) # e.g. "Graphs", "DBMS indexing", "HashMap"
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    success_rate: Mapped[float] = mapped_column(Float, default=0.0) # 0.0 to 1.0
    confidence_level: Mapped[int] = mapped_column(Integer, default=3) # 1-5 scale
    mock_performance_score: Mapped[float] = mapped_column(Float, default=0.0) # 0.0 to 100.0
    interview_performance_score: Mapped[float] = mapped_column(Float, default=0.0) # 0.0 to 100.0
    last_revised: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    weakness_frequency: Mapped[int] = mapped_column(Integer, default=0)
    readiness_score: Mapped[float] = mapped_column(Float, default=50.0) # Calculated metric 0.0 to 100.0
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="topic_performances")

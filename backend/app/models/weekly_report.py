import uuid
from datetime import datetime, date, timezone
from typing import Optional, List
from sqlalchemy import String, Text, Integer, Float, Date, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base

class WeeklyReport(Base):
    __tablename__ = "weekly_reports"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    
    applications_count: Mapped[int] = mapped_column(Integer, default=0)
    oa_success_rate: Mapped[float] = mapped_column(Float, default=0.0)
    readiness_score: Mapped[float] = mapped_column(Float, default=0.0)
    
    biggest_improvement: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    needs_attention: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    recurring_issues: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    recommended_focus: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    
    report_text: Mapped[Text] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="weekly_reports")


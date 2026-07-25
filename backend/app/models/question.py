import uuid
from datetime import datetime, date, timezone
from typing import Optional
from sqlalchemy import String, Text, Integer, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base

class Question(Base):
    __tablename__ = "questions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    company_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    role: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    round_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True) # OA, Technical, HR
    topic: Mapped[str] = mapped_column(String(100), nullable=False, index=True) # e.g. Graphs, OS, DBMS, Java
    subtopic: Mapped[Optional[str]] = mapped_column(String(100), nullable=True) # e.g. Dijkstra, Deadlocks, Indexing
    difficulty: Mapped[str] = mapped_column(String(50), default="Medium") # Easy, Medium, Hard
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    source: Mapped[str] = mapped_column(String(100), default="real_interview") # real_interview, mock, OA, online_prep
    date_encountered: Mapped[Optional[date]] = mapped_column(Date, default=lambda: datetime.now(timezone.utc).date())
    solved: Mapped[bool] = mapped_column(Boolean, default=True)
    confidence_level: Mapped[int] = mapped_column(Integer, default=3) # 1-5 scale
    user_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ai_explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    last_revised: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    revision_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="questions")


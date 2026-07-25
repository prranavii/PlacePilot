import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base
from app.core.config import settings

if settings.DATABASE_URL.startswith("sqlite"):
    from sqlalchemy import JSON as SQLiteJSON
    EmbeddingType = SQLiteJSON
else:
    from pgvector.sqlalchemy import Vector
    EmbeddingType = Vector(384)

class PlacementMemory(Base):
    __tablename__ = "placement_memories"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    application_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("applications.id", ondelete="SET NULL"), nullable=True, index=True)
    
    content_type: Mapped[str] = mapped_column(String(100), index=True) # e.g. "interview_feedback", "assessment_feedback", "note"
    content: Mapped[str] = mapped_column(Text, nullable=False)
    
    # 384-dimensional vector embedding (for sentence-transformers all-MiniLM-L6-v2)
    embedding = mapped_column(EmbeddingType, nullable=True)

    
    metadata_info: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True) # Renamed to avoid name conflicts with Base.metadata
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="memories")
    application = relationship("Application")

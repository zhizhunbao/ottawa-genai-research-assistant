"""
Feedback Data Model

Database model for storing user feedback on AI responses.

@template A9 backend/domain/models.py — SQLAlchemy ORM Model
"""

from datetime import UTC, datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.utils import generate_uuid


class Feedback(Base):
    """用户反馈模型"""

    __tablename__ = "feedback"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
    )
    response_id: Mapped[str] = mapped_column(
        String(36),
        index=True,
        nullable=False,
    )
    user_id: Mapped[str | None] = mapped_column(
        String(36),
        index=True,
        nullable=True,
    )
    rating: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    categories: Mapped[str] = mapped_column(
        Text,
        default="",
        nullable=False,
    )
    comment: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

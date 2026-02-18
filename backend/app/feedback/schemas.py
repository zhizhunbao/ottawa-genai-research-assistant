"""
Feedback Schemas

Pydantic models for user feedback on AI responses.

@template A8 backend/domain/schemas.py — Pydantic Models
"""

from datetime import datetime
from enum import IntEnum

from pydantic import BaseModel, Field


class FeedbackRating(IntEnum):
    """反馈评分"""
    THUMBS_DOWN = -1
    NEUTRAL = 0
    THUMBS_UP = 1


class FeedbackCreate(BaseModel):
    """创建反馈请求"""
    response_id: str = Field(..., description="The response being rated")
    rating: FeedbackRating = Field(..., description="Rating: -1, 0, or 1")
    categories: list[str] = Field(
        default_factory=list,
        description="Feedback categories: inaccurate, incomplete, irrelevant, outdated, etc.",
    )
    comment: str | None = Field(None, max_length=1000, description="Optional detailed comment")


class FeedbackResponse(BaseModel):
    """反馈响应"""
    id: str
    response_id: str
    user_id: str | None
    rating: int
    categories: list[str]
    comment: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class FeedbackStats(BaseModel):
    """反馈统计"""
    total: int = Field(0, description="Total feedback count")
    thumbs_up: int = Field(0, description="Positive ratings")
    thumbs_down: int = Field(0, description="Negative ratings")
    neutral: int = Field(0, description="Neutral ratings")
    top_categories: list[dict[str, int]] = Field(
        default_factory=list,
        description="Most common feedback categories with counts",
    )
    avg_rating: float = Field(0.0, description="Average rating (-1 to 1)")

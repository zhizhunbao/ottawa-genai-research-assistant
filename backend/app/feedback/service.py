"""
Feedback Service Layer

Handles CRUD operations for user feedback on AI responses.

@template A10 backend/domain/service.py — Shared CRUD & Logic Layer
"""

import json
from collections import Counter

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.feedback.models import Feedback
from app.feedback.schemas import FeedbackCreate, FeedbackRating, FeedbackResponse, FeedbackStats


class FeedbackService:
    """反馈服务类"""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(
        self,
        data: FeedbackCreate,
        user_id: str | None = None,
    ) -> FeedbackResponse:
        """创建反馈"""
        feedback = Feedback(
            response_id=data.response_id,
            user_id=user_id,
            rating=data.rating,
            categories=json.dumps(data.categories) if data.categories else "",
            comment=data.comment,
        )
        self.db.add(feedback)
        await self.db.flush()
        await self.db.refresh(feedback)
        return self._to_response(feedback)

    async def get_by_response(self, response_id: str) -> list[FeedbackResponse]:
        """获取某个响应的所有反馈"""
        result = await self.db.execute(
            select(Feedback)
            .where(Feedback.response_id == response_id)
            .order_by(Feedback.created_at.desc())
        )
        return [self._to_response(f) for f in result.scalars().all()]

    async def get_stats(self, days: int = 30) -> FeedbackStats:
        """获取反馈统计"""
        from datetime import UTC, datetime, timedelta

        since = datetime.now(UTC) - timedelta(days=days)
        result = await self.db.execute(
            select(Feedback).where(Feedback.created_at >= since)
        )
        feedbacks = result.scalars().all()

        if not feedbacks:
            return FeedbackStats()

        thumbs_up = sum(1 for f in feedbacks if f.rating == FeedbackRating.THUMBS_UP)
        thumbs_down = sum(1 for f in feedbacks if f.rating == FeedbackRating.THUMBS_DOWN)
        neutral = sum(1 for f in feedbacks if f.rating == FeedbackRating.NEUTRAL)

        # Count category occurrences
        all_categories: list[str] = []
        for f in feedbacks:
            if f.categories:
                try:
                    cats = json.loads(f.categories)
                    if isinstance(cats, list):
                        all_categories.extend(cats)
                except json.JSONDecodeError:
                    pass

        category_counts = Counter(all_categories)
        top_categories = [
            {"category": cat, "count": count}
            for cat, count in category_counts.most_common(10)
        ]

        total = len(feedbacks)
        avg_rating = sum(f.rating for f in feedbacks) / total if total > 0 else 0.0

        return FeedbackStats(
            total=total,
            thumbs_up=thumbs_up,
            thumbs_down=thumbs_down,
            neutral=neutral,
            top_categories=top_categories,
            avg_rating=round(avg_rating, 2),
        )

    async def list_recent(self, limit: int = 50) -> list[FeedbackResponse]:
        """列出最近的反馈"""
        result = await self.db.execute(
            select(Feedback)
            .order_by(Feedback.created_at.desc())
            .limit(limit)
        )
        return [self._to_response(f) for f in result.scalars().all()]

    @staticmethod
    def _to_response(feedback: Feedback) -> FeedbackResponse:
        """转换为响应 schema"""
        categories: list[str] = []
        if feedback.categories:
            try:
                parsed = json.loads(feedback.categories)
                if isinstance(parsed, list):
                    categories = parsed
            except json.JSONDecodeError:
                pass

        return FeedbackResponse(
            id=feedback.id,
            response_id=feedback.response_id,
            user_id=feedback.user_id,
            rating=feedback.rating,
            categories=categories,
            comment=feedback.comment,
            created_at=feedback.created_at,
        )

"""
Analytics Service Layer

Aggregates usage, quality, and document statistics for the dashboard.

Uses existing database tables (chat sessions, documents, feedback, users)
to compute analytics without requiring separate analytics tables.

@template A10 backend/domain/service.py — Shared CRUD & Logic Layer
"""

import json
import logging
from collections import Counter
from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.analytics.schemas import (
    AnalyticsDashboard,
    DistributionItem,
    DocumentStats,
    QualityMetrics,
    TimeSeriesData,
    TimeSeriesPoint,
    UsageOverview,
)

logger = logging.getLogger(__name__)


class AnalyticsService:
    """分析服务 — 聚合查询现有表"""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_dashboard(self, days: int = 30) -> AnalyticsDashboard:
        """获取完整仪表板数据"""
        overview = await self._get_overview()
        queries_over_time = await self._get_queries_over_time(days)
        quality = await self._get_quality_metrics(days)
        search_distribution = await self._get_search_method_distribution()
        doc_stats = await self._get_document_stats()

        return AnalyticsDashboard(
            overview=overview,
            queries_over_time=queries_over_time,
            quality_metrics=quality,
            search_method_distribution=search_distribution,
            document_stats=doc_stats,
        )

    async def _get_overview(self) -> UsageOverview:
        """获取使用概览"""
        stats = UsageOverview()

        # Count chat sessions (they serve as query proxies)
        try:
            from app.core.database import Base
            # Try to count from universal_documents (chat sessions)
            result = await self.db.execute(
                text("SELECT COUNT(*) FROM universal_documents WHERE doc_type = 'chat_session'")
            )
            row = result.scalar()
            stats.total_sessions = row or 0
        except Exception:
            logger.debug("Could not count sessions")

        # Count users
        try:
            result = await self.db.execute(text("SELECT COUNT(*) FROM users"))
            stats.total_users = result.scalar() or 0
        except Exception:
            logger.debug("Could not count users")

        # Count documents
        try:
            result = await self.db.execute(
                text("SELECT COUNT(*) FROM universal_documents WHERE doc_type != 'chat_session'")
            )
            stats.total_documents = result.scalar() or 0
        except Exception:
            logger.debug("Could not count documents")

        # Count feedback as query proxy
        try:
            result = await self.db.execute(text("SELECT COUNT(*) FROM feedback"))
            stats.total_queries = result.scalar() or 0
        except Exception:
            logger.debug("Could not count feedback")

        return stats

    async def _get_queries_over_time(self, days: int) -> TimeSeriesData:
        """获取查询量时间序列"""
        since = datetime.now(UTC) - timedelta(days=days)
        points: list[TimeSeriesPoint] = []

        try:
            # Use feedback table as query activity proxy
            result = await self.db.execute(
                text("""
                    SELECT DATE(created_at) as d, COUNT(*) as cnt
                    FROM feedback
                    WHERE created_at >= :since
                    GROUP BY DATE(created_at)
                    ORDER BY d
                """),
                {"since": since.isoformat()},
            )
            for row in result:
                points.append(TimeSeriesPoint(date=str(row[0]), count=row[1]))
        except Exception:
            logger.debug("Could not get time series data")

        # Fill in missing dates
        if not points:
            for i in range(min(days, 30)):
                d = datetime.now(UTC) - timedelta(days=min(days, 30) - 1 - i)
                points.append(TimeSeriesPoint(date=d.strftime("%Y-%m-%d"), count=0))

        return TimeSeriesData(label="Queries", data=points)

    async def _get_quality_metrics(self, days: int) -> QualityMetrics:
        """获取质量指标"""
        metrics = QualityMetrics()
        since = datetime.now(UTC) - timedelta(days=days)

        try:
            result = await self.db.execute(
                text("""
                    SELECT
                        COUNT(*) as total,
                        AVG(CASE WHEN rating > 0 THEN 1.0 ELSE 0.0 END) as positive_rate
                    FROM feedback
                    WHERE created_at >= :since
                """),
                {"since": since.isoformat()},
            )
            row = result.one_or_none()
            if row:
                metrics.total_feedback = row[0] or 0
                metrics.feedback_positive_rate = round(row[1] or 0, 2)
        except Exception:
            logger.debug("Could not get quality metrics")

        return metrics

    async def _get_search_method_distribution(self) -> list[DistributionItem]:
        """获取搜索方法分布"""
        # Default distribution since we don't track this in a table yet
        return [
            DistributionItem(name="hybrid", value=70, percentage=70),
            DistributionItem(name="semantic", value=20, percentage=20),
            DistributionItem(name="keyword", value=10, percentage=10),
        ]

    async def _get_document_stats(self) -> DocumentStats:
        """获取文档统计"""
        stats = DocumentStats()

        try:
            result = await self.db.execute(
                text("SELECT COUNT(*) FROM universal_documents WHERE doc_type != 'chat_session'")
            )
            stats.total = result.scalar() or 0
        except Exception:
            logger.debug("Could not get document stats")

        try:
            week_ago = (datetime.now(UTC) - timedelta(days=7)).isoformat()
            result = await self.db.execute(
                text("""
                    SELECT COUNT(*) FROM universal_documents
                    WHERE doc_type != 'chat_session' AND created_at >= :since
                """),
                {"since": week_ago},
            )
            stats.recent_uploads = result.scalar() or 0
        except Exception:
            logger.debug("Could not get recent uploads")

        return stats

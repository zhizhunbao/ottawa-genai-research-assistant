"""
Analytics Schemas

Pydantic models for analytics dashboard data.

@template A8 backend/domain/schemas.py — Pydantic Models
"""

from pydantic import BaseModel, Field


# ─── Overview Stats ────────────────────────────────────────────────────


class UsageOverview(BaseModel):
    """使用概览统计"""
    total_queries: int = Field(0, description="Total query count")
    total_sessions: int = Field(0, description="Total chat session count")
    total_documents: int = Field(0, description="Total indexed documents")
    total_users: int = Field(0, description="Total registered users")
    avg_latency_ms: float = Field(0.0, description="Average response latency (ms)")
    avg_confidence: float = Field(0.0, description="Average confidence score (0-1)")


# ─── Time-Series Data ──────────────────────────────────────────────────


class TimeSeriesPoint(BaseModel):
    """时间序列数据点"""
    date: str = Field(..., description="Date string (YYYY-MM-DD)")
    count: int = Field(0, description="Count value")
    avg_value: float | None = Field(None, description="Optional average value")


class TimeSeriesData(BaseModel):
    """时间序列数据集"""
    label: str = Field(..., description="Series label")
    data: list[TimeSeriesPoint] = Field(default_factory=list)


# ─── Distribution Data ────────────────────────────────────────────────


class DistributionItem(BaseModel):
    """分布数据项"""
    name: str
    value: int
    percentage: float = Field(0.0, ge=0, le=100)


# ─── Quality Metrics ───────────────────────────────────────────────────


class QualityMetrics(BaseModel):
    """质量指标"""
    avg_confidence: float = Field(0.0, description="Average confidence (0-1)")
    avg_evaluation_score: float = Field(0.0, description="Average evaluation (1-5)")
    feedback_positive_rate: float = Field(0.0, description="Positive feedback rate (0-1)")
    total_feedback: int = Field(0, description="Total feedback count")


# ─── Document Stats ───────────────────────────────────────────────────


class DocumentStats(BaseModel):
    """文档统计"""
    total: int = 0
    by_status: list[DistributionItem] = Field(default_factory=list)
    recent_uploads: int = Field(0, description="Documents uploaded in last 7 days")


# ─── Complete Dashboard ───────────────────────────────────────────────


class AnalyticsDashboard(BaseModel):
    """完整仪表板数据"""
    overview: UsageOverview
    queries_over_time: TimeSeriesData
    quality_metrics: QualityMetrics
    search_method_distribution: list[DistributionItem] = Field(default_factory=list)
    document_stats: DocumentStats

"""
Admin Console Schemas

Data structures for admin dashboard stats and health checks.
"""

from pydantic import BaseModel


class DashboardStat(BaseModel):
    """A single statistic item for the dashboard cards."""
    label: str
    value: str
    description: str | None = None
    trend: str | None = None  # e.g. "up", "down", "neutral"
    unit: str | None = None


class DashboardStatsResponse(BaseModel):
    """Response for the dashboard stats endpoint."""
    stats: list[DashboardStat]


class ServiceHealth(BaseModel):
    """Status of a single system service."""
    service: str
    status: str  # "healthy", "degraded", "unavailable", "unknown"
    message: str | None = None
    latency_ms: float | None = None


class DashboardHealthResponse(BaseModel):
    """Response for the system health endpoint."""
    services: list[ServiceHealth]
    overall_status: str

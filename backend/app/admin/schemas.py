"""
Admin Console Schemas

Data structures for admin dashboard stats and health checks.
"""

from typing import Any, Optional
from pydantic import BaseModel, Field


class DashboardStat(BaseModel):
    """A single statistic item for the dashboard cards."""
    label: str
    value: str
    description: Optional[str] = None
    trend: Optional[str] = None  # e.g. "up", "down", "neutral"
    unit: Optional[str] = None


class DashboardStatsResponse(BaseModel):
    """Response for the dashboard stats endpoint."""
    stats: list[DashboardStat]


class ServiceHealth(BaseModel):
    """Status of a single system service."""
    service: str
    status: str  # "healthy", "degraded", "unavailable", "unknown"
    message: Optional[str] = None
    latency_ms: Optional[float] = None


class DashboardHealthResponse(BaseModel):
    """Response for the system health endpoint."""
    services: list[ServiceHealth]
    overall_status: str

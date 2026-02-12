"""
Health Check Schemas

Pydantic models for health status reporting.

@template A8 backend/domain/schemas.py — Pydantic Models
"""

from enum import StrEnum

from pydantic import BaseModel


class HealthStatus(StrEnum):
    """Health status enum."""
    HEALTHY = "healthy"
    UNHEALTHY = "unhealthy"
    DEGRADED = "degraded"


class ServiceHealth(BaseModel):
    """Individual service health status."""
    name: str
    status: HealthStatus
    message: str | None = None
    latency_ms: float | None = None


class HealthCheckResponse(BaseModel):
    """Complete health check response."""
    status: HealthStatus
    version: str
    environment: str
    services: list[ServiceHealth]

    @property
    def is_healthy(self) -> bool:
        """Check if all services are healthy."""
        return self.status == HealthStatus.HEALTHY

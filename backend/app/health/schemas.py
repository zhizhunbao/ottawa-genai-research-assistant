"""Health check response schemas."""

from enum import Enum
from typing import Optional

from pydantic import BaseModel


class HealthStatus(str, Enum):
    """Health status enum."""
    HEALTHY = "healthy"
    UNHEALTHY = "unhealthy"
    DEGRADED = "degraded"


class ServiceHealth(BaseModel):
    """Individual service health status."""
    name: str
    status: HealthStatus
    message: Optional[str] = None
    latency_ms: Optional[float] = None


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

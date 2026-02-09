"""Health check API routes."""

from fastapi import APIRouter, Depends

from app.health.schemas import HealthCheckResponse, HealthStatus, ServiceHealth
from app.health.service import HealthCheckService

router = APIRouter(prefix="/health", tags=["Health"])


def get_health_service() -> HealthCheckService:
    """Dependency injection for health service."""
    return HealthCheckService()


@router.get(
    "",
    response_model=HealthCheckResponse,
    summary="Complete health check",
    description="Check health status of all Azure services",
)
async def health_check(
    service: HealthCheckService = Depends(get_health_service),
) -> HealthCheckResponse:
    """Check health of all services."""
    return await service.check_all()


@router.get(
    "/live",
    response_model=dict,
    summary="Liveness probe",
    description="Simple liveness check for Kubernetes",
)
async def liveness() -> dict:
    """Kubernetes liveness probe."""
    return {"status": "alive"}


@router.get(
    "/ready",
    response_model=dict,
    summary="Readiness probe",
    description="Readiness check - verifies all services are available",
)
async def readiness(
    service: HealthCheckService = Depends(get_health_service),
) -> dict:
    """Kubernetes readiness probe."""
    result = await service.check_all()
    if result.status == HealthStatus.HEALTHY:
        return {"status": "ready"}
    return {"status": "not_ready", "reason": result.status.value}


@router.get(
    "/storage",
    response_model=ServiceHealth,
    summary="Azure Storage health",
    description="Check Azure Blob Storage connection",
)
async def storage_health(
    service: HealthCheckService = Depends(get_health_service),
) -> ServiceHealth:
    """Check Azure Storage health."""
    return await service.check_storage()


@router.get(
    "/search",
    response_model=ServiceHealth,
    summary="Azure Search health",
    description="Check Azure AI Search connection",
)
async def search_health(
    service: HealthCheckService = Depends(get_health_service),
) -> ServiceHealth:
    """Check Azure AI Search health."""
    return await service.check_search()


@router.get(
    "/openai",
    response_model=ServiceHealth,
    summary="Azure OpenAI health",
    description="Check Azure OpenAI connection",
)
async def openai_health(
    service: HealthCheckService = Depends(get_health_service),
) -> ServiceHealth:
    """Check Azure OpenAI health."""
    return await service.check_openai()

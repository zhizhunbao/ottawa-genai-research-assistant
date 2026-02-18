"""
Admin Console Routes

API endpoints for the Admin Dashboard and configuration management.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.admin.schemas import DashboardStatsResponse, DashboardHealthResponse
from app.admin.service import AdminService
from app.core.database import get_db
from app.core.schemas import ApiResponse

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


def get_admin_service(db: AsyncSession = Depends(get_db)) -> AdminService:
    """Dependency injection for AdminService."""
    return AdminService(db)


@router.get("/dashboard/stats", response_model=ApiResponse[DashboardStatsResponse])
async def get_dashboard_stats(
    service: AdminService = Depends(get_admin_service),
) -> ApiResponse[DashboardStatsResponse]:
    """Get summarized statistics for the admin dashboard."""
    result = await service.get_dashboard_stats()
    return ApiResponse.ok(result)


@router.get("/dashboard/health", response_model=ApiResponse[DashboardHealthResponse])
async def get_system_health(
    service: AdminService = Depends(get_admin_service),
) -> ApiResponse[DashboardHealthResponse]:
    """Get system health and service reachability status."""
    result = await service.get_system_health()
    return ApiResponse.ok(result)

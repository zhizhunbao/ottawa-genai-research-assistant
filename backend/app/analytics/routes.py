"""
Analytics Routes

API endpoints for the analytics dashboard.

@template A7 backend/domain/router.py — API Routes
"""

from fastapi import APIRouter, Depends, Query

from app.core.dependencies import DbSession
from app.core.rbac import Permission, require_permission
from app.core.schemas import ApiResponse
from app.analytics.schemas import AnalyticsDashboard, UsageOverview
from app.analytics.service import AnalyticsService

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])


def get_analytics_service(db: DbSession) -> AnalyticsService:
    """获取分析服务实例"""
    return AnalyticsService(db)


@router.get(
    "/dashboard",
    response_model=ApiResponse[AnalyticsDashboard],
    dependencies=[Depends(require_permission(Permission.ADMIN_SETTINGS))],
)
async def get_dashboard(
    days: int = Query(30, ge=1, le=365, description="统计天数"),
    service: AnalyticsService = Depends(get_analytics_service),
) -> ApiResponse[AnalyticsDashboard]:
    """获取完整仪表板数据 (需要管理员权限)"""
    dashboard = await service.get_dashboard(days=days)
    return ApiResponse.ok(dashboard)


@router.get(
    "/overview",
    response_model=ApiResponse[UsageOverview],
    dependencies=[Depends(require_permission(Permission.ADMIN_SETTINGS))],
)
async def get_overview(
    service: AnalyticsService = Depends(get_analytics_service),
) -> ApiResponse[UsageOverview]:
    """获取使用概览 (需要管理员权限)"""
    overview = await service._get_overview()
    return ApiResponse.ok(overview)

"""
Feedback Routes

API endpoints for submitting and viewing user feedback on AI responses.

@template A7 backend/domain/router.py — API Routes
"""

from fastapi import APIRouter, Depends, Query

from app.core.dependencies import DbSession, OptionalCurrentUser
from app.core.rbac import Permission, require_permission
from app.core.schemas import ApiResponse
from app.feedback.schemas import FeedbackCreate, FeedbackResponse, FeedbackStats
from app.feedback.service import FeedbackService

router = APIRouter(prefix="/api/v1/feedback", tags=["feedback"])


def get_feedback_service(db: DbSession) -> FeedbackService:
    """获取反馈服务实例"""
    return FeedbackService(db)


@router.post("", response_model=ApiResponse[FeedbackResponse])
async def submit_feedback(
    data: FeedbackCreate,
    current_user: OptionalCurrentUser,
    service: FeedbackService = Depends(get_feedback_service),
) -> ApiResponse[FeedbackResponse]:
    """提交反馈 (无需登录也可提交)"""
    user_id = current_user.get("sub") if current_user else None
    feedback = await service.create(data, user_id=user_id)
    return ApiResponse.ok(feedback)


@router.get(
    "/response/{response_id}",
    response_model=ApiResponse[list[FeedbackResponse]],
)
async def get_response_feedback(
    response_id: str,
    service: FeedbackService = Depends(get_feedback_service),
) -> ApiResponse[list[FeedbackResponse]]:
    """获取某个响应的反馈"""
    feedbacks = await service.get_by_response(response_id)
    return ApiResponse.ok(feedbacks)


@router.get(
    "/stats",
    response_model=ApiResponse[FeedbackStats],
    dependencies=[Depends(require_permission(Permission.ADMIN_SETTINGS))],
)
async def get_feedback_stats(
    days: int = Query(30, ge=1, le=365, description="统计天数"),
    service: FeedbackService = Depends(get_feedback_service),
) -> ApiResponse[FeedbackStats]:
    """获取反馈统计 (需要管理员权限)"""
    stats = await service.get_stats(days=days)
    return ApiResponse.ok(stats)


@router.get(
    "/recent",
    response_model=ApiResponse[list[FeedbackResponse]],
    dependencies=[Depends(require_permission(Permission.ADMIN_SETTINGS))],
)
async def list_recent_feedback(
    limit: int = Query(50, ge=1, le=200, description="返回数量"),
    service: FeedbackService = Depends(get_feedback_service),
) -> ApiResponse[list[FeedbackResponse]]:
    """列出最近的反馈 (需要管理员权限)"""
    feedbacks = await service.list_recent(limit=limit)
    return ApiResponse.ok(feedbacks)

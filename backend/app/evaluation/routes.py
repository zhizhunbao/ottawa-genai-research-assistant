"""
LLM 评估 API 路由

US-303: 提供评估触发和结果查询端点。
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import OptionalCurrentUser, get_openai_service_optional
from app.core.schemas import ApiResponse
from app.evaluation.schemas import EvaluationRequest, EvaluationResult, EvaluationSummary
from app.evaluation.service import LLMEvaluationService

router = APIRouter(prefix="/api/v1/evaluation", tags=["evaluation"])


async def get_evaluation_service(
    db: AsyncSession = Depends(get_db),
    openai_service=Depends(get_openai_service_optional),
) -> LLMEvaluationService:
    return LLMEvaluationService(db=db, openai_service=openai_service)


@router.post("/evaluate", response_model=ApiResponse[EvaluationResult])
async def evaluate_response(
    request: EvaluationRequest,
    service: LLMEvaluationService = Depends(get_evaluation_service),
    current_user: OptionalCurrentUser = None,
) -> ApiResponse[EvaluationResult]:
    """评估单个 LLM 响应的质量（6 维度）"""
    result = await service.evaluate(request)
    return ApiResponse.ok(result)


@router.get("/summary", response_model=ApiResponse[EvaluationSummary])
async def get_evaluation_summary(
    service: LLMEvaluationService = Depends(get_evaluation_service),
    current_user: OptionalCurrentUser = None,
) -> ApiResponse[EvaluationSummary]:
    """获取评估汇总统计"""
    summary = await service.get_summary()
    return ApiResponse.ok(summary)

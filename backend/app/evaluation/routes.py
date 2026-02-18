"""
LLM 评估 API 路由

US-303: 提供评估触发和结果查询端点。

@template A7 backend/domain/router.py — API Routes
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


@router.get("/compare-strategies", response_model=ApiResponse)
async def compare_strategy_evaluations(
    query: str = "",
    limit: int = 20,
    service: LLMEvaluationService = Depends(get_evaluation_service),
    current_user: OptionalCurrentUser = None,
) -> ApiResponse:
    """Compare evaluation results across different strategies.

    If query is provided, filters evaluations matching that query text.
    Returns evaluations grouped by strategy for side-by-side comparison.
    """
    from sqlalchemy import desc, select

    from app.core.enums import DocumentType
    from app.core.models import UniversalDocument

    stmt = (
        select(UniversalDocument)
        .where(UniversalDocument.type == DocumentType.EVALUATION_RESULT)
        .order_by(desc(UniversalDocument.created_at))
        .limit(200)
    )
    result = await service.db.execute(stmt)
    docs = result.scalars().all()

    # Filter evaluations that have strategy metadata
    comparisons: list[dict] = []
    for doc in docs:
        data = doc.data or {}
        # Skip benchmark-level docs (they have "leaderboard" key)
        if "leaderboard" in data:
            continue
        # Skip docs without strategy info
        if not data.get("strategy_id"):
            continue
        # Filter by query if provided
        if query and query.lower() not in data.get("query", "").lower():
            continue

        comparisons.append({
            "evaluation_id": data.get("id"),
            "strategy_id": data.get("strategy_id"),
            "llm_model": data.get("llm_model"),
            "search_engine": data.get("search_engine"),
            "embedding_model": data.get("embedding_model"),
            "query": data.get("query"),
            "overall_score": data.get("overall_score"),
            "scores": data.get("scores"),
            "latency_ms": data.get("latency_ms"),
            "evaluated_at": data.get("evaluated_at"),
        })
        if len(comparisons) >= limit:
            break

    return ApiResponse.ok(comparisons)

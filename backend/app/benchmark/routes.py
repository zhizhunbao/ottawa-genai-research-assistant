"""
Benchmark API Routes

Endpoints for running benchmarks, viewing leaderboards,
listing available strategies, and comparing strategies side-by-side.

@template A7 backend/domain/router.py — API Routes
@reference auto-model-strategy-evaluation.md Phase B
"""

import logging
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.benchmark.schemas import (
    BenchmarkRequest,
    BenchmarkRun,
    CompareRequest,
    LeaderboardEntry,
    StrategyConfig,
    StrategyResult,
)
from app.benchmark.service import BenchmarkOrchestrator, DEFAULT_TEST_QUERIES
from app.core.database import get_db
from app.core.dependencies import OptionalCurrentUser, get_openai_service_optional
from app.core.enums import DocumentType
from app.core.models import UniversalDocument
from app.core.schemas import ApiResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/benchmark", tags=["benchmark"])


# ── Dependency ────────────────────────────────────────────────────────


async def get_orchestrator(
    db: AsyncSession = Depends(get_db),
    openai_service=Depends(get_openai_service_optional),
) -> BenchmarkOrchestrator:
    """Create BenchmarkOrchestrator with DB session and optional OpenAI."""
    return BenchmarkOrchestrator(db_session=db, openai_service=openai_service)


# ── Endpoints ─────────────────────────────────────────────────────────


@router.post("/run", response_model=ApiResponse[BenchmarkRun])
async def run_benchmark(
    request: BenchmarkRequest,
    orchestrator: BenchmarkOrchestrator = Depends(get_orchestrator),
    current_user: OptionalCurrentUser = None,
) -> ApiResponse[BenchmarkRun]:
    """Run a full benchmark across strategy combinations.

    Iterates over all (LLM × Embedding × SearchEngine) combos,
    runs test queries, evaluates answers using Judge LLM,
    and returns a ranked leaderboard.

    - If `strategies` is null, auto-generates all available combos.
    - If `queries` is null, uses the built-in test query set.
    """
    result = await orchestrator.run_benchmark(request)
    return ApiResponse.ok(result)


@router.get("/strategies", response_model=ApiResponse[list[StrategyConfig]])
async def list_available_strategies(
    max_count: int = 20,
    orchestrator: BenchmarkOrchestrator = Depends(get_orchestrator),
    current_user: OptionalCurrentUser = None,
) -> ApiResponse[list[StrategyConfig]]:
    """List all available strategy combinations.

    Auto-generates combos from registered LLMs, embedding providers,
    and search engines. Does not run any benchmark.
    """
    strategies = orchestrator.generate_strategies(max_count=max_count)
    return ApiResponse.ok(strategies)


@router.get("/test-queries")
async def list_test_queries(
    current_user: OptionalCurrentUser = None,
) -> ApiResponse:
    """List the built-in test queries used for benchmarking."""
    return ApiResponse.ok([q.model_dump() for q in DEFAULT_TEST_QUERIES])


@router.post("/compare", response_model=ApiResponse[list[StrategyResult]])
async def compare_strategies(
    request: CompareRequest,
    orchestrator: BenchmarkOrchestrator = Depends(get_orchestrator),
    current_user: OptionalCurrentUser = None,
) -> ApiResponse[list[StrategyResult]]:
    """Run a single query across specific strategies for side-by-side comparison.

    If strategy_ids is empty, uses the top 2 strategies from available combos.
    """
    from app.benchmark.schemas import BenchmarkQuery

    test_query = BenchmarkQuery(id="compare", query=request.query)

    # Get available strategies
    all_strategies = orchestrator.generate_strategies(max_count=20)

    if request.strategy_ids:
        selected = [s for s in all_strategies if s.id in request.strategy_ids]
    else:
        selected = all_strategies[:2]

    if not selected:
        return ApiResponse.ok([])

    results: list[StrategyResult] = []
    for strategy in selected:
        try:
            result = await orchestrator._run_single(strategy, test_query)
            results.append(result)
        except Exception as e:
            logger.error(f"Compare failed for {strategy.name}: {e}")
            results.append(
                StrategyResult(
                    strategy_id=strategy.id,
                    query_id=test_query.id,
                    query_text=request.query,
                    error=str(e),
                )
            )

    return ApiResponse.ok(results)


@router.get("/leaderboard", response_model=ApiResponse)
async def get_latest_leaderboard(
    db: AsyncSession = Depends(get_db),
    current_user: OptionalCurrentUser = None,
) -> ApiResponse:
    """Get the latest benchmark leaderboard.

    Returns the leaderboard from the most recent completed benchmark run.
    """
    stmt = (
        select(UniversalDocument)
        .where(UniversalDocument.type == DocumentType.EVALUATION_RESULT)
        .order_by(desc(UniversalDocument.created_at))
        .limit(20)
    )
    result = await db.execute(stmt)
    docs = result.scalars().all()

    # Find the first doc that has a "benchmark" tag
    for doc in docs:
        tags = doc.tags or []
        if "benchmark" in tags:
            run_data = doc.data or {}
            return ApiResponse.ok({
                "leaderboard": run_data.get("leaderboard", []),
                "benchmark_id": run_data.get("id"),
                "status": run_data.get("status"),
                "total_combinations": run_data.get("total_combinations"),
                "completed_at": run_data.get("completed_at"),
                "strategies_count": len(run_data.get("strategies", [])),
                "queries_count": len(run_data.get("queries", [])),
            })

    return ApiResponse.ok({
        "leaderboard": [],
        "message": "No benchmark runs yet. Use POST /benchmark/run to start one.",
    })


@router.get("/history", response_model=ApiResponse)
async def get_benchmark_history(
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    current_user: OptionalCurrentUser = None,
) -> ApiResponse:
    """Get recent benchmark run summaries."""
    stmt = (
        select(UniversalDocument)
        .where(UniversalDocument.type == DocumentType.EVALUATION_RESULT)
        .order_by(desc(UniversalDocument.created_at))
        .limit(50)
    )
    result = await db.execute(stmt)
    docs = result.scalars().all()

    history: list[dict[str, Any]] = []
    for doc in docs:
        tags = doc.tags or []
        if "benchmark" not in tags:
            continue
        data = doc.data or {}
        leaderboard = data.get("leaderboard", [])
        top_strategy = leaderboard[0] if leaderboard else None

        history.append({
            "id": data.get("id"),
            "status": data.get("status"),
            "strategies_count": len(data.get("strategies", [])),
            "queries_count": len(data.get("queries", [])),
            "top_strategy": (
                top_strategy.get("strategy", {}).get("name") if top_strategy else None
            ),
            "top_score": (
                top_strategy.get("overall_score") if top_strategy else None
            ),
            "completed_at": data.get("completed_at"),
            "created_at": str(doc.created_at),
        })
        if len(history) >= limit:
            break

    return ApiResponse.ok(history)

"""
Search Engine Admin Routes

Admin API endpoints for search engine management.

@template A7 backend/domain/router.py — API Routes
"""

import logging
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.core.schemas import ApiResponse
from app.search.engine import search_router

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/admin/search-engines", tags=["admin:search"])


# ── Schemas ──────────────────────────────────────────────────────────


class EngineInfo(BaseModel):
    """Search engine information."""
    name: str
    available: bool = True
    stats: dict[str, Any] | None = None


class SearchTestRequest(BaseModel):
    """Request to test search on an engine."""
    query: str = Field(..., min_length=1)
    top_k: int = Field(default=5, ge=1, le=50)


class SearchTestResult(BaseModel):
    """Search test result."""
    engine: str
    query: str
    results: list[dict[str, Any]]
    result_count: int


class HybridSearchTestRequest(BaseModel):
    """Request to test hybrid search."""
    query: str = Field(..., min_length=1)
    engines: list[str] = Field(default_factory=list)
    top_k: int = Field(default=5, ge=1, le=50)


# ── Routes ───────────────────────────────────────────────────────────


@router.get("", response_model=ApiResponse[list[EngineInfo]])
async def list_engines() -> ApiResponse[list[EngineInfo]]:
    """
    List all registered search engines with their stats.

    Returns status and statistics for each engine.
    """
    engines: list[EngineInfo] = []

    for name in search_router.available_engines:
        engine = search_router.get_engine(name)
        if not engine:
            continue

        try:
            stats = await engine.get_stats()
            engines.append(EngineInfo(
                name=name,
                available=True,
                stats=stats,
            ))
        except Exception as e:
            logger.warning(f"Failed to get stats for {name}: {e}")
            engines.append(EngineInfo(
                name=name,
                available=False,
                stats={"error": str(e)},
            ))

    return ApiResponse.ok(engines)


@router.get("/{engine_name}/stats", response_model=ApiResponse[dict[str, Any]])
async def get_engine_stats(engine_name: str) -> ApiResponse[dict[str, Any]]:
    """
    Get detailed statistics for a specific engine.
    """
    engine = search_router.get_engine(engine_name)
    if not engine:
        return ApiResponse.ok({"error": f"Engine '{engine_name}' not found"})

    try:
        stats = await engine.get_stats()
        return ApiResponse.ok(stats)
    except Exception as e:
        return ApiResponse.ok({"error": str(e), "status": "unavailable"})


@router.post("/{engine_name}/test", response_model=ApiResponse[SearchTestResult])
async def test_engine(
    engine_name: str,
    request: SearchTestRequest,
) -> ApiResponse[SearchTestResult]:
    """
    Test search on a specific engine.

    Returns search results for the given query.
    """
    engine = search_router.get_engine(engine_name)
    if not engine:
        return ApiResponse.ok(SearchTestResult(
            engine=engine_name,
            query=request.query,
            results=[],
            result_count=0,
        ))

    try:
        results = await engine.search(
            query=request.query,
            top_k=request.top_k,
        )
        return ApiResponse.ok(SearchTestResult(
            engine=engine_name,
            query=request.query,
            results=[r.to_dict() for r in results],
            result_count=len(results),
        ))
    except Exception as e:
        logger.exception(f"Search test failed for {engine_name}")
        return ApiResponse.ok(SearchTestResult(
            engine=engine_name,
            query=request.query,
            results=[{"error": str(e)}],
            result_count=0,
        ))


@router.post("/hybrid-test", response_model=ApiResponse[SearchTestResult])
async def test_hybrid_search(
    request: HybridSearchTestRequest,
) -> ApiResponse[SearchTestResult]:
    """
    Test hybrid search across multiple engines.

    Uses RRF (Reciprocal Rank Fusion) to merge results.
    """
    engines = request.engines or search_router.available_engines

    try:
        results = await search_router.hybrid_search(
            query=request.query,
            engines=engines,
            top_k=request.top_k,
        )
        return ApiResponse.ok(SearchTestResult(
            engine="hybrid:" + "+".join(engines),
            query=request.query,
            results=[r.to_dict() for r in results],
            result_count=len(results),
        ))
    except Exception as e:
        logger.exception("Hybrid search test failed")
        return ApiResponse.ok(SearchTestResult(
            engine="hybrid",
            query=request.query,
            results=[{"error": str(e)}],
            result_count=0,
        ))


@router.get("/all-stats", response_model=ApiResponse[dict[str, dict[str, Any]]])
async def get_all_stats() -> ApiResponse[dict[str, dict[str, Any]]]:
    """
    Get stats from all registered engines.
    """
    stats = await search_router.get_all_stats()
    return ApiResponse.ok(stats)

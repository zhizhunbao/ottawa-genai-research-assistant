"""
Model Management Routes

Admin API endpoints for LLM and embedding model management.

@template A7 backend/domain/router.py — API Routes
"""

import json
import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.core.schemas import ApiResponse
from app.models.schemas import (
    DeleteModelRequest,
    DiskUsageStats,
    HealthStatus,
    ModelDetail,
    ModelInfo,
    ModelType,
    PullModelRequest,
    RunningModel,
    TestModelRequest,
    TestResult,
)
from app.models.service import ModelService
from app.ollama.service import OllamaError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/admin/llm-models", tags=["admin:models"])


# ── List Models ──────────────────────────────────────────────────────


@router.get("", response_model=ApiResponse[list[ModelInfo]])
async def list_models(
    model_type: ModelType | None = None,
) -> ApiResponse[list[ModelInfo]]:
    """
    List all available LLM models.

    Returns models from all configured providers (Azure OpenAI, Ollama).
    Optionally filter by model type (llm or embedding).
    """
    service = ModelService()
    models = await service.list_models(model_type=model_type)
    return ApiResponse.ok(models)


@router.get("/llm", response_model=ApiResponse[list[ModelInfo]])
async def list_llm_models() -> ApiResponse[list[ModelInfo]]:
    """List LLM (chat) models only."""
    service = ModelService()
    models = await service.list_llm_models()
    return ApiResponse.ok(models)


@router.get("/embedding", response_model=ApiResponse[list[ModelInfo]])
async def list_embedding_models() -> ApiResponse[list[ModelInfo]]:
    """List embedding models only."""
    service = ModelService()
    models = await service.list_embedding_models()
    return ApiResponse.ok(models)


# ── Model Details ────────────────────────────────────────────────────


@router.get("/{model_name:path}/info", response_model=ApiResponse[ModelDetail])
async def get_model_info(model_name: str) -> ApiResponse[ModelDetail]:
    """
    Get detailed information about a specific model.

    For Ollama models, returns parameters, template, license, etc.
    For Azure models, returns basic configuration info.
    """
    service = ModelService()
    try:
        detail = await service.get_model_detail(model_name)
        return ApiResponse.ok(detail)
    except OllamaError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ── Pull Model ───────────────────────────────────────────────────────


@router.post("/pull")
async def pull_model(request: PullModelRequest) -> StreamingResponse:
    """
    Pull (download) a model from Ollama registry.

    Streams progress events as NDJSON:
    - {status: "pulling manifest"}
    - {status: "downloading", digest: "...", total: 1234, completed: 567, percent: 45.6}
    - {status: "verifying sha256 digest"}
    - {status: "success"}
    """
    service = ModelService()

    async def generate():
        try:
            async for progress in service.pull_model(request.name):
                yield json.dumps(progress.model_dump(), ensure_ascii=False) + "\n"
        except OllamaError as e:
            yield json.dumps({"status": "error", "error": str(e)}) + "\n"
        except Exception as e:
            logger.exception(f"Pull failed for {request.name}")
            yield json.dumps({"status": "error", "error": str(e)}) + "\n"

    return StreamingResponse(
        generate(),
        media_type="application/x-ndjson",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


# ── Delete Model ─────────────────────────────────────────────────────


@router.delete("/{model_name:path}", response_model=ApiResponse[bool])
async def delete_model(model_name: str) -> ApiResponse[bool]:
    """
    Delete a model from local Ollama storage.

    This permanently removes the model files from disk.
    """
    service = ModelService()
    try:
        result = await service.delete_model(model_name)
        return ApiResponse.ok(result)
    except OllamaError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ── Test Model ───────────────────────────────────────────────────────


@router.post("/test", response_model=ApiResponse[TestResult])
async def test_model(request: TestModelRequest) -> ApiResponse[TestResult]:
    """
    Test a model with a prompt.

    Sends a test prompt to the model and returns the response with latency.
    """
    service = ModelService()
    try:
        result = await service.test_model(
            model=request.model,
            prompt=request.prompt,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
        )
        return ApiResponse.ok(result)
    except OllamaError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Disk Usage ───────────────────────────────────────────────────────


@router.get("/disk-usage", response_model=ApiResponse[DiskUsageStats])
async def get_disk_usage() -> ApiResponse[DiskUsageStats]:
    """
    Get disk usage statistics for all Ollama models.

    Returns total size and per-model breakdown.
    """
    service = ModelService()
    stats = await service.get_disk_usage()
    return ApiResponse.ok(stats)


# ── Running Models ───────────────────────────────────────────────────


@router.get("/running", response_model=ApiResponse[list[RunningModel]])
async def get_running_models() -> ApiResponse[list[RunningModel]]:
    """
    Get models currently loaded in Ollama memory.

    These are models that have been recently used and are still in RAM.
    """
    service = ModelService()
    models = await service.get_running_models()
    return ApiResponse.ok(models)


# ── Health Check ─────────────────────────────────────────────────────


@router.get("/health", response_model=ApiResponse[list[HealthStatus]])
async def check_health() -> ApiResponse[list[HealthStatus]]:
    """
    Check health of all model providers.

    Returns status for Azure OpenAI and Ollama.
    """
    service = ModelService()
    status = await service.check_health()
    return ApiResponse.ok(status)

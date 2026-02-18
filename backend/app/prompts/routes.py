"""
Prompt Management Routes

Admin API endpoints for prompt template management.

@template A7 backend/domain/router.py — API Routes
"""

import logging
import time

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.schemas import ApiResponse
from app.ollama.service import OllamaError, OllamaService
from app.prompts.schemas import (
    PromptCategory,
    PromptCreate,
    PromptInfo,
    PromptListResponse,
    PromptTestRequest,
    PromptTestResult,
    PromptUpdate,
    PromptVersion,
)
from app.prompts.service import PromptService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/admin/prompts", tags=["admin:prompts"])


# ── List Prompts ─────────────────────────────────────────────────────


@router.get("", response_model=ApiResponse[PromptListResponse])
async def list_prompts(
    category: PromptCategory | None = None,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[PromptListResponse]:
    """
    List all prompt templates.

    Returns prompts from database merged with defaults.
    Defaults are used when no custom version exists.
    """
    service = PromptService(db)
    result = await service.list_prompts(category=category)
    return ApiResponse.ok(result)


# ── Get Prompt ───────────────────────────────────────────────────────


@router.get("/{prompt_id}", response_model=ApiResponse[PromptInfo])
async def get_prompt(
    prompt_id: str,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[PromptInfo]:
    """
    Get a specific prompt by ID.

    For default prompts, use 'default:{name}' format.
    """
    service = PromptService(db)
    prompt = await service.get_prompt(prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return ApiResponse.ok(prompt)


# ── Create Prompt ────────────────────────────────────────────────────


@router.post("", response_model=ApiResponse[PromptInfo])
async def create_prompt(
    data: PromptCreate,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[PromptInfo]:
    """
    Create a new prompt template.

    If the name matches a default prompt, this will override it.
    """
    service = PromptService(db)
    prompt = await service.create_prompt(data)
    return ApiResponse.ok(prompt)


# ── Update Prompt ────────────────────────────────────────────────────


@router.put("/{prompt_id}", response_model=ApiResponse[PromptInfo])
async def update_prompt(
    prompt_id: str,
    data: PromptUpdate,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[PromptInfo]:
    """
    Update a prompt template.

    Creates a new version while preserving history.
    For default prompts, this creates a custom override.
    """
    service = PromptService(db)
    prompt = await service.update_prompt(prompt_id, data)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return ApiResponse.ok(prompt)


# ── Delete Prompt ────────────────────────────────────────────────────


@router.delete("/{prompt_id}", response_model=ApiResponse[bool])
async def delete_prompt(
    prompt_id: str,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[bool]:
    """
    Delete a prompt template.

    Archives the prompt (can be restored).
    Default prompts cannot be deleted.
    """
    service = PromptService(db)
    result = await service.delete_prompt(prompt_id)
    if not result:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete this prompt (default or not found)",
        )
    return ApiResponse.ok(result)


# ── Get Versions ─────────────────────────────────────────────────────


@router.get("/{prompt_id}/versions", response_model=ApiResponse[list[PromptVersion]])
async def get_versions(
    prompt_id: str,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[list[PromptVersion]]:
    """
    Get version history for a prompt.

    Returns empty list for default prompts.
    """
    service = PromptService(db)
    versions = await service.get_versions(prompt_id)
    return ApiResponse.ok(versions)


# ── Test Prompt ──────────────────────────────────────────────────────


@router.post("/test", response_model=ApiResponse[PromptTestResult])
async def test_prompt(
    request: PromptTestRequest,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[PromptTestResult]:
    """
    Test a prompt with variable substitution.

    Optionally sends the rendered prompt to an LLM and returns the response.
    """
    service = PromptService(db)

    # Render the prompt
    rendered = await service.render_prompt(request.prompt_id, request.variables)
    if rendered is None:
        raise HTTPException(status_code=404, detail="Prompt not found")

    result = PromptTestResult(
        prompt_id=request.prompt_id,
        rendered=rendered,
        response=None,
        latency_ms=None,
    )

    # Optionally test with LLM
    if request.model:
        try:
            ollama = OllamaService(base_url=settings.ollama_base_url)
            start = time.perf_counter()
            response = await ollama.chat_completion(
                messages=[{"role": "user", "content": rendered}],
                model=request.model,
                max_tokens=200,
            )
            latency = (time.perf_counter() - start) * 1000
            result.response = response
            result.latency_ms = round(latency, 2)
        except OllamaError as e:
            logger.warning(f"Prompt test failed: {e}")
            result.response = f"Error: {e}"

    return ApiResponse.ok(result)


# ── Render Prompt ────────────────────────────────────────────────────


@router.post("/{prompt_id}/render", response_model=ApiResponse[str])
async def render_prompt(
    prompt_id: str,
    variables: dict[str, str],
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[str]:
    """
    Render a prompt with variables substituted.

    Returns the final prompt text ready for use.
    """
    service = PromptService(db)
    rendered = await service.render_prompt(prompt_id, variables)
    if rendered is None:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return ApiResponse.ok(rendered)

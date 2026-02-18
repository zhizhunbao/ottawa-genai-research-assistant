"""
Prompt Schemas

Pydantic models for prompt template management API.

@template A6 backend/domain/schemas.py — Pydantic Schemas
"""

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field


class PromptCategory(StrEnum):
    """Prompt category classification."""
    SYSTEM = "system"
    RAG_CONTEXT = "rag_context"
    CITATION = "citation"
    CHART = "chart"
    EVALUATION = "evaluation"
    NO_RESULTS = "no_results"
    CUSTOM = "custom"


class PromptStatus(StrEnum):
    """Prompt status."""
    ACTIVE = "active"
    DRAFT = "draft"
    ARCHIVED = "archived"


# ── Request Schemas ──────────────────────────────────────────────────


class PromptCreate(BaseModel):
    """Request to create a new prompt."""
    name: str = Field(..., min_length=1, max_length=100)
    category: PromptCategory
    template: str = Field(..., min_length=1)
    description: str | None = None
    variables: list[str] = Field(default_factory=list)


class PromptUpdate(BaseModel):
    """Request to update a prompt (creates new version)."""
    template: str = Field(..., min_length=1)
    description: str | None = None
    variables: list[str] | None = None


class PromptTestRequest(BaseModel):
    """Request to test a prompt with variables."""
    prompt_id: str
    variables: dict[str, str] = Field(default_factory=dict)
    model: str | None = None


# ── Response Schemas ─────────────────────────────────────────────────


class PromptInfo(BaseModel):
    """Basic prompt information."""
    id: str
    name: str
    category: PromptCategory
    template: str
    description: str | None = None
    variables: list[str] = Field(default_factory=list)
    version: int = 1
    status: PromptStatus = PromptStatus.ACTIVE
    is_default: bool = False
    created_at: datetime
    updated_at: datetime


class PromptVersion(BaseModel):
    """Prompt version history entry."""
    version: int
    template: str
    description: str | None = None
    created_at: datetime
    created_by: str | None = None


class PromptTestResult(BaseModel):
    """Result of prompt test."""
    prompt_id: str
    rendered: str
    response: str | None = None
    latency_ms: float | None = None


class PromptListResponse(BaseModel):
    """List of prompts grouped by category."""
    prompts: list[PromptInfo]
    total: int
    by_category: dict[str, int]

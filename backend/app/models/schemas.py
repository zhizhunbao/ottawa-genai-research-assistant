"""
Model Schemas

Pydantic models for LLM model management API.

@template A6 backend/domain/schemas.py — Pydantic Schemas
"""

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class ModelProvider(str, Enum):
    """Model provider type."""
    AZURE = "azure"
    OLLAMA = "ollama"


class ModelType(str, Enum):
    """Model type classification."""
    LLM = "llm"
    EMBEDDING = "embedding"


class ModelStatus(str, Enum):
    """Model availability status."""
    AVAILABLE = "available"
    DOWNLOADING = "downloading"
    NOT_FOUND = "not_found"
    ERROR = "error"


# ── Request Schemas ──────────────────────────────────────────────────


class PullModelRequest(BaseModel):
    """Request to pull/download a model."""
    name: str = Field(..., description="Model name (e.g. 'llama3.1:8b')")


class TestModelRequest(BaseModel):
    """Request to test a model with a prompt."""
    model: str = Field(..., description="Model name")
    prompt: str = Field(..., description="Test prompt")
    max_tokens: int = Field(default=100, ge=1, le=4096)
    temperature: float = Field(default=0.7, ge=0, le=2)


class DeleteModelRequest(BaseModel):
    """Request to delete a model."""
    name: str = Field(..., description="Model name to delete")


# ── Response Schemas ─────────────────────────────────────────────────


class ModelInfo(BaseModel):
    """Basic model information."""
    id: str
    name: str
    provider: ModelProvider
    model_type: ModelType = ModelType.LLM
    available: bool = True
    size: int | None = None
    size_formatted: str | None = None
    modified_at: str | None = None
    digest: str | None = None


class ModelDetail(BaseModel):
    """Detailed model information."""
    id: str
    name: str
    provider: ModelProvider
    model_type: ModelType = ModelType.LLM
    available: bool = True
    size: int | None = None
    size_formatted: str | None = None
    modified_at: str | None = None
    digest: str | None = None
    # Ollama-specific details
    parameters: dict[str, Any] | None = None
    template: str | None = None
    system: str | None = None
    license: str | None = None
    modelfile: str | None = None
    # Computed fields
    parameter_size: str | None = None
    quantization_level: str | None = None
    context_length: int | None = None


class PullProgress(BaseModel):
    """Model download progress event."""
    status: str
    digest: str | None = None
    total: int | None = None
    completed: int | None = None
    percent: float | None = None


class TestResult(BaseModel):
    """Model test result."""
    model: str
    prompt: str
    response: str
    latency_ms: float
    tokens_generated: int | None = None


class DiskUsageStats(BaseModel):
    """Disk usage statistics for models."""
    total_size: int
    total_size_formatted: str
    model_count: int
    models: list[ModelInfo]


class RunningModel(BaseModel):
    """Information about a model currently loaded in memory."""
    name: str
    size: int | None = None
    size_formatted: str | None = None
    expires_at: str | None = None


class HealthStatus(BaseModel):
    """Health check result for a model provider."""
    provider: ModelProvider
    available: bool
    message: str | None = None
    model_count: int = 0

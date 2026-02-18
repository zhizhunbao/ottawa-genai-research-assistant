"""
Knowledge Base Schemas

Pydantic models for knowledge base CRUD, pipeline operations, and search engine config.

@reference ragflow dataset-creating-dialog.tsx — KB creation fields
@reference rag-web-ui models/knowledge.py — KnowledgeBase + ProcessingTask
"""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


# ── Knowledge Base ────────────────────────────────────────────


class KBCreate(BaseModel):
    """Create a new knowledge base."""

    name: str = Field(..., min_length=1, max_length=255, description="Display name")
    description: str | None = Field(None, description="Optional description")
    type: str = Field(
        "manual_upload",
        description="KB type: url_catalog | manual_upload | web_link",
    )
    config: dict[str, Any] = Field(
        default_factory=dict,
        description="Type-specific config (URLs, scrape rules, etc.)",
    )
    folder_id: str | None = Field(None, description="Linked folder in sidebar")
    search_engines: list[str] = Field(
        default_factory=lambda: ["azure_search"],
        description="Enabled search engines: azure_search | sqlite_fts | page_index",
    )


class KBUpdate(BaseModel):
    """Update a knowledge base."""

    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    config: dict[str, Any] | None = None
    folder_id: str | None = None
    search_engines: list[str] | None = None
    status: str | None = None


class KBResponse(BaseModel):
    """Knowledge base response."""

    id: str
    name: str
    description: str | None = None
    type: str
    config: dict[str, Any] = {}
    folder_id: str | None = None
    search_engines: list[str] = []
    status: str = "active"
    doc_count: int = 0
    indexed_count: int = 0
    created_at: str
    updated_at: str


class KBListResponse(BaseModel):
    """List of knowledge bases."""

    items: list[KBResponse]
    total: int


# ── Pipeline ──────────────────────────────────────────────────


class PipelineStepStatus(BaseModel):
    """Status of a single pipeline step."""

    step: str  # download | extract | chunk | embed | index
    status: str  # pending | running | completed | failed | skipped
    progress: float = 0.0
    error: str | None = None
    started_at: str | None = None
    completed_at: str | None = None
    metadata: dict[str, Any] = {}


class PipelineStatusResponse(BaseModel):
    """Full pipeline status for a document."""

    document_id: str
    steps: list[PipelineStepStatus]
    overall_status: str  # pending | processing | indexed | failed


class PipelineRunRequest(BaseModel):
    """Request to run pipeline steps."""

    steps: list[str] | None = Field(
        None,
        description="Steps to run (null = all). Options: download, extract, chunk, embed, index",
    )
    engines: list[str] | None = Field(
        None,
        description="Target search engines for embed/index steps",
    )


class BatchPipelineRequest(BaseModel):
    """Batch pipeline operation on multiple documents."""

    document_ids: list[str] = Field(..., min_length=1)
    steps: list[str] | None = None
    engines: list[str] | None = None


# ── KB Document Management ────────────────────────────────────


class KBAddUrlRequest(BaseModel):
    """Add a URL source to a knowledge base."""

    url: str = Field(..., description="PDF URL to add")
    title: str | None = Field(None, description="Custom title")


class KBDocumentResponse(BaseModel):
    """Document within a knowledge base."""

    id: str
    title: str
    file_name: str | None = None
    url: str | None = None
    status: str
    file_size: int | None = None
    page_count: int | None = None
    chunk_count: int | None = None
    pipeline_steps: list[PipelineStepStatus] = []
    created_at: str
    updated_at: str


class KBDocumentListResponse(BaseModel):
    """List of documents in a KB."""

    kb_id: str
    items: list[KBDocumentResponse]
    total: int


# ── Search Engine Status ──────────────────────────────────────


class SearchEngineStats(BaseModel):
    """Stats for a single search engine."""

    engine: str
    indexed_count: int = 0
    total_chunks: int = 0
    status: str = "ready"  # ready | unavailable | indexing


class SearchEngineStatusResponse(BaseModel):
    """Status of all search engines."""

    engines: list[SearchEngineStats]

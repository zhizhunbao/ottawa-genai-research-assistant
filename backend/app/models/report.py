"""Report data models."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ReportMetadata(BaseModel):
    """Report metadata model."""

    period: str | None = None
    version: str | None = None
    pages: int | None = None
    word_count: int = 0
    section_count: int = 0


class Report(BaseModel):
    """Report model."""

    id: str
    user_id: str | None = None  # Optional for backward compatibility
    title: str
    description: str = ""
    content: str = ""
    type: str = Field(
        pattern="^(economic_summary|program_impact|innovation_analysis|custom)$"
    )
    language: str = Field(default="en", pattern="^(en|fr)$")
    status: str = Field(default="draft", pattern="^(draft|published|archived)$")
    created_at: datetime
    updated_at: datetime
    author: str
    summary: str
    sources: list[str] | None = Field(default_factory=list)
    format: str = Field(default="html", pattern="^(html|pdf|word)$")
    version: int = 1
    tags: list[str] = Field(default_factory=list)
    metadata: ReportMetadata = Field(default_factory=ReportMetadata)


class ReportRequest(BaseModel):
    """Report generation request model."""

    title: str
    type: str = Field(
        pattern="^(economic_summary|program_impact|innovation_analysis|custom)$"
    )
    language: str = Field(default="en", pattern="^(en|fr)$")
    parameters: dict[str, Any] | None = None
    template: str | None = None
    data_sources: list[str] | None = None


class ReportResponse(BaseModel):
    """Report generation response model."""

    report_id: str
    status: str
    message: str
    estimated_completion: datetime | None = None


class ReportSummary(BaseModel):
    """Report summary model."""

    id: str
    title: str
    type: str
    status: str
    created_at: datetime
    author: str
    language: str

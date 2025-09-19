"""Report data models."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ReportMetadata(BaseModel):
    """Report metadata model."""
    period: Optional[str] = None
    version: Optional[str] = None
    pages: Optional[int] = None


class Report(BaseModel):
    """Report model."""
    id: str
    title: str
    type: str = Field(pattern="^(economic_summary|program_impact|innovation_analysis|custom)$")
    language: str = Field(default="en", pattern="^(en|fr)$")
    status: str = Field(default="draft", pattern="^(draft|published|archived)$")
    created_at: datetime
    updated_at: datetime
    author: str
    summary: str
    tags: List[str] = Field(default_factory=list)
    metadata: ReportMetadata = Field(default_factory=ReportMetadata)


class ReportRequest(BaseModel):
    """Report generation request model."""
    title: str
    type: str = Field(pattern="^(economic_summary|program_impact|innovation_analysis|custom)$")
    language: str = Field(default="en", pattern="^(en|fr)$")
    parameters: Optional[Dict[str, Any]] = None
    template: Optional[str] = None
    data_sources: Optional[List[str]] = None


class ReportResponse(BaseModel):
    """Report generation response model."""
    report_id: str
    status: str
    message: str
    estimated_completion: Optional[datetime] = None


class ReportSummary(BaseModel):
    """Report summary model."""
    id: str
    title: str
    type: str
    status: str
    created_at: datetime
    author: str
    language: str 
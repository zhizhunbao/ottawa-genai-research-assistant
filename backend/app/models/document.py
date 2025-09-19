"""Document data models."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class DocumentMetadata(BaseModel):
    """Document metadata model."""

    pages: Optional[int] = None
    author: Optional[str] = None
    version: Optional[str] = None
    section: Optional[str] = None
    subsection: Optional[str] = None
    word_count: Optional[int] = None
    start_char: Optional[int] = None
    end_char: Optional[int] = None


class Document(BaseModel):
    """Document model."""

    id: str
    user_id: str  # 添加用户ID字段
    filename: str
    title: str
    description: str
    file_path: str
    file_size: int
    mime_type: str
    upload_date: datetime
    last_modified: datetime
    status: str = Field(
        default="pending", pattern="^(pending|processing|processed|error)$"
    )
    language: str = Field(default="en", pattern="^(en|fr)$")
    tags: List[str] = Field(default_factory=list)
    metadata: DocumentMetadata = Field(default_factory=DocumentMetadata)


class DocumentChunk(BaseModel):
    """Document chunk model."""

    id: str
    doc_id: str
    chunk_index: int
    page_number: int
    content: str
    embedding: Optional[List[float]] = None
    metadata: DocumentMetadata = Field(default_factory=DocumentMetadata)
    created_at: datetime


class DocumentUpload(BaseModel):
    """Document upload request model."""

    filename: str
    title: Optional[str] = None
    description: Optional[str] = None
    language: str = Field(default="en", pattern="^(en|fr)$")
    tags: List[str] = Field(default_factory=list)


class DocumentSearch(BaseModel):
    """Document search request model."""

    query: str
    language: Optional[str] = Field(default=None, pattern="^(en|fr)$")
    tags: Optional[List[str]] = None
    max_results: int = Field(default=10, ge=1, le=50)
    similarity_threshold: float = Field(default=0.7, ge=0.0, le=1.0)


class DocumentSearchResult(BaseModel):
    """Document search result model."""

    doc_id: str
    filename: str
    chunk_text: str
    page_number: int
    similarity_score: float
    metadata: DocumentMetadata = Field(default_factory=DocumentMetadata)

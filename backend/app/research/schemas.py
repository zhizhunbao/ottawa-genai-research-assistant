"""
Research Module Schemas

Pydantic models for research queries, RAG responses, and chart data visualization.

@template A8 backend/domain/schemas.py — Pydantic Models
"""

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field

from app.core.enums import ChatRole


# ── Chart Schemas ─────────────────────────────────────────────────────


class ChartType(str, Enum):
    """图表类型"""

    LINE = "line"
    BAR = "bar"
    PIE = "pie"


class ChartData(BaseModel):
    """图表数据结构"""

    type: ChartType = Field(..., description="图表类型")
    title: str | None = Field(None, description="图表标题")
    x_key: str | None = Field(None, description="X 轴数据键名")
    y_keys: list[str] | None = Field(None, description="Y 轴数据键名列表")
    data: list[dict[str, Any]] = Field(default_factory=list, description="图表数据")
    stacked: bool = Field(False, description="是否堆叠显示（仅柱状图）")


# ── Search Schemas ────────────────────────────────────────────────────


class SearchQuery(BaseModel):
    """搜索查询 Schema"""

    query: str = Field(..., min_length=1, max_length=500, description="The search query text")
    top_k: int = Field(default=5, ge=1, le=20, description="Number of results to return")
    filters: dict | None = Field(None, description="Filtering criteria")


class SearchResult(BaseModel):
    """搜索结果 Schema"""

    id: str = Field(..., description="The unique identity of the document")
    title: str = Field(..., description="The title of the document")
    content: str = Field(..., description="A snippet of the document content")
    score: float = Field(..., description="The relevance score")
    source: str | None = Field(None, description="The document source")
    metadata: dict | None = Field(None, description="Additional metadata")


class SearchResponse(BaseModel):
    """搜索响应 Schema"""

    query: str = Field(..., description="The original search query")
    results: list[SearchResult] = Field(default_factory=list, description="List of search results")
    total: int = Field(..., description="Total number of results found")


# ── Chat Schemas ──────────────────────────────────────────────────────


class ChatMessage(BaseModel):
    """聊天消息 Schema"""

    role: ChatRole = Field(..., description="The role of the message author")
    content: str = Field(..., min_length=1, description="The content of the message")


class ChatRequest(BaseModel):
    """聊天请求 Schema"""

    messages: list[ChatMessage] = Field(..., min_length=1, description="The conversation history")
    use_rag: bool = Field(default=True, description="Whether to use Retrieval-Augmented Generation")
    model: str | None = Field(default=None, description="Model ID (e.g. 'gpt-4o-mini', 'llama3.1:8b'). None uses server default.")


class StreamChatRequest(BaseModel):
    """流式聊天请求 Schema (SSE)"""

    messages: list[ChatMessage] = Field(..., min_length=1, description="The conversation history")
    use_rag: bool = Field(default=True, description="Whether to use RAG")
    temperature: float = Field(default=0.7, ge=0, le=2, description="LLM temperature")
    stream: bool = Field(default=True, description="Enable streaming (always true for this endpoint)")
    model: str | None = Field(default=None, description="Model ID (e.g. 'gpt-4o-mini', 'llama3.1:8b'). None uses server default.")
    auto_strategy: bool = Field(default=False, description="Auto-select the best strategy from the latest benchmark")
    strategy_id: str | None = Field(default=None, description="Explicit strategy ID from benchmark leaderboard")


class ChatResponse(BaseModel):
    """聊天响应 Schema"""

    message: ChatMessage = Field(..., description="The assistant's response message")
    sources: list[SearchResult] = Field(default_factory=list, description="Referenced sources")
    confidence: float = Field(default=0.0, ge=0, le=1, description="Overall confidence score (0-1)")
    chart: ChartData | None = Field(None, description="Optional chart data for visualization")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="The timestamp of the response")

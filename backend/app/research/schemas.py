"""
研究 Schemas

定义研究/RAG 相关的请求/响应模型。
遵循 dev-backend_patterns skill 规范。
对应 US-301: Chart Visualization (添加图表数据支持)
"""

from datetime import datetime

from pydantic import BaseModel, Field

from app.core.enums import ChatRole
from app.research.chart_service import ChartData


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


class ChatMessage(BaseModel):
    """聊天消息 Schema"""

    role: ChatRole = Field(..., description="The role of the message author")
    content: str = Field(..., min_length=1, description="The content of the message")


class ChatRequest(BaseModel):
    """聊天请求 Schema"""

    messages: list[ChatMessage] = Field(..., min_length=1, description="The conversation history")
    use_rag: bool = Field(default=True, description="Whether to use Retrieval-Augmented Generation")


class ChatResponse(BaseModel):
    """聊天响应 Schema"""

    message: ChatMessage = Field(..., description="The assistant's response message")
    sources: list[SearchResult] = Field(default_factory=list, description="Referenced sources")
    confidence: float = Field(default=0.0, ge=0, le=1, description="Overall confidence score (0-1)")
    chart: ChartData | None = Field(None, description="Optional chart data for visualization")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="The timestamp of the response")

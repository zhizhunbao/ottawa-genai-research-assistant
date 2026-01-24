"""
研究 Schemas

定义研究/RAG 相关的请求/响应模型。
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class SearchQuery(BaseModel):
    """搜索查询 Schema"""

    query: str = Field(..., min_length=1, max_length=500, description="搜索查询")
    top_k: int = Field(default=5, ge=1, le=20, description="返回结果数量")
    filters: Optional[dict] = Field(None, description="过滤条件")


class SearchResult(BaseModel):
    """搜索结果 Schema"""

    id: str = Field(..., description="文档 ID")
    title: str = Field(..., description="文档标题")
    content: str = Field(..., description="文档内容片段")
    score: float = Field(..., description="相关性分数")
    source: Optional[str] = Field(None, description="来源")
    metadata: Optional[dict] = Field(None, description="元数据")


class SearchResponse(BaseModel):
    """搜索响应 Schema"""

    query: str = Field(..., description="原始查询")
    results: List[SearchResult] = Field(default_factory=list, description="搜索结果列表")
    total: int = Field(..., description="总结果数")


class ChatMessage(BaseModel):
    """聊天消息 Schema"""

    role: str = Field(..., pattern="^(user|assistant|system)$", description="消息角色")
    content: str = Field(..., min_length=1, description="消息内容")


class ChatRequest(BaseModel):
    """聊天请求 Schema"""

    messages: List[ChatMessage] = Field(..., min_length=1, description="消息历史")
    use_rag: bool = Field(default=True, description="是否使用 RAG")


class ChatResponse(BaseModel):
    """聊天响应 Schema"""

    message: ChatMessage = Field(..., description="助手回复")
    sources: List[SearchResult] = Field(default_factory=list, description="引用来源")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="创建时间")

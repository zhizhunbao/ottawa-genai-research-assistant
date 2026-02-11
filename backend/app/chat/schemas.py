"""
聊天 Schemas

定义聊天会话和消息的请求/响应模型。
对应 Sprint 4 US-204: Chat History Persistence。
"""


from pydantic import BaseModel, Field

from app.core.enums import ChatRole

# ─── Message ─────────────────────────────────────────────────────────


class ChatMessageSchema(BaseModel):
    """单条聊天消息"""

    id: str = Field(..., description="消息唯一标识")
    role: ChatRole = Field(..., description="消息角色")
    content: str = Field(..., description="消息内容")
    timestamp: str = Field(..., description="消息时间戳")
    sources: list[dict] | None = Field(None, description="引用来源")
    confidence: float | None = Field(None, ge=0, le=1, description="置信度 (0-1)")


# ─── Session Request ─────────────────────────────────────────────────


class ChatSessionCreate(BaseModel):
    """创建聊天会话请求"""

    title: str | None = Field(None, max_length=200, description="会话标题")


class ChatSessionUpdate(BaseModel):
    """更新聊天会话请求"""

    title: str | None = Field(None, max_length=200, description="新标题")


class AppendMessageRequest(BaseModel):
    """追加消息到会话"""

    role: ChatRole = Field(..., description="消息角色")
    content: str = Field(..., min_length=1, description="消息内容")
    sources: list[dict] | None = Field(None, description="引用来源")
    confidence: float | None = Field(None, ge=0, le=1, description="置信度")


# ─── Session Response ────────────────────────────────────────────────


class ChatSessionResponse(BaseModel):
    """聊天会话响应（含完整消息列表）"""

    id: str = Field(..., description="会话唯一标识")
    title: str = Field(..., description="会话标题")
    messages: list[ChatMessageSchema] = Field(
        default_factory=list, description="消息列表"
    )
    created_at: str = Field(..., description="创建时间")
    updated_at: str = Field(..., description="更新时间")


class ChatSessionListItem(BaseModel):
    """会话列表项（不含消息体，减少传输量）"""

    id: str
    title: str
    message_count: int = 0
    last_message_preview: str | None = None
    created_at: str
    updated_at: str

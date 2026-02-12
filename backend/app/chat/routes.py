"""
Chat History Routes

RESTful API endpoints for managing chat sessions and message history.

@template A7 backend/domain/router.py — API Routes
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.chat.schemas import (
    AppendMessageRequest,
    ChatMessageSchema,
    ChatSessionCreate,
    ChatSessionListItem,
    ChatSessionResponse,
    ChatSessionUpdate,
)
from app.chat.service import ChatHistoryService
from app.core.dependencies import get_db
from app.core.schemas import ApiResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])

# 临时用户 ID（后续接入 Azure Entra ID 认证后替换）
DEFAULT_OWNER_ID = "default-user"


def _get_service(db: AsyncSession = Depends(get_db)) -> ChatHistoryService:
    """依赖注入获取聊天历史服务"""
    return ChatHistoryService(db)


# ─── Session Endpoints ───────────────────────────────────────────────


@router.post("/sessions", response_model=ApiResponse[ChatSessionResponse])
async def create_session(
    body: ChatSessionCreate,
    service: ChatHistoryService = Depends(_get_service),
) -> ApiResponse[ChatSessionResponse]:
    """
    创建新的聊天会话

    返回新创建的会话，包含空消息列表。
    """
    session = await service.create_session(
        owner_id=DEFAULT_OWNER_ID,
        title=body.title,
    )
    return ApiResponse.ok(ChatSessionResponse(**session))


@router.get("/sessions", response_model=ApiResponse[list[ChatSessionListItem]])
async def list_sessions(
    limit: int = Query(50, ge=1, le=100, description="最大返回数"),
    offset: int = Query(0, ge=0, description="偏移量"),
    service: ChatHistoryService = Depends(_get_service),
) -> ApiResponse[list[ChatSessionListItem]]:
    """
    获取聊天会话列表

    按更新时间倒序排列，返回会话摘要（不含完整消息体以减少数据量）。
    """
    sessions = await service.list_sessions(
        owner_id=DEFAULT_OWNER_ID,
        limit=limit,
        offset=offset,
    )
    items = [ChatSessionListItem(**s) for s in sessions]
    return ApiResponse.ok(items)


@router.get("/sessions/{session_id}", response_model=ApiResponse[ChatSessionResponse])
async def get_session(
    session_id: str,
    service: ChatHistoryService = Depends(_get_service),
) -> ApiResponse[ChatSessionResponse]:
    """
    获取单个会话详情

    返回完整的消息列表，用于恢复历史对话。
    """
    session = await service.get_session(session_id, owner_id=DEFAULT_OWNER_ID)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return ApiResponse.ok(ChatSessionResponse(**session))


@router.patch(
    "/sessions/{session_id}", response_model=ApiResponse[ChatSessionResponse]
)
async def update_session(
    session_id: str,
    body: ChatSessionUpdate,
    service: ChatHistoryService = Depends(_get_service),
) -> ApiResponse[ChatSessionResponse]:
    """
    更新会话信息（当前支持修改标题）
    """
    session = await service.update_session(
        session_id,
        owner_id=DEFAULT_OWNER_ID,
        title=body.title,
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return ApiResponse.ok(ChatSessionResponse(**session))


@router.delete("/sessions/{session_id}", response_model=ApiResponse[dict])
async def delete_session(
    session_id: str,
    service: ChatHistoryService = Depends(_get_service),
) -> ApiResponse[dict]:
    """
    删除聊天会话（软删除，标记为归档）
    """
    success = await service.delete_session(session_id, owner_id=DEFAULT_OWNER_ID)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    return ApiResponse.ok({"deleted": True})


# ─── Message Endpoints ───────────────────────────────────────────────


@router.post(
    "/sessions/{session_id}/messages",
    response_model=ApiResponse[ChatMessageSchema],
)
async def append_message(
    session_id: str,
    body: AppendMessageRequest,
    service: ChatHistoryService = Depends(_get_service),
) -> ApiResponse[ChatMessageSchema]:
    """
    追加消息到指定会话

    前端在用户发消息和收到 AI 回复后分别调用此接口持久化。
    """
    message = await service.append_message(
        session_id=session_id,
        owner_id=DEFAULT_OWNER_ID,
        role=body.role,
        content=body.content,
        sources=body.sources,
        confidence=body.confidence,
    )
    if not message:
        raise HTTPException(status_code=404, detail="Session not found")
    return ApiResponse.ok(ChatMessageSchema(**message))

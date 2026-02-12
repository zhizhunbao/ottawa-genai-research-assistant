"""
Chat History Service Layer

Manages persistence of chat sessions and messages using the UniversalDocument model.
Implements CRUD operations for chat threads and message tracking.

@template A10 backend/domain/service.py — Generic CRUD Service Layer
"""

import logging
from datetime import UTC, datetime

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import ChatRole, DocumentStatus, DocumentType
from app.core.models import UniversalDocument
from app.core.utils import generate_uuid

logger = logging.getLogger(__name__)

# 会话文档类型标识
CHAT_SESSION_TYPE = DocumentType.RESEARCH_HISTORY


class ChatHistoryService:
    """聊天历史持久化服务"""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    # ─── Session CRUD ────────────────────────────────────────────────

    async def create_session(
        self,
        owner_id: str,
        title: str | None = None,
    ) -> dict:
        """
        创建新的聊天会话

        Args:
            owner_id: 用户 ID
            title: 会话标题

        Returns:
            会话字典
        """
        session_id = generate_uuid()

        data = {
            "title": title or "New Chat",
            "messages": [],
        }

        doc = UniversalDocument(
            id=session_id,
            type=CHAT_SESSION_TYPE,
            data=data,
            owner_id=owner_id,
            status=DocumentStatus.ACTIVE,
            tags=["chat_session"],
        )
        self.db.add(doc)
        await self.db.commit()
        await self.db.refresh(doc)

        logger.info(f"Created chat session {session_id} for user {owner_id}")
        return self._doc_to_session(doc)

    async def list_sessions(
        self,
        owner_id: str,
        limit: int = 50,
        offset: int = 0,
    ) -> list[dict]:
        """
        获取用户的会话列表（按更新时间倒序）

        Args:
            owner_id: 用户 ID
            limit: 最大返回数
            offset: 偏移量

        Returns:
            会话摘要列表（不含完整消息体）
        """
        stmt = (
            select(UniversalDocument)
            .where(
                UniversalDocument.type == CHAT_SESSION_TYPE,
                UniversalDocument.owner_id == owner_id,
                UniversalDocument.status == DocumentStatus.ACTIVE,
            )
            .order_by(desc(UniversalDocument.updated_at))
            .offset(offset)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        docs = result.scalars().all()

        sessions = []
        for doc in docs:
            messages = doc.data.get("messages", [])
            last_msg = messages[-1] if messages else None
            preview = None
            if last_msg:
                raw = last_msg.get("content", "")
                preview = raw[:80] + "..." if len(raw) > 80 else raw

            sessions.append(
                {
                    "id": doc.id,
                    "title": doc.data.get("title", "Untitled"),
                    "message_count": len(messages),
                    "last_message_preview": preview,
                    "created_at": doc.created_at.isoformat(),
                    "updated_at": doc.updated_at.isoformat(),
                }
            )

        return sessions

    async def get_session(
        self,
        session_id: str,
        owner_id: str,
    ) -> dict | None:
        """
        获取单个会话（含完整消息）

        Args:
            session_id: 会话 ID
            owner_id: 用户 ID

        Returns:
            会话字典，不存在返回 None
        """
        doc = await self._get_session_doc(session_id, owner_id)
        if not doc:
            return None
        return self._doc_to_session(doc)

    async def update_session(
        self,
        session_id: str,
        owner_id: str,
        title: str | None = None,
    ) -> dict | None:
        """
        更新会话标题

        Args:
            session_id: 会话 ID
            owner_id: 用户 ID
            title: 新标题

        Returns:
            更新后的会话字典
        """
        doc = await self._get_session_doc(session_id, owner_id)
        if not doc:
            return None

        if title is not None:
            data = dict(doc.data)
            data["title"] = title
            doc.data = data

        await self.db.commit()
        await self.db.refresh(doc)
        return self._doc_to_session(doc)

    async def delete_session(
        self,
        session_id: str,
        owner_id: str,
    ) -> bool:
        """
        软删除会话（标记为 ARCHIVED）

        Args:
            session_id: 会话 ID
            owner_id: 用户 ID

        Returns:
            是否成功
        """
        doc = await self._get_session_doc(session_id, owner_id)
        if not doc:
            return False

        doc.status = DocumentStatus.ARCHIVED
        await self.db.commit()
        logger.info(f"Archived chat session {session_id}")
        return True

    # ─── Message Operations ──────────────────────────────────────────

    async def append_message(
        self,
        session_id: str,
        owner_id: str,
        role: ChatRole,
        content: str,
        sources: list | None = None,
        confidence: float | None = None,
    ) -> dict | None:
        """
        追加消息到会话

        Args:
            session_id: 会话 ID
            owner_id: 用户 ID
            role: 消息角色
            content: 消息内容
            sources: 引用来源
            confidence: 置信度

        Returns:
            新消息字典
        """
        doc = await self._get_session_doc(session_id, owner_id)
        if not doc:
            return None

        message_id = generate_uuid()
        now = datetime.now(UTC).isoformat()

        new_message: dict = {
            "id": message_id,
            "role": role.value,
            "content": content,
            "timestamp": now,
        }
        if sources is not None:
            new_message["sources"] = sources
        if confidence is not None:
            new_message["confidence"] = confidence

        # 创建新 dict 以触发 SQLAlchemy 变更检测
        data = dict(doc.data)
        messages = list(data.get("messages", []))
        messages.append(new_message)
        data["messages"] = messages

        # 首条用户消息自动设为会话标题
        user_messages = [m for m in messages if m.get("role") == "user"]
        if len(user_messages) == 1 and role == ChatRole.USER:
            data["title"] = content[:50] + ("..." if len(content) > 50 else "")

        doc.data = data
        await self.db.commit()
        await self.db.refresh(doc)

        return new_message

    # ─── Private Helpers ─────────────────────────────────────────────

    async def _get_session_doc(
        self,
        session_id: str,
        owner_id: str,
    ) -> UniversalDocument | None:
        """获取会话文档（带权限检查）"""
        stmt = select(UniversalDocument).where(
            UniversalDocument.id == session_id,
            UniversalDocument.type == CHAT_SESSION_TYPE,
            UniversalDocument.owner_id == owner_id,
            UniversalDocument.status == DocumentStatus.ACTIVE,
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    def _doc_to_session(doc: UniversalDocument) -> dict:
        """将 UniversalDocument 转换为会话响应字典"""
        return {
            "id": doc.id,
            "title": doc.data.get("title", "Untitled"),
            "messages": doc.data.get("messages", []),
            "created_at": doc.created_at.isoformat(),
            "updated_at": doc.updated_at.isoformat(),
        }

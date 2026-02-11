"""
聊天路由集成测试

测试聊天会话 CRUD 和消息追加的 API 端点。
对应 Sprint 4 US-204: Chat History Persistence。
"""

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


class TestChatSessionCRUD:
    """聊天会话 CRUD 测试"""

    async def test_create_session_default_title(self, client: AsyncClient) -> None:
        """创建会话 - 使用默认标题"""
        resp = await client.post("/api/v1/chat/sessions", json={})
        assert resp.status_code == 200

        body = resp.json()
        assert body["success"] is True
        data = body["data"]
        assert data["id"]
        assert data["title"] == "New Chat"
        assert data["messages"] == []
        assert data["created_at"]
        assert data["updated_at"]

    async def test_create_session_custom_title(self, client: AsyncClient) -> None:
        """创建会话 - 自定义标题"""
        resp = await client.post(
            "/api/v1/chat/sessions", json={"title": "经济分析讨论"}
        )
        assert resp.status_code == 200

        data = resp.json()["data"]
        assert data["title"] == "经济分析讨论"

    async def test_list_sessions_empty(self, client: AsyncClient) -> None:
        """会话列表 - 空列表"""
        resp = await client.get("/api/v1/chat/sessions")
        assert resp.status_code == 200

        body = resp.json()
        assert body["success"] is True
        assert body["data"] == []

    async def test_list_sessions_with_data(self, client: AsyncClient) -> None:
        """会话列表 - 有数据"""
        # 创建多个会话
        await client.post("/api/v1/chat/sessions", json={"title": "Session A"})
        await client.post("/api/v1/chat/sessions", json={"title": "Session B"})

        resp = await client.get("/api/v1/chat/sessions")
        assert resp.status_code == 200

        items = resp.json()["data"]
        assert len(items) == 2
        # 按更新时间倒序
        assert items[0]["title"] == "Session B"
        assert items[1]["title"] == "Session A"
        # 列表项不含完整消息
        assert "messages" not in items[0]

    async def test_get_session(self, client: AsyncClient) -> None:
        """获取单个会话"""
        create_resp = await client.post(
            "/api/v1/chat/sessions", json={"title": "Test"}
        )
        session_id = create_resp.json()["data"]["id"]

        resp = await client.get(f"/api/v1/chat/sessions/{session_id}")
        assert resp.status_code == 200

        data = resp.json()["data"]
        assert data["id"] == session_id
        assert data["messages"] == []

    async def test_get_session_not_found(self, client: AsyncClient) -> None:
        """获取不存在的会话"""
        resp = await client.get("/api/v1/chat/sessions/nonexistent-id")
        assert resp.status_code == 404

    async def test_update_session_title(self, client: AsyncClient) -> None:
        """更新会话标题"""
        create_resp = await client.post(
            "/api/v1/chat/sessions", json={"title": "Old Title"}
        )
        session_id = create_resp.json()["data"]["id"]

        resp = await client.patch(
            f"/api/v1/chat/sessions/{session_id}",
            json={"title": "New Title"},
        )
        assert resp.status_code == 200
        assert resp.json()["data"]["title"] == "New Title"

    async def test_delete_session(self, client: AsyncClient) -> None:
        """删除会话（软删除）"""
        create_resp = await client.post(
            "/api/v1/chat/sessions", json={"title": "To Delete"}
        )
        session_id = create_resp.json()["data"]["id"]

        # 删除
        resp = await client.delete(f"/api/v1/chat/sessions/{session_id}")
        assert resp.status_code == 200
        assert resp.json()["data"]["deleted"] is True

        # 确认无法再获取
        get_resp = await client.get(f"/api/v1/chat/sessions/{session_id}")
        assert get_resp.status_code == 404

    async def test_delete_session_not_in_list(self, client: AsyncClient) -> None:
        """删除后不出现在列表中"""
        create_resp = await client.post(
            "/api/v1/chat/sessions", json={"title": "Temp"}
        )
        session_id = create_resp.json()["data"]["id"]

        await client.delete(f"/api/v1/chat/sessions/{session_id}")

        list_resp = await client.get("/api/v1/chat/sessions")
        assert len(list_resp.json()["data"]) == 0


class TestChatMessages:
    """聊天消息操作测试"""

    async def _create_session(self, client: AsyncClient) -> str:
        """辅助：创建会话并返回 ID"""
        resp = await client.post("/api/v1/chat/sessions", json={})
        return resp.json()["data"]["id"]

    async def test_append_user_message(self, client: AsyncClient) -> None:
        """追加用户消息"""
        session_id = await self._create_session(client)

        resp = await client.post(
            f"/api/v1/chat/sessions/{session_id}/messages",
            json={"role": "user", "content": "What is Ottawa's GDP?"},
        )
        assert resp.status_code == 200

        msg = resp.json()["data"]
        assert msg["id"]
        assert msg["role"] == "user"
        assert msg["content"] == "What is Ottawa's GDP?"
        assert msg["timestamp"]

    async def test_append_assistant_message_with_sources(
        self, client: AsyncClient
    ) -> None:
        """追加助手消息（含引用和置信度）"""
        session_id = await self._create_session(client)

        sources = [
            {
                "documentTitle": "Q3 2025 Report",
                "pageNumber": 12,
                "excerpt": "Ottawa GDP grew 3.2%...",
            }
        ]
        resp = await client.post(
            f"/api/v1/chat/sessions/{session_id}/messages",
            json={
                "role": "assistant",
                "content": "Ottawa's GDP grew by 3.2%.",
                "sources": sources,
                "confidence": 0.92,
            },
        )
        assert resp.status_code == 200

        msg = resp.json()["data"]
        assert msg["role"] == "assistant"
        assert msg["sources"] == sources
        assert msg["confidence"] == 0.92

    async def test_messages_persisted_in_session(self, client: AsyncClient) -> None:
        """消息持久化到会话中"""
        session_id = await self._create_session(client)

        # 追加用户消息
        await client.post(
            f"/api/v1/chat/sessions/{session_id}/messages",
            json={"role": "user", "content": "Hello"},
        )
        # 追加助手消息
        await client.post(
            f"/api/v1/chat/sessions/{session_id}/messages",
            json={"role": "assistant", "content": "Hi! How can I help?"},
        )

        # 获取会话，确认消息顺序
        resp = await client.get(f"/api/v1/chat/sessions/{session_id}")
        messages = resp.json()["data"]["messages"]
        assert len(messages) == 2
        assert messages[0]["role"] == "user"
        assert messages[1]["role"] == "assistant"

    async def test_first_user_message_sets_title(self, client: AsyncClient) -> None:
        """首条用户消息自动设为会话标题"""
        session_id = await self._create_session(client)
        assert (await client.get(f"/api/v1/chat/sessions/{session_id}")).json()["data"][
            "title"
        ] == "New Chat"

        # 发送第一条消息
        await client.post(
            f"/api/v1/chat/sessions/{session_id}/messages",
            json={"role": "user", "content": "Ottawa economic trends in Q3 2025"},
        )

        session = (
            await client.get(f"/api/v1/chat/sessions/{session_id}")
        ).json()["data"]
        assert session["title"] == "Ottawa economic trends in Q3 2025"

    async def test_append_to_nonexistent_session(self, client: AsyncClient) -> None:
        """向不存在的会话追加消息"""
        resp = await client.post(
            "/api/v1/chat/sessions/nonexistent/messages",
            json={"role": "user", "content": "test"},
        )
        assert resp.status_code == 404

    async def test_list_sessions_shows_message_count(
        self, client: AsyncClient
    ) -> None:
        """会话列表显示消息数和预览"""
        session_id = await self._create_session(client)

        await client.post(
            f"/api/v1/chat/sessions/{session_id}/messages",
            json={"role": "user", "content": "Hello world"},
        )
        await client.post(
            f"/api/v1/chat/sessions/{session_id}/messages",
            json={"role": "assistant", "content": "Hi there!"},
        )

        resp = await client.get("/api/v1/chat/sessions")
        items = resp.json()["data"]
        assert len(items) == 1
        assert items[0]["message_count"] == 2
        assert items[0]["last_message_preview"] == "Hi there!"

"""
研究路由集成测试

遵循 dev-tdd_workflow skill 的 API 集成测试模式。
"""

import pytest
from httpx import AsyncClient


class TestResearchRoutes:
    """研究路由测试类"""

    # ==================== POST /search 测试 ====================

    @pytest.mark.asyncio
    async def test_search_success(self, client: AsyncClient) -> None:
        """测试成功执行搜索"""
        # Arrange
        search_data = {"query": "新移民指南"}

        # Act
        response = await client.post("/api/v1/research/search", json=search_data)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "results" in data["data"]
        assert "total" in data["data"]
        assert data["data"]["query"] == "新移民指南"

    @pytest.mark.asyncio
    async def test_search_with_top_k(self, client: AsyncClient) -> None:
        """测试带 top_k 参数的搜索"""
        # Arrange
        search_data = {"query": "渥太华", "top_k": 5}

        # Act
        response = await client.post("/api/v1/research/search", json=search_data)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_search_empty_query_rejected(self, client: AsyncClient) -> None:
        """测试空查询被拒绝"""
        # Arrange
        search_data = {"query": ""}

        # Act
        response = await client.post("/api/v1/research/search", json=search_data)

        # Assert
        # 空查询应该返回 422（schema 验证失败）
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_search_missing_query_field(self, client: AsyncClient) -> None:
        """测试缺少查询字段"""
        # Arrange
        search_data = {}

        # Act
        response = await client.post("/api/v1/research/search", json=search_data)

        # Assert
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_search_result_structure(self, client: AsyncClient) -> None:
        """测试搜索结果结构"""
        # Arrange
        search_data = {"query": "test"}

        # Act
        response = await client.post("/api/v1/research/search", json=search_data)

        # Assert
        assert response.status_code == 200
        data = response.json()
        results = data["data"]["results"]

        if len(results) > 0:
            first_result = results[0]
            assert "id" in first_result
            assert "title" in first_result
            assert "content" in first_result
            assert "score" in first_result

    # ==================== POST /chat 测试 ====================

    @pytest.mark.asyncio
    async def test_chat_success(self, client: AsyncClient) -> None:
        """测试成功执行聊天"""
        # Arrange
        chat_data = {
            "messages": [{"role": "user", "content": "你好"}],
            "use_rag": False,
        }

        # Act
        response = await client.post("/api/v1/research/chat", json=chat_data)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "message" in data["data"]
        assert data["data"]["message"]["role"] == "assistant"

    @pytest.mark.asyncio
    async def test_chat_with_rag(self, client: AsyncClient) -> None:
        """测试启用 RAG 的聊天"""
        # Arrange
        chat_data = {
            "messages": [{"role": "user", "content": "新移民需要什么"}],
            "use_rag": True,
        }

        # Act
        response = await client.post("/api/v1/research/chat", json=chat_data)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "sources" in data["data"]
        assert len(data["data"]["sources"]) > 0

    @pytest.mark.asyncio
    async def test_chat_without_rag(self, client: AsyncClient) -> None:
        """测试禁用 RAG 的聊天"""
        # Arrange
        chat_data = {
            "messages": [{"role": "user", "content": "你好"}],
            "use_rag": False,
        }

        # Act
        response = await client.post("/api/v1/research/chat", json=chat_data)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["data"]["sources"]) == 0

    @pytest.mark.asyncio
    async def test_chat_multiple_messages(self, client: AsyncClient) -> None:
        """测试多轮对话"""
        # Arrange
        chat_data = {
            "messages": [
                {"role": "user", "content": "你好"},
                {"role": "assistant", "content": "您好！"},
                {"role": "user", "content": "请问渥太华天气如何？"},
            ],
            "use_rag": False,
        }

        # Act
        response = await client.post("/api/v1/research/chat", json=chat_data)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_chat_empty_messages_rejected(self, client: AsyncClient) -> None:
        """测试空消息列表被拒绝"""
        # Arrange
        chat_data = {"messages": [], "use_rag": False}

        # Act
        response = await client.post("/api/v1/research/chat", json=chat_data)

        # Assert
        # 空消息列表应该返回 422（schema 验证失败）
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_chat_missing_messages_field(self, client: AsyncClient) -> None:
        """测试缺少消息字段"""
        # Arrange
        chat_data = {"use_rag": False}

        # Act
        response = await client.post("/api/v1/research/chat", json=chat_data)

        # Assert
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_chat_invalid_role_rejected(self, client: AsyncClient) -> None:
        """测试无效角色被拒绝"""
        # Arrange
        chat_data = {
            "messages": [{"role": "invalid", "content": "test"}],
            "use_rag": False,
        }

        # Act
        response = await client.post("/api/v1/research/chat", json=chat_data)

        # Assert
        # 无效的枚举值应该返回 422
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_chat_response_format(self, client: AsyncClient) -> None:
        """测试聊天响应格式"""
        # Arrange
        chat_data = {
            "messages": [{"role": "user", "content": "测试"}],
            "use_rag": False,
        }

        # Act
        response = await client.post("/api/v1/research/chat", json=chat_data)

        # Assert
        assert response.status_code == 200
        data = response.json()

        # 验证响应结构
        assert "success" in data
        assert "data" in data

        # 验证数据结构
        chat_response = data["data"]
        assert "message" in chat_response
        assert "sources" in chat_response

        # 验证消息结构
        message = chat_response["message"]
        assert "role" in message
        assert "content" in message

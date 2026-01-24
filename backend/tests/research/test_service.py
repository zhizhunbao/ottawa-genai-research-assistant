"""
研究服务单元测试

遵循 dev-tdd_workflow skill 的测试模式。
测试 RAG 搜索和聊天功能。
"""

import pytest
from unittest.mock import patch

from app.research.service import ResearchService
from app.research.schemas import (
    ChatMessage,
    ChatRequest,
    SearchQuery,
)
from app.core.enums import ChatRole
from app.core.exceptions import ExternalServiceError


class TestResearchService:
    """研究服务测试类"""

    @pytest.fixture
    def research_service(self) -> ResearchService:
        """创建研究服务实例"""
        return ResearchService()

    # ==================== search 测试 ====================

    @pytest.mark.asyncio
    async def test_search_returns_results(
        self, research_service: ResearchService
    ) -> None:
        """测试搜索返回结果"""
        # Arrange
        query = SearchQuery(query="新移民指南")

        # Act
        result = await research_service.search(query)

        # Assert
        assert result.query == "新移民指南"
        assert len(result.results) > 0
        assert result.total > 0

    @pytest.mark.asyncio
    async def test_search_result_structure(
        self, research_service: ResearchService
    ) -> None:
        """测试搜索结果结构正确"""
        # Arrange
        query = SearchQuery(query="渥太华生活")

        # Act
        result = await research_service.search(query)

        # Assert
        first_result = result.results[0]
        assert first_result.id is not None
        assert first_result.title is not None
        assert first_result.content is not None
        assert first_result.score >= 0
        assert first_result.source is not None

    @pytest.mark.asyncio
    async def test_search_with_top_k(
        self, research_service: ResearchService
    ) -> None:
        """测试搜索使用 top_k 参数"""
        # Arrange
        query = SearchQuery(query="test", top_k=5)

        # Act
        result = await research_service.search(query)

        # Assert
        assert result.total == len(result.results)
        assert query.top_k == 5

    @pytest.mark.asyncio
    async def test_search_includes_metadata(
        self, research_service: ResearchService
    ) -> None:
        """测试搜索结果包含元数据"""
        # Arrange
        query = SearchQuery(query="immigration")

        # Act
        result = await research_service.search(query)

        # Assert
        first_result = result.results[0]
        assert first_result.metadata is not None
        assert "category" in first_result.metadata

    # ==================== chat 测试 ====================

    @pytest.mark.asyncio
    async def test_chat_returns_response(
        self, research_service: ResearchService
    ) -> None:
        """测试聊天返回响应"""
        # Arrange
        request = ChatRequest(
            messages=[ChatMessage(role=ChatRole.USER, content="你好")],
            use_rag=False,
        )

        # Act
        result = await research_service.chat(request)

        # Assert
        assert result.message is not None
        assert result.message.role == ChatRole.ASSISTANT
        assert len(result.message.content) > 0

    @pytest.mark.asyncio
    async def test_chat_with_rag_includes_sources(
        self, research_service: ResearchService
    ) -> None:
        """测试启用 RAG 的聊天包含来源"""
        # Arrange
        request = ChatRequest(
            messages=[ChatMessage(role=ChatRole.USER, content="新移民需要什么证件")],
            use_rag=True,
        )

        # Act
        result = await research_service.chat(request)

        # Assert
        assert result.message is not None
        assert result.sources is not None
        assert len(result.sources) > 0

    @pytest.mark.asyncio
    async def test_chat_without_rag_no_sources(
        self, research_service: ResearchService
    ) -> None:
        """测试禁用 RAG 的聊天不包含来源"""
        # Arrange
        request = ChatRequest(
            messages=[ChatMessage(role=ChatRole.USER, content="你好")],
            use_rag=False,
        )

        # Act
        result = await research_service.chat(request)

        # Assert
        assert result.sources is not None
        assert len(result.sources) == 0

    @pytest.mark.asyncio
    async def test_chat_uses_last_user_message_for_rag(
        self, research_service: ResearchService
    ) -> None:
        """测试 RAG 使用最后一条用户消息进行搜索"""
        # Arrange
        request = ChatRequest(
            messages=[
                ChatMessage(role=ChatRole.USER, content="第一个问题"),
                ChatMessage(role=ChatRole.ASSISTANT, content="第一个回答"),
                ChatMessage(role=ChatRole.USER, content="新移民指南"),
            ],
            use_rag=True,
        )

        # Act
        result = await research_service.chat(request)

        # Assert
        # 应该基于 "新移民指南" 进行搜索
        assert result.sources is not None
        assert len(result.sources) > 0

    @pytest.mark.asyncio
    async def test_chat_response_references_context(
        self, research_service: ResearchService
    ) -> None:
        """测试聊天响应引用上下文"""
        # Arrange
        request = ChatRequest(
            messages=[ChatMessage(role=ChatRole.USER, content="渥太华生活")],
            use_rag=True,
        )

        # Act
        result = await research_service.chat(request)

        # Assert
        # 模拟实现中，响应应该包含上下文信息
        assert "渥太华生活" in result.message.content or "来源" in result.message.content

    # ==================== 错误处理测试 ====================

    @pytest.mark.asyncio
    async def test_search_handles_external_service_error(
        self, research_service: ResearchService
    ) -> None:
        """测试搜索处理外部服务错误"""
        # Arrange
        query = SearchQuery(query="test")

        # 模拟 _mock_search 抛出异常
        with patch.object(
            research_service, "_mock_search", side_effect=Exception("Service unavailable")
        ):
            # Act & Assert
            with pytest.raises(ExternalServiceError) as exc_info:
                await research_service.search(query)
            
            assert "Azure AI Search" in str(exc_info.value.message)

    @pytest.mark.asyncio
    async def test_chat_handles_external_service_error(
        self, research_service: ResearchService
    ) -> None:
        """测试聊天处理外部服务错误"""
        # Arrange
        request = ChatRequest(
            messages=[ChatMessage(role=ChatRole.USER, content="test")],
            use_rag=False,
        )

        # 模拟 _mock_chat 抛出异常
        with patch.object(
            research_service, "_mock_chat", side_effect=Exception("Service unavailable")
        ):
            # Act & Assert
            with pytest.raises(ExternalServiceError) as exc_info:
                await research_service.chat(request)
            
            assert "Azure OpenAI" in str(exc_info.value.message)


class TestSearchQuery:
    """搜索查询 Schema 测试"""

    def test_search_query_default_top_k(self) -> None:
        """测试搜索查询默认 top_k"""
        query = SearchQuery(query="test")
        assert query.top_k == 5  # 默认值

    def test_search_query_custom_top_k(self) -> None:
        """测试搜索查询自定义 top_k"""
        query = SearchQuery(query="test", top_k=10)
        assert query.top_k == 10


class TestChatMessage:
    """聊天消息 Schema 测试"""

    def test_chat_message_user_role(self) -> None:
        """测试用户角色消息"""
        message = ChatMessage(role=ChatRole.USER, content="你好")
        assert message.role == ChatRole.USER
        assert message.content == "你好"

    def test_chat_message_assistant_role(self) -> None:
        """测试助手角色消息"""
        message = ChatMessage(role=ChatRole.ASSISTANT, content="您好！")
        assert message.role == ChatRole.ASSISTANT
        assert message.content == "您好！"

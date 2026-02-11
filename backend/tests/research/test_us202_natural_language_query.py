"""
US-202 Natural Language Query 单元测试

测试查询预处理、搜索集成、路由注入。
"""

from unittest.mock import AsyncMock, MagicMock

import pytest

from app.core.enums import ChatRole
from app.research.schemas import (
    ChatMessage,
    ChatRequest,
    SearchQuery,
    SearchResponse,
)
from app.research.service import MAX_QUERY_LENGTH, ResearchService


class TestQueryPreprocessing:
    """查询预处理测试"""

    @pytest.fixture
    def service(self):
        return ResearchService()

    def test_basic_cleanup(self, service):
        """清理多余空白"""
        result = service.preprocess_query("  hello   world  ")
        assert result == "hello world"

    def test_newlines_and_tabs(self, service):
        """替换换行和 Tab"""
        result = service.preprocess_query("hello\n\tworld\r\ntest")
        assert result == "hello world test"

    def test_truncate_long_query(self, service):
        """截断超长查询"""
        long_query = "a" * 1000
        result = service.preprocess_query(long_query)
        assert len(result) == MAX_QUERY_LENGTH

    def test_empty_query(self, service):
        """空查询返回空字符串"""
        result = service.preprocess_query("   ")
        assert result == ""

    def test_normal_query_unchanged(self, service):
        """正常查询不变"""
        result = service.preprocess_query("What is Ottawa's GDP?")
        assert result == "What is Ottawa's GDP?"

    def test_french_query(self, service):
        """法语查询正常处理"""
        result = service.preprocess_query(
            "Quel est le PIB d'Ottawa?"
        )
        assert result == "Quel est le PIB d'Ottawa?"

    def test_chinese_query(self, service):
        """中文查询正常处理"""
        result = service.preprocess_query("渥太华的经济发展如何？")
        assert result == "渥太华的经济发展如何？"


class TestSearchWithPreprocessing:
    """带预处理的搜索测试"""

    @pytest.fixture
    def service(self):
        """创建无 Azure 服务的 ResearchService (走 mock)"""
        return ResearchService()

    @pytest.mark.asyncio
    async def test_mock_search_returns_results(self, service):
        """Mock 模式搜索返回结果"""
        query = SearchQuery(query="Ottawa economy")
        response = await service.search(query)

        assert isinstance(response, SearchResponse)
        assert response.query == "Ottawa economy"
        assert response.total > 0
        assert len(response.results) > 0

    @pytest.mark.asyncio
    async def test_search_preprocesses_query(self, service):
        """搜索前进行查询预处理"""
        query = SearchQuery(query="  Ottawa   economy  ")
        response = await service.search(query)

        # 原始查询保留用于返回
        assert response.query == "  Ottawa   economy  "
        assert response.total > 0

    @pytest.mark.asyncio
    async def test_search_with_filters(self, service):
        """带过滤条件的搜索"""
        query = SearchQuery(
            query="GDP growth",
            top_k=3,
            filters={"category": "economics"},
        )
        response = await service.search(query)
        assert isinstance(response, SearchResponse)

    @pytest.mark.asyncio
    async def test_search_result_has_required_fields(self, service):
        """搜索结果包含必要字段"""
        query = SearchQuery(query="test")
        response = await service.search(query)

        for result in response.results:
            assert result.id is not None
            assert result.title is not None
            assert result.content is not None
            assert result.score is not None


class TestChatWithOpenAI:
    """Chat RAG 集成测试"""

    @pytest.fixture
    def mock_openai(self):
        """Mock OpenAI service"""
        mock = MagicMock()
        mock.create_embedding = AsyncMock(return_value=[0.1] * 1536)
        mock.rag_chat = AsyncMock(
            return_value="Based on the documents, Ottawa's GDP is $100B."
        )
        return mock

    @pytest.fixture
    def mock_search(self):
        """Mock Search service"""
        mock = MagicMock()
        mock.search = AsyncMock(return_value=[
            {
                "id": "chunk-1",
                "title": "Q4 Report",
                "content": "Ottawa GDP reached $100B",
                "source": "quarterly_report.pdf",
                "document_id": "doc-1",
                "page_number": 5,
                "chunk_index": 2,
                "score": 0.95,
            },
        ])
        return mock

    @pytest.mark.asyncio
    async def test_chat_uses_openai_when_available(
        self, mock_openai, mock_search
    ):
        """有 OpenAI 服务时使用 RAG chat"""
        service = ResearchService(
            search_service=mock_search,
            openai_service=mock_openai,
        )

        request = ChatRequest(
            messages=[
                ChatMessage(role=ChatRole.USER, content="What is Ottawa's GDP?")
            ],
            use_rag=True,
        )

        response = await service.chat(request)

        assert response.message.role == ChatRole.ASSISTANT
        assert "GDP" in response.message.content or "100B" in response.message.content
        mock_openai.rag_chat.assert_called_once()

    @pytest.mark.asyncio
    async def test_chat_falls_back_to_mock(self):
        """无 OpenAI 服务时走 mock"""
        service = ResearchService()

        request = ChatRequest(
            messages=[
                ChatMessage(role=ChatRole.USER, content="Hello!")
            ],
            use_rag=False,
        )

        response = await service.chat(request)
        assert response.message.role == ChatRole.ASSISTANT
        assert len(response.message.content) > 0

    @pytest.mark.asyncio
    async def test_chat_rag_searches_before_generating(
        self, mock_openai, mock_search
    ):
        """RAG chat 先搜索再生成"""
        service = ResearchService(
            search_service=mock_search,
            openai_service=mock_openai,
        )

        request = ChatRequest(
            messages=[
                ChatMessage(role=ChatRole.USER, content="GDP trends?")
            ],
            use_rag=True,
        )

        response = await service.chat(request)

        # 应该调用搜索
        mock_search.search.assert_called_once()
        # 应该传 sources 到 rag_chat
        mock_openai.rag_chat.assert_called_once()
        # 响应应包含 sources
        assert len(response.sources) > 0

    @pytest.mark.asyncio
    async def test_chat_with_history(self, mock_openai, mock_search):
        """带历史记录的聊天"""
        service = ResearchService(
            search_service=mock_search,
            openai_service=mock_openai,
        )

        request = ChatRequest(
            messages=[
                ChatMessage(role=ChatRole.USER, content="What is Ottawa?"),
                ChatMessage(
                    role=ChatRole.ASSISTANT,
                    content="Ottawa is the capital of Canada.",
                ),
                ChatMessage(role=ChatRole.USER, content="Tell me more about GDP"),
            ],
            use_rag=True,
        )

        response = await service.chat(request)
        assert response.message.role == ChatRole.ASSISTANT

        # rag_chat 应该收到 chat_history
        call_kwargs = mock_openai.rag_chat.call_args
        assert call_kwargs.kwargs.get("chat_history") is not None

    @pytest.mark.asyncio
    async def test_chat_without_rag(self, mock_openai):
        """禁用 RAG 时不搜索"""
        service = ResearchService(openai_service=mock_openai)

        request = ChatRequest(
            messages=[
                ChatMessage(role=ChatRole.USER, content="Hello!")
            ],
            use_rag=False,
        )

        response = await service.chat(request)
        assert response.message.role == ChatRole.ASSISTANT

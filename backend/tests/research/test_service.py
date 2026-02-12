"""
Research Service Tests

Unit and integration tests for RAG logic and search service.

@template T2 backend/tests/test_service.py — Service Layer Mocking Pattern
"""

from unittest.mock import patch

import pytest

from app.core.enums import ChatRole
from app.core.exceptions import ExternalServiceError
from app.research.schemas import (
    ChartData,
    ChartType,
    ChatMessage,
    ChatRequest,
    SearchQuery,
)
from app.research.service import (
    MAX_QUERY_LENGTH,
    ChartDataExtractor,
    ResearchService,
    chart_extractor,
)


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


# ── Chart Extraction Tests (US-301) ──────────────────────────────────


class TestChartDataExtractor:
    """测试 ChartDataExtractor 类"""

    @pytest.fixture
    def extractor(self) -> ChartDataExtractor:
        return ChartDataExtractor()

    def test_has_numeric_data_with_numbers(self, extractor: ChartDataExtractor):
        """测试检测数值数据 - 有数字"""
        content = "GDP increased by 2.5% in Q1, 3.1% in Q2, and 2.8% in Q3."
        assert extractor._has_numeric_data(content) is True

    def test_has_numeric_data_without_numbers(self, extractor: ChartDataExtractor):
        """测试检测数值数据 - 无数字"""
        content = "The economy is growing steadily."
        assert extractor._has_numeric_data(content) is False

    def test_extract_time_series_quarterly(self, extractor: ChartDataExtractor):
        """测试提取季度时间序列"""
        content = """
        Q1 2025: 2.5%
        Q2 2025: 3.1%
        Q3 2025: 2.8%
        Q4 2025: 3.0%
        """
        result = extractor._extract_time_series(content)
        assert len(result) == 4
        assert result[0]["period"] == "Q1 2025"
        assert result[0]["value"] == 2.5

    def test_extract_category_data(self, extractor: ChartDataExtractor):
        """测试提取分类数据"""
        content = """
        Technology: 35%
        Healthcare: 25%
        Finance: 20%
        Manufacturing: 20%
        """
        result = extractor._extract_category_data(content)
        assert len(result) == 4
        assert result[0]["name"] == "Technology"
        assert result[0]["value"] == 35

    def test_determine_chart_type_trend(self, extractor: ChartDataExtractor):
        """测试确定图表类型 - 趋势查询"""
        assert extractor._determine_chart_type("GDP growth trend") == ChartType.LINE
        assert extractor._determine_chart_type("quarterly growth") == ChartType.LINE

    def test_determine_chart_type_comparison(self, extractor: ChartDataExtractor):
        """测试确定图表类型 - 比较查询"""
        assert extractor._determine_chart_type("compare sectors") == ChartType.BAR
        assert extractor._determine_chart_type("top industries") == ChartType.BAR

    def test_determine_chart_type_distribution(self, extractor: ChartDataExtractor):
        """测试确定图表类型 - 分布查询"""
        assert extractor._determine_chart_type("market share") == ChartType.PIE
        assert extractor._determine_chart_type("sector distribution") == ChartType.PIE

    def test_extract_chart_data_returns_none_for_no_data(
        self, extractor: ChartDataExtractor
    ):
        """测试无数据时返回 None"""
        result = extractor.extract_chart_data("No numbers here", "query")
        assert result is None

    def test_extract_chart_data_returns_none_for_empty_content(
        self, extractor: ChartDataExtractor
    ):
        """测试空内容返回 None"""
        result = extractor.extract_chart_data("", "query")
        assert result is None

    def test_extract_chart_data_time_series(self, extractor: ChartDataExtractor):
        """测试提取时间序列图表数据"""
        content = """
        Economic growth by quarter:
        Q1 2025: 2.5%
        Q2 2025: 3.1%
        Q3 2025: 2.8%
        """
        result = extractor.extract_chart_data(content, "growth trend over time")
        assert result is not None
        assert result.type == ChartType.LINE
        assert len(result.data) >= 3

    def test_extract_chart_data_pie_chart(self, extractor: ChartDataExtractor):
        """测试提取饼图数据"""
        content = """
        Industry breakdown:
        Technology: 35%
        Healthcare: 25%
        Finance: 20%
        Other: 20%
        """
        result = extractor.extract_chart_data(content, "market share distribution")
        assert result is not None
        assert result.type == ChartType.PIE


class TestChartDataModel:
    """测试 ChartData 模型"""

    def test_chart_data_line(self):
        """测试折线图数据模型"""
        data = ChartData(
            type=ChartType.LINE,
            title="GDP Growth",
            x_key="period",
            y_keys=["value"],
            data=[{"period": "Q1", "value": 2.5}, {"period": "Q2", "value": 3.1}],
        )
        assert data.type == ChartType.LINE
        assert data.stacked is False

    def test_chart_data_bar_stacked(self):
        """测试堆叠柱状图数据模型"""
        data = ChartData(
            type=ChartType.BAR,
            title="Sector Comparison",
            x_key="sector",
            y_keys=["value1", "value2"],
            data=[{"sector": "Tech", "value1": 100, "value2": 50}],
            stacked=True,
        )
        assert data.type == ChartType.BAR
        assert data.stacked is True

    def test_chart_data_pie(self):
        """测试饼图数据模型"""
        data = ChartData(
            type=ChartType.PIE,
            title="Market Share",
            data=[{"name": "A", "value": 60}, {"name": "B", "value": 40}],
        )
        assert data.type == ChartType.PIE
        assert len(data.data) == 2


class TestGlobalExtractor:
    """测试全局 chart_extractor 实例"""

    def test_global_instance_exists(self):
        """测试全局实例存在"""
        assert chart_extractor is not None
        assert isinstance(chart_extractor, ChartDataExtractor)


# ── Query Preprocessing Tests (US-202) ───────────────────────────────


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

    def test_french_chinese_queries(self, service):
        """多语言查询正常处理"""
        assert service.preprocess_query("Quel est le PIB?") == "Quel est le PIB?"
        assert service.preprocess_query("渥太华经济如何？") == "渥太华经济如何？"


# ── RAG Integration Tests (Mocked) ───────────────────────────────────


class TestRAGIntegration:
    """RAG 集成流程测试 (使用 Mock)"""

    @pytest.fixture
    def mock_openai(self):
        """Mock OpenAI service"""
        from unittest.mock import AsyncMock, MagicMock
        mock = MagicMock()
        mock.create_embedding = AsyncMock(return_value=[0.1] * 1536)
        mock.rag_chat = AsyncMock(
            return_value="According to documents, Ottawa's GDP grew by 2%."
        )
        return mock

    @pytest.fixture
    def mock_search(self):
        """Mock Search service"""
        from unittest.mock import AsyncMock, MagicMock
        mock = MagicMock()
        mock.search = AsyncMock(return_value=[
            {
                "id": "chunk-1",
                "title": "Econ Report",
                "content": "Ottawa GDP growth was 2% in 2023.",
                "source": "report.pdf",
                "score": 0.99,
            },
        ])
        return mock

    @pytest.mark.asyncio
    async def test_chat_full_workflow(self, mock_openai, mock_search):
        """测试完整的 RAG 聊天流程 (搜索 -> 增强 -> 生成)"""
        service = ResearchService(
            search_service=mock_search,
            openai_service=mock_openai,
        )

        request = ChatRequest(
            messages=[ChatMessage(role=ChatRole.USER, content="How is the GDP?")],
            use_rag=True,
        )

        response = await service.chat(request)

        # 验证结果
        assert response.message.role == ChatRole.ASSISTANT
        assert "2%" in response.message.content
        assert len(response.sources) > 0
        assert response.sources[0].title == "Econ Report"

        # 验证调用链
        mock_search.search.assert_called_once()
        mock_openai.rag_chat.assert_called_once()

    @pytest.mark.asyncio
    async def test_chat_no_rag_workflow(self, mock_openai, mock_search):
        """测试不使用 RAG 的聊天流程"""
        service = ResearchService(
            search_service=mock_search,
            openai_service=mock_openai,
        )

        request = ChatRequest(
            messages=[ChatMessage(role=ChatRole.USER, content="Hello")],
            use_rag=False,
        )

        await service.chat(request)

        # 不应该调用搜索
        mock_search.search.assert_not_called()

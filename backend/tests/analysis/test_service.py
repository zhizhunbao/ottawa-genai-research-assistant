"""
分析服务单元测试

遵循 dev-tdd_workflow skill 的测试模式。
遵循 dev-terminology skill 的命名规范。
"""

from unittest.mock import AsyncMock

import pytest

from app.analysis.schemas import AnalysisRequest, ChartData, SpeakingNotes
from app.analysis.service import AnalysisService
from app.core.enums import AnalysisType, ChartType, DocumentType


class TestAnalysisService:
    """分析服务测试类"""

    @pytest.fixture
    def mock_doc_store(self) -> AsyncMock:
        """创建模拟文档存储"""
        store = AsyncMock()
        store.create = AsyncMock(return_value={"id": "doc-123"})
        return store

    @pytest.fixture
    def analysis_service(self, mock_doc_store: AsyncMock) -> AnalysisService:
        """创建分析服务实例"""
        return AnalysisService(mock_doc_store)

    # ==================== generate_chart 测试 ====================

    @pytest.mark.asyncio
    async def test_generate_chart_returns_chart_data(
        self, analysis_service: AnalysisService
    ) -> None:
        """测试生成图表返回 ChartData"""
        # Arrange
        request = AnalysisRequest(
            query="Ottawa employment trends",
            analysis_type=AnalysisType.CHART,
        )

        # Act
        result = await analysis_service.generate_chart(request)

        # Assert
        assert isinstance(result, ChartData)
        assert len(result.labels) > 0
        assert len(result.datasets) > 0

    @pytest.mark.asyncio
    async def test_generate_chart_includes_query_in_title(
        self, analysis_service: AnalysisService
    ) -> None:
        """测试图表标题包含查询内容"""
        # Arrange
        request = AnalysisRequest(
            query="GDP growth",
            analysis_type=AnalysisType.CHART,
        )

        # Act
        result = await analysis_service.generate_chart(request)

        # Assert
        assert "GDP growth" in result.title

    @pytest.mark.asyncio
    async def test_generate_chart_saves_to_document_store(
        self, analysis_service: AnalysisService, mock_doc_store: AsyncMock
    ) -> None:
        """测试图表结果保存到文档存储"""
        # Arrange
        request = AnalysisRequest(
            query="test query",
            analysis_type=AnalysisType.CHART,
        )

        # Act
        await analysis_service.generate_chart(request, user_id="user-123")

        # Assert
        mock_doc_store.create.assert_called_once()
        call_args = mock_doc_store.create.call_args
        assert call_args.kwargs["doc_type"] == DocumentType.CHART_RESULT
        assert call_args.kwargs["owner_id"] == "user-123"
        assert "chart" in call_args.kwargs["tags"]

    @pytest.mark.asyncio
    async def test_generate_chart_default_type_is_bar(
        self, analysis_service: AnalysisService
    ) -> None:
        """测试默认图表类型是柱状图"""
        # Arrange
        request = AnalysisRequest(
            query="test",
            analysis_type=AnalysisType.CHART,
        )

        # Act
        result = await analysis_service.generate_chart(request)

        # Assert
        assert result.chart_type == ChartType.BAR

    # ==================== generate_speaking_notes 测试 ====================

    @pytest.mark.asyncio
    async def test_generate_speaking_notes_returns_notes(
        self, analysis_service: AnalysisService
    ) -> None:
        """测试生成发言稿返回 SpeakingNotes"""
        # Arrange
        request = AnalysisRequest(
            query="Ottawa economic update",
            analysis_type=AnalysisType.SPEAKING_NOTES,
        )

        # Act
        result = await analysis_service.generate_speaking_notes(request)

        # Assert
        assert isinstance(result, SpeakingNotes)
        assert result.title is not None
        assert len(result.key_points) > 0
        assert len(result.statistics) > 0
        assert result.conclusion is not None

    @pytest.mark.asyncio
    async def test_generate_speaking_notes_saves_to_document_store(
        self, analysis_service: AnalysisService, mock_doc_store: AsyncMock
    ) -> None:
        """测试发言稿保存到文档存储"""
        # Arrange
        request = AnalysisRequest(
            query="test query",
            analysis_type=AnalysisType.SPEAKING_NOTES,
        )

        # Act
        await analysis_service.generate_speaking_notes(request, user_id="user-456")

        # Assert
        mock_doc_store.create.assert_called_once()
        call_args = mock_doc_store.create.call_args
        assert call_args.kwargs["doc_type"] == DocumentType.SPEAKING_NOTE
        assert call_args.kwargs["owner_id"] == "user-456"
        assert "notes" in call_args.kwargs["tags"]

    @pytest.mark.asyncio
    async def test_generate_speaking_notes_with_document_ids(
        self, analysis_service: AnalysisService
    ) -> None:
        """测试使用文档 ID 生成发言稿"""
        # Arrange
        request = AnalysisRequest(
            query="summarize documents",
            document_ids=["doc-1", "doc-2"],
            analysis_type=AnalysisType.SPEAKING_NOTES,
        )

        # Act
        result = await analysis_service.generate_speaking_notes(request)

        # Assert
        assert isinstance(result, SpeakingNotes)
        # 未来实现应该使用这些文档 ID


class TestChartData:
    """图表数据 Schema 测试"""

    def test_chart_data_with_all_fields(self) -> None:
        """测试创建完整图表数据"""
        chart = ChartData(
            labels=["Jan", "Feb", "Mar"],
            datasets=[{"label": "Sales", "data": [10, 20, 30]}],
            title="Monthly Sales",
            chart_type=ChartType.LINE,
        )
        assert chart.labels == ["Jan", "Feb", "Mar"]
        assert chart.chart_type == ChartType.LINE

    def test_chart_data_default_type(self) -> None:
        """测试图表默认类型"""
        chart = ChartData(
            labels=["A", "B"],
            datasets=[{"label": "Data", "data": [1, 2]}],
        )
        assert chart.chart_type == ChartType.BAR


class TestSpeakingNotes:
    """发言稿 Schema 测试"""

    def test_speaking_notes_creation(self) -> None:
        """测试创建发言稿"""
        notes = SpeakingNotes(
            title="Quarterly Report",
            key_points=["Point 1", "Point 2"],
            statistics=["Stat 1"],
            conclusion="Good progress",
        )
        assert notes.title == "Quarterly Report"
        assert len(notes.key_points) == 2


class TestAnalysisRequest:
    """分析请求 Schema 测试"""

    def test_analysis_request_chart_type(self) -> None:
        """测试图表分析请求"""
        request = AnalysisRequest(
            query="test",
            analysis_type=AnalysisType.CHART,
        )
        assert request.analysis_type == AnalysisType.CHART
        assert request.document_ids is None

    def test_analysis_request_with_documents(self) -> None:
        """测试带文档 ID 的分析请求"""
        request = AnalysisRequest(
            query="summary",
            document_ids=["doc-1"],
            analysis_type=AnalysisType.SUMMARY,
        )
        assert request.document_ids == ["doc-1"]

"""
Analysis Service Tests

Unit tests for chart generation, speaking notes, and fallback behavior.

@template T2 backend/tests/test_service.py — Service Logic Pattern
"""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.analysis.schemas import AnalysisRequest, ChartData, SpeakingNotes
from app.analysis.service import AnalysisService
from app.core.enums import AnalysisType, ChartType, DocumentType


class TestAnalysisService:
    """Analysis service unit tests"""

    @pytest.fixture
    def mock_doc_store(self) -> AsyncMock:
        """Create mock document store"""
        store = AsyncMock()
        store.create = AsyncMock(return_value={"id": "doc-123"})
        store.get_by_id = AsyncMock(return_value=None)
        return store

    @pytest.fixture
    def mock_openai_service(self) -> AsyncMock:
        """Create mock OpenAI service"""
        service = AsyncMock()
        service.chat_completion = AsyncMock(return_value="null")
        return service

    @pytest.fixture
    def analysis_service(self, mock_doc_store: AsyncMock) -> AnalysisService:
        """Create analysis service without OpenAI (fallback mode)"""
        return AnalysisService(mock_doc_store)

    @pytest.fixture
    def analysis_service_with_llm(
        self, mock_doc_store: AsyncMock, mock_openai_service: AsyncMock
    ) -> AnalysisService:
        """Create analysis service with OpenAI"""
        return AnalysisService(mock_doc_store, openai_service=mock_openai_service)

    # ==================== generate_chart tests ====================

    @pytest.mark.asyncio
    async def test_generate_chart_returns_chart_data(
        self, analysis_service: AnalysisService
    ) -> None:
        """Test that generate_chart returns ChartData"""
        request = AnalysisRequest(
            query="Ottawa employment trends",
            analysis_type=AnalysisType.CHART,
        )

        result = await analysis_service.generate_chart(request)

        assert isinstance(result, ChartData)
        assert len(result.labels) > 0
        assert len(result.datasets) > 0

    @pytest.mark.asyncio
    async def test_generate_chart_includes_query_in_title(
        self, analysis_service: AnalysisService
    ) -> None:
        """Test that chart title includes the query"""
        request = AnalysisRequest(
            query="GDP growth",
            analysis_type=AnalysisType.CHART,
        )

        result = await analysis_service.generate_chart(request)

        assert "GDP growth" in result.title

    @pytest.mark.asyncio
    async def test_generate_chart_saves_to_document_store(
        self, analysis_service: AnalysisService, mock_doc_store: AsyncMock
    ) -> None:
        """Test that chart result is saved to document store"""
        request = AnalysisRequest(
            query="test query",
            analysis_type=AnalysisType.CHART,
        )

        await analysis_service.generate_chart(request, user_id="user-123")

        mock_doc_store.create.assert_called_once()
        call_args = mock_doc_store.create.call_args
        assert call_args.kwargs["doc_type"] == DocumentType.CHART_RESULT
        assert call_args.kwargs["owner_id"] == "user-123"
        assert "chart" in call_args.kwargs["tags"]

    @pytest.mark.asyncio
    async def test_generate_chart_fallback_placeholder(
        self, analysis_service: AnalysisService
    ) -> None:
        """Test fallback to placeholder when no content available"""
        request = AnalysisRequest(
            query="test",
            analysis_type=AnalysisType.CHART,
        )

        result = await analysis_service.generate_chart(request)

        # Should return placeholder data
        assert isinstance(result, ChartData)
        assert len(result.labels) == 4  # Q1-Q4

    @pytest.mark.asyncio
    async def test_generate_chart_with_llm_extraction(
        self,
        analysis_service_with_llm: AnalysisService,
        mock_doc_store: AsyncMock,
        mock_openai_service: AsyncMock,
    ) -> None:
        """Test chart generation with LLM extraction when documents exist"""
        # Mock document store to return content
        mock_doc_store.get_by_id = AsyncMock(
            return_value={"data": {"content": "Q1: 100, Q2: 120, Q3: 115, Q4: 130 employment"}}
        )

        # Mock LLM response with valid chart data
        chart_json = json.dumps({
            "type": "line",
            "title": "Employment Trend",
            "x_key": "period",
            "y_keys": ["value"],
            "data": [
                {"period": "Q1", "value": 100},
                {"period": "Q2", "value": 120},
                {"period": "Q3", "value": 115},
                {"period": "Q4", "value": 130},
            ],
        })
        mock_openai_service.chat_completion.return_value = chart_json

        request = AnalysisRequest(
            query="employment trend",
            document_ids=["doc-1"],
            analysis_type=AnalysisType.CHART,
        )

        result = await analysis_service_with_llm.generate_chart(request)

        assert isinstance(result, ChartData)
        assert result.title == "Employment Trend"
        assert len(result.labels) == 4
        assert len(result.datasets) == 1

    @pytest.mark.asyncio
    async def test_generate_chart_llm_returns_null_falls_back(
        self,
        analysis_service_with_llm: AnalysisService,
        mock_doc_store: AsyncMock,
        mock_openai_service: AsyncMock,
    ) -> None:
        """Test LLM returning 'null' triggers fallback"""
        mock_doc_store.get_by_id = AsyncMock(
            return_value={"data": {"content": "Some text without numeric data"}}
        )
        mock_openai_service.chat_completion.return_value = "null"

        request = AnalysisRequest(
            query="analyze",
            document_ids=["doc-1"],
            analysis_type=AnalysisType.CHART,
        )

        result = await analysis_service_with_llm.generate_chart(request)

        # Should still return a ChartData, either from regex or placeholder
        assert isinstance(result, ChartData)

    # ==================== generate_speaking_notes tests ====================

    @pytest.mark.asyncio
    async def test_generate_speaking_notes_returns_notes(
        self, analysis_service: AnalysisService
    ) -> None:
        """Test that generate_speaking_notes returns SpeakingNotes"""
        request = AnalysisRequest(
            query="Ottawa economic update",
            analysis_type=AnalysisType.SPEAKING_NOTES,
        )

        result = await analysis_service.generate_speaking_notes(request)

        assert isinstance(result, SpeakingNotes)
        assert result.title is not None
        assert len(result.key_points) > 0
        assert len(result.statistics) > 0
        assert result.conclusion is not None

    @pytest.mark.asyncio
    async def test_generate_speaking_notes_saves_to_document_store(
        self, analysis_service: AnalysisService, mock_doc_store: AsyncMock
    ) -> None:
        """Test that speaking notes are saved to document store"""
        request = AnalysisRequest(
            query="test query",
            analysis_type=AnalysisType.SPEAKING_NOTES,
        )

        await analysis_service.generate_speaking_notes(request, user_id="user-456")

        mock_doc_store.create.assert_called_once()
        call_args = mock_doc_store.create.call_args
        assert call_args.kwargs["doc_type"] == DocumentType.SPEAKING_NOTE
        assert call_args.kwargs["owner_id"] == "user-456"
        assert "notes" in call_args.kwargs["tags"]

    @pytest.mark.asyncio
    async def test_generate_speaking_notes_with_llm(
        self,
        analysis_service_with_llm: AnalysisService,
        mock_doc_store: AsyncMock,
        mock_openai_service: AsyncMock,
    ) -> None:
        """Test speaking notes generation with LLM"""
        mock_doc_store.get_by_id = AsyncMock(
            return_value={"data": {"content": "Ottawa GDP grew by 3% in Q3 2024."}}
        )

        notes_json = json.dumps({
            "title": "Ottawa Economic Update",
            "key_points": ["GDP grew by 3%", "Strong Q3 performance"],
            "statistics": ["3% GDP growth in Q3 2024"],
            "conclusion": "Ottawa shows positive economic momentum.",
        })
        mock_openai_service.chat_completion.return_value = notes_json

        request = AnalysisRequest(
            query="summarize",
            document_ids=["doc-1"],
            analysis_type=AnalysisType.SPEAKING_NOTES,
        )

        result = await analysis_service_with_llm.generate_speaking_notes(request)

        assert isinstance(result, SpeakingNotes)
        assert result.title == "Ottawa Economic Update"
        assert len(result.key_points) == 2

    @pytest.mark.asyncio
    async def test_generate_speaking_notes_with_document_ids(
        self, analysis_service: AnalysisService
    ) -> None:
        """Test speaking notes with document IDs (no LLM, fallback)"""
        request = AnalysisRequest(
            query="summarize documents",
            document_ids=["doc-1", "doc-2"],
            analysis_type=AnalysisType.SPEAKING_NOTES,
        )

        result = await analysis_service.generate_speaking_notes(request)

        assert isinstance(result, SpeakingNotes)


class TestChartData:
    """ChartData schema tests"""

    def test_chart_data_with_all_fields(self) -> None:
        """Test creating ChartData with all fields"""
        chart = ChartData(
            labels=["Jan", "Feb", "Mar"],
            datasets=[{"label": "Sales", "data": [10, 20, 30]}],
            title="Monthly Sales",
            chart_type=ChartType.LINE,
        )
        assert chart.labels == ["Jan", "Feb", "Mar"]
        assert chart.chart_type == ChartType.LINE

    def test_chart_data_default_type(self) -> None:
        """Test default chart type is BAR"""
        chart = ChartData(
            labels=["A", "B"],
            datasets=[{"label": "Data", "data": [1, 2]}],
        )
        assert chart.chart_type == ChartType.BAR


class TestSpeakingNotes:
    """SpeakingNotes schema tests"""

    def test_speaking_notes_creation(self) -> None:
        """Test creating speaking notes"""
        notes = SpeakingNotes(
            title="Quarterly Report",
            key_points=["Point 1", "Point 2"],
            statistics=["Stat 1"],
            conclusion="Good progress",
        )
        assert notes.title == "Quarterly Report"
        assert len(notes.key_points) == 2


class TestAnalysisRequest:
    """AnalysisRequest schema tests"""

    def test_analysis_request_chart_type(self) -> None:
        """Test chart analysis request"""
        request = AnalysisRequest(
            query="test",
            analysis_type=AnalysisType.CHART,
        )
        assert request.analysis_type == AnalysisType.CHART
        assert request.document_ids is None

    def test_analysis_request_with_documents(self) -> None:
        """Test analysis request with document IDs"""
        request = AnalysisRequest(
            query="summary",
            document_ids=["doc-1"],
            analysis_type=AnalysisType.SUMMARY,
        )
        assert request.document_ids == ["doc-1"]

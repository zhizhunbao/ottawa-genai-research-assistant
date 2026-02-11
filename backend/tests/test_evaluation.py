"""
LLM 评估服务单元测试

US-303: 测试 6 维度评估逻辑、结果存储和汇总统计。
"""

import json
from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.evaluation.schemas import (
    DIMENSION_THRESHOLDS,
    DimensionScore,
    EvaluationDimension,
    EvaluationRequest,
    EvaluationResult,
    EvaluationSummary,
)
from app.evaluation.service import LLMEvaluationService


@pytest.fixture
def mock_db():
    """模拟数据库会话"""
    db = AsyncMock()
    db.add = MagicMock()
    db.commit = AsyncMock()
    return db


@pytest.fixture
def mock_openai():
    """模拟 OpenAI 服务"""
    service = AsyncMock()
    service.chat_completion = AsyncMock(
        return_value=json.dumps({"score": 4.5, "explanation": "Good quality response"})
    )
    return service


@pytest.fixture
def eval_service(mock_db, mock_openai):
    """创建评估服务实例"""
    return LLMEvaluationService(db=mock_db, openai_service=mock_openai)


@pytest.fixture
def eval_service_no_llm(mock_db):
    """无 OpenAI 的评估服务实例"""
    return LLMEvaluationService(db=mock_db, openai_service=None)


@pytest.fixture
def sample_request():
    """示例评估请求"""
    return EvaluationRequest(
        query="What is Ottawa's population growth trend?",
        response="Ottawa's population has grown steadily from 934,000 in 2016 to over 1,000,000 in 2021.",
        context=[
            "Ottawa population census 2016: 934,243",
            "Ottawa population census 2021: 1,017,449",
        ],
        sources=["census-2016.pdf", "census-2021.pdf"],
    )


class TestEvaluationDimension:
    """评估维度枚举测试"""

    def test_all_dimensions_exist(self):
        assert len(EvaluationDimension) == 6

    def test_dimension_values(self):
        assert EvaluationDimension.COHERENCE == "coherence"
        assert EvaluationDimension.RELEVANCY == "relevancy"
        assert EvaluationDimension.COMPLETENESS == "completeness"
        assert EvaluationDimension.GROUNDING == "grounding"
        assert EvaluationDimension.HELPFULNESS == "helpfulness"
        assert EvaluationDimension.FAITHFULNESS == "faithfulness"

    def test_all_dimensions_have_thresholds(self):
        for dim in EvaluationDimension:
            assert dim in DIMENSION_THRESHOLDS


class TestDimensionScore:
    """维度评分模型测试"""

    def test_valid_score(self):
        score = DimensionScore(
            dimension=EvaluationDimension.COHERENCE,
            score=4.5,
            explanation="Well structured",
        )
        assert score.score == 4.5
        assert score.dimension == EvaluationDimension.COHERENCE

    def test_score_min_boundary(self):
        score = DimensionScore(
            dimension=EvaluationDimension.RELEVANCY, score=1.0, explanation="Minimum"
        )
        assert score.score == 1.0

    def test_score_max_boundary(self):
        score = DimensionScore(
            dimension=EvaluationDimension.RELEVANCY, score=5.0, explanation="Maximum"
        )
        assert score.score == 5.0

    def test_score_below_minimum_raises(self):
        with pytest.raises(Exception):
            DimensionScore(
                dimension=EvaluationDimension.COHERENCE,
                score=0.5,
                explanation="Too low",
            )

    def test_score_above_maximum_raises(self):
        with pytest.raises(Exception):
            DimensionScore(
                dimension=EvaluationDimension.COHERENCE,
                score=5.5,
                explanation="Too high",
            )


class TestEvaluationRequest:
    """评估请求模型测试"""

    def test_valid_request(self, sample_request):
        assert sample_request.query != ""
        assert sample_request.response != ""
        assert len(sample_request.context) == 2

    def test_minimal_request(self):
        req = EvaluationRequest(
            query="test",
            response="test response",
        )
        assert req.context == []
        assert req.sources == []


class TestEvaluationResult:
    """评估结果模型测试"""

    def test_valid_result(self):
        scores = [
            DimensionScore(
                dimension=dim, score=4.0, explanation="Good"
            )
            for dim in EvaluationDimension
        ]
        result = EvaluationResult(
            id="test-id",
            query="test query",
            response="test response",
            scores=scores,
            overall_score=4.0,
        )
        assert result.overall_score == 4.0
        assert len(result.scores) == 6
        assert result.alerts == []

    def test_result_with_alerts(self):
        result = EvaluationResult(
            id="test-id",
            query="test",
            response="test",
            scores=[],
            overall_score=2.0,
            alerts=["coherence: 2.0 < 4.0"],
        )
        assert len(result.alerts) == 1


class TestLLMEvaluationService:
    """LLM 评估服务测试"""

    @pytest.mark.asyncio
    async def test_evaluate_calls_llm_for_all_dimensions(
        self, eval_service, mock_openai, sample_request
    ):
        """验证评估服务对每个维度调用 LLM"""
        result = await eval_service.evaluate(sample_request)

        assert mock_openai.chat_completion.call_count == 6
        assert len(result.scores) == 6
        assert result.overall_score == 4.5

    @pytest.mark.asyncio
    async def test_evaluate_saves_to_db(self, eval_service, mock_db, sample_request):
        """验证评估结果保存到数据库"""
        await eval_service.evaluate(sample_request)

        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_evaluate_generates_alerts_for_low_scores(
        self, mock_db, sample_request
    ):
        """验证低于阈值时生成告警"""
        mock_openai = AsyncMock()
        mock_openai.chat_completion = AsyncMock(
            return_value=json.dumps({"score": 2.0, "explanation": "Poor quality"})
        )
        service = LLMEvaluationService(db=mock_db, openai_service=mock_openai)

        result = await service.evaluate(sample_request)

        # 所有维度都是 2.0，都低于各自阈值
        assert len(result.alerts) == 6
        assert result.overall_score == 2.0

    @pytest.mark.asyncio
    async def test_evaluate_without_openai_returns_defaults(
        self, eval_service_no_llm, sample_request
    ):
        """验证无 OpenAI 时返回默认分数"""
        result = await eval_service_no_llm.evaluate(sample_request)

        assert len(result.scores) == 6
        for score in result.scores:
            assert score.score == 3.0
            assert "not configured" in score.explanation.lower()

    @pytest.mark.asyncio
    async def test_evaluate_handles_malformed_llm_response(
        self, mock_db, sample_request
    ):
        """验证处理 LLM 返回格式错误的情况"""
        mock_openai = AsyncMock()
        mock_openai.chat_completion = AsyncMock(return_value="not json at all")
        service = LLMEvaluationService(db=mock_db, openai_service=mock_openai)

        result = await service.evaluate(sample_request)

        # 应该 fallback 到默认分数 3.0
        assert len(result.scores) == 6
        for score in result.scores:
            assert score.score == 3.0

    @pytest.mark.asyncio
    async def test_evaluate_handles_llm_exception(self, mock_db, sample_request):
        """验证处理 LLM 调用异常"""
        mock_openai = AsyncMock()
        mock_openai.chat_completion = AsyncMock(side_effect=Exception("API Error"))
        service = LLMEvaluationService(db=mock_db, openai_service=mock_openai)

        result = await service.evaluate(sample_request)

        assert len(result.scores) == 6
        for score in result.scores:
            assert score.score == 3.0

    @pytest.mark.asyncio
    async def test_evaluate_clamps_score_range(self, mock_db, sample_request):
        """验证分数被限制在 1-5 范围"""
        mock_openai = AsyncMock()
        mock_openai.chat_completion = AsyncMock(
            return_value=json.dumps({"score": 99, "explanation": "Unreasonably high"})
        )
        service = LLMEvaluationService(db=mock_db, openai_service=mock_openai)

        result = await service.evaluate(sample_request)

        for score in result.scores:
            assert 1.0 <= score.score <= 5.0

    @pytest.mark.asyncio
    async def test_evaluate_cleans_markdown_json(self, mock_db, sample_request):
        """验证正确清理 markdown 包装的 JSON"""
        mock_openai = AsyncMock()
        mock_openai.chat_completion = AsyncMock(
            return_value='```json\n{"score": 4.0, "explanation": "Wrapped in markdown"}\n```'
        )
        service = LLMEvaluationService(db=mock_db, openai_service=mock_openai)

        result = await service.evaluate(sample_request)

        for score in result.scores:
            assert score.score == 4.0


class TestEvaluationSummary:
    """评估汇总测试"""

    @pytest.mark.asyncio
    async def test_get_summary_empty(self, eval_service):
        """验证无数据时返回空汇总"""
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = []
        eval_service.db.execute = AsyncMock(return_value=mock_result)

        summary = await eval_service.get_summary()

        assert summary.total_evaluations == 0
        assert summary.overall_average == 0.0

    def test_summary_model_defaults(self):
        summary = EvaluationSummary()
        assert summary.total_evaluations == 0
        assert summary.overall_average == 0.0
        assert summary.dimension_averages == {}
        assert summary.alerts_count == 0
        assert summary.recent_evaluations == []

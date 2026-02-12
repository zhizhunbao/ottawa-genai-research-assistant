"""
LLM 评估 Schemas

定义 US-303 LLM Evaluation Framework 的数据模型。
6 维度评估：Coherence, Relevancy, Completeness, Grounding, Helpfulness, Faithfulness

@template A8 backend/domain/schemas.py — Pydantic Models
"""

from datetime import UTC, datetime
from enum import StrEnum

from pydantic import BaseModel, Field


class EvaluationDimension(StrEnum):
    """评估维度"""
    COHERENCE = "coherence"
    RELEVANCY = "relevancy"
    COMPLETENESS = "completeness"
    GROUNDING = "grounding"
    HELPFULNESS = "helpfulness"
    FAITHFULNESS = "faithfulness"


# 默认阈值
DIMENSION_THRESHOLDS: dict[str, float] = {
    EvaluationDimension.COHERENCE: 4.0,
    EvaluationDimension.RELEVANCY: 4.0,
    EvaluationDimension.COMPLETENESS: 3.5,
    EvaluationDimension.GROUNDING: 4.5,
    EvaluationDimension.HELPFULNESS: 4.0,
    EvaluationDimension.FAITHFULNESS: 4.5,
}


class DimensionScore(BaseModel):
    """单维度评分"""
    dimension: EvaluationDimension
    score: float = Field(..., ge=1.0, le=5.0, description="1-5 分")
    explanation: str = Field("", description="评分理由")


class EvaluationRequest(BaseModel):
    """评估请求"""
    query: str = Field(..., description="用户问题")
    response: str = Field(..., description="LLM 回答")
    context: list[str] = Field(default_factory=list, description="检索到的上下文片段")
    sources: list[str] = Field(default_factory=list, description="来源文档名称")


class EvaluationResult(BaseModel):
    """评估结果"""
    id: str = Field(..., description="评估记录 ID")
    query: str
    response: str
    scores: list[DimensionScore]
    overall_score: float = Field(..., ge=1.0, le=5.0)
    alerts: list[str] = Field(
        default_factory=list,
        description="低于阈值的维度列表",
    )
    evaluated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class EvaluationSummary(BaseModel):
    """评估汇总统计"""
    total_evaluations: int = 0
    overall_average: float = 0.0
    dimension_averages: dict[str, float] = Field(default_factory=dict)
    alerts_count: int = 0
    recent_evaluations: list[EvaluationResult] = Field(default_factory=list)

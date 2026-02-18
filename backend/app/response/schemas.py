"""
Response Assembly Schemas

Defines the unified response envelope structure that combines RAG components.

@template A8 backend/domain/schemas.py — Pydantic Models
"""

from datetime import datetime
from enum import StrEnum, Enum
from typing import Any

from pydantic import BaseModel, Field


# ─── Citation Schemas ─────────────────────────────────────────────────


class Citation(BaseModel):
    """引用来源"""
    id: str = Field(..., description="唯一标识")
    source: str = Field(..., description="来源文档名称")
    snippet: str = Field(..., description="引用的内容片段")
    page: int | None = Field(None, description="页码")
    url: str | None = Field(None, description="来源 URL")
    confidence: float = Field(default=1.0, ge=0, le=1, description="该引用的置信度")


# ─── Confidence Score Schemas ─────────────────────────────────────────


class ConfidenceScore(BaseModel):
    """综合置信度评分"""
    overall: float = Field(..., ge=0, le=1, description="综合置信度")
    grounding: float = Field(..., ge=0, le=1, description="上下文支撑度")
    relevance: float = Field(..., ge=0, le=1, description="查询相关度")
    completeness: float = Field(..., ge=0, le=1, description="回答完整度")


# ─── Query Metadata Schemas ───────────────────────────────────────────


class SearchMethod(StrEnum):
    """搜索方法"""
    HYBRID = "hybrid"
    SEMANTIC = "semantic"
    KEYWORD = "keyword"


class QueryMetadata(BaseModel):
    """查询元数据"""
    method: SearchMethod = Field(default=SearchMethod.HYBRID, description="搜索方法")
    llm_model: str = Field(..., description="使用的 LLM 模型")
    search_engine: str = Field(..., description="搜索引擎")
    embedding_model: str = Field(..., description="Embedding 模型")
    reranker: str | None = Field(None, description="重排序模型")
    latency_ms: float = Field(..., description="响应延迟(毫秒)")


# ─── Chart Data Schema (extended from research) ────────────────────────


class ChartType(str, Enum):
    """图表类型"""

    LINE = "line"
    BAR = "bar"
    PIE = "pie"


class ChartData(BaseModel):
    """图表数据结构"""

    type: ChartType = Field(..., description="图表类型")
    title: str | None = Field(None, description="图表标题")
    x_key: str | None = Field(None, description="X 轴数据键名")
    y_keys: list[str] | None = Field(None, description="Y 轴数据键名列表")
    data: list[dict[str, Any]] = Field(default_factory=list, description="图表数据")
    stacked: bool = Field(False, description="是否堆叠显示")


# ─── Evaluation Integration ─────────────────────────────────────────────


class EvaluationDimension(StrEnum):
    """评估维度"""
    COHERENCE = "coherence"
    RELEVANCY = "relevancy"
    COMPLETENESS = "completeness"
    GROUNDING = "grounding"
    HELPFULNESS = "helpfulness"
    FAITHFULNESS = "faithfulness"


class DimensionScore(BaseModel):
    """单维度评分"""
    dimension: EvaluationDimension
    score: float = Field(..., ge=1.0, le=5.0)
    explanation: str = Field("", description="评分理由")


class EvaluationScores(BaseModel):
    """评估分数 (来自 EvaluationService)"""
    id: str = Field(..., description="评估记录 ID")
    overall_score: float = Field(..., ge=1.0, le=5.0)
    scores: list[DimensionScore]
    alerts: list[str] = Field(default_factory=list)
    evaluated_at: datetime = Field(default_factory=datetime.utcnow)


# ─── Main Response Envelope ────────────────────────────────────────────


class ResponseEnvelope(BaseModel):
    """
    统一的响应组装结构
    
    整合 RAG 各组件输出:
    - research 服务的 answer, sources
    - evaluation 服务的 6 维度评分
    - chart extraction 的图表数据
    - 计算 4 维度 confidence scores
    """
    
    # 主要回答内容
    answer: str = Field(..., description="主要回答")
    
    # 推理过程 (可选显示)
    thinking: str | None = Field(None, description="推理过程")
    
    # 图表数据 (数组，支持多个图表)
    charts: list[ChartData] = Field(default_factory=list, description="提取的图表列表")
    
    # 引用列表
    citations: list[Citation] = Field(default_factory=list, description="引用列表")
    
    # 综合置信度 (4 维度)
    confidence: ConfidenceScore = Field(..., description="置信度评分")
    
    # 查询元数据
    query_info: QueryMetadata = Field(..., description="查询元数据")
    
    # 评估分数 (可选)
    evaluation: EvaluationScores | None = Field(None, description="6维度评估分数")
    
    # 时间戳
    created_at: datetime = Field(default_factory=datetime.utcnow, description="创建时间")


# ─── Request Schemas ────────────────────────────────────────────────────


class AssembleRequest(BaseModel):
    """组装响应请求"""
    query: str = Field(..., description="用户问题")
    answer: str = Field(..., description="LLM 回答")
    sources: list[dict[str, Any]] = Field(default_factory=list, description="检索到的来源")
    context: list[str] = Field(default_factory=list, description="上下文片段")
    llm_model: str = Field(..., description="LLM 模型")
    search_engine: str = Field(default="azure-search", description="搜索引擎")
    embedding_model: str = Field(default="ada-002", description="Embedding 模型")
    latency_ms: float = Field(default=0.0, description="延迟(毫秒)")
    chart_data: ChartData | None = Field(None, description="图表数据")
    evaluation_result: EvaluationScores | None = Field(None, description="评估结果")

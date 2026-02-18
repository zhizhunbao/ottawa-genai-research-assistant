"""
Response Assembly Service

Core logic for assembling RAG responses into a unified envelope.

@template A10 backend/domain/service.py — Shared CRUD & Logic Layer
"""

import logging
from typing import Any

from app.response.schemas import (
    AssembleRequest,
    Citation,
    ConfidenceScore,
    EvaluationDimension,
    QueryMetadata,
    ResponseEnvelope,
    SearchMethod,
)

logger = logging.getLogger(__name__)

# ── Confidence Score Weights ───────────────────────────────────────────

# 评估维度到置信度子维度的映射
# Evaluation 分数 (1-5) -> Confidence 分数 (0-1)
EVALUATION_TO_CONFIDENCE_MAP: dict[str, tuple[str, float]] = {
    "grounding": ("grounding", 1.0),  # 直接映射
    "relevancy": ("relevance", 1.0),  # 直接映射
    "completeness": ("completeness", 1.0),  # 直接映射
}

# 默认权重 (当没有 evaluation 时使用)
DEFAULT_CONFIDENCE_WEIGHTS = {
    "grounding": 0.35,
    "relevance": 0.35,
    "completeness": 0.30,
}


# ── Citation Generation ─────────────────────────────────────────────────


def _generate_citations(sources: list[dict[str, Any]]) -> list[Citation]:
    """
    从 sources 生成结构化 citations
    
    Args:
        sources: 检索结果列表
        
    Returns:
        Citation 列表
    """
    citations = []
    
    for idx, source in enumerate(sources[:10]):  # 最多 10 个引用
        citation = Citation(
            id=f"cite-{idx + 1}",
            source=source.get("title", "Unknown"),
            snippet=source.get("content", "")[:200],  # 截取前 200 字符
            page=source.get("metadata", {}).get("page_number"),
            url=None,  # 可扩展
            confidence=source.get("score", 1.0),
        )
        citations.append(citation)
    
    return citations


# ── Confidence Score Calculation ──────────────────────────────────────


def _calculate_confidence_scores(
    sources: list[dict[str, Any]],
    evaluation_result: dict[str, Any] | None,
) -> ConfidenceScore:
    """
    计算 4 维度置信度分数
    
    Args:
        sources: 检索结果
        evaluation_result: 评估结果 (可选)
        
    Returns:
        ConfidenceScore
    """
    # 如果有评估结果，使用评估维度映射
    if evaluation_result and evaluation_result.get("scores"):
        scores_map = {}
        
        for dim_score in evaluation_result["scores"]:
            dimension = dim_score.get("dimension", "")
            score = dim_score.get("score", 3.0)  # 默认 3.0
            
            # 转换为 0-1 范围: (score - 1) / 4
            normalized = (score - 1.0) / 4.0
            
            if dimension in EVALUATION_TO_CONFIDENCE_MAP:
                conf_key, _ = EVALUATION_TO_CONFIDENCE_MAP[dimension]
                scores_map[conf_key] = normalized
        
        # 填充缺失的维度
        for key in ["grounding", "relevance", "completeness"]:
            if key not in scores_map:
                scores_map[key] = 0.5  # 默认中等置信度
        
        # 计算综合分数
        overall = (
            scores_map["grounding"] * DEFAULT_CONFIDENCE_WEIGHTS["grounding"]
            + scores_map["relevance"] * DEFAULT_CONFIDENCE_WEIGHTS["relevance"]
            + scores_map["completeness"] * DEFAULT_CONFIDENCE_WEIGHTS["completeness"]
        )
        
        return ConfidenceScore(
            overall=round(overall, 3),
            grounding=round(scores_map["grounding"], 3),
            relevance=round(scores_map["relevance"], 3),
            completeness=round(scores_map["completeness"], 3),
        )
    
    # 没有评估结果时，基于 sources 计算
    if not sources:
        return ConfidenceScore(
            overall=0.3,
            grounding=0.2,
            relevance=0.3,
            completeness=0.4,
        )
    
    # 基于 source scores 计算
    scores = [s.get("score", 0.0) for s in sources]
    avg_score = sum(scores) / len(scores) if scores else 0.0
    
    # 映射到置信度维度
    grounding = min(avg_score * 1.1, 1.0)  # 有 sources 支持
    relevance = avg_score  # 直接使用 relevance score
    completeness = min(avg_score * 0.9 + 0.2, 1.0)  # 假设有 context 就比较完整
    
    overall = (
        grounding * DEFAULT_CONFIDENCE_WEIGHTS["grounding"]
        + relevance * DEFAULT_CONFIDENCE_WEIGHTS["relevance"]
        + completeness * DEFAULT_CONFIDENCE_WEIGHTS["completeness"]
    )
    
    return ConfidenceScore(
        overall=round(overall, 3),
        grounding=round(grounding, 3),
        relevance=round(relevance, 3),
        completeness=round(completeness, 3),
    )


# ── Main Assembler ──────────────────────────────────────────────────────


class ResponseAssembler:
    """响应组装器 - 整合 RAG 各组件输出"""
    
    def __init__(self) -> None:
        """初始化组装器"""
        pass
    
    async def assemble(self, request: AssembleRequest) -> ResponseEnvelope:
        """
        组装统一的响应 envelope
        
        Args:
            request: 组装请求
            
        Returns:
            ResponseEnvelope
        """
        # 1. 生成 citations
        citations = _generate_citations(request.sources)
        
        # 2. 计算置信度分数
        eval_result_dict = None
        if request.evaluation_result:
            eval_result_dict = request.evaluation_result.model_dump(
                mode="json"
            ) if hasattr(request.evaluation_result, "model_dump") else request.evaluation_result
        
        confidence = _calculate_confidence_scores(
            sources=request.sources,
            evaluation_result=eval_result_dict,
        )
        
        # 3. 构建查询元数据
        query_info = QueryMetadata(
            method=SearchMethod.HYBRID,
            llm_model=request.llm_model,
            search_engine=request.search_engine,
            embedding_model=request.embedding_model,
            reranker=None,  # 可扩展
            latency_ms=request.latency_ms,
        )
        
        # 4. 处理 charts
        charts = []
        if request.chart_data:
            charts.append(request.chart_data)
        
        # 5. 构建响应 envelope
        envelope = ResponseEnvelope(
            answer=request.answer,
            thinking=None,  # 可扩展：支持 thinking 字段
            charts=charts,
            citations=citations,
            confidence=confidence,
            query_info=query_info,
            evaluation=request.evaluation_result,
        )
        
        logger.debug(
            f"Assembled response envelope: answer_len={len(request.answer)}, "
            f"citations={len(citations)}, confidence={confidence.overall}"
        )
        
        return envelope
    
    def assemble_sync(self, request: AssembleRequest) -> ResponseEnvelope:
        """同步版本 (用于非 async 场景)"""
        # 1. 生成 citations
        citations = _generate_citations(request.sources)
        
        # 2. 计算置信度分数
        eval_result_dict = None
        if request.evaluation_result:
            eval_result_dict = request.evaluation_result.model_dump(
                mode="json"
            ) if hasattr(request.evaluation_result, "model_dump") else request.evaluation_result
        
        confidence = _calculate_confidence_scores(
            sources=request.sources,
            evaluation_result=eval_result_dict,
        )
        
        # 3. 构建查询元数据
        query_info = QueryMetadata(
            method=SearchMethod.HYBRID,
            llm_model=request.llm_model,
            search_engine=request.search_engine,
            embedding_model=request.embedding_model,
            reranker=None,
            latency_ms=request.latency_ms,
        )
        
        # 4. 处理 charts
        charts = []
        if request.chart_data:
            charts.append(request.chart_data)
        
        # 5. 构建响应 envelope
        return ResponseEnvelope(
            answer=request.answer,
            thinking=None,
            charts=charts,
            citations=citations,
            confidence=confidence,
            query_info=query_info,
            evaluation=request.evaluation_result,
        )


# 全局默认实例
response_assembler = ResponseAssembler()

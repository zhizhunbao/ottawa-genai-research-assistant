"""
LLM Evaluation Service Layer

Implements a 'judge-as-LLM' approach for evaluating RAG response quality.
Assesses responses across multiple dimensions and persists results.

@template A10 backend/domain/service.py — Shared CRUD & Logic Layer
"""

import json
import logging
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import DocumentStatus, DocumentType
from app.core.models import UniversalDocument
from app.core.utils import generate_uuid
from app.azure.prompts import EVALUATION_PROMPTS, EVALUATION_SYSTEM_PROMPT
from app.evaluation.schemas import (
    DIMENSION_THRESHOLDS,
    DimensionScore,
    EvaluationDimension,
    EvaluationRequest,
    EvaluationResult,
    EvaluationSummary,
)

logger = logging.getLogger(__name__)


class LLMEvaluationService:
    """LLM 响应质量评估服务"""

    def __init__(
        self,
        db: AsyncSession,
        openai_service: Any = None,
    ) -> None:
        self.db = db
        self._openai_service = openai_service

    async def evaluate(self, request: EvaluationRequest) -> EvaluationResult:
        """
        评估单个 LLM 响应的质量

        Args:
            request: 评估请求（包含 query, response, context, sources）

        Returns:
            包含 6 维度评分的评估结果
        """
        scores: list[DimensionScore] = []

        for dimension in EvaluationDimension:
            score = await self._evaluate_dimension(
                dimension=dimension,
                query=request.query,
                response=request.response,
                context=request.context,
            )
            scores.append(score)

        overall_score = sum(s.score for s in scores) / len(scores)

        # 检查哪些维度低于阈值
        alerts = [
            f"{s.dimension.value}: {s.score:.1f} < {DIMENSION_THRESHOLDS[s.dimension]}"
            for s in scores
            if s.score < DIMENSION_THRESHOLDS[s.dimension]
        ]

        result = EvaluationResult(
            id=generate_uuid(),
            query=request.query,
            response=request.response,
            scores=scores,
            overall_score=round(overall_score, 2),
            alerts=alerts,
            evaluated_at=datetime.now(UTC),
        )

        # 存储到数据库
        await self._save_result(result)

        if alerts:
            logger.warning(
                f"Evaluation alerts for query '{request.query[:50]}...': {alerts}"
            )

        return result

    async def _evaluate_dimension(
        self,
        dimension: EvaluationDimension,
        query: str,
        response: str,
        context: list[str],
    ) -> DimensionScore:
        """使用 LLM 评估单个维度"""

        if not self._openai_service:
            logger.warning("OpenAI not configured, returning default score")
            return DimensionScore(
                dimension=dimension,
                score=3.0,
                explanation="OpenAI service not configured — default score",
            )

        prompt_template = EVALUATION_PROMPTS[dimension.value]
        prompt = prompt_template.format(
            query=query,
            response=response,
            context="\n---\n".join(context[:5]) if context else "(no context provided)",
        )

        try:
            result_text = await self._openai_service.chat_completion(
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                system_prompt=EVALUATION_SYSTEM_PROMPT,
            )

            # 清理 markdown 代码块
            cleaned = result_text.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned.replace("```json", "", 1)
            if cleaned.endswith("```"):
                cleaned = cleaned.rsplit("```", 1)[0]
            cleaned = cleaned.strip()

            parsed = json.loads(cleaned)
            score = max(1.0, min(5.0, float(parsed.get("score", 3.0))))

            return DimensionScore(
                dimension=dimension,
                score=score,
                explanation=parsed.get("explanation", ""),
            )
        except Exception as e:
            logger.error(f"Failed to evaluate {dimension.value}: {e}")
            return DimensionScore(
                dimension=dimension,
                score=3.0,
                explanation=f"Evaluation failed: {e}",
            )

    async def _save_result(self, result: EvaluationResult) -> None:
        """将评估结果存储为 UniversalDocument"""
        doc = UniversalDocument(
            id=result.id,
            type=DocumentType.EVALUATION_RESULT,
            data=result.model_dump(mode="json"),
            status=DocumentStatus.ACTIVE,
            tags=["evaluation", *[f"alert:{a.split(':')[0]}" for a in result.alerts]],
        )
        self.db.add(doc)
        await self.db.commit()

    async def get_summary(self, limit: int = 20) -> EvaluationSummary:
        """
        获取评估汇总统计

        Args:
            limit: 最近评估记录数量

        Returns:
            评估汇总
        """
        stmt = (
            select(UniversalDocument)
            .where(UniversalDocument.type == DocumentType.EVALUATION_RESULT)
            .order_by(desc(UniversalDocument.created_at))
            .limit(limit)
        )
        db_result = await self.db.execute(stmt)
        docs = db_result.scalars().all()

        if not docs:
            return EvaluationSummary()

        # 解析所有评估结果
        results: list[EvaluationResult] = []
        for doc in docs:
            try:
                results.append(EvaluationResult(**doc.data))
            except Exception as e:
                logger.warning(f"Failed to parse evaluation result {doc.id}: {e}")

        if not results:
            return EvaluationSummary()

        # 计算总体平均分
        overall_avg = sum(r.overall_score for r in results) / len(results)

        # 计算各维度平均分
        dim_totals: dict[str, list[float]] = {d.value: [] for d in EvaluationDimension}
        total_alerts = 0

        for r in results:
            total_alerts += len(r.alerts)
            for s in r.scores:
                dim_totals[s.dimension.value].append(s.score)

        dim_averages = {
            dim: round(sum(scores) / len(scores), 2) if scores else 0.0
            for dim, scores in dim_totals.items()
        }

        return EvaluationSummary(
            total_evaluations=len(results),
            overall_average=round(overall_avg, 2),
            dimension_averages=dim_averages,
            alerts_count=total_alerts,
            recent_evaluations=results[:10],
        )

# US-303: LLM Evaluation Framework - Implementation Plan

## Overview

实现 LLM 响应质量自动评估框架，持续监控和优化系统性能。

**User Story**: US-303
**Sprint**: 5
**Story Points**: 7
**Status**: ⬜ To Do

---

## 需求重述

- 实现 6 维度评估：Coherence, Relevancy, Completeness, Grounding, Helpfulness, Faithfulness
- 每个维度评分 1-5
- 评估结果存储和可查询
- 低于阈值时触发告警
- 生成周期性评估报告

---

## 评估维度规格

| 维度 | 描述 | 目标分数 |
|------|------|----------|
| Coherence | 响应逻辑连贯性 | ≥ 4.0/5.0 |
| Relevancy | 响应与问题相关性 | ≥ 4.0/5.0 |
| Completeness | 响应完整性 | ≥ 3.5/5.0 |
| Grounding | 基于检索内容 (无幻觉) | ≥ 4.5/5.0 |
| Helpfulness | 响应有用性 | ≥ 4.0/5.0 |
| Faithfulness | 与引用一致性 | ≥ 4.5/5.0 |

---

## 实现阶段

### 阶段 1: 评估服务架构设计 (Travis Yi - 3h)

#### 1.1 架构设计

```
Query Response → Evaluation Queue → Evaluation Service → Results Storage
                                          ↓
                                    Alert Service (if below threshold)
                                          ↓
                                    Dashboard (visualization)
```

#### 1.2 评估 Schema

**文件**: `backend/app/evaluation/schemas.py`

```python
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum

class EvaluationDimension(str, Enum):
    COHERENCE = "coherence"
    RELEVANCY = "relevancy"
    COMPLETENESS = "completeness"
    GROUNDING = "grounding"
    HELPFULNESS = "helpfulness"
    FAITHFULNESS = "faithfulness"

class DimensionScore(BaseModel):
    dimension: EvaluationDimension
    score: float = Field(..., ge=1.0, le=5.0)
    explanation: str

class EvaluationResult(BaseModel):
    id: str
    query_id: str
    query: str
    response: str
    sources: list[str]
    scores: list[DimensionScore]
    overall_score: float
    evaluated_at: datetime
    model_version: str

class EvaluationThresholds(BaseModel):
    coherence: float = 4.0
    relevancy: float = 4.0
    completeness: float = 3.5
    grounding: float = 4.5
    helpfulness: float = 4.0
    faithfulness: float = 4.5
```

---

### 阶段 2: 6 维度评估逻辑实现 (Peng Wang - 8h)

#### 2.1 评估服务

**文件**: `backend/app/evaluation/service.py`

```python
"""LLM 评估服务"""

from app.core.azure_openai import AzureOpenAIService
from app.evaluation.schemas import EvaluationResult, DimensionScore
from app.evaluation.prompts import EVALUATION_PROMPTS

class LLMEvaluationService:
    """LLM 响应质量评估"""

    def __init__(self, openai_service: AzureOpenAIService):
        self.openai = openai_service

    async def evaluate_response(
        self,
        query: str,
        response: str,
        context: list[str],
        sources: list[str]
    ) -> EvaluationResult:
        """评估单个响应"""
        scores = []

        for dimension in EvaluationDimension:
            score = await self._evaluate_dimension(
                dimension=dimension,
                query=query,
                response=response,
                context=context
            )
            scores.append(score)

        overall_score = sum(s.score for s in scores) / len(scores)

        return EvaluationResult(
            id=str(uuid.uuid4()),
            query_id=query_id,
            query=query,
            response=response,
            sources=sources,
            scores=scores,
            overall_score=overall_score,
            evaluated_at=datetime.utcnow(),
            model_version="gpt-4o"
        )

    async def _evaluate_dimension(
        self,
        dimension: EvaluationDimension,
        query: str,
        response: str,
        context: list[str]
    ) -> DimensionScore:
        """评估单个维度"""
        prompt = EVALUATION_PROMPTS[dimension].format(
            query=query,
            response=response,
            context="\n".join(context)
        )

        result = await self.openai.generate_completion(
            prompt,
            response_format={"type": "json_object"}
        )

        parsed = json.loads(result)

        return DimensionScore(
            dimension=dimension,
            score=parsed["score"],
            explanation=parsed["explanation"]
        )
```

#### 2.2 评估 Prompt 模板

**文件**: `backend/app/evaluation/prompts.py`

```python
"""评估 Prompt 模板"""

EVALUATION_PROMPTS = {
    EvaluationDimension.COHERENCE: """
Evaluate the coherence of the following response.
Coherence measures how logically structured and easy to follow the response is.

Query: {query}
Response: {response}

Rate from 1-5 where:
1 = Completely incoherent, disorganized
2 = Mostly incoherent, hard to follow
3 = Partially coherent, some logical flow
4 = Mostly coherent, well-structured
5 = Perfectly coherent, excellent logical flow

Return JSON: {{"score": <1-5>, "explanation": "<brief explanation>"}}
""",

    EvaluationDimension.RELEVANCY: """
Evaluate how relevant the response is to the query.

Query: {query}
Response: {response}

Rate from 1-5 where:
1 = Completely irrelevant
2 = Mostly irrelevant
3 = Partially relevant
4 = Mostly relevant
5 = Perfectly relevant

Return JSON: {{"score": <1-5>, "explanation": "<brief explanation>"}}
""",

    EvaluationDimension.GROUNDING: """
Evaluate how well the response is grounded in the provided context.
Check if any claims are made without support from the context (hallucination).

Context: {context}
Response: {response}

Rate from 1-5 where:
1 = Completely fabricated, no grounding
2 = Mostly fabricated
3 = Partially grounded
4 = Mostly grounded with minor issues
5 = Perfectly grounded, all claims supported

Return JSON: {{"score": <1-5>, "explanation": "<brief explanation>"}}
""",

    # ... 其他维度的 prompt
}
```

---

### 阶段 3: 评估结果存储 (Peng Wang - 3h)

#### 3.1 存储服务

**文件**: `backend/app/evaluation/repository.py`

```python
"""评估结果存储"""

from app.core.cosmos_db import CosmosDBService

class EvaluationRepository:
    """评估结果存储库"""

    def __init__(self, cosmos_service: CosmosDBService):
        self.cosmos = cosmos_service
        self.container = "evaluations"

    async def save_result(self, result: EvaluationResult) -> str:
        """保存评估结果"""
        await self.cosmos.create_item(
            container_name=self.container,
            item=result.model_dump()
        )
        return result.id

    async def get_results(
        self,
        start_date: datetime,
        end_date: datetime,
        limit: int = 100
    ) -> list[EvaluationResult]:
        """获取时间范围内的评估结果"""
        query = """
        SELECT * FROM c
        WHERE c.evaluated_at >= @start AND c.evaluated_at <= @end
        ORDER BY c.evaluated_at DESC
        OFFSET 0 LIMIT @limit
        """
        return await self.cosmos.query_items(
            container_name=self.container,
            query=query,
            parameters=[
                {"name": "@start", "value": start_date.isoformat()},
                {"name": "@end", "value": end_date.isoformat()},
                {"name": "@limit", "value": limit}
            ]
        )

    async def get_average_scores(
        self,
        start_date: datetime,
        end_date: datetime
    ) -> dict[str, float]:
        """获取平均分数"""
        # 实现聚合查询
        pass
```

---

### 阶段 4: 评估仪表板 UI (Hye Ran Yoo - 5h)

#### 4.1 评估仪表板

**文件**: `frontend/src/features/evaluation/components/EvaluationDashboard.tsx`

```typescript
export function EvaluationDashboard() {
  const { t } = useTranslation('evaluation');
  const { data, isLoading } = useEvaluationStats();

  const dimensions = [
    { key: 'coherence', label: t('coherence'), threshold: 4.0 },
    { key: 'relevancy', label: t('relevancy'), threshold: 4.0 },
    { key: 'completeness', label: t('completeness'), threshold: 3.5 },
    { key: 'grounding', label: t('grounding'), threshold: 4.5 },
    { key: 'helpfulness', label: t('helpfulness'), threshold: 4.0 },
    { key: 'faithfulness', label: t('faithfulness'), threshold: 4.5 },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      {/* 总体分数 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('overallScore')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-center">
            {data?.overall_average.toFixed(2)} / 5.0
          </div>
        </CardContent>
      </Card>

      {/* 维度分数 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {dimensions.map(dim => (
          <DimensionCard
            key={dim.key}
            label={dim.label}
            score={data?.dimension_averages[dim.key]}
            threshold={dim.threshold}
          />
        ))}
      </div>

      {/* 趋势图表 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('scoreTrend')}</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            data={data?.trend}
            xKey="date"
            yKeys={dimensions.map(d => d.key)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 4.2 维度卡片组件

**文件**: `frontend/src/features/evaluation/components/DimensionCard.tsx`

```typescript
interface DimensionCardProps {
  label: string;
  score: number;
  threshold: number;
}

export function DimensionCard({ label, score, threshold }: DimensionCardProps) {
  const isAboveThreshold = score >= threshold;

  return (
    <Card className={cn(
      "transition-colors",
      !isAboveThreshold && "border-red-500 bg-red-50"
    )}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{label}</span>
          {!isAboveThreshold && (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          )}
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold">{score?.toFixed(2)}</span>
          <span className="text-muted-foreground"> / 5.0</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Threshold: {threshold}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### 阶段 5: 告警设置 (Travis Yi - 2h)

#### 5.1 告警服务

**文件**: `backend/app/evaluation/alerts.py`

```python
"""评估告警服务"""

from app.evaluation.schemas import EvaluationResult, EvaluationThresholds
from app.core.notifications import NotificationService

class EvaluationAlertService:
    """评估告警"""

    def __init__(
        self,
        thresholds: EvaluationThresholds,
        notification_service: NotificationService
    ):
        self.thresholds = thresholds
        self.notifications = notification_service

    async def check_and_alert(self, result: EvaluationResult):
        """检查评估结果并在低于阈值时告警"""
        alerts = []

        for score in result.scores:
            threshold = getattr(self.thresholds, score.dimension.value)
            if score.score < threshold:
                alerts.append({
                    "dimension": score.dimension.value,
                    "score": score.score,
                    "threshold": threshold,
                    "query_id": result.query_id
                })

        if alerts:
            await self.notifications.send_alert(
                title="LLM Evaluation Alert",
                message=f"{len(alerts)} dimension(s) below threshold",
                details=alerts
            )
```

---

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 新建 | `backend/app/evaluation/__init__.py` | 评估模块 |
| 新建 | `backend/app/evaluation/schemas.py` | 评估 Schema |
| 新建 | `backend/app/evaluation/service.py` | 评估服务 |
| 新建 | `backend/app/evaluation/prompts.py` | 评估 Prompt |
| 新建 | `backend/app/evaluation/repository.py` | 结果存储 |
| 新建 | `backend/app/evaluation/alerts.py` | 告警服务 |
| 新建 | `backend/app/evaluation/routes.py` | 评估 API |
| 新建 | `frontend/src/features/evaluation/` | 评估功能模块 |

---

## 技术规格

| 参数 | 规格 |
|------|------|
| 评估模型 | GPT-4o |
| 评估维度 | 6 |
| 分数范围 | 1-5 |
| 采样率 | 10% (可配置) |
| 存储 | Azure Cosmos DB |

---

## 成功标准

- [ ] 6 维度评估正常运行
- [ ] 评估结果存储到 Cosmos DB
- [ ] 低于阈值时触发告警
- [ ] 评估仪表板显示统计
- [ ] 所有测试通过

---

## 估算复杂度: HIGH

| 部分 | 时间估算 | 状态 |
|------|----------|------|
| 架构设计 | 3h | ⬜ 待开始 |
| 评估逻辑 | 8h | ⬜ 待开始 |
| 结果存储 | 3h | ⬜ 待开始 |
| 仪表板 UI | 5h | ⬜ 待开始 |
| 告警设置 | 2h | ⬜ 待开始 |
| **总计** | **21h** | **0%** |

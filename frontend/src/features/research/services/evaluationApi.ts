/**
 * 评估 API 服务
 *
 * 对接后端 /api/v1/evaluation 端点。
 * 对应 US-303: LLM Evaluation Framework。
 */

import { apiService } from '@/shared/services/apiService'

// ─── Types ──────────────────────────────────────────────────────────

export interface DimensionScore {
  dimension: string
  score: number
  explanation: string
}

export interface EvaluationResult {
  id: string
  query: string
  response: string
  scores: DimensionScore[]
  overall_score: number
  alerts: string[]
  evaluated_at: string
}

export interface EvaluationSummary {
  total_evaluations: number
  overall_average: number
  dimension_averages: Record<string, number>
  alerts_count: number
  recent_evaluations: EvaluationResult[]
}

export interface EvaluateRequest {
  query: string
  response: string
  context: string[]
  sources: string[]
}

// ─── Dimension metadata ─────────────────────────────────────────────

export const DIMENSIONS = [
  { key: 'coherence', label: 'Coherence', labelFr: 'Cohérence', threshold: 4.0 },
  { key: 'relevancy', label: 'Relevancy', labelFr: 'Pertinence', threshold: 4.0 },
  { key: 'completeness', label: 'Completeness', labelFr: 'Complétude', threshold: 3.5 },
  { key: 'grounding', label: 'Grounding', labelFr: 'Ancrage', threshold: 4.5 },
  { key: 'helpfulness', label: 'Helpfulness', labelFr: 'Utilité', threshold: 4.0 },
  { key: 'faithfulness', label: 'Faithfulness', labelFr: 'Fidélité', threshold: 4.5 },
] as const

// ─── API Methods ────────────────────────────────────────────────────

export const evaluationApi = {
  /** 触发评估 */
  async evaluate(request: EvaluateRequest): Promise<EvaluationResult> {
    const response = await apiService.post<EvaluationResult>(
      '/evaluation/evaluate',
      request
    )
    if (!response.data) {
      throw new Error(response.error || 'Failed to evaluate')
    }
    return response.data
  },

  /** 获取汇总统计 */
  async getSummary(): Promise<EvaluationSummary> {
    const response = await apiService.get<EvaluationSummary>(
      '/evaluation/summary'
    )
    if (!response.data) {
      throw new Error(response.error || 'Failed to get evaluation summary')
    }
    return response.data
  },
}

export default evaluationApi

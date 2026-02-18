/**
 * Evaluation Center Types
 */

export type EvaluationDimension =
  | 'coherence'
  | 'relevancy'
  | 'completeness'
  | 'grounding'
  | 'helpfulness'
  | 'faithfulness'

export interface DimensionScore {
  dimension: EvaluationDimension
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
  strategy_id?: string
  llm_model?: string
  search_engine?: string
  embedding_model?: string
  latency_ms?: number
  evaluated_at: string
}

export interface EvaluationSummary {
  total_evaluations: number
  overall_average: number
  dimension_averages: Record<string, number>
  alerts_count: number
  recent_evaluations: EvaluationResult[]
}

export interface EvaluationRequest {
  query: string
  response: string
  context?: string[]
  sources?: string[]
}

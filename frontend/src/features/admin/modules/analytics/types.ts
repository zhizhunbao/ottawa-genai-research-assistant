/**
 * Analytics Module Types
 *
 * Type definitions for the analytics dashboard,
 * aligned with backend AnalyticsDashboard schema.
 *
 * @module features/admin/modules/analytics
 */

/** A single time-series data point */
export interface TimeSeriesPoint {
  date: string
  count: number
  avg_value?: number | null
}

/** Labelled time-series dataset */
export interface TimeSeriesData {
  label: string
  data: TimeSeriesPoint[]
}

/** Distribution / breakdown item (pie chart, bar chart) */
export interface DistributionItem {
  name: string
  value: number
  percentage: number
}

/** Top-level overview counts */
export interface UsageOverview {
  total_queries: number
  total_sessions: number
  total_documents: number
  total_users: number
  avg_latency_ms: number
  avg_confidence: number
}

/** Quality / evaluation metrics */
export interface QualityMetrics {
  avg_confidence: number
  avg_evaluation_score: number
  feedback_positive_rate: number
  total_feedback: number
}

/** Document statistics */
export interface DocumentStats {
  total: number
  by_status: DistributionItem[]
  recent_uploads: number
}

/** Full dashboard payload returned by the API */
export interface DashboardData {
  overview: UsageOverview
  queries_over_time: TimeSeriesData
  quality_metrics: QualityMetrics
  search_method_distribution: DistributionItem[]
  document_stats: DocumentStats
}

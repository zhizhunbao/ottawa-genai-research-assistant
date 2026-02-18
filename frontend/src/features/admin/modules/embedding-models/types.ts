/**
 * Embedding Models Types
 *
 * Type definitions for embedding model management.
 * Reuses types from llm-models module.
 */

export type { ModelInfo, ModelDetail, PullProgress, DiskUsageStats } from '../llm-models/types'

export interface SimilarityTestResult {
  text1: string
  text2: string
  similarity: number
  model: string
  latency_ms: number
}

export interface EmbeddingTestResult {
  text: string
  model: string
  dimension: number
  vector_preview: number[]  // First 10 values
  latency_ms: number
}

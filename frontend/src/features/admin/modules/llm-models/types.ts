/**
 * LLM Models Types
 *
 * Type definitions for LLM model management.
 */

export type ModelProvider = 'azure' | 'ollama'
export type ModelType = 'llm' | 'embedding'
export type ModelStatus = 'available' | 'downloading' | 'not_found' | 'error'

export interface ModelInfo {
  id: string
  name: string
  provider: ModelProvider
  model_type: ModelType
  available: boolean
  size?: number
  size_formatted?: string
  modified_at?: string
  digest?: string
}

export interface ModelDetail extends ModelInfo {
  parameters?: Record<string, unknown>
  template?: string
  system?: string
  license?: string
  modelfile?: string
  parameter_size?: string
  quantization_level?: string
  context_length?: number
}

export interface PullProgress {
  status: string
  digest?: string
  total?: number
  completed?: number
  percent?: number
  error?: string
}

export interface TestResult {
  model: string
  prompt: string
  response: string
  latency_ms: number
  tokens_generated?: number
}

export interface DiskUsageStats {
  total_size: number
  total_size_formatted: string
  model_count: number
  models: ModelInfo[]
}

export interface RunningModel {
  name: string
  size?: number
  size_formatted?: string
  expires_at?: string
}

export interface HealthStatus {
  provider: ModelProvider
  available: boolean
  message?: string
  model_count: number
}

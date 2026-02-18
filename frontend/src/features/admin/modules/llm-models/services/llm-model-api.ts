/**
 * LLM Models API Service
 *
 * API client for LLM model management endpoints.
 */

import type {
  DiskUsageStats,
  HealthStatus,
  ModelDetail,
  ModelInfo,
  PullProgress,
  RunningModel,
  TestResult,
} from '../types'

const API_BASE = '/api/v1/admin/llm-models'

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  const json: ApiResponse<T> = await response.json()
  if (!json.success) {
    throw new Error(json.error || 'API request failed')
  }
  return json.data
}

/**
 * List all LLM models (Azure + Ollama)
 */
export async function listModels(modelType?: 'llm' | 'embedding'): Promise<ModelInfo[]> {
  const params = modelType ? `?model_type=${modelType}` : ''
  return fetchApi<ModelInfo[]>(`${API_BASE}${params}`)
}

/**
 * List LLM (chat) models only
 */
export async function listLlmModels(): Promise<ModelInfo[]> {
  return fetchApi<ModelInfo[]>(`${API_BASE}/llm`)
}

/**
 * List embedding models only
 */
export async function listEmbeddingModels(): Promise<ModelInfo[]> {
  return fetchApi<ModelInfo[]>(`${API_BASE}/embedding`)
}

/**
 * Get detailed info about a specific model
 */
export async function getModelInfo(modelName: string): Promise<ModelDetail> {
  return fetchApi<ModelDetail>(`${API_BASE}/${encodeURIComponent(modelName)}/info`)
}

/**
 * Pull (download) a model with streaming progress
 */
export async function* pullModel(name: string): AsyncGenerator<PullProgress> {
  const response = await fetch(`${API_BASE}/pull`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })

  if (!response.ok) {
    throw new Error(`Failed to pull model: ${response.statusText}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('No response body')
  }

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.trim()) {
        try {
          yield JSON.parse(line) as PullProgress
        } catch {
          // Skip invalid JSON lines
        }
      }
    }
  }

  // Process remaining buffer
  if (buffer.trim()) {
    try {
      yield JSON.parse(buffer) as PullProgress
    } catch {
      // Skip invalid JSON
    }
  }
}

/**
 * Delete a model
 */
export async function deleteModel(modelName: string): Promise<boolean> {
  return fetchApi<boolean>(`${API_BASE}/${encodeURIComponent(modelName)}`, {
    method: 'DELETE',
  })
}

/**
 * Test a model with a prompt
 */
export async function testModel(
  model: string,
  prompt: string,
  maxTokens = 100,
  temperature = 0.7
): Promise<TestResult> {
  return fetchApi<TestResult>(`${API_BASE}/test`, {
    method: 'POST',
    body: JSON.stringify({
      model,
      prompt,
      max_tokens: maxTokens,
      temperature,
    }),
  })
}

/**
 * Get disk usage statistics
 */
export async function getDiskUsage(): Promise<DiskUsageStats> {
  return fetchApi<DiskUsageStats>(`${API_BASE}/disk-usage`)
}

/**
 * Get models currently loaded in memory
 */
export async function getRunningModels(): Promise<RunningModel[]> {
  return fetchApi<RunningModel[]>(`${API_BASE}/running`)
}

/**
 * Check health of model providers
 */
export async function checkHealth(): Promise<HealthStatus[]> {
  return fetchApi<HealthStatus[]>(`${API_BASE}/health`)
}

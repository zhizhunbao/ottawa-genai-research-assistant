/**
 * Embedding Models API Service
 *
 * Reuses llm-models API with embedding type filter.
 */

import type { ModelInfo, PullProgress, DiskUsageStats } from '../types'

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
 * List embedding models only
 */
export async function listEmbeddingModels(): Promise<ModelInfo[]> {
  return fetchApi<ModelInfo[]>(`${API_BASE}/embedding`)
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

  if (buffer.trim()) {
    try {
      yield JSON.parse(buffer) as PullProgress
    } catch {
      // Skip
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
 * Get disk usage for embedding models
 */
export async function getDiskUsage(): Promise<DiskUsageStats> {
  const stats = await fetchApi<DiskUsageStats>(`${API_BASE}/disk-usage`)
  // Filter to only embedding models
  stats.models = stats.models.filter(m => m.model_type === 'embedding')
  stats.model_count = stats.models.length
  stats.total_size = stats.models.reduce((sum, m) => sum + (m.size || 0), 0)
  return stats
}

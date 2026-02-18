/**
 * Evaluation Center API Service
 */

import type { EvaluationRequest, EvaluationResult, EvaluationSummary } from '../types'

const API_BASE = '/api/v1/evaluation'

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
 * Get evaluation summary statistics
 */
export async function getSummary(): Promise<EvaluationSummary> {
  return fetchApi<EvaluationSummary>(`${API_BASE}/summary`)
}

/**
 * Evaluate a single response
 */
export async function evaluate(request: EvaluationRequest): Promise<EvaluationResult> {
  return fetchApi<EvaluationResult>(`${API_BASE}/evaluate`, {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

/**
 * Compare evaluations across strategies
 */
export async function compareStrategies(
  query = '',
  limit = 20
): Promise<Array<Record<string, unknown>>> {
  const params = new URLSearchParams()
  if (query) params.set('query', query)
  params.set('limit', String(limit))
  return fetchApi<Array<Record<string, unknown>>>(`${API_BASE}/compare-strategies?${params}`)
}

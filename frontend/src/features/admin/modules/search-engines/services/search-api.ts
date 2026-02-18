/**
 * Search Engines API Service
 */

import type { EngineInfo, SearchTestResult } from '../types'

const API_BASE = '/api/v1/admin/search-engines'

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
 * List all search engines
 */
export async function listEngines(): Promise<EngineInfo[]> {
  return fetchApi<EngineInfo[]>(API_BASE)
}

/**
 * Get stats for a specific engine
 */
export async function getEngineStats(engineName: string): Promise<Record<string, unknown>> {
  return fetchApi<Record<string, unknown>>(`${API_BASE}/${engineName}/stats`)
}

/**
 * Test search on a specific engine
 */
export async function testEngine(
  engineName: string,
  query: string,
  topK = 5
): Promise<SearchTestResult> {
  return fetchApi<SearchTestResult>(`${API_BASE}/${engineName}/test`, {
    method: 'POST',
    body: JSON.stringify({ query, top_k: topK }),
  })
}

/**
 * Test hybrid search across engines
 */
export async function testHybridSearch(
  query: string,
  engines: string[],
  topK = 5
): Promise<SearchTestResult> {
  return fetchApi<SearchTestResult>(`${API_BASE}/hybrid-test`, {
    method: 'POST',
    body: JSON.stringify({ query, engines, top_k: topK }),
  })
}

/**
 * Get all engine stats
 */
export async function getAllStats(): Promise<Record<string, Record<string, unknown>>> {
  return fetchApi<Record<string, Record<string, unknown>>>(`${API_BASE}/all-stats`)
}

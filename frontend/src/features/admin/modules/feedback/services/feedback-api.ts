/**
 * Feedback API Service
 *
 * API client for feedback management endpoints.
 *
 * @module features/admin/modules/feedback/services
 */

import type { FeedbackCreate, FeedbackItem, FeedbackStats } from '../types'

const API_BASE = '/api/v1/feedback'

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  const json: ApiResponse<T> = await response.json()
  if (!json.success) throw new Error(json.error || 'API request failed')
  return json.data
}

/** Get aggregate feedback statistics for the last N days */
export async function getStats(days = 30): Promise<FeedbackStats> {
  return fetchApi<FeedbackStats>(`${API_BASE}/stats?days=${days}`)
}

/** Get recent feedback entries */
export async function getRecent(limit = 20): Promise<FeedbackItem[]> {
  return fetchApi<FeedbackItem[]>(`${API_BASE}/recent?limit=${limit}`)
}

/** Get feedback for a specific response */
export async function getByResponse(responseId: string): Promise<FeedbackItem[]> {
  return fetchApi<FeedbackItem[]>(`${API_BASE}/response/${responseId}`)
}

/** Submit new feedback */
export async function create(feedback: FeedbackCreate): Promise<FeedbackItem> {
  return fetchApi<FeedbackItem>(API_BASE, {
    method: 'POST',
    body: JSON.stringify(feedback),
  })
}

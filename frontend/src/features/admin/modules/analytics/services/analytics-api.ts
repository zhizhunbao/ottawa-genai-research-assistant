/**
 * Analytics API Service
 *
 * API client for analytics dashboard endpoints.
 *
 * @module features/admin/modules/analytics/services
 */

import type { DashboardData, UsageOverview } from '../types'

const API_BASE = '/api/v1/analytics'

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

/** Fetch full dashboard data for the last N days */
export async function getDashboard(days = 30): Promise<DashboardData> {
  return fetchApi<DashboardData>(`${API_BASE}/dashboard?days=${days}`)
}

/** Fetch usage overview only */
export async function getOverview(): Promise<UsageOverview> {
  return fetchApi<UsageOverview>(`${API_BASE}/overview`)
}

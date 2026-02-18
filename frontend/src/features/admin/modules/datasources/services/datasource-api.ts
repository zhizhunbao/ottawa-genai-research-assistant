/**
 * Data Sources API Service
 *
 * API client for data source sync endpoints.
 */

import type { CatalogResponse, SyncResult } from '../types'

const API_BASE = '/api/v1/sync'

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
 * Get the catalog with import status
 */
export async function getCatalog(checkUrls = false): Promise<CatalogResponse> {
  const params = checkUrls ? '?check_urls=true' : ''
  return fetchApi<CatalogResponse>(`${API_BASE}/catalog${params}`)
}

/**
 * Sync documents (all missing or specific IDs)
 */
export async function syncDocuments(catalogIds?: string[]): Promise<SyncResult> {
  return fetchApi<SyncResult>(`${API_BASE}/sync`, {
    method: 'POST',
    body: JSON.stringify({ catalog_ids: catalogIds || null }),
  })
}

/**
 * Retry a failed document sync
 */
export async function retryDocument(catalogId: string): Promise<{ status: string }> {
  return fetchApi<{ status: string }>(`${API_BASE}/retry/${catalogId}`, {
    method: 'POST',
  })
}

/**
 * Delete a synced document
 */
export async function deleteDocument(catalogId: string): Promise<{ status: string }> {
  return fetchApi<{ status: string }>(`${API_BASE}/${catalogId}`, {
    method: 'DELETE',
  })
}

/**
 * Check URL availability for all catalog items
 */
export async function checkUrls(): Promise<Record<string, boolean>> {
  return fetchApi<Record<string, boolean>>(`${API_BASE}/check-urls`)
}

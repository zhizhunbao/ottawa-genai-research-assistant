/**
 * syncApi - REST API client for Ottawa ED Update catalog sync & preview
 *
 * Endpoints:
 *   GET  /sync/catalog       - List catalog with import status
 *   POST /sync/sync          - Batch sync missing PDFs
 *   POST /sync/retry/:id     - Retry failed document pipeline
 *   DELETE /sync/:id         - Delete imported document
 *   GET  /sync/check-urls    - Check URL availability
 *   GET  /sync/preview-proxy - Proxy PDF for inline preview
 *
 * @module features/documents/services
 */

import { apiService } from '@/shared/services/api-service'

// ============================================================
// Types
// ============================================================

export interface CatalogItem {
  id: string
  title: string
  quarter: string
  year: number
  url: string
  source: string
  imported: boolean
  document_id: string | null
  status: string | null
  url_available: boolean | null
}

export interface CatalogResponse {
  items: CatalogItem[]
  total: number
  imported_count: number
  sources: string[]
}

export interface SyncResult {
  queued: number
  skipped: number
  failed: number
  details: Array<{
    id: string
    status: string
    document_id?: string
    file_name?: string
    folder?: string
    reason?: string
  }>
}

export interface UrlCheckResult {
  availability: Record<string, boolean>
  total: number
  available: number
  unavailable: number
}

// ============================================================
// API Methods
// ============================================================

export const syncApi = {
  /**
   * Get the Ottawa ED Update PDF catalog with import status.
   * @param checkUrls If true, backend also checks URL reachability (~2s extra).
   */
  async getCatalog(checkUrls = false): Promise<CatalogResponse> {
    const params = checkUrls ? '?check_urls=true' : ''
    const response = await apiService.get<CatalogResponse>(`/sync/catalog${params}`)
    if (!response.data) {
      throw new Error(response.error || 'Failed to fetch catalog')
    }
    return response.data
  },

  /**
   * Sync missing PDFs from the catalog.
   * @param catalogIds Optional list of specific IDs to sync. If null, syncs all missing.
   */
  async syncDocuments(catalogIds?: string[]): Promise<SyncResult> {
    const response = await apiService.post<SyncResult>('/sync/sync', {
      catalog_ids: catalogIds || null,
    })
    if (!response.data) {
      throw new Error(response.error || 'Failed to sync documents')
    }
    return response.data
  },

  /**
   * Retry the pipeline for a failed document.
   */
  async retryDocument(catalogId: string): Promise<{ document_id: string; status: string }> {
    const response = await apiService.post<{ document_id: string; status: string }>(
      `/sync/retry/${catalogId}`,
    )
    if (!response.data) {
      throw new Error(response.error || 'Failed to retry document')
    }
    return response.data
  },

  /**
   * Delete a synced document from the knowledge base.
   */
  async deleteDocument(catalogId: string): Promise<{ status: string; message: string }> {
    const response = await apiService.delete<{ status: string; message: string }>(
      `/sync/${catalogId}`,
    )
    if (!response.data) {
      throw new Error(response.error || 'Failed to delete document')
    }
    return response.data
  },

  /**
   * Check availability of all catalog URLs (parallel HEAD requests).
   */
  async checkUrls(): Promise<UrlCheckResult> {
    const response = await apiService.get<UrlCheckResult>('/sync/check-urls')
    if (!response.data) {
      throw new Error(response.error || 'Failed to check URLs')
    }
    return response.data
  },

  /**
   * Get the proxy URL for previewing a PDF from external source.
   */
  getPreviewProxyUrl(pdfUrl: string): string {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1'
    return `${baseUrl}/sync/preview-proxy?url=${encodeURIComponent(pdfUrl)}`
  },
}

export default syncApi

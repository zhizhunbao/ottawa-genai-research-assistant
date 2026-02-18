/**
 * Data Sources Types
 *
 * Type definitions for data source management (sync, catalog).
 */

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
    catalog_id: string
    status: string
    error?: string
  }>
}

export interface SyncRequest {
  catalog_ids?: string[]
}

// ── Knowledge Base ────────────────────────────────────────────

export interface KBResponse {
  id: string
  name: string
  description: string | null
  type: string
  config: Record<string, any>
  folder_id: string | null
  search_engines: string[]
  status: string
  doc_count: number
  indexed_count: number
  created_at: string
  updated_at: string
}

export interface KBCreate {
  name: string
  description?: string
  type?: string // url_catalog | manual_upload | web_link
  config?: Record<string, any>
  folder_id?: string
  search_engines?: string[]
}

export interface KBUpdate {
  name?: string
  description?: string
  config?: Record<string, any>
  folder_id?: string
  search_engines?: string[]
  status?: string
}

export interface KBListResponse {
  items: KBResponse[]
  total: number
}

// ── KB Documents ──────────────────────────────────────────────

export interface KBDocumentResponse {
  id: string
  title: string
  file_name: string | null
  url: string | null
  status: string
  file_size: number | null
  page_count: number | null
  chunk_count: number | null
  created_at: string
  updated_at: string
}

export interface KBDocumentListResponse {
  kb_id: string
  items: KBDocumentResponse[]
  total: number
}

/**
 * documentApi - REST API client for document management (upload, list, status, delete)
 *
 * @module features/documents/services
 * @template .agent/templates/frontend/features/documents/upload/document-api.ts.template
 * @reference rag-web-ui/frontend/src/lib/api.ts
 */

import { apiService } from '@/shared/services/api-service'

// ============================================================
// Backend Response Types
// ============================================================

/** Document status enum (mirrors backend DocumentStatus) */
export type DocumentStatusValue = 'pending' | 'processing' | 'indexed' | 'failed'

/** Single document from backend */
export interface BackendDocument {
  id: string
  title: string
  description: string | null
  tags: string[]
  owner_id: string | null
  status: DocumentStatusValue
  file_name: string
  blob_name: string | null
  blob_url: string | null
  created_at: string
  updated_at: string
}

/** Document list response */
interface DocumentListResponse {
  items: BackendDocument[]
  total: number
}

/** Upload response */
interface DocumentUploadResponse {
  id: string
  file_name: string
  blob_name: string
  blob_url: string
  status: DocumentStatusValue
}

/** Document status response */
interface DocumentStatusResponse {
  id: string
  title: string
  status: DocumentStatusValue
}

/** Download URL response */
interface DocumentDownloadUrlResponse {
  download_url: string
  expires_in_hours: number
  file_name: string
}

// ============================================================
// API Methods
// ============================================================

export const documentApi = {
  /**
   * List all documents.
   */
  async listDocuments(): Promise<{ items: BackendDocument[]; total: number }> {
    const response = await apiService.get<DocumentListResponse>('/documents')
    if (!response.data) {
      throw new Error(response.error || 'Failed to list documents')
    }
    return response.data
  },

  /**
   * Get a single document by ID.
   */
  async getDocument(documentId: string): Promise<BackendDocument> {
    const response = await apiService.get<BackendDocument>(
      `/documents/${documentId}`
    )
    if (!response.data) {
      throw new Error(response.error || 'Document not found')
    }
    return response.data
  },

  /**
   * Upload a PDF file.
   * Uses FormData multipart upload (not JSON).
   */
  async uploadFile(
    file: File,
    title?: string,
    description?: string,
    onProgress?: (percent: number) => void
  ): Promise<DocumentUploadResponse> {
    // Use XHR for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const formData = new FormData()
      formData.append('file', file)
      if (title) formData.append('title', title)
      if (description) formData.append('description', description)

      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            onProgress(Math.round((e.loaded / e.total) * 100))
          }
        })
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            resolve(response.data)
          } catch {
            reject(new Error('Failed to parse upload response'))
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText)
            reject(new Error(errorResponse.detail || errorResponse.error || `Upload failed: ${xhr.status}`))
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        }
      })

      xhr.addEventListener('error', () => reject(new Error('Network error during upload')))
      xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')))

      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1'
      xhr.open('POST', `${baseUrl}/documents/upload`)

      // Add auth token if available
      try {
        const authStorage = localStorage.getItem('auth-storage')
        if (authStorage) {
          const parsed = JSON.parse(authStorage)
          const token = parsed.state?.token
          if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        }
      } catch {
        // no auth token
      }

      xhr.send(formData)
    })
  },

  /**
   * Delete a document.
   */
  async deleteDocument(documentId: string): Promise<void> {
    const response = await apiService.delete<boolean>(
      `/documents/${documentId}`
    )
    if (!response.data) {
      throw new Error(response.error || 'Failed to delete document')
    }
  },

  /**
   * Get document processing status.
   */
  async getDocumentStatus(documentId: string): Promise<DocumentStatusResponse> {
    const response = await apiService.get<DocumentStatusResponse>(
      `/documents/${documentId}/status`
    )
    if (!response.data) {
      throw new Error(response.error || 'Failed to get document status')
    }
    return response.data
  },

  /**
   * Get temporary download URL (SAS token).
   */
  async getDownloadUrl(
    documentId: string,
    expiryHours = 1
  ): Promise<DocumentDownloadUrlResponse> {
    const response = await apiService.get<DocumentDownloadUrlResponse>(
      `/documents/${documentId}/url`,
      { expiry_hours: String(expiryHours) }
    )
    if (!response.data) {
      throw new Error(response.error || 'Failed to get download URL')
    }
    return response.data
  },

  /**
   * Update document metadata (title, description, tags, status).
   */
  async updateDocument(
    documentId: string,
    updates: {
      title?: string
      description?: string
      tags?: string[]
      status?: DocumentStatusValue
    }
  ): Promise<BackendDocument> {
    const response = await apiService.patch<BackendDocument>(
      `/documents/${documentId}`,
      updates
    )
    if (!response.data) {
      throw new Error(response.error || 'Failed to update document')
    }
    return response.data
  },
}

export default documentApi

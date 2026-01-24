/**
 * 文档 API 服务
 *
 * 封装文档相关的 API 调用。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import type {
  Document,
  DocumentListParams,
  DocumentListResponse,
  DocumentUploadRequest,
  DocumentUploadResponse,
} from '@/features/documents/types'

const API_BASE = '/api/v1'

/**
 * 文档 API
 */
export const documentsApi = {
  /**
   * 获取文档列表
   */
  async getDocuments(params?: DocumentListParams): Promise<DocumentListResponse> {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set('search', params.search)
    if (params?.quarter) searchParams.set('quarter', params.quarter)
    if (params?.year) searchParams.set('year', String(params.year))
    if (params?.reportType) searchParams.set('report_type', params.reportType)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.pageSize) searchParams.set('page_size', String(params.pageSize))

    const response = await fetch(`${API_BASE}/documents?${searchParams}`)
    if (!response.ok) {
      throw new Error('Failed to fetch documents')
    }
    return response.json()
  },

  /**
   * 获取单个文档详情
   */
  async getDocument(id: string): Promise<Document> {
    const response = await fetch(`${API_BASE}/documents/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch document')
    }
    return response.json()
  },

  /**
   * 上传文档
   */
  async uploadDocument(request: DocumentUploadRequest): Promise<DocumentUploadResponse> {
    const formData = new FormData()
    formData.append('file', request.file)
    if (request.title) formData.append('title', request.title)
    if (request.quarter) formData.append('quarter', request.quarter)
    if (request.year) formData.append('year', String(request.year))
    if (request.reportType) formData.append('report_type', request.reportType)

    const response = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) {
      throw new Error('Failed to upload document')
    }
    return response.json()
  },

  /**
   * 删除文档
   */
  async deleteDocument(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete document')
    }
  },
}

/**
 * 研究 API 服务
 *
 * 处理研究助手核心功能的 API 调用，包括查询、文档管理、可视化等。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { apiService } from '@/shared/services/apiService'
import type {
  Document,
  QueryRequest,
  QueryResponse,
  QueryRecord,
  ChartConfig,
  TableData,
  PaginatedResult,
  ApiResponse,
} from '@/features/research/types'

export const researchApi = {
  // ============================================================================
  // 查询相关
  // ============================================================================

  /**
   * 提交自然语言查询
   */
  async submitQuery(request: QueryRequest): Promise<QueryResponse> {
    const response = await apiService.post<QueryResponse>('/query', request)
    if (!response.data) {
      throw new Error(response.error || 'Query failed')
    }
    return response.data
  },

  /**
   * 获取查询历史
   */
  async getQueryHistory(
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResult<QueryRecord>> {
    const response = await apiService.get<PaginatedResult<QueryRecord>>(
      '/history',
      { page: String(page), pageSize: String(pageSize) }
    )
    if (!response.data) {
      throw new Error(response.error || 'Failed to get query history')
    }
    return response.data
  },

  /**
   * 获取单条查询结果
   */
  async getQueryById(queryId: string): Promise<QueryRecord> {
    const response = await apiService.get<QueryRecord>(`/query/${queryId}`)
    if (!response.data) {
      throw new Error(response.error || 'Query not found')
    }
    return response.data
  },

  // ============================================================================
  // 文档管理
  // ============================================================================

  /**
   * 获取文档列表
   */
  async getDocuments(
    page = 1,
    pageSize = 20,
    filters?: { year?: number; quarter?: string; status?: string }
  ): Promise<PaginatedResult<Document>> {
    const params: Record<string, string> = {
      page: String(page),
      pageSize: String(pageSize),
    }
    if (filters?.year) params.year = String(filters.year)
    if (filters?.quarter) params.quarter = filters.quarter
    if (filters?.status) params.status = filters.status

    const response = await apiService.get<PaginatedResult<Document>>(
      '/documents',
      params
    )
    if (!response.data) {
      throw new Error(response.error || 'Failed to get documents')
    }
    return response.data
  },

  /**
   * 获取单个文档详情
   */
  async getDocumentById(documentId: string): Promise<Document> {
    const response = await apiService.get<Document>(`/documents/${documentId}`)
    if (!response.data) {
      throw new Error(response.error || 'Document not found')
    }
    return response.data
  },

  /**
   * 上传文档
   */
  async uploadDocument(
    file: File,
    metadata: { quarter: string; year: number; reportType: string }
  ): Promise<Document> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('quarter', metadata.quarter)
    formData.append('year', String(metadata.year))
    formData.append('reportType', metadata.reportType)

    const response = await apiService.upload<Document>(
      '/documents/upload',
      formData
    )
    if (!response.data) {
      throw new Error(response.error || 'Upload failed')
    }
    return response.data
  },

  /**
   * 删除文档
   */
  async deleteDocument(documentId: string): Promise<void> {
    await apiService.delete(`/documents/${documentId}`)
  },

  // ============================================================================
  // 可视化
  // ============================================================================

  /**
   * 生成图表
   */
  async generateChart(
    queryId: string,
    chartType?: string
  ): Promise<ChartConfig> {
    const response = await apiService.post<ChartConfig>('/visualize', {
      queryId,
      chartType,
    })
    if (!response.data) {
      throw new Error(response.error || 'Chart generation failed')
    }
    return response.data
  },

  /**
   * 提取表格数据
   */
  async extractTable(documentId: string, pageNumber: number): Promise<TableData> {
    const response = await apiService.get<TableData>(
      `/documents/${documentId}/tables`,
      { page: String(pageNumber) }
    )
    if (!response.data) {
      throw new Error(response.error || 'Table extraction failed')
    }
    return response.data
  },

  /**
   * 生成演讲稿
   */
  async generateSpeakingNotes(
    documentIds: string[],
    topics?: string[]
  ): Promise<{ notes: string[] }> {
    const response = await apiService.post<{ notes: string[] }>('/speaking-notes', {
      documentIds,
      topics,
    })
    if (!response.data) {
      throw new Error(response.error || 'Speaking notes generation failed')
    }
    return response.data
  },

  // ============================================================================
  // 健康检查
  // ============================================================================

  /**
   * 检查 API 健康状态
   */
  async healthCheck(): Promise<ApiResponse<{ status: string; version: string }>> {
    return apiService.get('/health', undefined, { skipAuth: true })
  },
}

export default researchApi

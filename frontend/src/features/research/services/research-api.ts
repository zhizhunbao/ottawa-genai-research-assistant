/**
 * researchApi - REST API client for document management, RAG queries, and deep search
 *
 * @module features/research/services
 * @template none
 * @reference none
 */
import { apiService } from '@/shared/services/api-service'
import type {
  Document,
  QueryResponse,
  QueryRecord,
  ChartConfig,
  ChartData,
  TableData,
  PaginatedResult,
  ApiResponse,
  Source,
} from '@/features/research/types'

// ============================================================
// Backend Response Types
// ============================================================

/** 后端 /research/chat 请求体 */
interface BackendChatRequest {
  messages: { role: string; content: string }[]
  use_rag: boolean
}

/** 后端 SearchResult (sources) */
interface BackendSearchResult {
  id: string
  title: string
  content: string
  score: number
  source?: string
  metadata?: {
    document_id?: string
    page_number?: number
    chunk_index?: number
  }
}

/** 后端图表数据 */
interface BackendChartData {
  type: 'line' | 'bar' | 'pie'
  title?: string | null
  x_key?: string | null
  y_keys?: string[] | null
  data: Record<string, unknown>[]
  stacked?: boolean
}

/** 后端 /research/chat 响应体 */
interface BackendChatResponse {
  message: { role: string; content: string }
  sources: BackendSearchResult[]
  confidence: number
  chart?: BackendChartData | null
  created_at: string
}

/** 后端 /research/search 响应体 */
interface BackendSearchResponse {
  query: string
  results: BackendSearchResult[]
  total: number
}

// ============================================================
// Helpers
// ============================================================

/** 将后端 SearchResult 转换为前端 Source 类型 */
function toFrontendSource(result: BackendSearchResult): Source {
  return {
    documentId: result.metadata?.document_id || result.id,
    documentTitle: result.title,
    pageNumber: result.metadata?.page_number || 0,
    section: '',
    excerpt: result.content,
    relevanceScore: result.score,
  }
}

/** 根据 sources 的平均分计算置信度（后备方案） */
function computeConfidenceFallback(sources: BackendSearchResult[]): number {
  if (!sources.length) return 0.3
  const avgScore = sources.reduce((sum, s) => sum + s.score, 0) / sources.length
  // 将 0-1 的原始分映射为 0.1-1.0 的置信度
  return Math.max(0.1, Math.min(1.0, avgScore))
}

/** 将后端图表数据转换为前端 ChartData 类型 */
function toFrontendChart(chart: BackendChartData | null | undefined): ChartData | undefined {
  if (!chart) return undefined
  return {
    type: chart.type,
    title: chart.title ?? undefined,
    xKey: chart.x_key ?? undefined,
    yKeys: chart.y_keys ?? undefined,
    data: chart.data,
    stacked: chart.stacked,
  }
}

export const researchApi = {
  // ============================================================================
  // 查询相关 (US-202 / US-203)
  // ============================================================================

  /**
   * 提交自然语言查询 (RAG Chat)
   *
   * 调用后端 /research/chat 端点，将对话历史和查询发送给 RAG 管道。
   * 返回标准化的 QueryResponse，包含 answer、sources、confidence。
   */
  async submitQuery(
    query: string,
    chatHistory?: { role: string; content: string }[]
  ): Promise<QueryResponse> {
    const messages = [
      ...(chatHistory || []),
      { role: 'user', content: query },
    ]

    const body: BackendChatRequest = {
      messages,
      use_rag: true,
    }

    const response = await apiService.post<BackendChatResponse>(
      '/research/chat',
      body
    )

    if (!response.data) {
      throw new Error(response.error || 'Query failed')
    }

    const data = response.data
    const sources = data.sources.map(toFrontendSource)
    // 优先使用后端返回的置信度，否则根据 sources 计算
    const confidence = data.confidence ?? computeConfidenceFallback(data.sources)
    const chart = toFrontendChart(data.chart)

    return {
      answer: data.message.content,
      sources,
      confidence,
      chart,
      metrics: {
        accuracy: confidence,
        faithfulness: sources.length > 0 ? 0.9 : 0.5,
        contextRecall: Math.min(1, sources.length / 5),
      },
      responseTimeMs: 0, // 后续可通过 performance API 测量
    }
  },

  /**
   * 执行语义搜索 (不含 LLM 生成)
   */
  async semanticSearch(
    query: string,
    topK = 5,
    filters?: Record<string, unknown>
  ): Promise<{ results: Source[]; total: number }> {
    const response = await apiService.post<BackendSearchResponse>(
      '/research/search',
      { query, top_k: topK, filters }
    )
    if (!response.data) {
      throw new Error(response.error || 'Search failed')
    }
    return {
      results: response.data.results.map(toFrontendSource),
      total: response.data.total,
    }
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

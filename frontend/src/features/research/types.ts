/**
 * ResearchTypes - Interfaces and enums for RAG, search, and document management
 *
 * @module features/research
 * @template none
 * @reference none
 */
export enum DocumentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  INDEXED = 'indexed',
  FAILED = 'failed'
}

/** 报告类型 */
export enum ReportType {
  ED_UPDATE = 'ED_UPDATE',
  QUARTERLY = 'QUARTERLY',
  ANNUAL = 'ANNUAL',
  SPECIAL = 'SPECIAL'
}

/** 文档元数据 */
export interface DocumentMetadata {
  language: 'en' | 'fr'
  topics: string[]
}

/** 文档实体 */
export interface Document {
  id: string
  title: string
  fileName: string
  uploadDate: string
  quarter: string
  year: number
  reportType: ReportType
  status: DocumentStatus
  pageCount: number
  chunkCount: number
  metadata: DocumentMetadata
}

// ============================================================================
// 查询相关类型
// ============================================================================

/** 查询指标 */
export interface QueryMetrics {
  accuracy: number
  faithfulness: number
  contextRecall: number
}

/** 信息来源 */
export interface Source {
  documentId: string
  documentTitle: string
  pageNumber: number
  section: string
  excerpt: string
  relevanceScore: number
}

/** 查询响应 */
export interface QueryResponse {
  answer: string
  sources: Source[]
  confidence: number
  chart?: ChartData
  metrics: QueryMetrics
  responseTimeMs: number
}

/** 查询记录 */
export interface QueryRecord {
  id: string
  userId: string
  queryText: string
  timestamp: string
  response: QueryResponse
}

/** 聊天消息角色 */
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

/** 图表数据（来自后端 ChartData schema） */
export interface ChartData {
  type: 'line' | 'bar' | 'pie'
  title?: string
  xKey?: string
  yKeys?: string[]
  data: Record<string, unknown>[]
  stacked?: boolean
}

/** 聊天消息 */
export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: string
  sources?: Source[]
  confidence?: number
  isLoading?: boolean
  chart?: ChartData
}

/** 聊天会话 */
export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

// ============================================================================
// 可视化相关类型
// ============================================================================

/** 图表类型 */
export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
  AREA = 'area'
}

/** 图表数据点 */
export interface ChartDataPoint {
  label: string
  value: number
  category?: string
}

/** 图表配置 */
export interface ChartConfig {
  type: ChartType
  title: string
  xAxisLabel?: string
  yAxisLabel?: string
  data: ChartDataPoint[]
}

/** 表格数据 */
export interface TableData {
  headers: string[]
  rows: (string | number)[][]
  title?: string
}

// ============================================================================
// API 相关类型
// ============================================================================

/** API 响应基础结构 */
export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: string | null
  timestamp: string
}

/** 分页参数 */
export interface PaginationParams {
  page: number
  pageSize: number
}

/** 分页结果 */
export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** 文档上传请求 */
export interface UploadDocumentRequest {
  file: File
  quarter: string
  year: number
  reportType: ReportType
}

/** 查询请求 */
export interface QueryRequest {
  query: string
  filters?: {
    dateRange?: { start: string; end: string }
    documentTypes?: ReportType[]
    topics?: string[]
  }
}

/** 可视化请求 */
export interface VisualizationRequest {
  queryId: string
  chartType?: ChartType
}

/** 演讲稿请求 */
export interface SpeakingNotesRequest {
  documentIds: string[]
  topics?: string[]
}

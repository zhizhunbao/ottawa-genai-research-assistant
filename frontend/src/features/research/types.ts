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

/** Token usage and cost info from LLM */
export interface UsageInfo {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  estimated_cost: number
  model?: string
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
  usage?: UsageInfo
  // M11: Response Assembly fields
  thinking?: string
  citations?: Citation[]
  confidenceScore?: ConfidenceScore
  queryMetadata?: QueryMetadata
  evaluation?: EvaluationScores
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

// ============================================================================
// Chat Component Types (merged from features/chat/types.ts)
// ============================================================================

/** Agent reasoning step (for deep-search / multi-agent flows) */
export interface AgentStep {
  id: string
  type: string
  title: string
  content?: string
  status: 'pending' | 'running' | 'done' | 'error'
}

/** Local message type used by ChatInterface component */
export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  thought?: string
  status?: 'loading' | 'done' | 'error'
  steps?: AgentStep[]
  sources?: Source[]
  confidence?: number
  chart?: ChartData
}

/** Callbacks for the chat stream */
export interface ChatStreamOptions {
  onMessage?: (chunk: string) => void
  onThought?: (thought: string) => void
  onStep?: (step: AgentStep) => void
  onDone?: () => void
  onError?: (error: Error) => void
}

// ============================================================================
// Strategy & Benchmark Types (Phase D)
// ============================================================================

/** A specific combination of LLM + Embedding + Search Engine */
export interface StrategyConfig {
  id: string
  name: string
  llm_provider: string
  llm_model: string
  embedding_provider: string
  embedding_model: string
  search_engine: string
  hybrid_engines?: string[] | null
  temperature: number
}

/** A test query for benchmarking */
export interface BenchmarkQuery {
  id: string
  query: string
  expected_topics: string[]
  difficulty: string
  category: string
}

/** Result of running a single strategy on a single query */
export interface StrategyResult {
  strategy_id: string
  query_id: string
  query_text: string
  answer: string
  sources_count: number
  confidence: number
  latency_ms: number
  token_usage: Record<string, unknown>
  coherence: number
  relevancy: number
  completeness: number
  grounding: number
  helpfulness: number
  faithfulness: number
  overall_score: number
  error?: string | null
  evaluated_at: string
}

/** Ranked strategy in the leaderboard */
export interface LeaderboardEntry {
  rank: number
  strategy: StrategyConfig
  overall_score: number
  dimension_scores: Record<string, number>
  avg_latency_ms: number
  avg_confidence: number
  query_count: number
}

/** Complete benchmark run */
export interface BenchmarkRun {
  id: string
  status: string
  strategies: StrategyConfig[]
  queries: BenchmarkQuery[]
  results: StrategyResult[]
  leaderboard: LeaderboardEntry[]
  total_combinations: number
  completed_combinations: number
  started_at: string | null
  completed_at: string | null
  created_at: string
}

/** Request to start a benchmark */
export interface BenchmarkRequest {
  strategies?: StrategyConfig[] | null
  queries?: BenchmarkQuery[] | null
  auto_select?: boolean
  max_strategies?: number
}

/** Compare request */
export interface CompareRequest {
  query: string
  strategy_ids?: string[]
}

// ============================================================================
// M11: Response Assembly Types
// ============================================================================

/** Citation source */
export interface Citation {
  id: string
  source: string
  snippet: string
  page?: number
  url?: string
  confidence: number
}

/** 4-dimensional confidence score */
export interface ConfidenceScore {
  overall: number       // 0-1 综合置信度
  grounding: number    // 0-1 上下文支撑度
  relevance: number    // 0-1 查询相关度
  completeness: number  // 0-1 回答完整度
}

/** Search method */
export type SearchMethod = 'hybrid' | 'semantic' | 'keyword'

/** Query metadata */
export interface QueryMetadata {
  method: SearchMethod
  llm_model: string
  search_engine: string
  embedding_model: string
  reranker?: string
  latency_ms: number
}

/** Evaluation dimension */
export type EvaluationDimension = 
  | 'coherence' 
  | 'relevancy' 
  | 'completeness' 
  | 'grounding' 
  | 'helpfulness' 
  | 'faithfulness'

/** Single dimension score */
export interface DimensionScore {
  dimension: EvaluationDimension
  score: number        // 1-5
  explanation: string
}

/** Evaluation scores (from EvaluationService) */
export interface EvaluationScores {
  id: string
  overall_score: number // 1-5
  scores: DimensionScore[]
  alerts: string[]
  evaluated_at: string
}

/** Response envelope - unified RAG response */
export interface ResponseEnvelope {
  answer: string
  thinking?: string
  charts: ChartData[]
  citations: Citation[]
  confidence: ConfidenceScore
  query_info: QueryMetadata
  evaluation?: EvaluationScores
  created_at: string
}

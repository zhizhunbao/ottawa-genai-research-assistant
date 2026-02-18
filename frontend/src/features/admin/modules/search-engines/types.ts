/**
 * Search Engines Types
 */

export interface EngineInfo {
  name: string
  available: boolean
  stats: Record<string, unknown> | null
}

export interface SearchTestResult {
  engine: string
  query: string
  results: Array<{
    id: string
    title: string
    content: string
    score: number
    source?: string
    page_num?: number
    engine?: string
    error?: string
  }>
  result_count: number
}

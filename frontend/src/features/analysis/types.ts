/**
 * 分析模块类型定义
 *
 * 遵循 dev-frontend_patterns skill 规范。
 */

export type AnalysisType = 'chart' | 'speaking_notes' | 'summary'

export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string
  borderColor?: string
}

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
  title?: string
  chartType: 'bar' | 'line' | 'pie'
}

export interface SpeakingNotes {
  title: string
  keyPoints: string[]
  statistics: string[]
  conclusion: string
}

export interface AnalysisRequest {
  query: string
  documentIds?: string[]
  analysisType: AnalysisType
}

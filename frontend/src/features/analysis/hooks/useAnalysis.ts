/**
 * 分析模块业务逻辑 Hook
 *
 * 处理图表生成和报告分析。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useState, useCallback } from 'react'
import { analysisApi } from '../services/analysisApi'
import type { ChartData, SpeakingNotes, AnalysisType } from '../types'

export function useAnalysis() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [speakingNotes, setSpeakingNotes] = useState<SpeakingNotes | null>(null)

  const performAnalysis = useCallback(async (query: string, type: AnalysisType) => {
    setIsLoading(true)
    setError(null)
    try {
      if (type === 'chart') {
        const response = await analysisApi.generateChart({ query, analysisType: type })
        if (response.success && response.data) {
          setChartData(response.data)
        }
      } else if (type === 'speaking_notes') {
        const response = await analysisApi.generateSpeakingNotes({ query, analysisType: type })
        if (response.success && response.data) {
          setSpeakingNotes(response.data)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setChartData(null)
    setSpeakingNotes(null)
    setError(null)
  }, [])

  return {
    isLoading,
    error,
    chartData,
    speakingNotes,
    performAnalysis,
    clearResults,
  }
}

/**
 * useEvaluationSummary hook
 *
 * 获取评估汇总统计数据。
 */

import { useCallback, useEffect, useState } from 'react'
import { evaluationApi, type EvaluationSummary } from '../services/evaluationApi'

export function useEvaluationSummary() {
  const [data, setData] = useState<EvaluationSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const summary = await evaluationApi.getSummary()
      setData(summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load evaluation data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  return { data, isLoading, error, refetch: fetchSummary }
}

/**
 * useEvaluationSummary - Hook for loading and managing evaluation summary data
 *
 * @module features/evaluation/hooks
 * @template none
 * @reference none
 */
import { useCallback, useEffect, useState } from 'react'
import { evaluationApi, type EvaluationSummary } from '../services/evaluation-api'

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

/**
 * benchmarkApi - REST API client for benchmark, strategy, and leaderboard operations
 *
 * @module features/research/services
 * @template none
 * @reference backend/app/benchmark/routes.py
 */
import { apiService } from '@/shared/services/api-service'
import type {
  BenchmarkQuery,
  BenchmarkRequest,
  BenchmarkRun,
  CompareRequest,
  LeaderboardEntry,
  StrategyConfig,
  StrategyResult,
} from '@/features/research/types'

export const benchmarkApi = {
  // ============================================================================
  // Benchmark Operations
  // ============================================================================

  /** Run a full benchmark across strategy combinations */
  async runBenchmark(request: BenchmarkRequest = {}): Promise<BenchmarkRun> {
    const res = await apiService.post<BenchmarkRun>('/benchmark/run', request)
    return res.data!
  },

  /** Get available strategy combinations */
  async getStrategies(maxCount = 20): Promise<StrategyConfig[]> {
    const res = await apiService.get<StrategyConfig[]>('/benchmark/strategies', {
      max_count: String(maxCount),
    })
    return res.data ?? []
  },

  /** Get built-in test queries */
  async getTestQueries(): Promise<BenchmarkQuery[]> {
    const res = await apiService.get<BenchmarkQuery[]>('/benchmark/test-queries')
    return res.data ?? []
  },

  /** Compare strategies on a single query */
  async compareStrategies(request: CompareRequest): Promise<StrategyResult[]> {
    const res = await apiService.post<StrategyResult[]>('/benchmark/compare', request)
    return res.data ?? []
  },

  // ============================================================================
  // Leaderboard & History
  // ============================================================================

  /** Get the latest benchmark leaderboard */
  async getLeaderboard(): Promise<{
    leaderboard: LeaderboardEntry[]
    benchmark_id?: string
    status?: string
    total_combinations?: number
    completed_at?: string
    strategies_count?: number
    queries_count?: number
    message?: string
  }> {
    const res = await apiService.get<{
      leaderboard: LeaderboardEntry[]
      benchmark_id?: string
      status?: string
      total_combinations?: number
      completed_at?: string
      strategies_count?: number
      queries_count?: number
      message?: string
    }>('/benchmark/leaderboard')
    return res.data ?? { leaderboard: [] }
  },

  /** Get benchmark run history */
  async getHistory(limit = 10): Promise<
    {
      id: string
      status: string
      strategies_count: number
      queries_count: number
      top_strategy: string | null
      top_score: number | null
      completed_at: string | null
      created_at: string
    }[]
  > {
    const res = await apiService.get<
      {
        id: string
        status: string
        strategies_count: number
        queries_count: number
        top_strategy: string | null
        top_score: number | null
        completed_at: string | null
        created_at: string
      }[]
    >('/benchmark/history', { limit: String(limit) })
    return res.data ?? []
  },

  // ============================================================================
  // Embedding Models
  // ============================================================================

  /** List available embedding models */
  async getEmbeddingModels(): Promise<
    {
      id: string
      provider: string
      dimension: number
      available: boolean
      registered?: boolean
    }[]
  > {
    const res = await apiService.get<
      {
        id: string
        provider: string
        dimension: number
        available: boolean
        registered?: boolean
      }[]
    >('/research/embedding-models')
    return res.data ?? []
  },
}

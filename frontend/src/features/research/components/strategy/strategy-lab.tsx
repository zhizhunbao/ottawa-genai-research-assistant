/**
 * StrategyLab - Full-featured benchmark & strategy comparison UI
 *
 * Tabs: Leaderboard | Radar | Compare | Test Queries
 * Features: Run benchmark, view rankings, compare strategies side-by-side
 *
 * @module features/research/components/strategy
 * @reference backend/app/benchmark/routes.py
 */
import { useState, useEffect, useCallback } from 'react'
import {
  Trophy,
  Play,
  Loader2,
  Zap,
  Clock,
  Target,
  BarChart3,
  GitCompare,
  ListChecks,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Search,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui'
import { benchmarkApi } from '../../services/benchmark-api'
import type {
  StrategyConfig,
  LeaderboardEntry,
  StrategyResult,
  BenchmarkQuery,
} from '../../types'

// ============================================================================
// Dimension metadata for display
// ============================================================================
const DIMENSIONS = [
  { key: 'coherence', label: 'Coherence', color: '#6366f1', icon: '🔗' },
  { key: 'relevancy', label: 'Relevancy', color: '#8b5cf6', icon: '🎯' },
  { key: 'completeness', label: 'Completeness', color: '#06b6d4', icon: '📦' },
  { key: 'grounding', label: 'Grounding', color: '#10b981', icon: '🏔️' },
  { key: 'helpfulness', label: 'Helpfulness', color: '#f59e0b', icon: '💡' },
  { key: 'faithfulness', label: 'Faithfulness', color: '#ef4444', icon: '✅' },
]

// ============================================================================
// Score badge component
// ============================================================================
function ScoreBadge({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const getColor = (s: number) => {
    if (s >= 4.0) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    if (s >= 3.0) return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    return 'bg-red-500/20 text-red-400 border-red-500/30'
  }
  const sizeClass = size === 'lg' ? 'text-lg px-3 py-1' : size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-0.5'
  return (
    <span className={`inline-flex items-center rounded-full border font-semibold ${getColor(score)} ${sizeClass}`}>
      {score.toFixed(2)}
    </span>
  )
}

// ============================================================================
// Rank badge
// ============================================================================
function RankBadge({ rank }: { rank: number }) {
  const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }
  if (medals[rank]) {
    return <span className="text-2xl">{medals[rank]}</span>
  }
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-sm font-bold">
      {rank}
    </span>
  )
}

// ============================================================================
// SVG Radar Chart
// ============================================================================
function RadarChart({
  entries,
  size = 280,
}: {
  entries: LeaderboardEntry[]
  size?: number
}) {
  const center = size / 2
  const radius = size / 2 - 40
  const angleStep = (2 * Math.PI) / DIMENSIONS.length

  // Compute polygon points for a set of dimension scores
  const getPoints = (scores: Record<string, number>) =>
    DIMENSIONS.map((dim, i) => {
      const angle = i * angleStep - Math.PI / 2
      const val = (scores[dim.key] || 0) / 5
      const x = center + radius * val * Math.cos(angle)
      const y = center + radius * val * Math.sin(angle)
      return `${x},${y}`
    }).join(' ')

  // Grid rings
  const rings = [1, 2, 3, 4, 5]
  const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {/* Grid rings */}
      {rings.map((level) => (
        <polygon
          key={level}
          points={DIMENSIONS.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2
            const r = (radius * level) / 5
            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`
          }).join(' ')}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="0.5"
          opacity={0.4}
        />
      ))}

      {/* Axis lines */}
      {DIMENSIONS.map((dim, i) => {
        const angle = i * angleStep - Math.PI / 2
        return (
          <g key={dim.key}>
            <line
              x1={center}
              y1={center}
              x2={center + radius * Math.cos(angle)}
              y2={center + radius * Math.sin(angle)}
              stroke="hsl(var(--border))"
              strokeWidth="0.5"
              opacity={0.4}
            />
            <text
              x={center + (radius + 20) * Math.cos(angle)}
              y={center + (radius + 20) * Math.sin(angle)}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground"
              fontSize="10"
            >
              {dim.icon} {dim.label}
            </text>
          </g>
        )
      })}

      {/* Data polygons */}
      {entries.slice(0, 5).map((entry, idx) => (
        <polygon
          key={entry.strategy.id}
          points={getPoints(entry.dimension_scores)}
          fill={colors[idx % colors.length]}
          fillOpacity={0.15}
          stroke={colors[idx % colors.length]}
          strokeWidth="2"
          strokeOpacity={0.8}
        />
      ))}

      {/* Legend */}
      {entries.slice(0, 5).map((entry, idx) => (
        <g key={`legend-${entry.strategy.id}`}>
          <rect
            x={8}
            y={8 + idx * 18}
            width={10}
            height={10}
            rx={2}
            fill={colors[idx % colors.length]}
            opacity={0.8}
          />
          <text
            x={24}
            y={16 + idx * 18}
            className="fill-foreground"
            fontSize="10"
          >
            #{entry.rank} {entry.strategy.name.substring(0, 30)}
          </text>
        </g>
      ))}
    </svg>
  )
}

// ============================================================================
// Dimension bar (horizontal)
// ============================================================================
function DimensionBar({ label, score, icon, color }: {
  label: string
  score: number
  icon: string
  color: string
}) {
  const pct = (score / 5) * 100
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-5 text-center">{icon}</span>
      <span className="w-28 text-muted-foreground truncate">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-10 text-right font-mono text-xs">{score.toFixed(1)}</span>
    </div>
  )
}

// ============================================================================
// Leaderboard Tab Content
// ============================================================================
function LeaderboardTab({ entries, onSelect }: {
  entries: LeaderboardEntry[]
  onSelect: (id: string) => void
}) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (!entries.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
        <Trophy className="w-12 h-12 opacity-30" />
        <p className="text-lg">No benchmark results yet</p>
        <p className="text-sm">Run a benchmark to see the leaderboard</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div
          key={entry.strategy.id}
          className="group rounded-xl border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all cursor-pointer"
          onClick={() => setExpanded(expanded === entry.strategy.id ? null : entry.strategy.id)}
        >
          {/* Main row */}
          <div className="flex items-center gap-4 p-4">
            <RankBadge rank={entry.rank} />

            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground truncate">
                {entry.strategy.name}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {entry.strategy.llm_model}
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {entry.strategy.embedding_model}
                </span>
                <span className="flex items-center gap-1">
                  <Search className="w-3 h-3" />
                  {entry.strategy.search_engine}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <ScoreBadge score={entry.overall_score} size="lg" />
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-end">
                  <Clock className="w-3 h-3" />
                  {entry.avg_latency_ms.toFixed(0)}ms
                </div>
              </div>

              <button
                className="p-1 rounded-md hover:bg-muted transition-colors"
                onClick={(e) => { e.stopPropagation(); onSelect(entry.strategy.id) }}
                title="Select for comparison"
              >
                <GitCompare className="w-4 h-4 text-muted-foreground" />
              </button>

              {expanded === entry.strategy.id
                ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                : <ChevronDown className="w-4 h-4 text-muted-foreground" />
              }
            </div>
          </div>

          {/* Expanded detail */}
          {expanded === entry.strategy.id && (
            <div className="px-4 pb-4 pt-1 border-t border-border/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {DIMENSIONS.map((dim) => (
                  <DimensionBar
                    key={dim.key}
                    label={dim.label}
                    score={entry.dimension_scores[dim.key] || 0}
                    icon={dim.icon}
                    color={dim.color}
                  />
                ))}
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span>{entry.query_count} queries tested</span>
                <span>Avg confidence: {(entry.avg_confidence * 100).toFixed(0)}%</span>
                <span>Temperature: {entry.strategy.temperature}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// Compare Tab Content
// ============================================================================
function CompareTab({ strategies }: { strategies: StrategyConfig[] }) {
  const [query, setQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [results, setResults] = useState<StrategyResult[]>([])
  const [loading, setLoading] = useState(false)

  const toggleStrategy = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(0, 3)
    )
  }

  const handleCompare = async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const data = await benchmarkApi.compareStrategies({
        query: query.trim(),
        strategy_ids: selectedIds,
      })
      setResults(data)
    } catch (err) {
      console.error('Compare failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Strategy selector */}
      <div className="rounded-xl border bg-card/50 p-4">
        <h4 className="text-sm font-medium mb-3 text-foreground">
          Select strategies to compare (max 3)
        </h4>
        <div className="flex flex-wrap gap-2">
          {strategies.map((s) => (
            <button
              key={s.id}
              onClick={() => toggleStrategy(s.id)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                ${selectedIds.includes(s.id)
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'
                }
              `}
            >
              {selectedIds.includes(s.id) && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Query input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a test query to compare strategies..."
          className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
        />
        <button
          onClick={handleCompare}
          disabled={loading || !query.trim()}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitCompare className="w-4 h-4" />}
          Compare
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((r) => {
            const strategy = strategies.find((s) => s.id === r.strategy_id)
            return (
              <div key={r.strategy_id} className="rounded-xl border bg-card/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm truncate">
                    {strategy?.name || r.strategy_id}
                  </h4>
                  <ScoreBadge score={r.overall_score} />
                </div>

                {r.error ? (
                  <div className="flex items-center gap-2 text-red-400 text-xs">
                    <AlertCircle className="w-4 h-4" />
                    {r.error}
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      {DIMENSIONS.map((dim) => (
                        <DimensionBar
                          key={dim.key}
                          label={dim.label}
                          score={r[dim.key as keyof StrategyResult] as number || 0}
                          icon={dim.icon}
                          color={dim.color}
                        />
                      ))}
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border/50">
                      <div className="flex justify-between">
                        <span>Latency</span>
                        <span>{r.latency_ms.toFixed(0)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sources</span>
                        <span>{r.sources_count}</span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                      <p className="line-clamp-3">{r.answer}</p>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Test Queries Tab
// ============================================================================
function TestQueriesTab({ queries }: { queries: BenchmarkQuery[] }) {
  return (
    <div className="space-y-3">
      {queries.map((q) => (
        <div key={q.id} className="rounded-xl border bg-card/50 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium text-foreground">{q.query}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {q.category}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  q.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' :
                  q.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {q.difficulty}
                </span>
              </div>
            </div>
          </div>
          {q.expected_topics.length > 0 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {q.expected_topics.map((t) => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary/80">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// Main StrategyLab Component
// ============================================================================
export function StrategyLab() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [strategies, setStrategies] = useState<StrategyConfig[]>([])
  const [testQueries, setTestQueries] = useState<BenchmarkQuery[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = useCallback(async () => {
    try {
      const [lb, strats, queries] = await Promise.all([
        benchmarkApi.getLeaderboard(),
        benchmarkApi.getStrategies(),
        benchmarkApi.getTestQueries(),
      ])
      setLeaderboard(lb.leaderboard || [])
      setStrategies(strats)
      setTestQueries(queries)
    } catch (err) {
      console.error('Failed to load benchmark data:', err)
    }
  }, [])

  const handleRunBenchmark = async () => {
    setIsRunning(true)
    setError(null)
    setProgress(0)
    try {
      // Simulate progress (real-time progress would require WebSocket)
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 5, 90))
      }, 1000)

      const result = await benchmarkApi.runBenchmark({
        auto_select: true,
        max_strategies: 10,
      })

      clearInterval(progressInterval)
      setProgress(100)
      setLeaderboard(result.leaderboard || [])

      // Refresh all data
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Benchmark failed')
    } finally {
      setIsRunning(false)
    }
  }

  const handleSelectForCompare = (_id: string) => {
    // Reserved for future: select strategies for compare tab
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b bg-card/30 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Strategy Lab
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Benchmark LLM × Embedding × Search combinations
            </p>
          </div>

          <button
            onClick={handleRunBenchmark}
            disabled={isRunning}
            className="px-5 py-2.5 rounded-xl bg-linear-to-r from-primary to-primary/80 text-primary-foreground font-medium text-sm hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running... {progress}%
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Benchmark
              </>
            )}
          </button>
        </div>

        {/* Progress bar */}
        {isRunning && (
          <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-primary to-primary/60 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      {/* Tabs Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <Tabs defaultValue="leaderboard" className="h-full">
          <TabsList className="mb-4">
            <TabsTrigger value="leaderboard" className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="radar" className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              Radar
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex items-center gap-1.5">
              <GitCompare className="w-3.5 h-3.5" />
              Compare
            </TabsTrigger>
            <TabsTrigger value="queries" className="flex items-center gap-1.5">
              <ListChecks className="w-3.5 h-3.5" />
              Test Queries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard">
            <LeaderboardTab entries={leaderboard} onSelect={handleSelectForCompare} />
          </TabsContent>

          <TabsContent value="radar">
            {leaderboard.length > 0 ? (
              <div className="flex flex-col items-center gap-6">
                <div className="rounded-xl border bg-card/50 p-6">
                  <h3 className="text-center text-sm font-medium text-muted-foreground mb-4">
                    6-Dimension Score Comparison (Top 5)
                  </h3>
                  <RadarChart entries={leaderboard} size={380} />
                </div>
                {/* Score table */}
                <div className="w-full max-w-3xl rounded-xl border bg-card/50 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground">Strategy</th>
                        {DIMENSIONS.map((d) => (
                          <th key={d.key} className="text-center px-2 py-2 font-medium text-muted-foreground">
                            {d.icon}
                          </th>
                        ))}
                        <th className="text-center px-4 py-2 font-medium text-muted-foreground">Overall</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.slice(0, 5).map((entry) => (
                        <tr key={entry.strategy.id} className="border-b border-border/30 hover:bg-muted/20">
                          <td className="px-4 py-2 truncate max-w-[180px]">
                            <span className="mr-1">{entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank-1] : `#${entry.rank}`}</span>
                            {entry.strategy.name}
                          </td>
                          {DIMENSIONS.map((d) => (
                            <td key={d.key} className="text-center px-2 py-2 font-mono text-xs">
                              {(entry.dimension_scores[d.key] || 0).toFixed(1)}
                            </td>
                          ))}
                          <td className="text-center px-4 py-2">
                            <ScoreBadge score={entry.overall_score} size="sm" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                <BarChart3 className="w-12 h-12 opacity-30" />
                <p>Run a benchmark to see the radar chart</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="compare">
            <CompareTab strategies={strategies} />
          </TabsContent>

          <TabsContent value="queries">
            <TestQueriesTab queries={testQueries} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default StrategyLab

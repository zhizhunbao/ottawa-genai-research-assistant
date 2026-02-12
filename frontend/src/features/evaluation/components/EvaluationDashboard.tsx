/**
 * EvaluationDashboard - LLM 评估仪表板
 *
 * US-303: 显示 6 维度评估统计和近期评估结果。
 * 使用 Recharts RadarChart 展示维度评分，用卡片展示告警。
 */

import { useEffect, useState } from 'react'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Skeleton,
} from '@/shared/components/ui'
import { useEvaluationSummary } from '../hooks/useEvaluationSummary'
import { DIMENSIONS } from '../services/evaluationApi'
import type { EvaluationResult } from '../services/evaluationApi'

// ─── Score color helper ─────────────────────────────────────────────

function scoreColor(score: number, threshold: number): string {
  if (score >= threshold) return 'text-emerald-600'
  if (score >= threshold - 0.5) return 'text-amber-500'
  return 'text-red-500'
}

function scoreBg(score: number, threshold: number): string {
  if (score >= threshold) return 'bg-emerald-50 border-emerald-200'
  if (score >= threshold - 0.5) return 'bg-amber-50 border-amber-200'
  return 'bg-red-50 border-red-200'
}

function badgeVariant(score: number, threshold: number) {
  if (score >= threshold) return 'default' as const
  return 'destructive' as const
}

// ─── DimensionCard ──────────────────────────────────────────────────

function DimensionCard({
  label,
  score,
  threshold,
}: {
  label: string
  score: number
  threshold: number
}) {
  const isAbove = score >= threshold

  return (
    <div
      className={`
        rounded-xl border p-4 transition-all duration-300
        hover:shadow-md hover:-translate-y-0.5
        ${scoreBg(score, threshold)}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {!isAbove && (
          <span className="text-xs text-red-500 font-medium animate-pulse">
            ⚠ Below
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold tabular-nums ${scoreColor(score, threshold)}`}>
          {score.toFixed(1)}
        </span>
        <span className="text-sm text-gray-400">/ 5.0</span>
      </div>
      <div className="mt-1 text-xs text-gray-500">
        Target: ≥ {threshold}
      </div>
      {/* Progress bar */}
      <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isAbove
              ? 'bg-linear-to-r from-emerald-400 to-emerald-500'
              : 'bg-linear-to-r from-red-400 to-red-500'
          }`}
          style={{ width: `${Math.min(100, (score / 5) * 100)}%` }}
        />
      </div>
    </div>
  )
}

// ─── Recent evaluation item ────────────────────────────────────────

function EvaluationItem({ result }: { result: EvaluationResult }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0 mr-4">
          <p className="text-sm font-medium text-gray-900 truncate">
            {result.query}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date(result.evaluated_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={badgeVariant(result.overall_score, 4.0)}>
            {result.overall_score.toFixed(1)}
          </Badge>
          {result.alerts.length > 0 && (
            <span className="text-xs text-red-500">
              {result.alerts.length} alert{result.alerts.length > 1 ? 's' : ''}
            </span>
          )}
          <span className="text-gray-400 text-sm">
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t space-y-2">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {result.scores.map((s) => {
              const dimMeta = DIMENSIONS.find((d) => d.key === s.dimension)
              return (
                <div
                  key={s.dimension}
                  className="flex items-center justify-between text-xs p-2 rounded bg-gray-50"
                >
                  <span className="text-gray-600">
                    {dimMeta?.label ?? s.dimension}
                  </span>
                  <span
                    className={`font-bold ${scoreColor(
                      s.score,
                      dimMeta?.threshold ?? 4.0
                    )}`}
                  >
                    {s.score.toFixed(1)}
                  </span>
                </div>
              )
            })}
          </div>
          {result.response && (
            <div className="text-xs text-gray-600 bg-gray-50 rounded p-2 max-h-24 overflow-y-auto">
              <strong>Response:</strong> {result.response.slice(0, 200)}
              {result.response.length > 200 && '...'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Loading skeleton ───────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-64" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  )
}

// ─── Empty state ────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">📊</div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        No Evaluations Yet
      </h3>
      <p className="text-sm text-gray-500 max-w-md mx-auto">
        Evaluations will appear here once you start evaluating LLM responses.
        Use the <code className="bg-gray-100 px-1 rounded">POST /api/v1/evaluation/evaluate</code> endpoint
        to trigger an evaluation.
      </p>
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────

export default function EvaluationDashboard() {
  const { data, isLoading, error, refetch } = useEvaluationSummary()
  const [autoRefresh, setAutoRefresh] = useState(false)

  // Auto-refresh every 30s
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(refetch, 30_000)
    return () => clearInterval(interval)
  }, [autoRefresh, refetch])

  if (isLoading) return <DashboardSkeleton />

  if (error) {
    return (
      <div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 font-medium">Failed to load evaluation data</p>
            <p className="text-sm text-red-500 mt-1">{error}</p>
            <Button onClick={refetch} className="mt-4" variant="outline" size="sm">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data || data.total_evaluations === 0) {
    return (
      <div>
        <EmptyState />
      </div>
    )
  }

  // Prepare radar chart data
  const radarData = DIMENSIONS.map((dim) => ({
    dimension: dim.label,
    score: data.dimension_averages[dim.key] ?? 0,
    threshold: dim.threshold,
    fullMark: 5,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            LLM Evaluation Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {data.total_evaluations} evaluation{data.total_evaluations !== 1 ? 's' : ''} recorded
            {data.alerts_count > 0 && (
              <span className="text-red-500 ml-2">
                · {data.alerts_count} alert{data.alerts_count !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh
          </label>
          <Button onClick={refetch} variant="outline" size="sm">
            ↻ Refresh
          </Button>
        </div>
      </div>

      {/* Overall score hero card */}
      <Card className="bg-linear-to-br from-[#004890] to-[#0066cc] text-white border-0 shadow-lg">
        <CardContent className="p-8 flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm font-medium uppercase tracking-wider">
              Overall Quality Score
            </p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-5xl font-bold tabular-nums">
                {data.overall_average.toFixed(2)}
              </span>
              <span className="text-white/60 text-xl">/ 5.0</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-6xl opacity-20">🎯</div>
          </div>
        </CardContent>
      </Card>

      {/* Dimension cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {DIMENSIONS.map((dim) => (
          <DimensionCard
            key={dim.key}
            label={dim.label}
            score={data.dimension_averages[dim.key] ?? 0}
            threshold={dim.threshold}
          />
        ))}
      </div>

      {/* Radar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quality Radar</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 5]}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
              />
              <RechartsTooltip
                formatter={(value) => [(typeof value === 'number' ? value.toFixed(2) : value), 'Score']}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#004890"
                fill="#004890"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Radar
                name="Threshold"
                dataKey="threshold"
                stroke="#f59e0b"
                fill="transparent"
                strokeDasharray="5 5"
                strokeWidth={1.5}
              />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500 mt-2">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-[#004890] inline-block" /> Score
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-amber-500 inline-block border-dashed" /> Threshold
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Recent evaluations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Evaluations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.recent_evaluations.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No recent evaluations
            </p>
          ) : (
            data.recent_evaluations.map((result) => (
              <EvaluationItem key={result.id} result={result} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

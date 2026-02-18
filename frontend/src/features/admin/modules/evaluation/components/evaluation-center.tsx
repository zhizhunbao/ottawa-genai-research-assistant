/**
 * EvaluationCenter - Page for evaluation management and visualization
 *
 * Shows evaluation summary, recent results, and dimension breakdown.
 *
 * @module features/admin/modules/evaluation
 */

import { useCallback, useEffect, useState } from 'react'
import {
  LineChart,
  RefreshCw,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  Target,
} from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Progress } from '@/shared/components/ui/progress'
import { cn } from '@/lib/utils'

import type { EvaluationSummary, EvaluationResult, EvaluationDimension } from '../types'
import * as api from '../services/evaluation-api'

const DIMENSION_LABELS: Record<EvaluationDimension, string> = {
  coherence: 'Coherence',
  relevancy: 'Relevancy',
  completeness: 'Completeness',
  grounding: 'Grounding',
  helpfulness: 'Helpfulness',
  faithfulness: 'Faithfulness',
}

const DIMENSION_DESCRIPTIONS: Record<EvaluationDimension, string> = {
  coherence: 'Logical structure and flow',
  relevancy: 'Addresses the query',
  completeness: 'Covers all aspects',
  grounding: 'Supported by context',
  helpfulness: 'Useful and actionable',
  faithfulness: 'Accurate representation',
}

function getScoreColor(score: number): string {
  if (score >= 4.5) return 'text-emerald-500'
  if (score >= 4.0) return 'text-green-500'
  if (score >= 3.5) return 'text-amber-500'
  if (score >= 3.0) return 'text-orange-500'
  return 'text-red-500'
}

function getScoreBg(score: number): string {
  if (score >= 4.5) return 'bg-emerald-500'
  if (score >= 4.0) return 'bg-green-500'
  if (score >= 3.5) return 'bg-amber-500'
  if (score >= 3.0) return 'bg-orange-500'
  return 'bg-red-500'
}

export default function EvaluationCenter() {
  const [summary, setSummary] = useState<EvaluationSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSummary = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getSummary()
      setSummary(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load summary')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Evaluation Center</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor RAG response quality with 6-dimension evaluation
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadSummary} disabled={loading}>
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Error display */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
          <Button variant="ghost" size="sm" className="ml-2" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : summary ? (
        <>
          {/* Stats cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Total Evaluations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total_evaluations}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Overall Average
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn('text-2xl font-bold', getScoreColor(summary.overall_average))}>
                  {summary.overall_average.toFixed(2)} / 5.0
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Quality Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.total_evaluations > 0
                    ? Math.round(((summary.total_evaluations - summary.alerts_count) / summary.total_evaluations) * 100)
                    : 0}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn('text-2xl font-bold', summary.alerts_count > 0 ? 'text-amber-500' : 'text-emerald-500')}>
                  {summary.alerts_count}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dimension scores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Dimension Averages
              </CardTitle>
              <CardDescription>
                Average scores across all evaluations by dimension
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(summary.dimension_averages).map(([dim, score]) => (
                  <div key={dim} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium capitalize">{DIMENSION_LABELS[dim as EvaluationDimension] || dim}</span>
                        <span className="text-muted-foreground ml-2 text-xs">
                          {DIMENSION_DESCRIPTIONS[dim as EvaluationDimension] || ''}
                        </span>
                      </div>
                      <span className={cn('font-bold', getScoreColor(score))}>
                        {score.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', getScoreBg(score))}
                        style={{ width: `${(score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent evaluations */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Evaluations</CardTitle>
              <CardDescription>
                Latest evaluation results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summary.recent_evaluations.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No evaluations yet. Run a chat query with evaluation enabled.
                </p>
              ) : (
                <div className="space-y-3">
                  {summary.recent_evaluations.slice(0, 5).map((evaluation) => (
                    <EvaluationRow key={evaluation.id} evaluation={evaluation} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No evaluation data available. Run evaluations to see results here.
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/** Single evaluation row */
function EvaluationRow({ evaluation }: { evaluation: EvaluationResult }) {
  const hasAlerts = evaluation.alerts.length > 0

  return (
    <div className="rounded-lg border p-4 space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{evaluation.query}</p>
          <p className="text-xs text-muted-foreground truncate mt-1">
            {evaluation.response.substring(0, 100)}...
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {hasAlerts ? (
            <Badge variant="outline" className="text-amber-500 border-amber-500">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {evaluation.alerts.length} alerts
            </Badge>
          ) : (
            <Badge variant="outline" className="text-emerald-500 border-emerald-500">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Good
            </Badge>
          )}
          <Badge className={getScoreBg(evaluation.overall_score)}>
            {evaluation.overall_score.toFixed(1)}
          </Badge>
        </div>
      </div>

      {/* Dimension mini-bars */}
      <div className="flex gap-1">
        {evaluation.scores.map((s) => (
          <div
            key={s.dimension}
            className="flex-1 h-1.5 rounded-full overflow-hidden bg-muted"
            title={`${DIMENSION_LABELS[s.dimension]}: ${s.score.toFixed(1)}`}
          >
            <div
              className={cn('h-full rounded-full', getScoreBg(s.score))}
              style={{ width: `${(s.score / 5) * 100}%` }}
            />
          </div>
        ))}
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {evaluation.llm_model && <span>{evaluation.llm_model}</span>}
        {evaluation.search_engine && <span>• {evaluation.search_engine}</span>}
        {evaluation.latency_ms && <span>• {evaluation.latency_ms.toFixed(0)}ms</span>}
        <span className="ml-auto">
          {new Date(evaluation.evaluated_at).toLocaleString()}
        </span>
      </div>
    </div>
  )
}

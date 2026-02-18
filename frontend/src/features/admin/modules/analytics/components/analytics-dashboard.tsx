/**
 * AnalyticsDashboard - Usage statistics and system insights
 *
 * Shows usage overview, query trends, quality metrics, and document stats.
 * Accessible via Admin Console at /admin/analytics.
 *
 * @module features/admin/modules/analytics/components
 */

import { useState, useEffect, useCallback } from 'react'
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Activity,
  Clock,
  ThumbsUp,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { LineChart } from '@/shared/components/charts'
import { PieChart } from '@/shared/components/charts'
import { cn } from '@/lib/utils'

import type { DashboardData } from '../types'
import * as api from '../services/analytics-api'

// ─── Sub-Components ───────────────────────────────────────────────────

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ElementType
  color: string
}

function StatCard({ title, value, description, icon: Icon, color }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', color)}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{title}</p>
            <p className="text-xl font-bold tabular-nums">{value}</p>
            {description && (
              <p className="text-[10px] text-muted-foreground/70">{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface MetricItemProps {
  label: string
  value: string
  icon: React.ElementType
  color: string
}

function MetricItem({ label, value, icon: Icon, color }: MetricItemProps) {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/40">
      <Icon className={cn('h-8 w-8', color)} />
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className={cn('text-lg font-bold tabular-nums', color)}>{value}</p>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────

export default function AnalyticsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(30)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.getDashboard(days)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-muted-foreground gap-2">
        <BarChart3 className="h-8 w-8" />
        <p className="text-sm">{error || 'No analytics data available'}</p>
        <button onClick={fetchData} className="text-xs text-primary hover:underline">Retry</button>
      </div>
    )
  }

  const d = data

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Analytics Dashboard
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Usage statistics and quality insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map(n => (
            <button
              key={n}
              onClick={() => setDays(n)}
              className={cn(
                'px-2.5 py-1 text-xs rounded-md transition-colors',
                days === n
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {n}d
            </button>
          ))}
          <button onClick={fetchData} className="p-1.5 rounded-md hover:bg-muted">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="Total Queries"
          value={d.overview.total_queries.toLocaleString()}
          icon={Activity}
          color="bg-blue-500"
        />
        <StatCard
          title="Chat Sessions"
          value={d.overview.total_sessions.toLocaleString()}
          icon={TrendingUp}
          color="bg-purple-500"
        />
        <StatCard
          title="Documents"
          value={d.overview.total_documents.toLocaleString()}
          description={`${d.document_stats.recent_uploads} this week`}
          icon={FileText}
          color="bg-emerald-500"
        />
        <StatCard
          title="Users"
          value={d.overview.total_users.toLocaleString()}
          icon={Users}
          color="bg-amber-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Queries Over Time */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Queries Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-55">
              <LineChart
                data={d.queries_over_time.data.map(p => ({
                  date: p.date,
                  queries: p.count,
                }))}
                xKey="date"
                yKeys={['queries']}
              />
            </div>
          </CardContent>
        </Card>

        {/* Search Method Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Search Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-55">
              <PieChart
                data={d.search_method_distribution.map(item => ({
                  name: item.name,
                  value: item.value,
                }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Metrics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4 text-emerald-500" />
            Quality Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricItem
              label="Avg Confidence"
              value={`${Math.round(d.quality_metrics.avg_confidence * 100)}%`}
              icon={Activity}
              color={d.quality_metrics.avg_confidence >= 0.7 ? 'text-emerald-500' : 'text-amber-500'}
            />
            <MetricItem
              label="Avg Evaluation"
              value={`${d.quality_metrics.avg_evaluation_score.toFixed(1)}/5`}
              icon={BarChart3}
              color={d.quality_metrics.avg_evaluation_score >= 3.5 ? 'text-emerald-500' : 'text-amber-500'}
            />
            <MetricItem
              label="Positive Feedback"
              value={`${Math.round(d.quality_metrics.feedback_positive_rate * 100)}%`}
              icon={ThumbsUp}
              color={d.quality_metrics.feedback_positive_rate >= 0.7 ? 'text-emerald-500' : 'text-amber-500'}
            />
            <MetricItem
              label="Total Feedback"
              value={d.quality_metrics.total_feedback.toLocaleString()}
              icon={Clock}
              color="text-blue-500"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

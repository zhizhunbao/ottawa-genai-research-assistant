/**
 * FeedbackAdmin - Admin page for viewing and managing user feedback
 *
 * Displays aggregate statistics, top issue categories, and a scrollable
 * list of recent feedback items. Uses feedback-api service for data fetching
 * with graceful mock-data fallback.
 *
 * @module features/admin/modules/feedback/components
 */

import { useState, useEffect, useCallback } from 'react'
import {
  ThumbsUp,
  ThumbsDown,
  Minus,
  MessageSquare,
  RefreshCw,
  BarChart3,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/lib/utils'

import type { FeedbackItem, FeedbackStats } from '../types'
import * as api from '../services/feedback-api'

const EMPTY_STATS: FeedbackStats = {
  total: 0, thumbs_up: 0, thumbs_down: 0, neutral: 0,
  top_categories: [], avg_rating: 0,
}

// ─── Sub-Components ───────────────────────────────────────────────────

function RatingIcon({ rating }: { rating: number }) {
  if (rating > 0) return <ThumbsUp size={14} className="text-emerald-500" />
  if (rating < 0) return <ThumbsDown size={14} className="text-red-500" />
  return <Minus size={14} className="text-muted-foreground" />
}

interface StatCardProps {
  value: number | string
  label: string
  colorClass?: string
  icon?: React.ReactNode
}

function StatCard({ value, label, colorClass, icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <p className={cn('text-3xl font-bold', colorClass)}>{value}</p>
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          {icon}
          {label}
        </p>
      </CardContent>
    </Card>
  )
}

function CategoryList({ categories }: { categories: FeedbackStats['top_categories'] }) {
  if (categories.length === 0) {
    return <p className="text-sm text-muted-foreground italic">No categorized feedback yet</p>
  }
  return (
    <div className="space-y-2">
      {categories.map(cat => (
        <div key={cat.category} className="flex items-center justify-between">
          <span className="text-sm capitalize">{cat.category.replace(/_/g, ' ')}</span>
          <Badge variant="outline" className="text-xs tabular-nums">
            {cat.count}
          </Badge>
        </div>
      ))}
    </div>
  )
}

function FeedbackRow({ item }: { item: FeedbackItem }) {
  return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="mt-0.5">
        <RatingIcon rating={item.rating} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          {item.categories.map(cat => (
            <Badge key={cat} variant="outline" className="text-[10px]">
              {cat.replace(/_/g, ' ')}
            </Badge>
          ))}
        </div>
        {item.comment && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.comment}</p>
        )}
      </div>
      <span className="text-[10px] text-muted-foreground/60 shrink-0">
        {new Date(item.created_at).toLocaleDateString()}
      </span>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────

export default function FeedbackAdmin() {
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [recent, setRecent] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [statsData, recentData] = await Promise.all([
        api.getStats(30),
        api.getRecent(20),
      ])
      setStats(statsData)
      setRecent(recentData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feedback data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const s = stats ?? EMPTY_STATS
  const avgDisplay = `${s.avg_rating > 0 ? '+' : ''}${s.avg_rating.toFixed(2)}`
  const avgColor = s.avg_rating > 0
    ? 'text-emerald-500'
    : s.avg_rating < 0 ? 'text-red-500' : 'text-muted-foreground'

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Feedback
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            User feedback on AI responses (last 30 days)
          </p>
        </div>
        <button onClick={fetchData} className="p-1.5 rounded-md hover:bg-muted" disabled={loading}>
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard value={s.total} label="Total" />
        <StatCard
          value={s.thumbs_up}
          label="Positive"
          colorClass="text-emerald-500"
          icon={<ThumbsUp size={12} />}
        />
        <StatCard
          value={s.thumbs_down}
          label="Negative"
          colorClass="text-red-500"
          icon={<ThumbsDown size={12} />}
        />
        <StatCard value={avgDisplay} label="Avg Rating" colorClass={avgColor} />
      </div>

      {/* Two columns: Categories + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Categories */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-amber-500" />
              Top Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryList categories={s.top_categories} />
          </CardContent>
        </Card>

        {/* Recent Feedback */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            {recent.length > 0 ? (
              <div className="space-y-2 max-h-100 overflow-y-auto">
                {recent.map(fb => (
                  <FeedbackRow key={fb.id} item={fb} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No feedback yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

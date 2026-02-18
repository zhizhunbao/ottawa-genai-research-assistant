/**
 * AdminDashboard - Admin Console overview page with system health stats
 *
 * Shows status cards for all infrastructure components,
 * recent activity feed, and quick-action links.
 *
 * @module features/admin/views
 * @reference shadcn-admin/src/features/dashboard
 */

import { useState, useEffect } from 'react'
import {
  Database,
  Brain,
  Cpu,
  Search,
  FileText,
  BarChart3,
  LineChart,
  FlaskConical,
  Users,
  Activity,
  HardDrive,
  Zap,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { apiService } from '@/shared/services/api-service'
import type { DashboardStatsResponse, DashboardHealthResponse, ServiceHealth } from '../types'

/** Map backend stat labels to icons and colors */
const STAT_CONFIG: Record<string, { icon: React.ElementType; color: string; href: string }> = {
  'Data Sources': { icon: Database, color: 'text-blue-500', href: '/admin/datasources' },
  'LLM Models': { icon: Brain, color: 'text-purple-500', href: '/admin/llm-models' },
  'Embedding Models': { icon: Cpu, color: 'text-cyan-500', href: '/admin/embedding-models' },
  'Search Engines': { icon: Search, color: 'text-orange-500', href: '/admin/search-engines' },
  'Prompt Studio': { icon: FileText, color: 'text-emerald-500', href: '/admin/prompt-studio' },
  'Evaluation': { icon: FlaskConical, color: 'text-amber-500', href: '/admin/benchmark' },
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any[]>([])
  const [health, setHealth] = useState<ServiceHealth[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, healthRes] = await Promise.all([
          apiService.get<DashboardStatsResponse>('/admin/dashboard/stats'),
          apiService.get<DashboardHealthResponse>('/admin/dashboard/health'),
        ])

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data.stats)
        }
        if (healthRes.success && healthRes.data) {
          setHealth(healthRes.data.services)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Console</h1>
          <p className="text-muted-foreground text-sm mt-1">
            System overview and infrastructure management
          </p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Updating...
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.length > 0 ? (
          stats.map((stat) => {
            const config = STAT_CONFIG[stat.label] || {
              icon: Activity,
              color: 'text-muted-foreground',
              href: '#',
            }
            const Icon = config.icon
            return (
              <Link
                key={stat.label}
                to={config.href}
                className="group rounded-lg border border-border bg-card p-5 transition-all hover:shadow-md hover:border-primary/30"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold tracking-tight">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>
                  <div
                    className={`rounded-lg bg-muted p-2.5 transition-colors group-hover:bg-accent ${config.color}`}
                  >
                    <Icon size={20} />
                  </div>
                </div>
              </Link>
            )
          })
        ) : loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-lg border border-border bg-muted/20 animate-pulse" />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No statistics available.
          </div>
        )}
      </div>

      {/* Quick overview sections */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* System Health */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-emerald-500" />
              <h2 className="font-semibold">System Health</h2>
            </div>
            {!loading && (
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                Live Status
              </span>
            )}
          </div>
          <div className="space-y-3">
            {health.length > 0 ? (
              health.map((service) => (
                <HealthRow key={service.service} item={service} />
              ))
            ) : loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 w-full bg-muted/30 animate-pulse rounded" />
              ))
            ) : (
              <div className="text-sm text-muted-foreground italic">
                Could not retrieve service health.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={18} className="text-amber-500" />
            <h2 className="font-semibold">Quick Actions</h2>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <QuickAction
              icon={Brain}
              label="Pull Model"
              description="Download a new Ollama model"
              href="/admin/llm-models"
            />
            <QuickAction
              icon={BarChart3}
              label="Run Benchmark"
              description="Evaluate model strategies"
              href="/admin/benchmark"
            />
            <QuickAction
              icon={LineChart}
              label="Run Evaluation"
              description="Assess response quality"
              href="/admin/evaluation"
            />
            <QuickAction
              icon={HardDrive}
              label="Disk Usage"
              description="Check model storage"
              href="/admin/llm-models"
            />
            <QuickAction
              icon={Users}
              label="Manage Users"
              description="User roles and access"
              href="/admin/users"
            />
            <QuickAction
              icon={Database}
              label="Sync Data"
              description="Trigger data source sync"
              href="/admin/datasources"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/** Health status row */
function HealthRow({ item }: { item: ServiceHealth }) {
  const isHealthy = item.status === 'healthy'
  const isDegraded = item.status === 'degraded'
  const isUnavailable = item.status === 'unavailable'

  let StatusIcon = Clock
  let statusColor = 'text-muted-foreground/30'
  let textColor = 'text-muted-foreground'

  if (isHealthy) {
    StatusIcon = CheckCircle2
    statusColor = 'text-emerald-500'
    textColor = 'text-foreground'
  } else if (isDegraded) {
    StatusIcon = Clock
    statusColor = 'text-amber-500'
  } else if (isUnavailable) {
    StatusIcon = AlertCircle
    statusColor = 'text-destructive'
  }

  return (
    <div className="flex items-center justify-between text-sm group">
      <div className="flex items-center gap-2">
        <span className={textColor}>{item.service}</span>
        {item.latency_ms && (
          <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            {item.latency_ms}ms
          </span>
        )}
      </div>
      <span className={`flex items-center gap-1.5 text-xs font-medium ${statusColor}`}>
        <StatusIcon size={12} />
        {item.status.charAt(0) + item.status.slice(1)}
      </span>
    </div>
  )
}

/** Quick action card */
function QuickAction({
  icon: Icon,
  label,
  description,
  href,
}: {
  icon: React.ElementType
  label: string
  description: string
  href: string
}) {
  return (
    <Link
      to={href}
      className="flex items-center gap-3 rounded-md border border-border p-3 transition-colors hover:bg-accent"
    >
      <Icon size={16} className="text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
    </Link>
  )
}

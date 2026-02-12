/**
 * 文档状态组件
 *
 * 显示文档的处理状态（Pending / Processing / Indexed）。
 * 对应 Sprint 3 US-201 Task 8。
 */

import { FileText, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { Badge, Card, CardContent } from '@/shared/components/ui'
import { cn } from '@/lib/utils'

interface DocumentStatusProps {
  name: string
  status: 'pending' | 'processing' | 'indexed' | 'failed'
  updatedAt?: string
}

export function DocumentStatus({ name, status, updatedAt }: DocumentStatusProps) {
  const statusConfig: Record<string, {
    icon: typeof Clock
    color: string
    bg: string
    label: string
    pulse?: boolean
  }> = {
    pending: {
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      label: 'Pending',
    },
    processing: {
      icon: Clock,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      label: 'Processing',
      pulse: true,
    },
    indexed: {
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      label: 'Indexed',
    },
    failed: {
      icon: AlertCircle,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      label: 'Failed',
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Card className="overflow-hidden border-none shadow-sm bg-card hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={cn('p-2 rounded-xl shrink-0', config.bg)}>
            <FileText className={cn('w-5 h-5', config.color)} />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold truncate text-foreground">{name}</h4>
            {updatedAt && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {new Date(updatedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <Badge
          variant="secondary"
          className={cn(
            'gap-1 pr-2 text-[10px] h-6 font-medium border-none',
            config.bg,
            config.color
          )}
        >
          <Icon className={cn('w-3 h-3', config.pulse && 'animate-pulse')} />
          {config.label}
        </Badge>
      </CardContent>
    </Card>
  )
}

/**
 * ConfidenceIndicator - Visual badge showing AI response confidence level
 *
 * @module features/chat
 * @template none
 * @reference none
 */

import { useTranslation } from 'react-i18next'
import { ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/shared/components/ui'

interface ConfidenceIndicatorProps {
  /** Confidence value 0-1. */
  confidence: number
}

type ConfidenceLevel = 'high' | 'medium' | 'low'

function getLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 0.8) return 'high'
  if (confidence >= 0.5) return 'medium'
  return 'low'
}

const levelConfig: Record<
  ConfidenceLevel,
  {
    icon: typeof ShieldCheck
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
    className: string
    labelKey: string
  }
> = {
  high: {
    icon: ShieldCheck,
    variant: 'default',
    className: 'bg-emerald-500/15 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-800',
    labelKey: 'confidence.high',
  },
  medium: {
    icon: ShieldAlert,
    variant: 'outline',
    className: 'bg-amber-500/15 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-800',
    labelKey: 'confidence.medium',
  },
  low: {
    icon: ShieldQuestion,
    variant: 'destructive',
    className: 'bg-red-500/10 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-800',
    labelKey: 'confidence.low',
  },
}

export function ConfidenceIndicator({
  confidence,
}: ConfidenceIndicatorProps) {
  const { t } = useTranslation('chat')
  const level = getLevel(confidence)
  const config = levelConfig[level]
  const Icon = config.icon
  const pct = Math.round(confidence * 100)

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 text-[10px] font-medium transition-colors cursor-default',
        config.className
      )}
    >
      <Icon className="w-3 h-3" />
      <span>{t(config.labelKey)}</span>
      <span className="opacity-50">·</span>
      <span>{pct}%</span>
    </Badge>
  )
}

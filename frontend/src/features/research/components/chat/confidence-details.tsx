/**
 * ConfidenceDetails - 4-dimensional confidence score breakdown
 *
 * Shows overall + grounding/relevance/completeness scores with progress bars.
 * Collapsible panel that expands from the confidence badge.
 *
 * @module features/chat
 */

import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { ConfidenceScore } from '@/features/research/types'

interface ConfidenceDetailsProps {
  score: ConfidenceScore
}

interface DimensionConfig {
  key: keyof Omit<ConfidenceScore, 'overall'>
  labelKey: string
  fallbackLabel: string
  color: string
  bgColor: string
}

const dimensions: DimensionConfig[] = [
  {
    key: 'grounding',
    labelKey: 'confidenceDetails.grounding',
    fallbackLabel: 'Grounding',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-500/20',
  },
  {
    key: 'relevance',
    labelKey: 'confidenceDetails.relevance',
    fallbackLabel: 'Relevance',
    color: 'bg-purple-500',
    bgColor: 'bg-purple-500/20',
  },
  {
    key: 'completeness',
    labelKey: 'confidenceDetails.completeness',
    fallbackLabel: 'Completeness',
    color: 'bg-amber-500',
    bgColor: 'bg-amber-500/20',
  },
]

function getOverallColor(value: number): string {
  if (value >= 0.8) return 'text-emerald-600 dark:text-emerald-400'
  if (value >= 0.5) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

export function ConfidenceDetails({ score }: ConfidenceDetailsProps) {
  const { t } = useTranslation('chat')
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="inline-flex flex-col">
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className={cn('font-semibold', getOverallColor(score.overall))}>
          {Math.round(score.overall * 100)}%
        </span>
        <span className="opacity-60">
          {t('confidenceDetails.label', 'Confidence')}
        </span>
        {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>

      {/* Expanded breakdown */}
      {expanded && (
        <div className="mt-1.5 p-2 bg-muted/40 rounded-lg border border-border/50 space-y-1.5 min-w-40 animate-in fade-in slide-in-from-top-1 duration-150">
          {dimensions.map((dim) => {
            const value = score[dim.key]
            const pct = Math.round(value * 100)
            return (
              <div key={dim.key} className="space-y-0.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">
                    {t(dim.labelKey, dim.fallbackLabel)}
                  </span>
                  <span className="font-mono font-medium tabular-nums">
                    {pct}%
                  </span>
                </div>
                <div className={cn('h-1 rounded-full w-full', dim.bgColor)}>
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', dim.color)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

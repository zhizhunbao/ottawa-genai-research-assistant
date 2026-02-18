/**
 * EvaluationScoresDisplay - 6-dimension evaluation scores radar/bar visualization
 *
 * Shows coherence, relevancy, completeness, grounding, helpfulness, faithfulness
 * with a compact bar chart and optional alerts.
 *
 * @module features/chat
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { BarChart3, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import type { EvaluationScores, EvaluationDimension } from '@/features/research/types'

interface EvaluationScoresDisplayProps {
  evaluation: EvaluationScores
}

const dimensionColors: Record<EvaluationDimension, { bar: string; bg: string }> = {
  coherence:    { bar: 'bg-blue-500',    bg: 'bg-blue-500/20' },
  relevancy:    { bar: 'bg-purple-500',  bg: 'bg-purple-500/20' },
  completeness: { bar: 'bg-amber-500',   bg: 'bg-amber-500/20' },
  grounding:    { bar: 'bg-emerald-500', bg: 'bg-emerald-500/20' },
  helpfulness:  { bar: 'bg-pink-500',    bg: 'bg-pink-500/20' },
  faithfulness: { bar: 'bg-cyan-500',    bg: 'bg-cyan-500/20' },
}

function getScoreColor(score: number): string {
  if (score >= 4) return 'text-emerald-600 dark:text-emerald-400'
  if (score >= 3) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

export function EvaluationScoresDisplay({ evaluation }: EvaluationScoresDisplayProps) {
  const { t } = useTranslation('chat')
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="inline-flex flex-col">
      {/* Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <BarChart3 size={11} />
        <span className={cn('font-semibold', getScoreColor(evaluation.overall_score))}>
          {evaluation.overall_score.toFixed(1)}/5
        </span>
        <span className="opacity-60">
          {t('evaluation.label', 'Quality')}
        </span>
        {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div className="mt-1.5 p-2.5 bg-muted/40 rounded-lg border border-border/50 space-y-2 min-w-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Dimension bars */}
          <div className="space-y-1.5">
            {evaluation.scores.map((ds) => {
              const colors = dimensionColors[ds.dimension] ?? { bar: 'bg-gray-500', bg: 'bg-gray-500/20' }
              const pct = (ds.score / 5) * 100
              return (
                <div key={ds.dimension} className="space-y-0.5" title={ds.explanation}>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground capitalize">
                      {t(`evaluation.dimensions.${ds.dimension}`, ds.dimension)}
                    </span>
                    <span className={cn('font-mono font-medium tabular-nums', getScoreColor(ds.score))}>
                      {ds.score.toFixed(1)}
                    </span>
                  </div>
                  <div className={cn('h-1 rounded-full w-full', colors.bg)}>
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', colors.bar)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Alerts */}
          {evaluation.alerts.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-border/50">
              {evaluation.alerts.map((alert, i) => (
                <div key={i} className="flex items-start gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                  <AlertTriangle size={10} className="shrink-0 mt-0.5" />
                  <span>{alert}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

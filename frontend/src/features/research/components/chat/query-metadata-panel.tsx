/**
 * QueryMetadataPanel - Collapsible panel showing query processing details
 *
 * Displays LLM model, search method, embedding model, reranker, and latency.
 *
 * @module features/chat
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Info, ChevronDown, ChevronUp, Cpu, Search, Layers, Timer, Shuffle } from 'lucide-react'
import { Badge } from '@/shared/components/ui'
import type { QueryMetadata } from '@/features/research/types'

interface QueryMetadataPanelProps {
  metadata: QueryMetadata
}

const methodIcons: Record<string, typeof Search> = {
  hybrid: Shuffle,
  semantic: Layers,
  keyword: Search,
}

const methodColors: Record<string, string> = {
  hybrid: 'bg-violet-500/15 text-violet-600 border-violet-200 dark:text-violet-400 dark:border-violet-800',
  semantic: 'bg-blue-500/15 text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800',
  keyword: 'bg-emerald-500/15 text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800',
}

function formatLatency(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function QueryMetadataPanel({ metadata }: QueryMetadataPanelProps) {
  const { t } = useTranslation('chat')
  const [expanded, setExpanded] = useState(false)

  const MethodIcon = methodIcons[metadata.method] ?? Search

  return (
    <div className="inline-flex flex-col">
      {/* Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <Info size={11} />
        <span>{t('queryMetadata.label', 'Details')}</span>
        {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>

      {/* Panel */}
      {expanded && (
        <div className="mt-1.5 p-2.5 bg-muted/40 rounded-lg border border-border/50 space-y-2 min-w-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search method badge */}
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className={cn(
                'gap-1 text-[10px] font-medium',
                methodColors[metadata.method] ?? methodColors.hybrid
              )}
            >
              <MethodIcon className="w-3 h-3" />
              {metadata.method}
            </Badge>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[10px]">
            {/* LLM */}
            <span className="flex items-center gap-1 text-muted-foreground">
              <Cpu size={10} />
              {t('queryMetadata.llm', 'LLM')}
            </span>
            <span className="font-mono text-foreground truncate">{metadata.llm_model}</span>

            {/* Search Engine */}
            <span className="flex items-center gap-1 text-muted-foreground">
              <Search size={10} />
              {t('queryMetadata.search', 'Search')}
            </span>
            <span className="font-mono text-foreground truncate">{metadata.search_engine}</span>

            {/* Embedding */}
            <span className="flex items-center gap-1 text-muted-foreground">
              <Layers size={10} />
              {t('queryMetadata.embedding', 'Embedding')}
            </span>
            <span className="font-mono text-foreground truncate">{metadata.embedding_model}</span>

            {/* Reranker (optional) */}
            {metadata.reranker && (
              <>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Shuffle size={10} />
                  {t('queryMetadata.reranker', 'Reranker')}
                </span>
                <span className="font-mono text-foreground truncate">{metadata.reranker}</span>
              </>
            )}

            {/* Latency */}
            <span className="flex items-center gap-1 text-muted-foreground">
              <Timer size={10} />
              {t('queryMetadata.latency', 'Latency')}
            </span>
            <span className={cn(
              'font-mono font-medium',
              metadata.latency_ms < 2000 ? 'text-emerald-600 dark:text-emerald-400'
                : metadata.latency_ms < 5000 ? 'text-amber-600 dark:text-amber-400'
                : 'text-red-600 dark:text-red-400'
            )}>
              {formatLatency(metadata.latency_ms)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

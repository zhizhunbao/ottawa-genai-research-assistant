/**
 * CitationPopover - Full citation detail panel shown in a modal or expanded view
 *
 * Displays all citation chunks from a source document, with relevance scoring
 * and color-coded confidence indicators. Supports both inline popover and
 * modal expansion modes.
 *
 * @module features/chat/citation
 * @template .agent/templates/frontend/features/chat/citation/citation-popover.tsx.template
 * @reference rag-web-ui/frontend/src/components/chat/answer.tsx
 */

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Badge } from '@/shared/components/ui/badge'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Separator } from '@/shared/components/ui/separator'
import { FileText } from 'lucide-react'
import type { Citation, CitationSource } from './types'

// ============================================================
// Confidence Utilities
// ============================================================

/**
 * Calculate display percentage from distance/confidence score.
 */
function calculatePercentage(confidence: number): number {
  if (typeof confidence !== 'number') return 0
  if (confidence < 0) return 0
  if (confidence > 1) return 100
  return Math.round(confidence * 10000) / 100
}

/**
 * Get relevance color class based on confidence percentage.
 */
function getRelevanceColor(percentage: number): string {
  if (percentage >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
  if (percentage >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
  if (percentage >= 40) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
  return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
}

// ============================================================
// Source List Component
// ============================================================

interface CitationSourceListProps {
  /** Grouped citation sources */
  sources: CitationSource[]
  /** Callback when a source is clicked */
  onSourceClick?: (source: CitationSource) => void
}

/**
 * Collapsible list of citation sources shown below AI response.
 */
export const CitationSourceList: React.FC<CitationSourceListProps> = ({
  sources,
  onSourceClick,
}) => {
  const [expanded, setExpanded] = React.useState(false)

  if (sources.length === 0) return null

  return (
    <div className="py-1 w-full mt-4">
      {/* Toggle button */}
      <button
        className="text-xs font-medium text-muted-foreground px-3 py-1.5 rounded-full hover:bg-muted/60 transition-colors flex items-center gap-1.5 border border-border/50"
        onClick={() => setExpanded(!expanded)}
      >
        <FileText className="h-3 w-3" />
        <span>
          {sources.length === 1
            ? '1 Source'
            : `${sources.length} Sources`}
        </span>
        <span className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {/* Expandable source list */}
      {expanded && (
        <div className="mt-2 space-y-1 pl-1 animate-in slide-in-from-top-1 fade-in duration-200">
          {sources.map((source, idx) => (
            <button
              key={source.id}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-left py-1.5 px-3 rounded-lg hover:bg-muted/40 border border-transparent hover:border-border/50"
              onClick={() => onSourceClick?.(source)}
            >
              <span className="font-medium bg-muted px-1.5 py-0.5 rounded text-[10px] shrink-0">
                {idx + 1}
              </span>
              <span className="truncate flex-1">{source.name}</span>
              {source.avgConfidence != null && (
                <Badge
                  variant="outline"
                  className={`text-[9px] px-1 py-0 shrink-0 ${getRelevanceColor(calculatePercentage(source.avgConfidence))}`}
                >
                  {Math.round(source.avgConfidence * 100)}%
                </Badge>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Citation Detail Modal
// ============================================================

interface CitationDetailModalProps {
  /** Whether the modal is open */
  open: boolean
  /** Close handler */
  onOpenChange: (open: boolean) => void
  /** The source to display details for */
  source: CitationSource | null
}

/**
 * Full citation detail modal showing all chunks from a source document.
 */
export const CitationDetailModal: React.FC<CitationDetailModalProps> = ({
  open,
  onOpenChange,
  source,
}) => {
  if (!source) return null

  // Sort citations by confidence (highest first)
  const sortedCitations = [...source.citations].sort(
    (a, b) => (b.metadata.confidence ?? 0) - (a.metadata.confidence ?? 0)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b bg-card">
          <DialogTitle className="flex items-center gap-3 text-base font-semibold">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <FileText className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="truncate max-w-[400px]">{source.name}</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                {source.citations.length} extracted reference{source.citations.length > 1 ? 's' : ''}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-6 py-4">
          <div className="space-y-6">
            {sortedCitations.map((citation, idx) => {
              const percentage = calculatePercentage(citation.metadata.confidence ?? 0)

              return (
                <div key={citation.id} className="space-y-3">
                  {/* Chunk header */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground uppercase tracking-wider text-[10px]">Reference {idx + 1}</span>

                    {citation.metadata.page_num != null && (
                      <span className="px-2 py-0.5 rounded bg-muted">Page {citation.metadata.page_num + 1}</span>
                    )}

                    {citation.metadata.section_title && (
                      <span className="truncate max-w-[200px]">§ {citation.metadata.section_title}</span>
                    )}

                    {citation.metadata.confidence != null && (
                      <Badge
                        variant="outline"
                        className={`text-[10px] ml-auto font-medium ${getRelevanceColor(percentage)}`}
                      >
                        {percentage.toFixed(1)}% Relevance
                      </Badge>
                    )}
                  </div>

                  {/* Chunk text */}
                  <div className="relative group">
                    <div className="absolute -left-3 top-0 bottom-0 w-1 bg-primary/20 rounded-full group-hover:bg-primary/40 transition-colors" />
                    <pre className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed bg-muted/20 p-4 rounded-xl font-sans border border-border/10">
                      {citation.text.trim().replace(/\n\n+/g, '\n\n')}
                    </pre>
                  </div>

                  {/* Metadata debug (collapsible) */}
                  {Object.keys(citation.metadata).length > 3 && (
                    <details className="text-[10px] text-muted-foreground">
                      <summary className="cursor-pointer hover:text-foreground transition-colors py-1">
                        View raw metadata
                      </summary>
                      <div className="mt-2 p-3 bg-muted/30 rounded-lg space-y-1 font-mono border border-border/20">
                        {Object.entries(citation.metadata)
                          .filter(([key]) => !['source_file', 'page_num', 'section_title', 'confidence'].includes(key))
                          .map(([key, value]) => (
                            <div key={key} className="flex gap-2">
                              <span className="font-bold min-w-[120px] opacity-70">{key}:</span>
                              <span className="truncate">{String(value)}</span>
                            </div>
                          ))}
                      </div>
                    </details>
                  )}

                  {idx < sortedCitations.length - 1 && <Separator className="opacity-50" />}
                </div>
              )
            })}
          </div>
        </ScrollArea>
        
        <div className="px-6 py-4 bg-muted/30 border-t flex justify-end">
            <button 
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
                Close
            </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// Utility: Group citations by source
// ============================================================

/**
 * Group flat citation array into CitationSource groups.
 */
export function groupCitationsBySource(citations: Citation[]): CitationSource[] {
  const sourceMap = new Map<string, CitationSource>()

  for (const citation of citations) {
    const id =
      citation.metadata.kb_id && citation.metadata.document_id
        ? `${citation.metadata.kb_id}-${citation.metadata.document_id}`
        : citation.metadata.source_file || `unknown-${citation.id}`

    const existing = sourceMap.get(id)

    if (existing) {
      existing.citations.push(citation)
    } else {
      sourceMap.set(id, {
        id,
        name: citation.metadata.source_file || `Source ${citation.id}`,
        fileName: citation.metadata.source_file || '',
        citations: [citation],
      })
    }
  }

  // Calculate average confidence per source
  for (const source of sourceMap.values()) {
    const confidences = source.citations
      .map((c) => c.metadata.confidence)
      .filter((c): c is number => c != null)

    if (confidences.length > 0) {
      source.avgConfidence =
        confidences.reduce((sum, c) => sum + c, 0) / confidences.length
    }
  }

  return Array.from(sourceMap.values())
}

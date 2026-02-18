/**
 * CitationLink - Inline citation reference rendered as a clickable badge with Popover
 *
 * Pattern: Markdown renders [1] as <a href="1"> → CitationLink intercepts → shows Popover
 * When citation data is available, displays source file + text preview in a popover.
 * When not available, renders as plain text [N].
 *
 * @module features/chat/citation
 * @template .agent/templates/frontend/features/chat/citation/citation-link.tsx.template
 * @reference rag-web-ui/frontend/src/components/chat/answer.tsx
 */

import { AnchorHTMLAttributes, ClassAttributes } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover'
import { Badge } from '@/shared/components/ui/badge'
import { FileText, PanelRight } from 'lucide-react'
import type { Citation, CitationInfo } from './types'
import { usePreviewStore } from '@/stores/research-store'
import type { Source } from '@/features/research/types'

/**
 * Create a memoized CitationLink component for use as react-markdown's `a` override.
 *
 * Usage with react-markdown:
 * ```tsx
 * const CitationLink = createCitationLink(citations, citationInfoMap)
 * <Markdown components={{ a: CitationLink }}>{content}</Markdown>
 * ```
 */
export function createCitationLink(
  citations: Citation[],
  citationInfoMap: Record<string, CitationInfo>
) {
  // eslint-disable-next-line react/display-name
  return function (
    props: ClassAttributes<HTMLAnchorElement> &
      AnchorHTMLAttributes<HTMLAnchorElement>
  ) {
    // Extract citation ID from href — markdown [1](1) renders as <a href="1">
    const citationIdStr = props.href?.match(/^(\d+)$/)?.[1]
    const citationId = citationIdStr ? parseInt(citationIdStr) : null
    const citation = citationId
      ? citations.find(c => c.id === citationId)
      : null

    // Not a citation link — render as normal anchor
    if (!citation) {
      return (
        <a
          {...props}
          className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        />
      )
    }

    // Build source key for info lookup
    const sourceKey = citation.metadata.kb_id && citation.metadata.document_id
      ? `${citation.metadata.kb_id}-${citation.metadata.document_id}`
      : citation.metadata.source_file || `source-${citationId}`

    const info = citationInfoMap[sourceKey]

    // Determine confidence color
    const confidence = citation.metadata.confidence ?? 1.0
    const confidenceColor = confidence >= 0.8
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : confidence >= 0.5
        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'

    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 mx-0.5 text-[10px] font-bold text-primary bg-primary/10 rounded-md hover:bg-primary/20 transition-all cursor-pointer align-baseline border border-primary/20 hover:scale-110 active:scale-95"
            aria-label={`Citation ${citationId}`}
          >
            {citationId}
          </button>
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="start"
          className="max-w-md w-[calc(100vw-2rem)] p-0 rounded-xl shadow-2xl border-none overflow-hidden animate-in zoom-in-95 fade-in duration-200"
        >
          <div className="flex flex-col">
            {/* Source header */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-card/80 backdrop-blur-sm border-b border-border/10">
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <span className="text-xs font-semibold truncate flex-1">
                {info
                  ? `${info.knowledgeBaseName} / ${info.documentFileName}`
                  : citation.metadata.source_file || `Source Reference`}
              </span>
              {citation.metadata.page_num != null && (
                <Badge variant="outline" className="text-[10px] font-medium px-1.5 py-0">
                  p.{citation.metadata.page_num + 1}
                </Badge>
              )}
            </div>

            {/* Citation text */}
            <div className="px-4 py-3 bg-background">
              <p className="text-sm text-foreground/80 leading-relaxed italic line-clamp-6">
                "{citation.text.trim()}"
              </p>
            </div>

            {/* Confidence + metadata footer + Open in panel */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-border/10 bg-muted/20">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter ${confidenceColor}`}>
                  {Math.round(confidence * 100)}% Match
                </span>
                {citation.metadata.section_title && (
                    <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                      § {citation.metadata.section_title}
                    </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const source: Source = {
                      documentId: String(citation.metadata.document_id || ''),
                      documentTitle: citation.metadata.source_file || `Source ${citationId}`,
                      pageNumber: (citation.metadata.page_num != null ? citation.metadata.page_num + 1 : 0),
                      section: citation.metadata.section_title || '',
                      excerpt: citation.text,
                      relevanceScore: citation.metadata.confidence ?? 0,
                    }
                    usePreviewStore.getState().openPreview(source)
                  }}
                  className="flex items-center gap-1 text-[9px] text-primary hover:text-primary/80 font-medium transition-colors"
                  title="Open in side panel"
                >
                  <PanelRight className="h-3 w-3" />
                  <span>Panel</span>
                </button>
                <span className="text-[9px] text-muted-foreground font-medium opacity-50 uppercase">Ref {citationId}</span>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }
}

export default createCitationLink

/**
 * useCitation - Hook for managing citation data and grouping
 *
 * @module features/chat/citation
 * @template .agent/templates/frontend/features/chat/citation/use-citation.ts.template
 * @reference rag-web-ui/frontend/src/components/chat/answer.tsx
 */

import { useMemo } from 'react'
import type { Source } from '@/features/research/types'
import type { Citation } from './types'
import { groupCitationsBySource } from './citation-popover'

/**
 * Convert backend Source objects to frontend Citation format.
 */
export function mapSourcesToCitations(sources: Source[]): Citation[] {
  return sources.map((s, idx) => ({
    id: idx + 1,
    text: s.excerpt,
    metadata: {
      source_file: s.documentTitle,
      page_num: s.pageNumber > 0 ? s.pageNumber - 1 : undefined, // Backend uses 1-based or 0-based? Let's assume 1-based for display.
      document_id: s.documentId,
      section_title: s.section,
      confidence: s.relevanceScore,
    },
  }))
}

export function useCitation(sources: Source[] = []) {
  // Convert sources to citations
  const citations = useMemo(
    () => mapSourcesToCitations(sources),
    [sources]
  )

  // Group citations by source for the summary list
  const citationSources = useMemo(
    () => groupCitationsBySource(citations),
    [citations]
  )

  return {
    citations,
    citationSources,
  }
}

export default useCitation

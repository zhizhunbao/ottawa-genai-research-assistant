/**
 * MessageMarkdown - Enhanced react-markdown renderer with citation support
 *
 * Renders AI response markdown with:
 * - Inline citation links [1] → Popover with source details
 * - Code block syntax highlighting with copy button
 * - GFM (tables, strikethrough, task lists)
 *
 * @module features/chat/citation
 * @template .agent/templates/frontend/features/chat/citation/message-markdown.tsx.template
 * @reference rag-web-ui/frontend/src/components/chat/answer.tsx
 */

import React, { useMemo, useCallback, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Copy, Check } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { createCitationLink } from './citation-link'
import {
  CitationSourceList,
  CitationDetailModal,
  groupCitationsBySource,
} from './citation-popover'
import type { CitationSource, MessageMarkdownProps } from './types'

// CSS for highlight.js themes should be imported in App.tsx or similar
// import 'highlight.js/styles/github-dark.css'

// ============================================================
// Citation Format Normalizer
// ============================================================

/**
 * Normalize various citation formats in markdown to standard [citation](N) link format.
 */
function normalizeCitationMarkers(text: string): string {
  if (!text) return ''
  return text
    .replace(/\[\[([cC])itation:?\s*(\d+)\]\]/g, '[citation]($2)')
    .replace(/\[([cC])itation:?\s*(\d+)\]/g, '[citation]($2)')
    .replace(/\[(\d+)\]/g, '[citation]($1)')
}

/**
 * Process think blocks from DeepSeek-style models.
 */
function processThinkBlocks(text: string): string {
  if (!text) return ''
  return text
    .replace(/<think>/g, '\n<details className="think-block">\n<summary>💭 Thinking...</summary>\n\n')
    .replace(/<\/think>/g, '\n</details>\n')
}

// ============================================================
// Code Block Component
// ============================================================

interface CodeBlockProps {
  children?: React.ReactNode
  className?: string
  node?: unknown
  [key: string]: unknown
}

/** Code block with copy button and language label */
function CodeBlock({ children, className, ...rest }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const match = /language-(\w+)/.exec(className || '')
  const language = match ? match[1] : ''
  const isInline = !match

  // Handle copy
  const handleCopy = useCallback(() => {
    const text = String(children).replace(/\n$/, '')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [children])

  // Inline code
  if (isInline) {
    return (
      <code
        className="px-1.5 py-0.5 rounded-md bg-muted text-sm font-mono font-medium"
        {...rest}
      >
        {children}
      </code>
    )
  }

  // Block code with header
  return (
    <div className="relative group rounded-xl overflow-hidden my-6 border border-border/50 bg-card shadow-sm">
      {/* Language label + copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 text-[10px] uppercase tracking-widest font-bold text-muted-foreground border-b border-border/50">
        <span className="font-mono">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-foreground transition-all active:scale-95"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-green-500" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed scrollbar-thin scrollbar-thumb-muted">
        <code className={className} {...rest}>
          {children}
        </code>
      </pre>
    </div>
  )
}

// ============================================================
// Main Component
// ============================================================

/**
 * Enhanced markdown renderer with citation support.
 */
export const MessageMarkdown: React.FC<MessageMarkdownProps> = ({
  content,
  citations = [],
  className = '',
}) => {
  // Process markdown: normalize citations + handle think blocks
  const processedContent = useMemo(() => {
    let processed = normalizeCitationMarkers(content)
    processed = processThinkBlocks(processed)
    return processed
  }, [content])

  // Placeholder for citation info map (could be extended later)
  const citationInfoMap = useMemo(() => ({}), [])

  // Create citation link component bound to current citations
  const CitationLinkComponent = useMemo(
    () => createCitationLink(citations, citationInfoMap),
    [citations, citationInfoMap]
  )

  // Group citations by source for the source list
  const citationSources = useMemo(
    () => groupCitationsBySource(citations),
    [citations]
  )

  // Modal state
  const [selectedSource, setSelectedSource] = useState<CitationSource | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleSourceClick = useCallback((source: CitationSource) => {
    setSelectedSource(source)
    setModalOpen(true)
  }, [])

  // Loading skeleton
  if (!content) {
    return (
      <div className="flex flex-col gap-3 py-2">
        <Skeleton className="max-w-[80%] h-4 rounded-full" />
        <Skeleton className="max-w-[60%] h-4 rounded-full" />
        <Skeleton className="max-w-[70%] h-4 rounded-full" />
        <Skeleton className="max-w-[50%] h-4 rounded-full" />
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Markdown content */}
      <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-a:no-underline prose-pre:p-0 prose-pre:bg-transparent">
        <Markdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            a: CitationLinkComponent as any,
            code: CodeBlock as any,
          }}
        >
          {processedContent}
        </Markdown>
      </div>

      {/* Citation source list (expandable) */}
      {citationSources.length > 0 && (
        <CitationSourceList
          sources={citationSources}
          onSourceClick={handleSourceClick}
        />
      )}

      {/* Citation detail modal */}
      <CitationDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        source={selectedSource}
      />
    </div>
  )
}

export default MessageMarkdown

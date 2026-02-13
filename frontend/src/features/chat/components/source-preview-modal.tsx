/**
 * SourcePreviewModal - Modal overlay for viewing citation source details
 *
 * @module features/chat
 * @template none
 * @reference none
 */

import { useTranslation } from 'react-i18next'
import { FileText, ExternalLink, X } from 'lucide-react'
import type { Source } from '@/features/research/types'
import { cn } from '@/lib/utils'
import { Button, Badge } from '@/shared/components/ui'

interface SourcePreviewModalProps {
  /** Currently selected source, null to hide. */
  source: Source | null
  /** Source index (1-based). */
  index?: number
  /** Close callback. */
  onClose: () => void
}

export function SourcePreviewModal({
  source,
  index,
  onClose,
}: SourcePreviewModalProps) {
  const { t } = useTranslation('chat')

  if (!source) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          'fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'w-[90vw] max-w-lg max-h-[80vh]',
          'bg-card rounded-2xl shadow-xl border',
          'flex flex-col',
          'animate-in fade-in zoom-in-95 slide-in-from-bottom-2'
        )}
        role="dialog"
        aria-modal="true"
        aria-label={t('sources.preview')}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground truncate max-w-[300px]">
              {index !== undefined && (
                <Badge variant="secondary" className="mr-2 text-[10px]">
                  [{index}]
                </Badge>
              )}
              {source.documentTitle}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 px-5 py-3 bg-muted/30 text-xs text-muted-foreground">
          <span>
            {t('sources.page')}: <strong>{source.pageNumber}</strong>
          </span>
          {source.section && (
            <>
              <span className="opacity-30">|</span>
              <span>
                {t('sources.section')}: <strong>{source.section}</strong>
              </span>
            </>
          )}
          {source.relevanceScore !== undefined && (
            <>
              <span className="opacity-30">|</span>
              <span>
                {t('sources.relevance')}:{' '}
                <strong>{Math.round(source.relevanceScore * 100)}%</strong>
              </span>
            </>
          )}
        </div>

        {/* Excerpt */}
        <div className="flex-1 overflow-auto px-5 py-4">
          <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2">
            {t('sources.excerpt')}
          </p>
          <blockquote className="text-sm leading-relaxed text-foreground/90 border-l-2 border-primary/30 pl-4 italic whitespace-pre-wrap">
            {source.excerpt || t('sources.noExcerpt')}
          </blockquote>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('actions.close')}
          </Button>
          {source.documentId && (
            <Button size="sm" className="gap-1.5" asChild>
              <a
                href={`/documents/${source.documentId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {t('sources.viewDocument')}
              </a>
            </Button>
          )}
        </div>
      </div>
    </>
  )
}

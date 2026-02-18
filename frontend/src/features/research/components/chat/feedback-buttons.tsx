/**
 * FeedbackButtons - Thumbs up/down feedback component for AI responses
 *
 * Allows users to rate AI responses and optionally provide detailed feedback.
 *
 * @module features/chat
 */

import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ThumbsUp, ThumbsDown, MessageSquare, X, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/shared/components/ui'

interface FeedbackButtonsProps {
  /** Unique message/response ID */
  responseId: string
  /** Callback when feedback is submitted */
  onSubmit?: (feedback: FeedbackData) => void
}

export interface FeedbackData {
  response_id: string
  rating: -1 | 0 | 1
  categories: string[]
  comment?: string
}

const FEEDBACK_CATEGORIES = [
  { key: 'inaccurate', labelKey: 'feedback.categories.inaccurate', fallback: 'Inaccurate' },
  { key: 'incomplete', labelKey: 'feedback.categories.incomplete', fallback: 'Incomplete' },
  { key: 'irrelevant', labelKey: 'feedback.categories.irrelevant', fallback: 'Irrelevant' },
  { key: 'outdated', labelKey: 'feedback.categories.outdated', fallback: 'Outdated' },
  { key: 'hard_to_understand', labelKey: 'feedback.categories.hardToUnderstand', fallback: 'Hard to understand' },
  { key: 'missing_citations', labelKey: 'feedback.categories.missingCitations', fallback: 'Missing citations' },
] as const

export function FeedbackButtons({ responseId, onSubmit }: FeedbackButtonsProps) {
  const { t } = useTranslation('chat')
  const [rating, setRating] = useState<-1 | 0 | 1 | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleRate = useCallback((newRating: -1 | 1) => {
    setRating(newRating)
    if (newRating === 1) {
      // Thumbs up — submit immediately
      onSubmit?.({
        response_id: responseId,
        rating: 1,
        categories: [],
      })
      setSubmitted(true)
    } else {
      // Thumbs down — show detail form
      setShowForm(true)
    }
  }, [responseId, onSubmit])

  const toggleCategory = useCallback((key: string) => {
    setCategories(prev =>
      prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
    )
  }, [])

  const handleSubmitDetailed = useCallback(() => {
    onSubmit?.({
      response_id: responseId,
      rating: rating ?? -1,
      categories,
      comment: comment.trim() || undefined,
    })
    setShowForm(false)
    setSubmitted(true)
  }, [responseId, rating, categories, comment, onSubmit])

  if (submitted) {
    return (
      <span className="text-[10px] text-muted-foreground/70 italic">
        {t('feedback.thanks', 'Thanks for your feedback')}
      </span>
    )
  }

  return (
    <div className="inline-flex flex-col">
      {/* Thumbs buttons */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => handleRate(1)}
          className={cn(
            'p-1 rounded-md transition-colors',
            rating === 1
              ? 'text-emerald-600 bg-emerald-500/15'
              : 'text-muted-foreground/50 hover:text-emerald-600 hover:bg-emerald-500/10'
          )}
          title={t('feedback.thumbsUp', 'Helpful')}
        >
          <ThumbsUp size={12} />
        </button>
        <button
          onClick={() => handleRate(-1)}
          className={cn(
            'p-1 rounded-md transition-colors',
            rating === -1
              ? 'text-red-600 bg-red-500/15'
              : 'text-muted-foreground/50 hover:text-red-600 hover:bg-red-500/10'
          )}
          title={t('feedback.thumbsDown', 'Not helpful')}
        >
          <ThumbsDown size={12} />
        </button>
      </div>

      {/* Detailed feedback form (for thumbs down) */}
      {showForm && (
        <div className="mt-1.5 p-2.5 bg-muted/40 rounded-lg border border-border/50 space-y-2 max-w-xs animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-foreground">
              {t('feedback.whatsWrong', "What went wrong?")}
            </span>
            <button
              onClick={() => { setShowForm(false); setRating(null) }}
              className="p-0.5 rounded text-muted-foreground hover:text-foreground"
            >
              <X size={12} />
            </button>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-1">
            {FEEDBACK_CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => toggleCategory(cat.key)}
                className="transition-colors"
              >
                <Badge
                  variant={categories.includes(cat.key) ? 'default' : 'outline'}
                  className="text-[10px] cursor-pointer"
                >
                  {t(cat.labelKey, cat.fallback)}
                </Badge>
              </button>
            ))}
          </div>

          {/* Comment */}
          <div className="flex items-start gap-1.5">
            <MessageSquare size={12} className="mt-1.5 text-muted-foreground shrink-0" />
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder={t('feedback.commentPlaceholder', 'Additional details (optional)...')}
              className="flex-1 bg-transparent border border-border/50 rounded-md px-2 py-1 text-[11px] resize-none focus:outline-none focus:ring-1 focus:ring-primary/30 min-h-10"
              rows={2}
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmitDetailed}
            className="w-full flex items-center justify-center gap-1 px-2 py-1 text-[11px] font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Send size={10} />
            {t('feedback.submit', 'Submit')}
          </button>
        </div>
      )}
    </div>
  )
}

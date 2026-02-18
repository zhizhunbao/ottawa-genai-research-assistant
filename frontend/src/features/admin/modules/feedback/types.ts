/**
 * Feedback Module Types
 *
 * Type definitions for admin feedback management,
 * aligned with backend FeedbackResponse / FeedbackStats schemas.
 *
 * @module features/admin/modules/feedback
 */

/** Rating value: -1 (thumbs down), 0 (neutral), 1 (thumbs up) */
export type FeedbackRating = -1 | 0 | 1

/** Categories that describe why feedback was negative */
export type FeedbackCategory =
  | 'inaccurate'
  | 'incomplete'
  | 'irrelevant'
  | 'outdated'
  | 'missing_citations'
  | 'helpful'
  | 'other'

/** A single feedback entry from the API */
export interface FeedbackItem {
  id: string
  response_id: string
  user_id: string | null
  rating: FeedbackRating
  categories: FeedbackCategory[]
  comment: string | null
  created_at: string
}

/** Category count pair used in top-categories list */
export interface CategoryCount {
  category: string
  count: number
}

/** Aggregate feedback statistics */
export interface FeedbackStats {
  total: number
  thumbs_up: number
  thumbs_down: number
  neutral: number
  top_categories: CategoryCount[]
  avg_rating: number
}

/** Request body for creating feedback */
export interface FeedbackCreate {
  response_id: string
  rating: FeedbackRating
  categories?: FeedbackCategory[]
  comment?: string
}

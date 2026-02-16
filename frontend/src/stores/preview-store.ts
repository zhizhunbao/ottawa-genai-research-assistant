/**
 * usePreviewStore - Global state for the right-side file preview drawer
 *
 * Any component (CitationLink, MessageItem source list, etc.) can call
 * `openPreview(source)` to slide out the drawer with source details.
 *
 * @module stores
 * @template none
 * @reference none
 */
import { create } from 'zustand'
import type { Source } from '@/features/research/types'

interface PreviewState {
  /** Whether the drawer is currently open */
  isOpen: boolean
  /** The source being previewed */
  source: Source | null
  /** Optional: which page to highlight (1-based) */
  highlightPage: number | null
  /** Optional: text excerpt to highlight in preview */
  highlightExcerpt: string | null
}

interface PreviewStore extends PreviewState {
  /** Open the drawer with a specific source */
  openPreview: (source: Source, highlightPage?: number, highlightExcerpt?: string) => void
  /** Close the drawer */
  closePreview: () => void
  /** Toggle drawer open/close */
  togglePreview: () => void
}

const initialState: PreviewState = {
  isOpen: false,
  source: null,
  highlightPage: null,
  highlightExcerpt: null,
}

export const usePreviewStore = create<PreviewStore>()((set) => ({
  ...initialState,

  openPreview: (source, highlightPage, highlightExcerpt) =>
    set({
      isOpen: true,
      source,
      highlightPage: highlightPage ?? source.pageNumber ?? null,
      highlightExcerpt: highlightExcerpt ?? source.excerpt ?? null,
    }),

  closePreview: () =>
    set({ isOpen: false }),

  togglePreview: () =>
    set((state) => ({ isOpen: !state.isOpen })),
}))

// Selectors
export const selectPreviewOpen = (state: PreviewStore) => state.isOpen
export const selectPreviewSource = (state: PreviewStore) => state.source

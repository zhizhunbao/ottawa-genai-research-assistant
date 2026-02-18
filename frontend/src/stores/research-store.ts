/**
 * useResearchStore - Unified Zustand store for the Research module
 *
 * Merges three previously separate stores:
 * - ChatStore (sessions, messages, interaction state)
 * - DocumentStore (explorer selection, view options, sync drawer)
 * - PreviewStore (source preview drawer)
 *
 * @module stores
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ChatSession, ChatMessage, MessageRole, Source } from '@/features/research/types'

// ============================================================================
// Types
// ============================================================================

type NodeType = 'folder' | 'file' | null
type ViewMode = 'list' | 'grid'
type SortBy = 'name' | 'date' | 'status'
type SortOrder = 'asc' | 'desc'

/** Content panel mode for the unified research view */
export type ContentMode = 'chat' | 'folder' | 'file-preview' | 'sync' | 'empty'

// ---- Chat slice ----
interface ChatSlice {
  sessions: ChatSession[]
  currentSessionId: string | null
  isLoading: boolean
  error: string | null
}

// ---- Document / Explorer slice ----
interface DocumentSlice {
  selectedNodeId: string | null
  selectedNodeType: NodeType
  selectedNodeName: string | null
  viewMode: ViewMode
  sortBy: SortBy
  sortOrder: SortOrder
  syncDrawerOpen: boolean
  explorerOpen: boolean
}

// ---- Preview slice ----
interface PreviewSlice {
  previewOpen: boolean
  previewSource: Source | null
  highlightPage: number | null
  highlightExcerpt: string | null
}

// ---- Combined state ----
interface ResearchState extends ChatSlice, DocumentSlice, PreviewSlice {
  /** Which content panel is currently shown */
  contentMode: ContentMode
}

// ---- Actions ----
interface ResearchActions {
  // Content mode
  setContentMode: (mode: ContentMode) => void

  // -- Chat actions --
  createSession: (title?: string) => string
  setCurrentSession: (sessionId: string | null) => void
  deleteSession: (sessionId: string) => void
  updateSessionTitle: (sessionId: string, title: string) => void
  addMessage: (sessionId: string, role: MessageRole, content: string) => string
  updateMessage: (sessionId: string, messageId: string, updates: Partial<ChatMessage>) => void
  deleteMessage: (sessionId: string, messageId: string) => void
  setMessageLoading: (sessionId: string, messageId: string, isLoading: boolean) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  getCurrentSession: () => ChatSession | null
  getSessionMessages: (sessionId: string) => ChatMessage[]

  // -- Document / Explorer actions --
  selectNode: (id: string, type: 'folder' | 'file', name?: string) => void
  clearSelection: () => void
  setViewMode: (mode: ViewMode) => void
  setSorting: (by: SortBy, order?: SortOrder) => void
  toggleSortOrder: () => void
  openSyncDrawer: () => void
  closeSyncDrawer: () => void
  toggleExplorer: () => void
  setExplorerOpen: (open: boolean) => void

  // -- Preview actions --
  openPreview: (source: Source, highlightPage?: number, highlightExcerpt?: string) => void
  closePreview: () => void
  togglePreview: () => void
}

export interface ResearchStore extends ResearchState, ResearchActions {}

// ============================================================================
// Helpers
// ============================================================================

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`

// ============================================================================
// Initial State
// ============================================================================

const initialState: ResearchState = {
  // Content mode
  contentMode: 'chat',

  // Chat
  sessions: [],
  currentSessionId: null,
  isLoading: false,
  error: null,

  // Document / Explorer
  selectedNodeId: null,
  selectedNodeType: null,
  selectedNodeName: null,
  viewMode: 'list',
  sortBy: 'name',
  sortOrder: 'asc',
  syncDrawerOpen: false,
  explorerOpen: true,

  // Preview
  previewOpen: false,
  previewSource: null,
  highlightPage: null,
  highlightExcerpt: null,
}

// ============================================================================
// Store
// ============================================================================

export const useResearchStore = create<ResearchStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ---- Content mode ----
      setContentMode: (mode) => set({ contentMode: mode }),

      // ================================================================
      // Chat actions (ported from chat-store.ts)
      // ================================================================

      createSession: (title) => {
        const id = generateId()
        const now = new Date().toISOString()
        const newSession: ChatSession = {
          id,
          title: title || `新会话 ${get().sessions.length + 1}`,
          messages: [],
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: id,
          contentMode: 'chat',
        }))
        return id
      },

      setCurrentSession: (sessionId) =>
        set({ currentSessionId: sessionId, contentMode: 'chat' }),

      deleteSession: (sessionId) =>
        set((state) => {
          const newSessions = state.sessions.filter((s) => s.id !== sessionId)
          return {
            sessions: newSessions,
            currentSessionId:
              state.currentSessionId === sessionId
                ? newSessions[0]?.id ?? null
                : state.currentSessionId,
          }
        }),

      updateSessionTitle: (sessionId, title) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, title, updatedAt: new Date().toISOString() }
              : s
          ),
        })),

      addMessage: (sessionId, role, content) => {
        const messageId = generateId()
        const now = new Date().toISOString()
        const newMessage: ChatMessage = {
          id: messageId,
          role,
          content,
          timestamp: now,
          isLoading: role === 'assistant',
        }
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                ...s,
                messages: [...s.messages, newMessage],
                updatedAt: now,
              }
              : s
          ),
        }))
        return messageId
      },

      updateMessage: (sessionId, messageId, updates) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === messageId ? { ...m, ...updates } : m
                ),
                updatedAt: new Date().toISOString(),
              }
              : s
          ),
        })),

      deleteMessage: (sessionId, messageId) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                ...s,
                messages: s.messages.filter((m) => m.id !== messageId),
                updatedAt: new Date().toISOString(),
              }
              : s
          ),
        })),

      setMessageLoading: (sessionId, messageId, isLoading) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === messageId ? { ...m, isLoading } : m
                ),
              }
              : s
          ),
        })),

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      getCurrentSession: () => {
        const { sessions, currentSessionId } = get()
        return sessions.find((s) => s.id === currentSessionId) ?? null
      },

      getSessionMessages: (sessionId) => {
        const session = get().sessions.find((s) => s.id === sessionId)
        return session?.messages ?? []
      },

      // ================================================================
      // Document / Explorer actions (ported from document-store.ts)
      // ================================================================

      selectNode: (id, type, name) =>
        set({
          selectedNodeId: id,
          selectedNodeType: type,
          selectedNodeName: name ?? null,
        }),

      clearSelection: () =>
        set({
          selectedNodeId: null,
          selectedNodeType: null,
          selectedNodeName: null,
        }),

      setViewMode: (mode) => set({ viewMode: mode }),

      setSorting: (by, order) =>
        set({
          sortBy: by,
          sortOrder: order ?? get().sortOrder,
        }),

      toggleSortOrder: () =>
        set((state) => ({
          sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc',
        })),

      openSyncDrawer: () => set({ syncDrawerOpen: true }),
      closeSyncDrawer: () => set({ syncDrawerOpen: false }),

      toggleExplorer: () =>
        set((state) => ({ explorerOpen: !state.explorerOpen })),

      setExplorerOpen: (open) => set({ explorerOpen: open }),

      // ================================================================
      // Preview actions (ported from preview-store.ts)
      // ================================================================

      openPreview: (source, highlightPage, highlightExcerpt) =>
        set({
          previewOpen: true,
          previewSource: source,
          highlightPage: highlightPage ?? source.pageNumber ?? null,
          highlightExcerpt: highlightExcerpt ?? source.excerpt ?? null,
        }),

      closePreview: () =>
        set({ previewOpen: false }),

      togglePreview: () =>
        set((state) => ({ previewOpen: !state.previewOpen })),
    }),
    {
      name: 'research-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
        explorerOpen: state.explorerOpen,
        contentMode: state.contentMode,
      }),
    }
  )
)

// ============================================================================
// Selectors
// ============================================================================

// Chat selectors
export const selectSessions = (state: ResearchStore) => state.sessions
export const selectCurrentSessionId = (state: ResearchStore) => state.currentSessionId
export const selectChatLoading = (state: ResearchStore) => state.isLoading
export const selectChatError = (state: ResearchStore) => state.error

// Document / Explorer selectors
export const selectSelectedNode = (state: ResearchStore) => ({
  id: state.selectedNodeId,
  type: state.selectedNodeType,
  name: state.selectedNodeName,
})
export const selectViewMode = (state: ResearchStore) => state.viewMode
export const selectSorting = (state: ResearchStore) => ({
  by: state.sortBy,
  order: state.sortOrder,
})
export const selectSyncDrawerOpen = (state: ResearchStore) => state.syncDrawerOpen
export const selectExplorerOpen = (state: ResearchStore) => state.explorerOpen

// Preview selectors
export const selectPreviewOpen = (state: ResearchStore) => state.previewOpen
export const selectPreviewSource = (state: ResearchStore) => state.previewSource

// Content mode selector
export const selectContentMode = (state: ResearchStore) => state.contentMode

// ============================================================================
// Backward-compatible aliases (for gradual migration)
// ============================================================================
export const useChatStore = useResearchStore
export const useDocumentStore = useResearchStore
export const usePreviewStore = useResearchStore

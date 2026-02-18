/**
 * StoreExports - Barrel export for all Zustand stores and selectors
 *
 * @module stores
 * @template none
 * @reference none
 */

export { useAuthStore, selectUser, selectIsAuthenticated, selectIsLoading, selectAuthError } from './auth-store'

// Unified Research store (replaces chat-store, document-store, preview-store)
export {
  useResearchStore,
  useChatStore,
  useDocumentStore,
  usePreviewStore,
  selectSessions,
  selectCurrentSessionId,
  selectChatLoading,
  selectChatError,
  selectSelectedNode,
  selectViewMode,
  selectSorting,
  selectSyncDrawerOpen,
  selectExplorerOpen,
  selectPreviewOpen,
  selectPreviewSource,
  selectContentMode,
} from './research-store'

export type { ResearchStore, ContentMode } from './research-store'

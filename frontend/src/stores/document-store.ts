/**
 * useDocumentStore - Zustand store for library view selection and UI state
 *
 * Manages:
 * - Tree node selection (folder/file)
 * - Content view options (list/grid, sorting)
 * - Sync drawer visibility
 *
 * @module stores
 */
import { create } from 'zustand'

type NodeType = 'folder' | 'file' | null
type ViewMode = 'list' | 'grid'
type SortBy = 'name' | 'date' | 'status'
type SortOrder = 'asc' | 'desc'

interface DocumentState {
  // Selection
  selectedNodeId: string | null
  selectedNodeType: NodeType
  selectedNodeName: string | null

  // View options
  viewMode: ViewMode
  sortBy: SortBy
  sortOrder: SortOrder

  // Sync drawer
  syncDrawerOpen: boolean

  // Explorer collapse
  explorerOpen: boolean
}

interface DocumentStore extends DocumentState {
  // Selection actions
  selectNode: (id: string, type: 'folder' | 'file', name?: string) => void
  clearSelection: () => void

  // View actions
  setViewMode: (mode: ViewMode) => void
  setSorting: (by: SortBy, order?: SortOrder) => void
  toggleSortOrder: () => void

  // Sync drawer actions
  openSyncDrawer: () => void
  closeSyncDrawer: () => void

  // Explorer actions
  toggleExplorer: () => void
  setExplorerOpen: (open: boolean) => void
}

const initialState: DocumentState = {
  selectedNodeId: null,
  selectedNodeType: null,
  selectedNodeName: null,
  viewMode: 'list',
  sortBy: 'name',
  sortOrder: 'asc',
  syncDrawerOpen: false,
  explorerOpen: true,
}

export const useDocumentStore = create<DocumentStore>()((set, get) => ({
  ...initialState,

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
}))

// Selectors
export const selectSelectedNode = (state: DocumentStore) => ({
  id: state.selectedNodeId,
  type: state.selectedNodeType,
  name: state.selectedNodeName,
})
export const selectViewMode = (state: DocumentStore) => state.viewMode
export const selectSorting = (state: DocumentStore) => ({
  by: state.sortBy,
  order: state.sortOrder,
})
export const selectSyncDrawerOpen = (state: DocumentStore) => state.syncDrawerOpen
export const selectExplorerOpen = (state: DocumentStore) => state.explorerOpen

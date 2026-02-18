/**
 * ResearchView - VS Code-style layout: resizable file tree on left, chat always on right
 *
 * Layout:
 * ┌──────────────────┬──────────────────────────────────────┐
 * │ [≡] Session ▾    │                                      │
 * ├──────────────────┤                                      │
 * │                  │   Chat Interface (always visible)    │
 * │  File Explorer   │                                      │
 * │  (tree view)     │   Files can be selected from the     │
 * │                  │   tree to provide context to chat    │
 * │  📁 Folder    ↔  │← drag to resize                     │
 * │    📄 file.pdf   │                                      │
 * │    📄 file2.pdf  │                                      │
 * │                  │                                      │
 * └──────────────────┴──────────────────────────────────────┘
 *
 * - Files are shown inline in the tree (VS Code style)
 * - PDF Preview / Sync Panel open as dialog overlays
 * - Sidebar is freely resizable by dragging the edge
 *
 * @module features/research/views
 */
import { useCallback, useState, useRef } from 'react'
import {
  PanelLeftClose,
  PanelLeft,
  Plus,
  MessageSquare,
  ChevronDown,
  Trash2,
  X,
} from 'lucide-react'
import { ChatInterface } from '../components/chat/chat-interface'
import { FileExplorer } from '../components/explorer/file-explorer'
import { SyncPanel } from '../components/documents/sync-panel'
import { PdfPreviewPanel } from '../components/documents/pdf-preview-panel'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/shared/components/ui'
import { cn } from '@/lib/utils'
import useChat from '../hooks/use-chat'
import {
  useResearchStore,
  selectExplorerOpen,
} from '@/stores/research-store'

// ============================================================
// Constants
// ============================================================

const MIN_SIDEBAR_WIDTH = 200
const MAX_SIDEBAR_WIDTH = 600
const DEFAULT_SIDEBAR_WIDTH = 288 // 18rem (w-72)

// Dialog overlay types
type OverlayType = 'sync' | 'pdf-preview' | null

export default function ResearchView() {
  const {
    sessions,
    currentSessionId,
    startNewSession,
    switchSession,
    removeSession,
  } = useChat()

  const explorerOpen = useResearchStore(selectExplorerOpen)
  const { toggleExplorer, selectNode } = useResearchStore()

  // Overlay state for SyncPanel / PdfPreview dialogs
  const [overlay, setOverlay] = useState<OverlayType>(null)
  const [overlayFile, setOverlayFile] = useState<{ id: string; name: string | null } | null>(null)

  // Resizable sidebar state
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH)
  const isResizing = useRef(false)

  // Find current session title for the dropdown trigger
  const currentSession = sessions.find((s: { id: string }) => s.id === currentSessionId)
  const currentTitle = currentSession?.title || 'New Chat'

  // Handle node selection from FileExplorer
  const handleNodeSelect = useCallback(
    (id: string, type: 'folder' | 'file', name?: string) => {
      // Special: sync button in explorer toolbar
      if (id === '__sync__') {
        setOverlay('sync')
        return
      }

      selectNode(id, type, name)
      // File click → open PDF preview overlay
      if (type === 'file') {
        setOverlayFile({ id, name: name ?? null })
        setOverlay('pdf-preview')
      }
    },
    [selectNode]
  )

  const closeOverlay = useCallback(() => {
    setOverlay(null)
    setOverlayFile(null)
  }, [])

  // ---- Resize handlers ----
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isResizing.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizing.current) return
      const newWidth = Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, moveEvent.clientX))
      setSidebarWidth(newWidth)
    }

    const handleMouseUp = () => {
      isResizing.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [])

  return (
    <div className="flex h-full w-full overflow-hidden relative">
      {/* ====== Left: File Explorer Tree (VS Code style, resizable) ====== */}
      <div
        className={cn(
          'h-full shrink-0 transition-all ease-in-out overflow-hidden bg-muted/20 relative',
          explorerOpen ? 'border-r border-border' : 'w-0 border-r-0',
          // Disable transition during resize for smooth dragging
          isResizing.current ? 'duration-0' : 'duration-300',
        )}
        style={explorerOpen ? { width: sidebarWidth } : { width: 0 }}
      >
        <div className="h-full" style={{ width: sidebarWidth }}>
          <FileExplorer onNodeSelect={handleNodeSelect} />
        </div>
      </div>

      {/* Resize handle */}
      {explorerOpen && (
        <div
          className="w-1 h-full cursor-col-resize hover:bg-primary/20 active:bg-primary/30 shrink-0 transition-colors z-10"
          onMouseDown={startResizing}
          title="Drag to resize"
        />
      )}

      {/* ====== Right: Chat (always visible) ====== */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Session bar */}
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/50 bg-background/80 backdrop-blur-sm">
          {/* Explorer toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            title={explorerOpen ? 'Hide Explorer' : 'Show Explorer'}
            onClick={toggleExplorer}
          >
            {explorerOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
          </Button>

          {/* Session dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 gap-1.5 px-2 text-sm font-medium max-w-[240px]"
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{currentTitle}</span>
                <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 max-h-80 overflow-y-auto">
              {/* New chat */}
              <DropdownMenuItem onClick={startNewSession} className="gap-2 font-medium">
                <Plus className="h-4 w-4" />
                New Chat
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {/* Sessions */}
              {sessions.length === 0 ? (
                <div className="px-2 py-3 text-xs text-muted-foreground text-center">
                  No chat sessions yet
                </div>
              ) : (
                sessions.map((session: { id: string; title?: string }) => (
                  <DropdownMenuItem
                    key={session.id}
                    onClick={() => switchSession(session.id)}
                    className={cn(
                      'gap-2 justify-between group',
                      session.id === currentSessionId && 'bg-primary/5 font-medium'
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm">
                        {session.title || 'Untitled Chat'}
                      </span>
                    </div>
                    {session.id !== currentSessionId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeSession(session.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/10 transition-opacity"
                        title="Delete session"
                      >
                        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    )}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex-1" />
        </div>

        {/* Chat Interface */}
        <div className="flex-1 min-h-0">
          <ChatInterface
            sidebarOpen={explorerOpen}
            onToggleSidebar={toggleExplorer}
          />
        </div>
      </div>

      {/* ====== Overlay Dialogs ====== */}

      {/* PDF Preview overlay */}
      {overlay === 'pdf-preview' && overlayFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
            onClick={closeOverlay}
          />
          <div className="relative z-10 w-[90vw] max-w-4xl h-[80vh] bg-background rounded-xl shadow-2xl border flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-4 py-2 border-b shrink-0">
              <span className="text-sm font-medium truncate">
                {overlayFile.name || 'Document Preview'}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closeOverlay}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 min-h-0">
              <PdfPreviewPanel fileId={overlayFile.id} fileName={overlayFile.name} />
            </div>
          </div>
        </div>
      )}

      {/* Sync Panel overlay */}
      {overlay === 'sync' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
            onClick={closeOverlay}
          />
          <div className="relative z-10 w-[90vw] max-w-5xl h-[85vh] bg-background rounded-xl shadow-2xl border flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-4 py-2 border-b shrink-0">
              <span className="text-sm font-medium">Ottawa ED Sync</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closeOverlay}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 min-h-0 overflow-auto">
              <SyncPanel embedded={true} onSyncComplete={closeOverlay} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

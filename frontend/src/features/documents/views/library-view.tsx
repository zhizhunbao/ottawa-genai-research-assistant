/**
 * LibraryView - Split-pane layout with FileExplorer (left) and content area (right)
 *
 * Layout:
 * - Left: Collapsible FileExplorer tree (w-72)
 * - Right: Content toolbar + folder list / PDF preview / SyncPanel (for Ottawa) / empty state
 *
 * @module features/documents/views
 */
import { useCallback } from 'react'
import { PanelLeftClose, PanelLeft, Upload, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/components/ui/button'
import { useDocumentStore, selectExplorerOpen, selectSelectedNode } from '@/stores'
import { FileExplorer } from '../components/file-explorer'
import { EmptyContent } from '../components/empty-content'
import { ContentToolbar } from '../components/content-toolbar'
import { FolderContentList } from '../components/folder-content-list'
import { SyncPanel } from '../components/sync-panel'
import { PdfPreviewPanel } from '../components/pdf-preview-panel'

export default function LibraryView() {
  const explorerOpen = useDocumentStore(selectExplorerOpen)
  const selectedNode = useDocumentStore(selectSelectedNode)
  const { toggleExplorer, selectNode } = useDocumentStore()

  // Detect if selected folder is the Ottawa sync folder
  const isOttawaFolder = selectedNode.type === 'folder' &&
    selectedNode.name?.toLowerCase().includes('ottawa')

  // Handle node selection from FileExplorer
  const handleNodeSelect = useCallback(
    (id: string, type: 'folder' | 'file', name?: string) => {
      selectNode(id, type, name)
    },
    [selectNode]
  )

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left: FileExplorer (collapsible) */}
      <div
        className={cn(
          'h-full border-r border-border shrink-0 transition-all duration-300 ease-in-out overflow-hidden bg-muted/20',
          explorerOpen ? 'w-72' : 'w-0 border-r-0'
        )}
      >
        <div className="w-72 h-full">
          <FileExplorer onNodeSelect={handleNodeSelect} />
        </div>
      </div>

      {/* Right: Content area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header bar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50 bg-background/80 backdrop-blur-sm">
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

          {/* Title */}
          <h1 className="text-sm font-medium">Knowledge Base</h1>

          <div className="flex-1" />

          {/* Actions */}
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <Upload className="h-3.5 w-3.5" />
            Upload
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Help">
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>

        {/* Content area - conditional rendering */}
        {!selectedNode.id ? (
          <EmptyContent />
        ) : isOttawaFolder ? (
          // Ottawa sync folder: show SyncPanel directly
          <div className="flex-1 min-h-0 overflow-auto">
            <SyncPanel embedded={true} />
          </div>
        ) : selectedNode.type === 'folder' ? (
          <div className="flex-1 min-h-0 flex flex-col">
            <ContentToolbar />
            <FolderContentList folderId={selectedNode.id} />
          </div>
        ) : (
          <PdfPreviewPanel fileId={selectedNode.id} fileName={selectedNode.name} />
        )}
      </div>
    </div>
  )
}

/**
 * EmptyContent - Welcome/guide state when no folder or file is selected
 *
 * @module features/documents/components
 */
import { FolderOpen, Upload, CloudDownload, MousePointerClick } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useDocumentStore } from '@/stores'

export function EmptyContent() {
  const { openSyncDrawer } = useDocumentStore()

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <FolderOpen className="w-8 h-8 text-primary" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Knowledge Base</h2>
          <p className="text-muted-foreground">
            Select a folder from the explorer to view its contents, or get started by uploading documents.
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="outline" className="gap-2" onClick={openSyncDrawer}>
            <CloudDownload className="h-4 w-4" />
            Sync Ottawa Resources
          </Button>
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload PDF
          </Button>
        </div>

        {/* Tips */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <MousePointerClick className="h-3.5 w-3.5" />
            Tip: Click on a folder in the explorer to see its documents
          </p>
        </div>
      </div>
    </div>
  )
}

export default EmptyContent

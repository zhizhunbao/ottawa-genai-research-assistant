/**
 * PdfPreviewDialog - Full-screen dialog for previewing PDF documents
 *
 * Renders an iframe with the PDF URL (either a local blob URL or a server download URL).
 * Includes a toolbar with download and close actions.
 *
 * @module features/documents/components
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Download, ExternalLink } from 'lucide-react'

// ============================================================
// Props
// ============================================================

interface PdfPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  url: string | null
  fileName: string
}

// ============================================================
// Main Component
// ============================================================

export function PdfPreviewDialog({
  open,
  onOpenChange,
  url,
  fileName,
}: PdfPreviewDialogProps) {
  if (!url) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[90vw] h-[85vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b border-border flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-sm font-medium truncate max-w-[60%]">
            {fileName}
          </DialogTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => window.open(url, '_blank')}
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              Open
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              asChild
            >
              <a href={url} download={fileName}>
                <Download className="h-3.5 w-3.5 mr-1" />
                Download
              </a>
            </Button>
          </div>
        </DialogHeader>

        {/* PDF iframe */}
        <div className="flex-1 min-h-0 bg-muted/30">
          <iframe
            src={`${url}#toolbar=1&navpanes=1`}
            className="w-full h-full border-0"
            title={`Preview: ${fileName}`}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PdfPreviewDialog

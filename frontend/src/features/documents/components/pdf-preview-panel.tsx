/**
 * PdfPreviewPanel - Inline PDF preview panel for the content area
 *
 * @module features/documents/components
 */
import { useState, useEffect } from 'react'
import { FileText, Download, ExternalLink, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { documentApi } from '../services/document-api'

interface PdfPreviewPanelProps {
  fileId: string
  fileName?: string | null
}

export function PdfPreviewPanel({ fileId, fileName }: PdfPreviewPanelProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUrl = async () => {
      setLoading(true)
      setError(null)
      try {
        const urlData = await documentApi.getDownloadUrl(fileId)
        setPreviewUrl(urlData.download_url)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load preview')
      } finally {
        setLoading(false)
      }
    }
    fetchUrl()
  }, [fileId])

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading preview...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !previewUrl) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <AlertCircle className="h-8 w-8 mx-auto text-destructive" />
          <p className="text-sm text-destructive">{error || 'Preview not available'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/30 shrink-0">
        <FileText className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-medium truncate flex-1">
          {fileName || 'Document Preview'}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          title="Download"
          onClick={() => window.open(previewUrl, '_blank')}
        >
          <Download className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          title="Open in new tab"
          onClick={() => window.open(previewUrl, '_blank')}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* PDF iframe */}
      <div className="flex-1 min-h-0 bg-muted/10">
        <iframe
          src={`${previewUrl}#toolbar=1&navpanes=0`}
          className="w-full h-full border-0"
          title={fileName || 'PDF Preview'}
        />
      </div>
    </div>
  )
}

export default PdfPreviewPanel

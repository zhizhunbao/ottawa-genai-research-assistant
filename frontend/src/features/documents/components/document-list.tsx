/**
 * DocumentList - Table view of uploaded documents with status, actions, and auto-refresh
 *
 * Displays all documents with processing status badges, file size,
 * timestamps, and delete actions. Auto-polls for status updates when
 * any document is in "processing" state.
 *
 * @module features/documents/components
 * @template .agent/templates/frontend/features/documents/upload/document-list.tsx.template
 * @reference docs/plans/MASTER-PLAN.md Phase 1.2
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  FileText,
  Loader2,
  AlertCircle,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Clock,
  Download,
} from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { cn } from '@/lib/utils'
import { documentApi, type BackendDocument, type DocumentStatusValue } from '../services/document-api'

// ============================================================
// Status Badge
// ============================================================

function StatusBadge({ status }: { status: DocumentStatusValue }) {
  const config: Record<DocumentStatusValue, {
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
    label: string
    icon: typeof Clock
    iconClass: string
  }> = {
    pending: {
      variant: 'outline',
      label: 'Pending',
      icon: Clock,
      iconClass: 'text-amber-500',
    },
    processing: {
      variant: 'default',
      label: 'Processing',
      icon: Loader2,
      iconClass: 'text-blue-500 animate-spin',
    },
    indexed: {
      variant: 'secondary',
      label: 'Indexed',
      icon: CheckCircle2,
      iconClass: 'text-emerald-500',
    },
    failed: {
      variant: 'destructive',
      label: 'Failed',
      icon: AlertCircle,
      iconClass: 'text-destructive',
    },
  }

  const { variant, label, icon: Icon, iconClass } = config[status] ?? config.pending
  return (
    <Badge variant={variant} className="gap-1 text-[10px]">
      <Icon className={cn('h-3 w-3', iconClass)} />
      {label}
    </Badge>
  )
}

// ============================================================
// Props
// ============================================================

interface DocumentListProps {
  /** Increment to trigger a refresh (e.g. after upload) */
  refreshTrigger?: number
}

// ============================================================
// Main Component
// ============================================================

export function DocumentList({ refreshTrigger }: DocumentListProps) {
  const [documents, setDocuments] = useState<BackendDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ---- Fetch documents ----
  const fetchDocuments = useCallback(async () => {
    try {
      const data = await documentApi.listDocuments()
      setDocuments(data.items)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  // Refresh when trigger changes (after upload)
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchDocuments()
    }
  }, [refreshTrigger, fetchDocuments])

  // ---- Auto-poll when processing ----
  useEffect(() => {
    const hasProcessing = documents.some(
      (d) => d.status === 'processing' || d.status === 'pending'
    )

    if (hasProcessing) {
      pollTimerRef.current = setTimeout(() => {
        fetchDocuments()
      }, 3000) // poll every 3s
    }

    return () => {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current)
      }
    }
  }, [documents, fetchDocuments])

  // ---- Delete handler ----
  const handleDelete = async (docId: string) => {
    setDeletingId(docId)
    try {
      await documentApi.deleteDocument(docId)
      setDocuments((prev) => prev.filter((d) => d.id !== docId))
    } catch (err) {
      console.error('Failed to delete document:', err)
    } finally {
      setDeletingId(null)
    }
  }

  // ---- Download handler ----
  const handleDownload = async (doc: BackendDocument) => {
    try {
      const { download_url } = await documentApi.getDownloadUrl(doc.id)
      window.open(download_url, '_blank')
    } catch (err) {
      console.error('Failed to get download URL:', err)
    }
  }

  // ---- Loading state ----
  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-16">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">Loading documents...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ---- Error state ----
  if (error) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-16">
          <div className="text-center space-y-3">
            <AlertCircle className="h-8 w-8 mx-auto text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchDocuments}>
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ---- Empty state ----
  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No documents yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Upload your first PDF document to start building your knowledge base.
            Documents will be automatically indexed for RAG chat.
          </p>
        </CardContent>
      </Card>
    )
  }

  // ---- Document list ----
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Knowledge Base
            <Badge variant="secondary" className="text-xs">{documents.length}</Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchDocuments}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors group"
            >
              {/* File icon */}
              <div className="shrink-0">
                <FileText className="h-5 w-5 text-red-500" />
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {doc.title || doc.file_name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    {doc.file_name}
                  </span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="shrink-0">
                <StatusBadge status={doc.status} />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {doc.status === 'indexed' && doc.blob_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(doc)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(doc.id)}
                  disabled={deletingId === doc.id}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  title="Delete"
                >
                  {deletingId === doc.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default DocumentList

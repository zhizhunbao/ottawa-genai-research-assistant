/**
 * UploadPanel - Drag-and-drop file upload component for PDF documents
 *
 * Supports drag-drop and click-to-browse file selection. Shows file previews
 * with size info, upload progress bar, and status badges. Calls documentApi
 * to upload files to the backend.
 *
 * @module features/documents/components
 * @template .agent/templates/frontend/features/documents/upload/document-upload-steps.tsx.template
 * @reference docs/plans/MASTER-PLAN.md Phase 1.1
 */

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Upload,
  X,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Progress } from '@/shared/components/ui/progress'
import { cn } from '@/lib/utils'
import { documentApi } from '../services/document-api'

// ============================================================
// Types
// ============================================================

type UploadFileStatus = 'pending' | 'uploading' | 'success' | 'error'

interface UploadFileEntry {
  file: File
  status: UploadFileStatus
  progress: number
  error?: string
  documentId?: string
}

// ============================================================
// Status Badge Sub-component
// ============================================================

function UploadStatusBadge({ status }: { status: UploadFileStatus }) {
  const config: Record<UploadFileStatus, {
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
    label: string
  }> = {
    pending: { variant: 'outline', label: 'Ready' },
    uploading: { variant: 'default', label: 'Uploading...' },
    success: { variant: 'secondary', label: 'Uploaded' },
    error: { variant: 'destructive', label: 'Failed' },
  }
  const { variant, label } = config[status]
  return <Badge variant={variant}>{label}</Badge>
}

// ============================================================
// Props
// ============================================================

interface UploadPanelProps {
  /** Callback after a successful upload */
  onUploadComplete?: () => void
}

// ============================================================
// Main Component
// ============================================================

export function UploadPanel({ onUploadComplete }: UploadPanelProps) {
  const [files, setFiles] = useState<UploadFileEntry[]>([])
  const [isUploading, setIsUploading] = useState(false)

  // ---- Dropzone ----
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newEntries: UploadFileEntry[] = acceptedFiles.map((file) => ({
      file,
      status: 'pending' as const,
      progress: 0,
    }))
    setFiles((prev) => [...prev, ...newEntries])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 50 * 1024 * 1024, // 50MB
  })

  const removeFile = (file: File) => {
    setFiles((prev) => prev.filter((f) => f.file !== file))
  }

  // ---- Upload handler ----
  const handleUpload = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending')
    if (pendingFiles.length === 0) return

    setIsUploading(true)

    for (const entry of pendingFiles) {
      // Mark as uploading
      setFiles((prev) =>
        prev.map((f) =>
          f.file === entry.file ? { ...f, status: 'uploading' as const, progress: 0 } : f
        )
      )

      try {
        const result = await documentApi.uploadFile(
          entry.file,
          entry.file.name.replace(/\.pdf$/i, ''),
          undefined,
          (percent) => {
            setFiles((prev) =>
              prev.map((f) =>
                f.file === entry.file ? { ...f, progress: percent } : f
              )
            )
          }
        )

        setFiles((prev) =>
          prev.map((f) =>
            f.file === entry.file
              ? { ...f, status: 'success' as const, progress: 100, documentId: result.id }
              : f
          )
        )
      } catch (err) {
        setFiles((prev) =>
          prev.map((f) =>
            f.file === entry.file
              ? { ...f, status: 'error' as const, error: err instanceof Error ? err.message : 'Upload failed' }
              : f
          )
        )
      }
    }

    setIsUploading(false)
    onUploadComplete?.()
  }

  const pendingCount = files.filter((f) => f.status === 'pending').length
  const successCount = files.filter((f) => f.status === 'success').length

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Upload Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop zone */}
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
            isDragActive
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            <div className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center transition-colors',
              isDragActive ? 'bg-primary/10' : 'bg-muted'
            )}>
              <Upload className={cn(
                'h-6 w-6 transition-colors',
                isDragActive ? 'text-primary' : 'text-muted-foreground'
              )} />
            </div>
            <div>
              <p className="text-sm font-medium">
                {isDragActive ? 'Drop your files here' : 'Drag & drop PDF files here'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse · PDF only · max 50 MB
              </p>
            </div>
          </div>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {files.map((entry) => (
              <div
                key={entry.file.name + entry.file.lastModified}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card"
              >
                <div className="shrink-0">
                  {entry.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : entry.status === 'error' ? (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  ) : entry.status === 'uploading' ? (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  ) : (
                    <FileText className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{entry.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(entry.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {entry.status === 'uploading' && (
                    <Progress value={entry.progress} className="h-1.5 mt-1.5" />
                  )}
                  {entry.status === 'error' && entry.error && (
                    <p className="text-xs text-destructive mt-1">{entry.error}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <UploadStatusBadge status={entry.status} />
                  {entry.status === 'pending' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(entry.file) }}
                      className="p-1 hover:bg-accent rounded-full transition-colors"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload button */}
        {files.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {pendingCount > 0 ? `${pendingCount} file(s) ready to upload` : `${successCount} file(s) uploaded`}
            </p>
            <div className="flex gap-2">
              {!isUploading && successCount > 0 && pendingCount === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFiles([])}
                >
                  Clear All
                </Button>
              )}
              <Button
                onClick={handleUpload}
                disabled={pendingCount === 0 || isUploading}
                size="sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload {pendingCount > 0 ? `(${pendingCount})` : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default UploadPanel

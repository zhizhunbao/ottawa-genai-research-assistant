/**
 * FolderContentList - Table/grid view of folder contents
 *
 * Displays files and subfolders within the selected folder.
 *
 * @module features/documents/components
 */
import { useEffect, useState, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  FileText,
  Folder,
  Loader2,
  AlertCircle,
  Trash2,
  Download,
  CheckCircle2,
  Clock,
  FolderOpen,
} from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { folderApi, type FileNodeResponse } from '../../services/folder-api'
import { documentApi, type DocumentStatusValue } from '../../services/document-api'
import { useDocumentStore, selectSorting } from '@/stores'

// ============================================================
// Status Badge (reused from document-list.tsx pattern)
// ============================================================

function StatusBadge({ status }: { status: DocumentStatusValue | null | undefined }) {
  if (!status) return null

  const config: Record<string, {
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

  const cfg = config[status] ?? config.pending
  const Icon = cfg.icon

  return (
    <Badge variant={cfg.variant} className="gap-1 text-[10px]">
      <Icon className={cn('h-3 w-3', cfg.iconClass)} />
      {cfg.label}
    </Badge>
  )
}

// ============================================================
// Props
// ============================================================

interface FolderContentListProps {
  folderId: string
}

// ============================================================
// Main Component
// ============================================================

export function FolderContentList({ folderId }: FolderContentListProps) {
  const [items, setItems] = useState<FileNodeResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const sorting = useDocumentStore(selectSorting)
  const { selectNode } = useDocumentStore()

  // Fetch folder contents
  const fetchContents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await folderApi.listChildren(folderId)
      setItems(data.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load folder contents')
    } finally {
      setLoading(false)
    }
  }, [folderId])

  useEffect(() => {
    fetchContents()
  }, [fetchContents])

  // Sort items
  const sortedItems = [...items].sort((a, b) => {
    const order = sorting.order === 'asc' ? 1 : -1
    switch (sorting.by) {
      case 'name':
        return order * a.name.localeCompare(b.name)
      case 'date':
        return order * ((a.created_at ?? '').localeCompare(b.created_at ?? ''))
      case 'status':
        return order * ((a.status ?? '').localeCompare(b.status ?? ''))
      default:
        return 0
    }
  })

  // Handlers
  const handleDelete = async (itemId: string, isFolder: boolean) => {
    setDeletingId(itemId)
    try {
      if (isFolder) {
        await folderApi.deleteFolder(itemId)
      } else {
        await documentApi.deleteDocument(itemId)
      }
      setItems((prev) => prev.filter((i) => i.id !== itemId))
    } catch (err) {
      console.error('Failed to delete:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const handleDownload = async (itemId: string) => {
    try {
      const urlData = await documentApi.getDownloadUrl(itemId)
      window.open(urlData.download_url, '_blank')
    } catch (err) {
      console.error('Failed to download:', err)
    }
  }

  const handleItemClick = (item: FileNodeResponse) => {
    const type = item.type === 'folder' ? 'folder' : 'file'
    selectNode(item.id, type, item.name)
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 p-4 space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <AlertCircle className="h-8 w-8 mx-auto text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchContents}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">This folder is empty</p>
        </div>
      </div>
    )
  }

  // List view
  return (
    <ScrollArea className="flex-1">
      <div className="p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left py-2 px-3 font-medium text-muted-foreground w-24">Status</th>
              <th className="text-left py-2 px-3 font-medium text-muted-foreground w-32">Modified</th>
              <th className="text-right py-2 px-3 font-medium text-muted-foreground w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item) => {
              const isFolder = item.type === 'folder'
              const isDeleting = deletingId === item.id

              return (
                <tr
                  key={item.id}
                  className={cn(
                    'border-b last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors',
                    isDeleting && 'opacity-50'
                  )}
                  onClick={() => handleItemClick(item)}
                >
                  {/* Name */}
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      {isFolder ? (
                        <Folder className="h-4 w-4 text-amber-500 shrink-0" />
                      ) : (
                        <FileText className="h-4 w-4 text-red-400 shrink-0" />
                      )}
                      <span className="truncate">{item.name}</span>
                      {isFolder && item.children_count > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({item.children_count})
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-2 px-3">
                    {!isFolder && <StatusBadge status={item.status as DocumentStatusValue} />}
                  </td>

                  {/* Modified */}
                  <td className="py-2 px-3 text-muted-foreground text-xs">
                    {item.created_at
                      ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true })
                      : 'â€”'}
                  </td>

                  {/* Actions */}
                  <td className="py-2 px-3">
                    <div className="flex items-center justify-end gap-1">
                      {!isFolder && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Download"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDownload(item.id)
                            }}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        title="Delete"
                        disabled={isDeleting}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(item.id, isFolder)
                        }}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </ScrollArea>
  )
}

export default FolderContentList

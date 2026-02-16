/**
 * FileExplorer - VS Code-style file explorer sidebar with tree view, drag-drop, and right-click context menu
 *
 * Features:
 * - Local-first uploads: files appear immediately, upload happens in background
 * - No full-page flash on refresh: only initial load shows spinner
 * - PDF preview: double-click or right-click → Preview to view PDFs inline
 * - Drag-and-drop reordering, rename, delete, move operations
 *
 * @module features/documents/components
 * @reference react-complex-tree (lukasbach/react-complex-tree)
 */

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import {
  UncontrolledTreeEnvironment,
  Tree,
  StaticTreeDataProvider,
  type TreeItemIndex,
  type TreeItem,
} from 'react-complex-tree'
import 'react-complex-tree/lib/style-modern.css'
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  FolderPlus,
  Upload,
  Trash2,
  Pencil,
  RefreshCw,
  Loader2,
  Copy,
  Download,
  FolderInput,
  FilePlus,
  Eye,
  CloudUpload,
  CheckCircle2,
  AlertCircle,
  Cloud,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/shared/components/ui/context-menu'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Progress } from '@/shared/components/ui/progress'
import { cn } from '@/lib/utils'
import { folderApi, type FileNodeResponse } from '../services/folder-api'
import { documentApi } from '../services/document-api'
import { PdfPreviewDialog } from './pdf-preview-dialog'

// ============================================================
// Types
// ============================================================

interface FileTreeItem {
  index: TreeItemIndex
  data: {
    name: string
    type: 'folder' | 'uploaded_file'
    status?: string | null
    fileNode?: FileNodeResponse
  }
  children?: TreeItemIndex[]
  isFolder?: boolean
  canMove?: boolean
  canRename?: boolean
}

/** Tracks a file being uploaded in the background */
interface PendingUpload {
  tempId: string
  file: File
  objectUrl: string
  progress: number
  status: 'uploading' | 'done' | 'error'
  error?: string
  parentId: string | null
}

// ============================================================
// Props
// ============================================================

interface FileExplorerProps {
  className?: string
  /** Called when a tree node is selected (clicked) */
  onNodeSelect?: (id: string, type: 'folder' | 'file', name?: string) => void
}

// ============================================================
// Main Component
// ============================================================

export function FileExplorer({ className, onNodeSelect }: FileExplorerProps) {
  const [treeItems, setTreeItems] = useState<Record<TreeItemIndex, TreeItem<FileTreeItem['data']>>>({
    root: {
      index: 'root',
      data: { name: 'Root', type: 'folder' },
      children: [],
      isFolder: true,
    },
  })
  const [initialLoading, setInitialLoading] = useState(true)
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [creatingFolderParent, setCreatingFolderParent] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const newFolderInputRef = useRef<HTMLInputElement>(null)

  // Upload queue: tracks background uploads
  const [pendingUploads, setPendingUploads] = useState<Map<string, PendingUpload>>(new Map())

  // PDF preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewName, setPreviewName] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)

  // Local file blob URLs (for preview before upload completes)
  const localFileUrls = useRef<Map<string, string>>(new Map())

  // Memoized data provider — only recreated when treeItems changes,
  // prevents drag-and-drop state loss during unrelated re-renders
  const dataProvider = useMemo(
    () => new StaticTreeDataProvider(treeItems, (item, newName) => ({
      ...item,
      data: { ...item.data, name: newName },
    })),
    [treeItems]
  )

  // Tree key — forces remount ONLY when treeItems changes,
  // NOT during unrelated re-renders (e.g. upload progress)
  const treeKeyRef = useRef(0)
  const prevTreeItemsRef = useRef(treeItems)
  if (prevTreeItemsRef.current !== treeItems) {
    treeKeyRef.current++
    prevTreeItemsRef.current = treeItems
  }

  // Store a ref to trigger rename from context menu
  const renameRefsMap = useRef<Record<string, () => void>>({})

  // Upload target folder (for "Upload File Here" context menu)
  const uploadTargetFolder = useRef<string | null>(null)

  // ---- Fetch tree data (silent refresh — no loading flash) ----
  const fetchTree = useCallback(async () => {
    try {
      const rootContents = await folderApi.listRoot()

      const items: Record<TreeItemIndex, TreeItem<FileTreeItem['data']>> = {
        root: {
          index: 'root',
          data: { name: 'Root', type: 'folder' },
          children: rootContents.items.map((item) => item.id),
          isFolder: true,
        },
      }

      // Add each root-level item
      for (const item of rootContents.items) {
        items[item.id] = {
          index: item.id,
          data: {
            name: item.name,
            type: item.type,
            status: item.status,
            fileNode: item,
          },
          children: item.type === 'folder' ? [] : undefined,
          isFolder: item.type === 'folder',
          canMove: true,
          canRename: true,
        }

        // Load children for folders
        if (item.type === 'folder') {
          try {
            const children = await folderApi.listChildren(item.id)
            items[item.id].children = children.items.map((c) => c.id)

            for (const child of children.items) {
              items[child.id] = {
                index: child.id,
                data: {
                  name: child.name,
                  type: child.type,
                  status: child.status,
                  fileNode: child,
                },
                children: child.type === 'folder' ? [] : undefined,
                isFolder: child.type === 'folder',
                canMove: true,
                canRename: true,
              }
            }
          } catch {
            // Folder children load failed, keep empty
          }
        }
      }

      setTreeItems(items)
    } catch (err) {
      console.error('Failed to load file tree:', err)
    } finally {
      setInitialLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTree()
  }, [fetchTree])

  // ---- Create folder (optimistic) ----
  const handleCreateFolder = useCallback(async () => {
    if (!newFolderName.trim()) return

    const tempName = newFolderName.trim()
    const parentId = creatingFolderParent

    // Reset UI immediately
    setNewFolderName('')
    setCreatingFolder(false)
    setCreatingFolderParent(null)

    try {
      await folderApi.createFolder(tempName, parentId)
      await fetchTree()
    } catch (err) {
      console.error('Failed to create folder:', err)
    }
  }, [newFolderName, creatingFolderParent, fetchTree])

  const startCreatingFolder = useCallback((parentId: string | null = null) => {
    setCreatingFolderParent(parentId)
    setCreatingFolder(true)
    setTimeout(() => newFolderInputRef.current?.focus(), 50)
  }, [])

  // ---- Delete node ----
  const handleDelete = useCallback(async (itemId: string, isFolder: boolean) => {
    // Optimistic: remove from tree immediately
    setTreeItems((prev) => {
      const next = { ...prev }
      // Remove from parent's children
      for (const key of Object.keys(next)) {
        const node = next[key]
        if (node.children?.includes(itemId)) {
          next[key] = {
            ...node,
            children: node.children.filter((c) => c !== itemId),
          }
        }
      }
      delete next[itemId]
      return next
    })

    try {
      if (isFolder) {
        await folderApi.deleteFolder(itemId)
      } else {
        await documentApi.deleteDocument(itemId)
      }
      // Refresh to ensure consistency
      await fetchTree()
    } catch (err) {
      console.error('Failed to delete:', err)
      // Revert on error
      await fetchTree()
    }
  }, [fetchTree])

  // ---- Rename node ----
  const handleRename = useCallback(async (itemId: TreeItemIndex, newName: string) => {
    const item = treeItems[itemId]
    if (!item) return

    try {
      if (item.data.type === 'folder') {
        await folderApi.renameFolder(String(itemId), newName)
      } else {
        await documentApi.updateDocument(String(itemId), { title: newName })
      }
      await fetchTree()
    } catch (err) {
      console.error('Failed to rename:', err)
    }
  }, [treeItems, fetchTree])

  // ---- Copy name to clipboard ----
  const handleCopyName = useCallback((name: string) => {
    navigator.clipboard.writeText(name)
  }, [])

  // ---- Download file ----
  const handleDownload = useCallback(async (itemId: string) => {
    try {
      const urlData = await documentApi.getDownloadUrl(itemId)
      window.open(urlData.download_url, '_blank')
    } catch (err) {
      console.error('Failed to download:', err)
    }
  }, [])

  // ---- Preview file ----
  const handlePreview = useCallback(async (itemId: string, itemName: string) => {
    // Check if it's a local file (pending upload)
    const localUrl = localFileUrls.current.get(itemId)
    if (localUrl) {
      setPreviewUrl(localUrl)
      setPreviewName(itemName)
      setPreviewOpen(true)
      return
    }

    // Server file — get download URL
    try {
      const urlData = await documentApi.getDownloadUrl(itemId)
      setPreviewUrl(urlData.download_url)
      setPreviewName(itemName)
      setPreviewOpen(true)
    } catch (err) {
      console.error('Failed to get preview URL:', err)
    }
  }, [])

  // ---- Move node (drag & drop) ----
  const handleDrop = useCallback(async (
    items: TreeItem<FileTreeItem['data']>[],
    target: { targetType: string; parentItem: TreeItemIndex; targetItem?: TreeItemIndex }
  ) => {
    let newParentId: string | null = null

    if (target.targetType === 'item' && target.targetItem != null) {
      // Dropped directly ON a folder — targetItem is the folder to move into
      newParentId = target.targetItem === 'root' ? null : String(target.targetItem)
    } else if (target.targetType === 'between-items') {
      // Dropped between items inside a folder — parentItem is the containing folder
      newParentId = target.parentItem === 'root' ? null : String(target.parentItem)
    } else if (target.targetType === 'root') {
      // Dropped at root level
      newParentId = null
    } else {
      return
    }

    for (const item of items) {
      try {
        await folderApi.moveNode(String(item.index), newParentId)
      } catch (err) {
        console.error('Failed to move:', err)
      }
    }

    await fetchTree()
  }, [fetchTree])

  // ---- File upload via hidden input (LOCAL-FIRST) ----
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const targetFolderId = uploadTargetFolder.current
    uploadTargetFolder.current = null

    for (const file of Array.from(files)) {
      const tempId = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const objectUrl = URL.createObjectURL(file)

      // Store the local blob URL for preview
      localFileUrls.current.set(tempId, objectUrl)

      // Create pending upload entry
      const pendingUpload: PendingUpload = {
        tempId,
        file,
        objectUrl,
        progress: 0,
        status: 'uploading',
        parentId: targetFolderId,
      }

      setPendingUploads((prev) => {
        const next = new Map(prev)
        next.set(tempId, pendingUpload)
        return next
      })

      // Add to tree optimistically (appears immediately!)
      setTreeItems((prev) => {
        const parentKey = targetFolderId || 'root'
        const parent = prev[parentKey]
        if (!parent) return prev

        return {
          ...prev,
          [tempId]: {
            index: tempId,
            data: {
              name: file.name,
              type: 'uploaded_file' as const,
              status: 'uploading',
            },
            isFolder: false,
            canMove: false,
            canRename: false,
          },
          [parentKey]: {
            ...parent,
            children: [...(parent.children || []), tempId],
          },
        }
      })


      // Upload in background (non-blocking!)
      documentApi.uploadFile(
        file,
        file.name.replace(/\.pdf$/i, ''),
        undefined,
        (progress) => {
          // Update progress
          setPendingUploads((prev) => {
            const next = new Map(prev)
            const entry = next.get(tempId)
            if (entry) {
              next.set(tempId, { ...entry, progress })
            }
            return next
          })
        }
      ).then(async () => {
        // Upload succeeded — mark as done
        setPendingUploads((prev) => {
          const next = new Map(prev)
          const entry = next.get(tempId)
          if (entry) {
            next.set(tempId, { ...entry, status: 'done', progress: 100 })
          }
          return next
        })

        // Refresh tree to get real server data
        await fetchTree()

        // Clean up temp resources after a short delay
        setTimeout(() => {
          setPendingUploads((prev) => {
            const next = new Map(prev)
            next.delete(tempId)
            return next
          })
          URL.revokeObjectURL(objectUrl)
          localFileUrls.current.delete(tempId)
        }, 2000)
      }).catch((err) => {
        console.error('Upload failed:', err)
        setPendingUploads((prev) => {
          const next = new Map(prev)
          const entry = next.get(tempId)
          if (entry) {
            next.set(tempId, {
              ...entry,
              status: 'error',
              error: err instanceof Error ? err.message : 'Upload failed',
            })
          }
          return next
        })

        // Update tree item status to failed
        setTreeItems((prev) => {
          const item = prev[tempId]
          if (!item) return prev
          return {
            ...prev,
            [tempId]: {
              ...item,
              data: { ...item.data, status: 'failed' },
            },
          }
        })

      })
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [fetchTree])

  // Helper: trigger upload into a specific folder
  const triggerUploadInFolder = useCallback((folderId: string | null) => {
    uploadTargetFolder.current = folderId
    fileInputRef.current?.click()
  }, [])

  // Count active uploads
  const activeUploads = Array.from(pendingUploads.values()).filter(
    (u) => u.status === 'uploading'
  )
  const totalProgress = activeUploads.length > 0
    ? Math.round(activeUploads.reduce((sum, u) => sum + u.progress, 0) / activeUploads.length)
    : 0

  // ---- Initial loading state ----
  if (initialLoading) {
    return (
      <div className={cn('flex flex-col h-full', className)}>
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Explorer
        </span>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            title="New Folder"
            onClick={() => startCreatingFolder(null)}
          >
            <FolderPlus className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            title="Upload File"
            onClick={() => triggerUploadInFolder(null)}
          >
            <Upload className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            title="Refresh"
            onClick={fetchTree}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* New folder input */}
      {creatingFolder && (
        <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border">
          <Folder className="h-4 w-4 text-amber-500 shrink-0" />
          <input
            ref={newFolderInputRef}
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder()
              if (e.key === 'Escape') { setCreatingFolder(false); setNewFolderName(''); setCreatingFolderParent(null) }
            }}
            onBlur={() => {
              if (newFolderName.trim()) {
                handleCreateFolder()
              } else {
                setCreatingFolder(false)
                setCreatingFolderParent(null)
              }
            }}
            placeholder="New folder name..."
            className="flex-1 h-6 text-xs bg-transparent border-none outline-none focus:ring-0"
          />
        </div>
      )}

      {/* Tree view */}
      <ScrollArea className="flex-1">
        {/* Tree area */}
        <div className="rct-dark py-1">
          <UncontrolledTreeEnvironment
            key={treeKeyRef.current}
            dataProvider={dataProvider}
            getItemTitle={(item) => item.data.name}
            viewState={{}}
            canDragAndDrop
            canDropOnFolder
            canReorderItems
            canDropBelowOpenFolders
            canRename
            onRenameItem={(item, newName) => handleRename(item.index, newName)}
            onDrop={handleDrop as any}
            renderItemTitle={({ title }) => (
              <span className="text-sm truncate">{title}</span>
            )}
            renderItemArrow={({ item, context }) => {
              if (!item.isFolder) return <span className="w-4" />
              return (
                <span
                  className="w-4 flex items-center justify-center cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); context.toggleExpandedState() }}
                >
                  {context.isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </span>
              )
            }}
            renderItem={({ item, depth, children, title, context, arrow }) => {
                  const isFolder = item.data.type === 'folder'
                  const isSelected = context.isSelected
                  const isFocused = context.isFocused
                  const itemId = String(item.index)
                  const itemName = item.data.name
                  const isUploading = item.data.status === 'uploading'
                  const isFailed = item.data.status === 'failed'
                  const isPending = itemId.startsWith('pending-')

                  // Detect Ottawa sync folder (special folder with cloud icon)
                  const isOttawaFolder = isFolder && itemName.toLowerCase().includes('ottawa')

                  // Get upload progress for pending items
                  const uploadEntry = pendingUploads.get(itemId)

                  // Store rename trigger ref
                  renameRefsMap.current[itemId] = () => context.startRenamingItem()

                  return (
                    <li
                      {...(context.itemContainerWithChildrenProps as any)}
                      className="list-none"
                    >
                      {/* Right-click context menu per item */}
                      <ContextMenu>
                        <ContextMenuTrigger asChild>
                          <div
                            {...(context.itemContainerWithoutChildrenProps as any)}
                            {...(context.interactiveElementProps as any)}
                            className={cn(
                              'flex items-center gap-1.5 px-2 py-1 cursor-pointer rounded-sm mx-1 group',
                              'hover:bg-muted/50 transition-colors',
                              isSelected && 'bg-primary/10 text-primary',
                              isFocused && 'ring-1 ring-primary/30',
                              isUploading && 'opacity-70',
                            )}
                            style={{ paddingLeft: `${depth * 16 + 8}px` }}
                            onClick={() => {
                              // Notify parent of selection
                              const nodeType = isFolder ? 'folder' : 'file'
                              onNodeSelect?.(itemId, nodeType, itemName)
                            }}
                            onDoubleClick={() => {
                              if (!isFolder && !isPending) {
                                handlePreview(itemId, itemName)
                              }
                            }}
                          >
                            {arrow}

                            {/* Icon */}
                            {isOttawaFolder ? (
                              <Cloud className="h-4 w-4 text-blue-500 shrink-0" />
                            ) : isFolder ? (
                              context.isExpanded ? (
                                <FolderOpen className="h-4 w-4 text-amber-500 shrink-0" />
                              ) : (
                                <Folder className="h-4 w-4 text-amber-500 shrink-0" />
                              )
                            ) : isUploading ? (
                              <Loader2 className="h-4 w-4 text-blue-400 shrink-0 animate-spin" />
                            ) : isFailed ? (
                              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                            ) : (
                              <FileText className="h-4 w-4 text-red-400 shrink-0" />
                            )}

                            {/* Title + progress */}
                            <div className="flex-1 min-w-0">
                              <span className="text-sm truncate block">{title}</span>
                              {isUploading && uploadEntry && (
                                <Progress value={uploadEntry.progress} className="h-0.5 mt-0.5" />
                              )}
                            </div>

                            {/* Status indicator for files */}
                            {!isFolder && !isPending && item.data.status && item.data.status !== 'indexed' && (
                              <span className={cn(
                                'w-2 h-2 rounded-full shrink-0',
                                item.data.status === 'processing' && 'bg-blue-400 animate-pulse',
                                item.data.status === 'failed' && 'bg-red-400',
                                item.data.status === 'pending' && 'bg-amber-400',
                              )} />
                            )}

                            {/* Upload done indicator */}
                            {uploadEntry?.status === 'done' && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            )}
                          </div>
                        </ContextMenuTrigger>

                        {/* === VS Code-style context menu === */}
                        <ContextMenuContent className="w-52">
                          {/* File-specific actions */}
                          {!isFolder && !isPending && (
                            <>
                              <ContextMenuItem onClick={() => handlePreview(itemId, itemName)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </ContextMenuItem>
                              <ContextMenuItem onClick={() => handleDownload(itemId)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </ContextMenuItem>
                              <ContextMenuSeparator />
                            </>
                          )}

                          {/* Pending file actions */}
                          {isPending && !isFolder && (
                            <>
                              <ContextMenuItem onClick={() => handlePreview(itemId, itemName)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview (Local)
                              </ContextMenuItem>
                              <ContextMenuSeparator />
                            </>
                          )}

                          {/* Folder-specific actions */}
                          {isFolder && (
                            <>
                              <ContextMenuItem onClick={() => startCreatingFolder(itemId)}>
                                <FolderPlus className="h-4 w-4 mr-2" />
                                New Folder
                              </ContextMenuItem>
                              <ContextMenuItem onClick={() => triggerUploadInFolder(itemId)}>
                                <FilePlus className="h-4 w-4 mr-2" />
                                Upload File Here
                              </ContextMenuItem>
                              <ContextMenuSeparator />
                            </>
                          )}

                          {/* Common actions (not for pending items) */}
                          {!isPending && (
                            <>
                              <ContextMenuItem onClick={() => renameRefsMap.current[itemId]?.()}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Rename
                                <span className="ml-auto text-xs text-muted-foreground">F2</span>
                              </ContextMenuItem>

                              <ContextMenuItem onClick={() => handleCopyName(itemName)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Name
                              </ContextMenuItem>

                              <ContextMenuSub>
                                <ContextMenuSubTrigger>
                                  <FolderInput className="h-4 w-4 mr-2" />
                                  Move To...
                                </ContextMenuSubTrigger>
                                <ContextMenuSubContent className="w-44">
                                  <ContextMenuItem
                                    onClick={() => folderApi.moveNode(itemId, null).then(fetchTree)}
                                  >
                                    📁 Root
                                  </ContextMenuItem>
                                  {Object.values(treeItems)
                                    .filter(
                                      (ti) =>
                                        ti.isFolder &&
                                        ti.index !== 'root' &&
                                        ti.index !== item.index,
                                    )
                                    .map((folder) => (
                                      <ContextMenuItem
                                        key={String(folder.index)}
                                        onClick={() =>
                                          folderApi
                                            .moveNode(itemId, String(folder.index))
                                            .then(fetchTree)
                                        }
                                      >
                                        📁 {folder.data.name}
                                      </ContextMenuItem>
                                    ))}
                                </ContextMenuSubContent>
                              </ContextMenuSub>

                              <ContextMenuSeparator />

                              <ContextMenuItem
                                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                onClick={() => handleDelete(itemId, isFolder)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                                <span className="ml-auto text-xs text-muted-foreground">Del</span>
                              </ContextMenuItem>
                            </>
                          )}
                      </ContextMenuContent>
                      </ContextMenu>
                      {children}
                    </li>
                  )
                }}
              >
                <Tree treeId="file-explorer" rootItem="root" treeLabel="File Explorer" />
              </UncontrolledTreeEnvironment>
        </div>

        {/* Right-click on empty area: background context menu */}
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div className="min-h-[120px] flex-1">
              {/* Empty state */}
              {treeItems.root?.children?.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">No files yet</p>
                  <p className="text-xs text-muted-foreground/60 text-center">
                    Right-click to create folders or upload files to your knowledge base.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => triggerUploadInFolder(null)}
                  >
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    Upload PDF
                  </Button>
                </div>
              )}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-48">
            <ContextMenuItem onClick={() => startCreatingFolder(null)}>
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </ContextMenuItem>
            <ContextMenuItem onClick={() => triggerUploadInFolder(null)}>
              <FilePlus className="h-4 w-4 mr-2" />
              Upload File
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={fetchTree}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </ScrollArea>

      {/* Upload progress bar (shown when uploads are active) */}
      {activeUploads.length > 0 && (
        <div className="px-3 py-2 border-t border-border bg-muted/30">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <CloudUpload className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
            <span>
              Uploading {activeUploads.length} file{activeUploads.length > 1 ? 's' : ''}... {totalProgress}%
            </span>
          </div>
          <Progress value={totalProgress} className="h-1" />
        </div>
      )}

      {/* PDF Preview Dialog */}
      <PdfPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        url={previewUrl}
        fileName={previewName}
      />
    </div>
  )
}

export default FileExplorer

/**
 * EmbeddingModelManager - Page for embedding model management
 *
 * Lists installed embedding models, allows pulling new models and deletion.
 * Focused on vector embedding models for semantic search.
 *
 * @module features/admin/modules/embedding-models
 */

import { useCallback, useEffect, useState } from 'react'
import {
  Cpu,
  Download,
  HardDrive,
  Loader2,
  RefreshCw,
  Trash2,
  Cloud,
  Server,
  Info,
} from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Progress } from '@/shared/components/ui/progress'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/lib/utils'

import type { ModelInfo, PullProgress } from '../types'
import * as api from '../services/embedding-api'

// Known embedding models with dimensions
const EMBEDDING_MODEL_INFO: Record<string, { dimension: number; description: string }> = {
  'nomic-embed-text': { dimension: 768, description: 'General purpose text embeddings' },
  'mxbai-embed-large': { dimension: 1024, description: 'High quality multilingual embeddings' },
  'bge-m3': { dimension: 1024, description: 'Multi-Functionality, Multi-Linguality, Multi-Granularity' },
  'all-minilm': { dimension: 384, description: 'Lightweight, fast embeddings' },
  'snowflake-arctic-embed': { dimension: 1024, description: 'Retrieval optimized embeddings' },
}

export default function EmbeddingModelManager() {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pull model state
  const [pullDialogOpen, setPullDialogOpen] = useState(false)
  const [pullModelName, setPullModelName] = useState('')
  const [pullProgress, setPullProgress] = useState<PullProgress | null>(null)
  const [isPulling, setIsPulling] = useState(false)

  // Delete model state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [modelToDelete, setModelToDelete] = useState<ModelInfo | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadModels = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.listEmbeddingModels()
      setModels(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load models')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadModels()
  }, [loadModels])

  // Pull model handler
  const handlePullModel = async () => {
    if (!pullModelName.trim()) return
    setIsPulling(true)
    setPullProgress({ status: 'Starting...' })

    try {
      for await (const progress of api.pullModel(pullModelName.trim())) {
        setPullProgress(progress)
        if (progress.error) {
          setError(progress.error)
          break
        }
      }
      setPullDialogOpen(false)
      setPullModelName('')
      loadModels()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Pull failed')
    } finally {
      setIsPulling(false)
      setPullProgress(null)
    }
  }

  // Delete model handler
  const handleDeleteModel = async () => {
    if (!modelToDelete) return
    setIsDeleting(true)

    try {
      await api.deleteModel(modelToDelete.name)
      setDeleteDialogOpen(false)
      setModelToDelete(null)
      loadModels()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setIsDeleting(false)
    }
  }

  // Quick pull known model
  const handleQuickPull = (modelName: string) => {
    setPullModelName(modelName)
    setPullDialogOpen(true)
  }

  // Compute total size
  const totalSize = models.reduce((sum, m) => sum + (m.size || 0), 0)
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Embedding Models</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Vector embedding models for semantic search
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadModels} disabled={loading}>
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setPullDialogOpen(true)}>
            <Download className="h-4 w-4" />
            Pull Model
          </Button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
          <Button variant="ghost" size="sm" className="ml-2" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Installed Models
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{models.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Disk Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatSize(totalSize)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Installed Models */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Installed Embedding Models
          </CardTitle>
          <CardDescription>
            Models available for vector search and similarity matching
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : models.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No embedding models installed. Click "Pull Model" to download one.
            </p>
          ) : (
            <div className="space-y-2">
              {models.map((model) => {
                const baseName = model.name.split(':')[0]
                const info = EMBEDDING_MODEL_INFO[baseName]
                return (
                  <div
                    key={model.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {model.provider === 'azure' ? (
                        <Cloud className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Server className="h-5 w-5 text-cyan-500" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{model.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {model.provider}
                          </Badge>
                          {info && (
                            <Badge variant="outline" className="text-xs">
                              {info.dimension}d
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {model.size_formatted && <span>{model.size_formatted}</span>}
                          {info && <span>• {info.description}</span>}
                        </div>
                      </div>
                    </div>
                    {model.provider === 'ollama' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setModelToDelete(model)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommended Models */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Recommended Models
          </CardTitle>
          <CardDescription>
            Popular embedding models you can install
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(EMBEDDING_MODEL_INFO).map(([name, info]) => {
              const isInstalled = models.some((m) => m.name.startsWith(name))
              return (
                <div
                  key={name}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{name}</span>
                      <Badge variant="outline" className="text-xs">
                        {info.dimension}d
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{info.description}</p>
                  </div>
                  {isInstalled ? (
                    <Badge variant="secondary" className="text-xs">
                      Installed
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickPull(name)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pull Model Dialog */}
      <Dialog open={pullDialogOpen} onOpenChange={setPullDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pull Embedding Model</DialogTitle>
            <DialogDescription>
              Download an embedding model from Ollama registry.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Model name (e.g., nomic-embed-text)"
              value={pullModelName}
              onChange={(e) => setPullModelName(e.target.value)}
              disabled={isPulling}
            />
            {pullProgress && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{pullProgress.status}</p>
                {pullProgress.percent !== undefined && (
                  <Progress value={pullProgress.percent} />
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPullDialogOpen(false)} disabled={isPulling}>
              Cancel
            </Button>
            <Button onClick={handlePullModel} disabled={isPulling || !pullModelName.trim()}>
              {isPulling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Pulling...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Pull
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Model</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{modelToDelete?.name}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteModel} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

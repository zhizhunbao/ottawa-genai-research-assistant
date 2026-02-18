/**
 * LLMModelManager - Main page for LLM model management
 *
 * Lists installed models, allows pulling new models, testing, and deletion.
 *
 * @module features/admin/modules/llm-models
 * @reference lobe-chat model management UI
 */

import { useCallback, useEffect, useState } from 'react'
import {
  Brain,
  Download,
  HardDrive,
  Loader2,
  Play,
  RefreshCw,
  Trash2,
  Cpu,
  Cloud,
  Server,
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
import { Textarea } from '@/shared/components/ui/textarea'
import { cn } from '@/lib/utils'

import type { ModelInfo, PullProgress, TestResult, DiskUsageStats } from '../types'
import * as api from '../services/llm-model-api'

export default function LLMModelManager() {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [diskUsage, setDiskUsage] = useState<DiskUsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pull model state
  const [pullDialogOpen, setPullDialogOpen] = useState(false)
  const [pullModelName, setPullModelName] = useState('')
  const [pullProgress, setPullProgress] = useState<PullProgress | null>(null)
  const [isPulling, setIsPulling] = useState(false)

  // Test model state
  const [testDialogOpen, setTestDialogOpen] = useState(false)
  const [testModel, setTestModel] = useState<ModelInfo | null>(null)
  const [testPrompt, setTestPrompt] = useState('Hello! Tell me a fun fact.')
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [isTesting, setIsTesting] = useState(false)

  // Delete model state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [modelToDelete, setModelToDelete] = useState<ModelInfo | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadModels = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [modelsData, diskData] = await Promise.all([
        api.listModels(),
        api.getDiskUsage(),
      ])
      setModels(modelsData)
      setDiskUsage(diskData)
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

  // Test model handler
  const handleTestModel = async () => {
    if (!testModel || !testPrompt.trim()) return
    setIsTesting(true)
    setTestResult(null)

    try {
      const result = await api.testModel(testModel.name, testPrompt.trim())
      setTestResult(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Test failed')
    } finally {
      setIsTesting(false)
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

  const llmModels = models.filter((m) => m.model_type === 'llm')
  const embeddingModels = models.filter((m) => m.model_type === 'embedding')

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">LLM Models</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage Azure OpenAI and Ollama models
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
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={() => setError(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Disk usage stats */}
      {diskUsage && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Models
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{models.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ollama Models
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{diskUsage.model_count}</div>
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
              <div className="text-2xl font-bold">{diskUsage.total_size_formatted}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* LLM Models */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Chat Models
          </CardTitle>
          <CardDescription>
            Large language models for chat and text generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : llmModels.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No LLM models installed. Click "Pull Model" to download one.
            </p>
          ) : (
            <div className="space-y-2">
              {llmModels.map((model) => (
                <ModelRow
                  key={model.id}
                  model={model}
                  onTest={() => {
                    setTestModel(model)
                    setTestResult(null)
                    setTestDialogOpen(true)
                  }}
                  onDelete={() => {
                    setModelToDelete(model)
                    setDeleteDialogOpen(true)
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Embedding Models */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Embedding Models
          </CardTitle>
          <CardDescription>
            Vector embedding models for semantic search
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : embeddingModels.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No embedding models installed.
            </p>
          ) : (
            <div className="space-y-2">
              {embeddingModels.map((model) => (
                <ModelRow
                  key={model.id}
                  model={model}
                  onTest={() => {
                    setTestModel(model)
                    setTestResult(null)
                    setTestDialogOpen(true)
                  }}
                  onDelete={() => {
                    setModelToDelete(model)
                    setDeleteDialogOpen(true)
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pull Model Dialog */}
      <Dialog open={pullDialogOpen} onOpenChange={setPullDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pull Model</DialogTitle>
            <DialogDescription>
              Download a model from the Ollama registry. Popular models: llama3.1:8b,
              mistral:7b, nomic-embed-text
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Model name (e.g., llama3.1:8b)"
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
            <Button
              variant="outline"
              onClick={() => setPullDialogOpen(false)}
              disabled={isPulling}
            >
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

      {/* Test Model Dialog */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Test Model: {testModel?.name}</DialogTitle>
            <DialogDescription>
              Send a test prompt to verify the model is working correctly.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter your test prompt..."
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              rows={3}
              disabled={isTesting}
            />
            {testResult && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Latency: {testResult.latency_ms.toFixed(0)}ms</span>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm whitespace-pre-wrap">{testResult.response}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleTestModel} disabled={isTesting || !testPrompt.trim()}>
              {isTesting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Test
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Model</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{modelToDelete?.name}"? This will permanently
              remove the model files from disk.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteModel} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/** Model row component */
function ModelRow({
  model,
  onTest,
  onDelete,
}: {
  model: ModelInfo
  onTest: () => void
  onDelete: () => void
}) {
  const isAzure = model.provider === 'azure'

  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3">
        {isAzure ? (
          <Cloud className="h-5 w-5 text-blue-500" />
        ) : (
          <Server className="h-5 w-5 text-purple-500" />
        )}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{model.name}</span>
            <Badge variant={isAzure ? 'default' : 'secondary'} className="text-xs">
              {model.provider}
            </Badge>
          </div>
          {model.size_formatted && (
            <p className="text-xs text-muted-foreground">{model.size_formatted}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!isAzure && (
          <>
            <Button variant="ghost" size="sm" onClick={onTest}>
              <Play className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

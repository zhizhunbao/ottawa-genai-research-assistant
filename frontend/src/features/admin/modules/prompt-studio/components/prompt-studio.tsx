/**
 * PromptStudio - Main page for prompt template management
 *
 * Lists all prompts, allows editing, testing, and viewing versions.
 *
 * @module features/admin/modules/prompt-studio
 */

import { useCallback, useEffect, useState } from 'react'
import {
  FileText,
  RefreshCw,
  Save,
  Play,
  History,
  Loader2,
  ChevronDown,
  ChevronRight,
  Pencil,
  X,
  Check,
} from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
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

import type { PromptInfo, PromptListResponse, PromptTestResult, PromptVersion } from '../types'
import * as api from '../services/prompt-api'

const CATEGORY_LABELS: Record<string, string> = {
  system: 'System',
  rag_context: 'RAG Context',
  citation: 'Citation',
  chart: 'Chart',
  evaluation: 'Evaluation',
  no_results: 'No Results',
  custom: 'Custom',
}

const CATEGORY_COLORS: Record<string, string> = {
  system: 'bg-blue-500/10 text-blue-500',
  rag_context: 'bg-purple-500/10 text-purple-500',
  citation: 'bg-emerald-500/10 text-emerald-500',
  chart: 'bg-amber-500/10 text-amber-500',
  evaluation: 'bg-rose-500/10 text-rose-500',
  no_results: 'bg-slate-500/10 text-slate-500',
  custom: 'bg-cyan-500/10 text-cyan-500',
}

export default function PromptStudio() {
  const [data, setData] = useState<PromptListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit state
  const [editingPrompt, setEditingPrompt] = useState<PromptInfo | null>(null)
  const [editedTemplate, setEditedTemplate] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Test state
  const [testDialogOpen, setTestDialogOpen] = useState(false)
  const [testPrompt, setTestPrompt] = useState<PromptInfo | null>(null)
  const [testVariables, setTestVariables] = useState<Record<string, string>>({})
  const [testResult, setTestResult] = useState<PromptTestResult | null>(null)
  const [isTesting, setIsTesting] = useState(false)

  // Version history state
  const [versionsDialogOpen, setVersionsDialogOpen] = useState(false)
  const [versionsPrompt, setVersionsPrompt] = useState<PromptInfo | null>(null)
  const [versions, setVersions] = useState<PromptVersion[]>([])
  const [loadingVersions, setLoadingVersions] = useState(false)

  // Expanded categories
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['system', 'rag_context', 'evaluation'])
  )

  const loadPrompts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.listPrompts()
      setData(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load prompts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPrompts()
  }, [loadPrompts])

  // Group prompts by category
  const promptsByCategory = data?.prompts.reduce(
    (acc, prompt) => {
      const cat = prompt.category
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(prompt)
      return acc
    },
    {} as Record<string, PromptInfo[]>
  )

  const toggleCategory = (category: string) => {
    const next = new Set(expandedCategories)
    if (next.has(category)) {
      next.delete(category)
    } else {
      next.add(category)
    }
    setExpandedCategories(next)
  }

  // Start editing
  const handleEdit = (prompt: PromptInfo) => {
    setEditingPrompt(prompt)
    setEditedTemplate(prompt.template)
    setEditedDescription(prompt.description || '')
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingPrompt(null)
    setEditedTemplate('')
    setEditedDescription('')
  }

  // Save changes
  const handleSave = async () => {
    if (!editingPrompt) return
    setIsSaving(true)
    try {
      await api.updatePrompt(editingPrompt.id, {
        template: editedTemplate,
        description: editedDescription || undefined,
      })
      setEditingPrompt(null)
      loadPrompts()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  // Open test dialog
  const handleOpenTest = (prompt: PromptInfo) => {
    setTestPrompt(prompt)
    setTestVariables(
      prompt.variables.reduce((acc, v) => ({ ...acc, [v]: '' }), {})
    )
    setTestResult(null)
    setTestDialogOpen(true)
  }

  // Run test
  const handleTest = async () => {
    if (!testPrompt) return
    setIsTesting(true)
    setTestResult(null)
    try {
      const result = await api.testPrompt(testPrompt.id, testVariables)
      setTestResult(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Test failed')
    } finally {
      setIsTesting(false)
    }
  }

  // Open versions dialog
  const handleOpenVersions = async (prompt: PromptInfo) => {
    setVersionsPrompt(prompt)
    setVersionsDialogOpen(true)
    setLoadingVersions(true)
    try {
      const vers = await api.getVersions(prompt.id)
      setVersions(vers)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load versions')
    } finally {
      setLoadingVersions(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Prompt Studio</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Edit and manage prompt templates used by the RAG pipeline
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadPrompts} disabled={loading}>
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          Refresh
        </Button>
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
      {data && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(data.by_category).map(([cat, count]) => (
            <Badge key={cat} variant="outline" className={CATEGORY_COLORS[cat]}>
              {CATEGORY_LABELS[cat] || cat}: {count}
            </Badge>
          ))}
        </div>
      )}

      {/* Prompts by category */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(promptsByCategory || {}).map(([category, prompts]) => (
            <Card key={category}>
              <CardHeader
                className="cursor-pointer select-none"
                onClick={() => toggleCategory(category)}
              >
                <CardTitle className="flex items-center gap-2 text-base">
                  {expandedCategories.has(category) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <FileText className="h-4 w-4" />
                  {CATEGORY_LABELS[category] || category}
                  <Badge variant="secondary" className="ml-2">
                    {prompts.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              {expandedCategories.has(category) && (
                <CardContent className="space-y-4">
                  {prompts.map((prompt) => (
                    <PromptCard
                      key={prompt.id}
                      prompt={prompt}
                      isEditing={editingPrompt?.id === prompt.id}
                      editedTemplate={editedTemplate}
                      editedDescription={editedDescription}
                      onEditTemplateChange={setEditedTemplate}
                      onEditDescriptionChange={setEditedDescription}
                      onEdit={() => handleEdit(prompt)}
                      onCancelEdit={handleCancelEdit}
                      onSave={handleSave}
                      onTest={() => handleOpenTest(prompt)}
                      onViewVersions={() => handleOpenVersions(prompt)}
                      isSaving={isSaving}
                    />
                  ))}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Test Dialog */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Test Prompt: {testPrompt?.name}</DialogTitle>
            <DialogDescription>
              Fill in the variables and preview the rendered prompt.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {testPrompt?.variables.map((variable) => (
              <div key={variable}>
                <label className="text-sm font-medium">{`{${variable}}`}</label>
                <Input
                  placeholder={`Enter ${variable}...`}
                  value={testVariables[variable] || ''}
                  onChange={(e) =>
                    setTestVariables({ ...testVariables, [variable]: e.target.value })
                  }
                />
              </div>
            ))}
            {testPrompt?.variables.length === 0 && (
              <p className="text-sm text-muted-foreground">
                This prompt has no variables.
              </p>
            )}
            {testResult && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Rendered Prompt:</label>
                <div className="rounded-lg bg-muted p-4 text-sm whitespace-pre-wrap max-h-64 overflow-auto">
                  {testResult.rendered}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleTest} disabled={isTesting}>
              {isTesting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Test
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Versions Dialog */}
      <Dialog open={versionsDialogOpen} onOpenChange={setVersionsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Version History: {versionsPrompt?.name}</DialogTitle>
            <DialogDescription>
              View previous versions of this prompt template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-auto">
            {loadingVersions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : versions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No version history available (default prompt).
              </p>
            ) : (
              versions.map((version) => (
                <div key={version.version} className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">v{version.version}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(version.created_at).toLocaleString()}
                    </span>
                  </div>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                    {version.template}
                  </pre>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVersionsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/** Individual prompt card */
function PromptCard({
  prompt,
  isEditing,
  editedTemplate,
  editedDescription,
  onEditTemplateChange,
  onEditDescriptionChange,
  onEdit,
  onCancelEdit,
  onSave,
  onTest,
  onViewVersions,
  isSaving,
}: {
  prompt: PromptInfo
  isEditing: boolean
  editedTemplate: string
  editedDescription: string
  onEditTemplateChange: (value: string) => void
  onEditDescriptionChange: (value: string) => void
  onEdit: () => void
  onCancelEdit: () => void
  onSave: () => void
  onTest: () => void
  onViewVersions: () => void
  isSaving: boolean
}) {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{prompt.name}</span>
            {prompt.is_default && (
              <Badge variant="outline" className="text-xs">
                Default
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              v{prompt.version}
            </Badge>
          </div>
          {prompt.description && (
            <p className="text-sm text-muted-foreground mt-1">{prompt.description}</p>
          )}
          {prompt.variables.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {prompt.variables.map((v) => (
                <Badge key={v} variant="outline" className="text-xs font-mono">
                  {`{${v}}`}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!isEditing && (
            <>
              <Button variant="ghost" size="sm" onClick={onTest}>
                <Play className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onViewVersions}>
                <History className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Pencil className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              value={editedDescription}
              onChange={(e) => onEditDescriptionChange(e.target.value)}
              placeholder="Prompt description..."
            />
          </div>
          <div>
            <label className="text-sm font-medium">Template</label>
            <Textarea
              value={editedTemplate}
              onChange={(e) => onEditTemplateChange(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onCancelEdit} disabled={isSaving}>
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button size="sm" onClick={onSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Save
            </Button>
          </div>
        </div>
      ) : (
        <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-32 whitespace-pre-wrap">
          {prompt.template}
        </pre>
      )}
    </div>
  )
}

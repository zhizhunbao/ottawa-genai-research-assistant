/**
 * SearchEngineManager - Page for search engine management
 *
 * Lists registered engines, shows stats, allows testing search queries.
 *
 * @module features/admin/modules/search-engines
 */

import { useCallback, useEffect, useState } from 'react'
import {
  Search,
  RefreshCw,
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  Database,
  Layers,
  Zap,
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
import { cn } from '@/lib/utils'

import type { EngineInfo, SearchTestResult } from '../types'
import * as api from '../services/search-api'

const ENGINE_ICONS: Record<string, React.ElementType> = {
  sqlite_fts: Database,
  page_index: Layers,
  azure_search: Zap,
}

const ENGINE_DESCRIPTIONS: Record<string, string> = {
  sqlite_fts: 'SQLite Full-Text Search with FTS5',
  page_index: 'Page-level semantic search index',
  azure_search: 'Azure AI Search (Vector + BM25)',
}

export default function SearchEngineManager() {
  const [engines, setEngines] = useState<EngineInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Test state
  const [testDialogOpen, setTestDialogOpen] = useState(false)
  const [testEngine, setTestEngine] = useState<string | null>(null)
  const [testQuery, setTestQuery] = useState('')
  const [testResult, setTestResult] = useState<SearchTestResult | null>(null)
  const [isTesting, setIsTesting] = useState(false)

  // Hybrid test
  const [hybridDialogOpen, setHybridDialogOpen] = useState(false)
  const [hybridQuery, setHybridQuery] = useState('')
  const [hybridResult, setHybridResult] = useState<SearchTestResult | null>(null)

  const loadEngines = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.listEngines()
      setEngines(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load engines')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEngines()
  }, [loadEngines])

  // Test single engine
  const handleTest = async () => {
    if (!testEngine || !testQuery.trim()) return
    setIsTesting(true)
    setTestResult(null)
    try {
      const result = await api.testEngine(testEngine, testQuery.trim())
      setTestResult(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Test failed')
    } finally {
      setIsTesting(false)
    }
  }

  // Test hybrid search
  const handleHybridTest = async () => {
    if (!hybridQuery.trim()) return
    setIsTesting(true)
    setHybridResult(null)
    try {
      const engineNames = engines.filter((e) => e.available).map((e) => e.name)
      const result = await api.testHybridSearch(hybridQuery.trim(), engineNames)
      setHybridResult(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Hybrid test failed')
    } finally {
      setIsTesting(false)
    }
  }

  const openTestDialog = (engineName: string) => {
    setTestEngine(engineName)
    setTestQuery('')
    setTestResult(null)
    setTestDialogOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Search Engines</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage and test search engine configurations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadEngines} disabled={loading}>
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setHybridDialogOpen(true)}>
            <Zap className="h-4 w-4" />
            Test Hybrid Search
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

      {/* Engine cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : engines.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No search engines registered. Check the application logs.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {engines.map((engine) => {
            const Icon = ENGINE_ICONS[engine.name] || Search
            const description = ENGINE_DESCRIPTIONS[engine.name] || engine.name
            const stats = engine.stats || {}

            return (
              <Card key={engine.name}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      {engine.name}
                    </div>
                    {engine.available ? (
                      <Badge variant="default" className="bg-emerald-500">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Online
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Offline
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(stats)
                      .filter(([k]) => !k.startsWith('error'))
                      .slice(0, 4)
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground capitalize">
                            {key.replace(/_/g, ' ')}:
                          </span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                  </div>

                  {/* Actions */}
                  {engine.available && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => openTestDialog(engine.name)}
                    >
                      <Play className="h-4 w-4" />
                      Test Search
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Single Engine Test Dialog */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Test Search: {testEngine}</DialogTitle>
            <DialogDescription>
              Enter a query to test this search engine.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter search query..."
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTest()}
            />
            {testResult && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Found {testResult.result_count} results
                </div>
                <div className="max-h-64 overflow-auto space-y-2">
                  {testResult.results.map((r, i) => (
                    <div key={i} className="rounded-lg border p-3 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium truncate">{r.title}</span>
                        <Badge variant="outline">{r.score.toFixed(3)}</Badge>
                      </div>
                      <p className="text-muted-foreground line-clamp-2">{r.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleTest} disabled={isTesting || !testQuery.trim()}>
              {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Search
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hybrid Test Dialog */}
      <Dialog open={hybridDialogOpen} onOpenChange={setHybridDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Test Hybrid Search</DialogTitle>
            <DialogDescription>
              Test search across all engines with RRF fusion.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter search query..."
              value={hybridQuery}
              onChange={(e) => setHybridQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleHybridTest()}
            />
            {hybridResult && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {hybridResult.engine} - {hybridResult.result_count} results
                </div>
                <div className="max-h-64 overflow-auto space-y-2">
                  {hybridResult.results.map((r, i) => (
                    <div key={i} className="rounded-lg border p-3 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium truncate">{r.title}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {r.engine}
                          </Badge>
                          <Badge variant="outline">{r.score.toFixed(3)}</Badge>
                        </div>
                      </div>
                      <p className="text-muted-foreground line-clamp-2">{r.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHybridDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleHybridTest} disabled={isTesting || !hybridQuery.trim()}>
              {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Search
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/**
 * SyncPanel - Ottawa ED Update PDF catalog with tabbed source view & batch-sync
 *
 * Simplified design:
 *   - Compact header with title + inline stats + action buttons
 *   - Source tabs preserved
 *   - Year filter pills
 *   - Clean table with Document / Status / Actions columns
 *
 * @module features/research/components
 */

import { useState, useEffect, useCallback } from 'react'
import {
  RefreshCw,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Sparkles,
  Check,
  Trash2,
  RotateCcw,
  Unlink,
  Globe,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Progress } from '@/shared/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs'
import {
  syncApi,
  type CatalogItem,
  type CatalogResponse,
} from '../../services/sync-api'

// ============================================================
// Types
// ============================================================

export interface SyncPanelProps {
  onSyncComplete?: () => void
  onPreview?: (item: CatalogItem) => void
  previewingId?: string | null
  embedded?: boolean
}

type YearFilter = 'all' | number

// ============================================================
// Status config
// ============================================================

const STATUS_CONFIG = {
  pending: {
    label: 'Downloaded',
    className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    icon: Clock,
  },
  indexed: {
    label: 'Indexed',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    icon: CheckCircle2,
  },
  processing: {
    label: 'Processing',
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    icon: Loader2,
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    icon: AlertCircle,
  },
} as const

// ============================================================
// Sub-components
// ============================================================

function StatusBadge({ item, urlAvailable }: { item: CatalogItem; urlAvailable: boolean | null }) {
  if (urlAvailable === false && !item.imported) {
    return (
      <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0 bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border-zinc-500/20">
        <Unlink className="h-2.5 w-2.5" />
        Broken
      </Badge>
    )
  }

  if (!item.imported) {
    if (urlAvailable === true) {
      return (
        <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
          <CheckCircle2 className="h-2.5 w-2.5" />
          Available
        </Badge>
      )
    }
    return <span className="text-xs text-muted-foreground">—</span>
  }

  const statusInfo = item.status ? STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] : null
  if (statusInfo) {
    return (
      <Badge variant="outline" className={cn('text-[10px] gap-1 px-1.5 py-0', statusInfo.className)}>
        <statusInfo.icon className={cn('h-2.5 w-2.5', item.status === 'processing' && 'animate-spin')} />
        {statusInfo.label}
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
      <CheckCircle2 className="h-2.5 w-2.5" />
      Imported
    </Badge>
  )
}

// ============================================================
// Main Component
// ============================================================

export function SyncPanel({ onSyncComplete, onPreview, previewingId, embedded = false }: SyncPanelProps) {
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [syncResult, setSyncResult] = useState<{ queued: number; failed: number } | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [yearFilter, setYearFilter] = useState<YearFilter>('all')
  const [urlAvailability, setUrlAvailability] = useState<Record<string, boolean>>({})
  const [checkingUrls, setCheckingUrls] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [activeSource, setActiveSource] = useState<string>('')

  // ---- Fetch catalog ----
  const fetchCatalog = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await syncApi.getCatalog()
      setCatalog(data)
      if (data.sources.length > 0 && !activeSource) {
        setActiveSource(data.sources[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load catalog')
    } finally {
      setLoading(false)
    }
  }, [activeSource])

  useEffect(() => { fetchCatalog() }, [fetchCatalog])

  // ---- Check URL availability ----
  const handleCheckUrls = useCallback(async () => {
    setCheckingUrls(true)
    try {
      const result = await syncApi.checkUrls()
      setUrlAvailability(result.availability)
    } catch { /* silent */ } finally {
      setCheckingUrls(false)
    }
  }, [])

  useEffect(() => {
    if (catalog && Object.keys(urlAvailability).length === 0) handleCheckUrls()
  }, [catalog]) // eslint-disable-line react-hooks/exhaustive-deps

  const getUrlAvailable = useCallback((item: CatalogItem): boolean | null => {
    if (item.url_available !== null) return item.url_available
    if (item.id in urlAvailability) return urlAvailability[item.id]
    return null
  }, [urlAvailability])

  // ---- Selection ----
  const toggleItem = useCallback((id: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const selectAllMissing = useCallback(() => {
    if (!catalog) return
    setSelectedItems(new Set(
      catalog.items.filter(i => !i.imported && getUrlAvailable(i) !== false).map(i => i.id)
    ))
  }, [catalog, getUrlAvailable])

  const clearSelection = useCallback(() => setSelectedItems(new Set()), [])

  const allMissingSelected = catalog
    ? catalog.items.filter(i => !i.imported && getUrlAvailable(i) !== false).length > 0 &&
      catalog.items.filter(i => !i.imported && getUrlAvailable(i) !== false).every(i => selectedItems.has(i.id))
    : false

  const toggleSelectAll = useCallback(() => {
    allMissingSelected ? clearSelection() : selectAllMissing()
  }, [allMissingSelected, clearSelection, selectAllMissing])

  // ---- Sync ----
  const handleSync = useCallback(async () => {
    if (!catalog) return
    setSyncing(true); setSyncResult(null); setSyncProgress(10)
    try {
      const ids = selectedItems.size > 0 ? Array.from(selectedItems) : undefined
      setSyncProgress(30)
      const result = await syncApi.syncDocuments(ids)
      setSyncProgress(100)
      setSyncResult({ queued: result.queued, failed: result.failed })
      await fetchCatalog(); setSelectedItems(new Set()); onSyncComplete?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setSyncing(false); setTimeout(() => setSyncProgress(0), 2000)
    }
  }, [catalog, selectedItems, fetchCatalog, onSyncComplete])

  const handleSyncSingle = useCallback(async (id: string) => {
    setActionLoading(id)
    try { await syncApi.syncDocuments([id]); await fetchCatalog(); onSyncComplete?.() }
    catch (err) { setError(err instanceof Error ? err.message : 'Sync failed') }
    finally { setActionLoading(null) }
  }, [fetchCatalog, onSyncComplete])

  const handleRetry = useCallback(async (id: string) => {
    setActionLoading(id)
    try { await syncApi.retryDocument(id); await fetchCatalog(); onSyncComplete?.() }
    catch (err) { setError(err instanceof Error ? err.message : 'Retry failed') }
    finally { setActionLoading(null) }
  }, [fetchCatalog, onSyncComplete])

  const handleDelete = useCallback(async (id: string) => {
    setActionLoading(id)
    try { await syncApi.deleteDocument(id); await fetchCatalog(); onSyncComplete?.() }
    catch (err) { setError(err instanceof Error ? err.message : 'Delete failed') }
    finally { setActionLoading(null) }
  }, [fetchCatalog, onSyncComplete])

  // ---- Filter ----
  const filteredItems = catalog?.items.filter(item => {
    if (yearFilter !== 'all' && item.year !== yearFilter) return false
    if (activeSource && item.source !== activeSource) return false
    return true
  }) ?? []

  const missingCount = catalog?.items.filter(i => !i.imported && getUrlAvailable(i) !== false).length ?? 0
  const years = [...new Set(catalog?.items.map(i => i.year) ?? [])].sort()
  const sources = catalog?.sources ?? []

  // ---- Loading ----
  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  // ---- Error ----
  if (error && !catalog) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <AlertCircle className="h-6 w-6 text-destructive" />
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchCatalog}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry
        </Button>
      </div>
    )
  }

  return (
    <div className={cn(embedded ? 'p-4' : 'p-4')}>
      {/* ── Header: title + stats + actions ── */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Ottawa ED Documents</h3>
          <span className="text-xs text-muted-foreground">
            {catalog?.imported_count ?? 0}/{catalog?.total ?? 0}
          </span>
          {checkingUrls && (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          )}
          {missingCount > 0 && !checkingUrls && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-primary border-primary/30">
              {missingCount} available
            </Badge>
          )}
          {missingCount === 0 && !checkingUrls && (
            <Badge variant="secondary" className="text-[10px] gap-1 px-1.5 py-0">
              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
              All imported
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          {missingCount > 0 && (
            <Button size="sm" className="h-7 text-xs gap-1" onClick={handleSync} disabled={syncing}>
              {syncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              {syncing ? 'Syncing…' : selectedItems.size > 0 ? `Sync (${selectedItems.size})` : 'Sync All'}
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCheckUrls} disabled={checkingUrls} title="Check URLs">
            <Globe className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={fetchCatalog} title="Refresh">
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Sync progress */}
      {syncing && <Progress value={syncProgress} className="h-1 mb-3" />}

      {/* Sync result */}
      {syncResult && (
        <div className={cn(
          'mb-3 flex items-center gap-2 px-3 py-1.5 rounded-md text-xs',
          syncResult.failed > 0 ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'
        )}>
          {syncResult.failed > 0 ? <AlertCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          {syncResult.queued} document{syncResult.queued !== 1 ? 's' : ''} synced
          {syncResult.failed > 0 && ` · ${syncResult.failed} failed`}
        </div>
      )}

      {error && catalog && (
        <div className="mb-3 flex items-center gap-2 px-3 py-1.5 rounded-md text-xs bg-destructive/10 text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />{error}
        </div>
      )}

      {/* ── Source tabs + content ── */}
      <Tabs value={activeSource || sources[0] || ''} onValueChange={setActiveSource}>
        {/* Source tabs */}
        {sources.length > 0 && (
          <TabsList className="mb-3 w-full justify-start h-8">
            {sources.map(source => {
              const count = catalog?.items.filter(i => i.source === source).length ?? 0
              return (
                <TabsTrigger key={source} value={source} className="gap-1.5 text-xs h-7">
                  <Globe className="h-3 w-3" />
                  {source}
                  <Badge variant="secondary" className="text-[9px] px-1 py-0 ml-0.5 h-4">{count}</Badge>
                </TabsTrigger>
              )
            })}
          </TabsList>
        )}

        {/* Year filter pills */}
        <div className="flex items-center gap-1 mb-2">
          <button
            onClick={() => setYearFilter('all')}
            className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium transition-colors border',
              yearFilter === 'all'
                ? 'bg-foreground text-background border-foreground'
                : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
            )}
          >All</button>
          {years.map(year => (
            <button
              key={year}
              onClick={() => setYearFilter(yearFilter === year ? 'all' : year)}
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium transition-colors border',
                yearFilter === year
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
              )}
            >{year}</button>
          ))}
          {missingCount > 0 && (
            <button
              onClick={toggleSelectAll}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {allMissingSelected ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {/* Tab content */}
        {sources.map(source => (
          <TabsContent key={source} value={source} className="mt-0">
            <CatalogTable
              items={filteredItems}
              missingCount={missingCount}
              selectedItems={selectedItems}
              previewingId={previewingId ?? null}
              actionLoading={actionLoading}
              syncing={syncing}
              getUrlAvailable={getUrlAvailable}
              onToggleItem={toggleItem}
              onToggleSelectAll={toggleSelectAll}
              allMissingSelected={allMissingSelected}
              onPreview={onPreview}
              onSyncSingle={handleSyncSingle}
              onRetry={handleRetry}
              onDelete={handleDelete}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

// ============================================================
// CatalogTable
// ============================================================

interface CatalogTableProps {
  items: CatalogItem[]
  missingCount: number
  selectedItems: Set<string>
  previewingId: string | null
  actionLoading: string | null
  syncing: boolean
  getUrlAvailable: (item: CatalogItem) => boolean | null
  onToggleItem: (id: string) => void
  onToggleSelectAll: () => void
  allMissingSelected: boolean
  onPreview?: (item: CatalogItem) => void
  onSyncSingle: (id: string) => void
  onRetry: (id: string) => void
  onDelete: (id: string) => void
}

function CatalogTable({
  items,
  missingCount,
  selectedItems,
  previewingId,
  actionLoading,
  syncing,
  getUrlAvailable,
  onToggleItem,
  onToggleSelectAll,
  allMissingSelected,
  onPreview,
  onSyncSingle,
  onRetry,
  onDelete,
}: CatalogTableProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground border rounded-lg">
        No documents match this filter.
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            {missingCount > 0 && (
              <th className="w-8 px-2 py-2 text-center">
                <button
                  onClick={onToggleSelectAll}
                  className={cn(
                    'w-3.5 h-3.5 rounded border flex items-center justify-center transition-all',
                    allMissingSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30 hover:border-primary/50'
                  )}
                >
                  {allMissingSelected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                </button>
              </th>
            )}
            <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
              Document
            </th>
            <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wider w-24">
              Status
            </th>
            <th className="text-right px-3 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wider w-28">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => {
            const isSelected = selectedItems.has(item.id)
            const isPreviewing = previewingId === item.id
            const urlAvail = getUrlAvailable(item)
            const isUrlBroken = urlAvail === false && !item.imported
            const isActionBusy = actionLoading === item.id

            return (
              <tr
                key={item.id}
                className={cn(
                  'border-b last:border-b-0 transition-colors group',
                  isPreviewing
                    ? 'bg-primary/8 border-l-2 border-l-primary'
                    : isUrlBroken
                      ? 'bg-zinc-500/5 opacity-50'
                      : isSelected
                        ? 'bg-primary/5'
                        : 'bg-background hover:bg-muted/30',
                  !item.imported && !isUrlBroken && 'cursor-pointer',
                )}
                onClick={() => {
                  if (!item.imported && !isUrlBroken) onToggleItem(item.id)
                }}
              >
                {/* Checkbox */}
                {missingCount > 0 && (
                  <td className="px-2 py-2 text-center">
                    {!item.imported && !isUrlBroken ? (
                      <div className={cn(
                        'w-3.5 h-3.5 rounded border flex items-center justify-center transition-all mx-auto',
                        isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30 group-hover:border-primary/50'
                      )}>
                        {isSelected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                      </div>
                    ) : item.imported ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mx-auto" />
                    ) : (
                      <Unlink className="h-3 w-3 text-zinc-400 mx-auto" />
                    )}
                  </td>
                )}

                {/* Document title + period */}
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-sm truncate',
                      isUrlBroken && 'line-through text-muted-foreground',
                      item.imported && !isUrlBroken && 'text-muted-foreground',
                      isPreviewing && 'text-primary font-medium',
                    )}>
                      {item.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60 shrink-0">
                      {item.quarter} {item.year}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-3 py-2">
                  <StatusBadge item={item} urlAvailable={urlAvail} />
                </td>

                {/* Actions */}
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-0.5">
                    {isActionBusy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        {/* Preview */}
                        <Button
                          variant={isPreviewing ? 'secondary' : 'ghost'}
                          size="icon"
                          className="h-6 w-6"
                          title="Preview"
                          disabled={isUrlBroken}
                          onClick={e => { e.stopPropagation(); onPreview?.(item) }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>

                        {/* Open URL */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          title="Open URL"
                          onClick={e => { e.stopPropagation(); window.open(item.url, '_blank') }}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>

                        {/* Download (not imported) */}
                        {!item.imported && !isUrlBroken && (
                          <Button variant="ghost" size="icon" className="h-6 w-6" title="Download"
                            onClick={e => { e.stopPropagation(); onSyncSingle(item.id) }} disabled={syncing}>
                            <Download className="h-3 w-3" />
                          </Button>
                        )}

                        {/* Retry (failed) */}
                        {item.imported && item.status === 'failed' && (
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-amber-600" title="Retry"
                            onClick={e => { e.stopPropagation(); onRetry(item.id) }}>
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        )}

                        {/* Delete */}
                        {item.imported && ['pending', 'indexed', 'failed'].includes(item.status ?? '') && (
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" title="Remove"
                            onClick={e => { e.stopPropagation(); onDelete(item.id) }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default SyncPanel

/**
 * SyncPanel - Ottawa ED Update PDF catalog with tabbed source view & batch-sync
 *
 * Features:
 *   - Source tabs at the top (e.g. documents.ottawa.ca)
 *   - Full status-based action matrix:
 *       not_imported:  Preview · Open URL · Sync
 *       pending:       Preview · Open URL · Delete (downloaded, not processed)
 *       processing:    Preview · Open URL
 *       indexed:       Preview · Open URL · Delete
 *       failed:        Preview · Open URL · Retry · Delete
 *       url_unavailable: Open URL (disabled Preview/Sync)
 *   - Auto URL availability checking on load
 *   - Batch select & sync (download only)
 *
 * Preview is handled externally by the parent (DocumentsView) via
 * `onPreview` callback — opens in a browser-side sidebar panel.
 *
 * @module features/documents/components
 */

import { useState, useEffect, useCallback } from 'react'
import {
  RefreshCw,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CloudDownload,
  ExternalLink,
  ChevronDown,
  ChevronUp,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Progress } from '@/shared/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs'
import {
  syncApi,
  type CatalogItem,
  type CatalogResponse,
} from '../services/sync-api'

// ============================================================
// Types
// ============================================================

export interface SyncPanelProps {
  onSyncComplete?: () => void
  /** Called when the user clicks Preview on a catalog item */
  onPreview?: (item: CatalogItem) => void
  /** ID of the currently previewed item (to highlight the row) */
  previewingId?: string | null
  /** If true, renders without Card wrapper (for embedding in Sheet/Drawer) */
  embedded?: boolean
}

type YearFilter = 'all' | number

// ============================================================
// Style constants
// ============================================================

const YEAR_COLORS: Record<number, string> = {
  2022: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  2023: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  2024: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  2025: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
}

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
  // URL not available & not yet imported
  if (urlAvailable === false && !item.imported) {
    return (
      <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0 bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border-zinc-500/20">
        <Unlink className="h-2.5 w-2.5" />
        Link Broken
      </Badge>
    )
  }

  if (!item.imported) {
    // URL available but not imported — show availability or dash
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
  const [syncResult, setSyncResult] = useState<{
    queued: number
    failed: number
  } | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [yearFilter, setYearFilter] = useState<YearFilter>('all')
  const [expanded, setExpanded] = useState(true)
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
      // Default to first source tab
      if (data.sources.length > 0 && !activeSource) {
        setActiveSource(data.sources[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load catalog')
    } finally {
      setLoading(false)
    }
  }, [activeSource])

  useEffect(() => {
    fetchCatalog()
  }, [fetchCatalog])

  // ---- Check URL availability (auto-triggered after catalog loads) ----
  const handleCheckUrls = useCallback(async () => {
    setCheckingUrls(true)
    try {
      const result = await syncApi.checkUrls()
      setUrlAvailability(result.availability)
    } catch {
      // Silently fail, availability is optional
    } finally {
      setCheckingUrls(false)
    }
  }, [])

  // Auto-check URLs once catalog is loaded
  useEffect(() => {
    if (catalog && Object.keys(urlAvailability).length === 0) {
      handleCheckUrls()
    }
  }, [catalog]) // eslint-disable-line react-hooks/exhaustive-deps

  // Merge url_available from both catalog and manual check
  const getUrlAvailable = useCallback((item: CatalogItem): boolean | null => {
    if (item.url_available !== null) return item.url_available
    if (item.id in urlAvailability) return urlAvailability[item.id]
    return null
  }, [urlAvailability])

  // ---- Selection handlers ----
  const toggleItem = useCallback((id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const selectAllMissing = useCallback(() => {
    if (!catalog) return
    const missing = catalog.items
      .filter((item) => !item.imported && getUrlAvailable(item) !== false)
      .map((item) => item.id)
    setSelectedItems(new Set(missing))
  }, [catalog, getUrlAvailable])

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set())
  }, [])

  const allMissingSelected = catalog
    ? catalog.items.filter((i) => !i.imported && getUrlAvailable(i) !== false).length > 0 &&
      catalog.items.filter((i) => !i.imported && getUrlAvailable(i) !== false).every((i) => selectedItems.has(i.id))
    : false

  const toggleSelectAll = useCallback(() => {
    if (allMissingSelected) {
      clearSelection()
    } else {
      selectAllMissing()
    }
  }, [allMissingSelected, clearSelection, selectAllMissing])

  // ---- Sync handler (batch) ----
  const handleSync = useCallback(async () => {
    if (!catalog) return

    setSyncing(true)
    setSyncResult(null)
    setSyncProgress(10)

    try {
      const ids = selectedItems.size > 0 ? Array.from(selectedItems) : undefined
      setSyncProgress(30)

      const result = await syncApi.syncDocuments(ids)

      setSyncProgress(100)
      setSyncResult({ queued: result.queued, failed: result.failed })

      await fetchCatalog()
      setSelectedItems(new Set())
      onSyncComplete?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncProgress(0), 2000)
    }
  }, [catalog, selectedItems, fetchCatalog, onSyncComplete])

  // ---- Sync single item ----
  const handleSyncSingle = useCallback(async (catalogId: string) => {
    setActionLoading(catalogId)
    try {
      await syncApi.syncDocuments([catalogId])
      await fetchCatalog()
      onSyncComplete?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setActionLoading(null)
    }
  }, [fetchCatalog, onSyncComplete])

  // ---- Retry handler ----
  const handleRetry = useCallback(async (catalogId: string) => {
    setActionLoading(catalogId)
    try {
      await syncApi.retryDocument(catalogId)
      await fetchCatalog()
      onSyncComplete?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Retry failed')
    } finally {
      setActionLoading(null)
    }
  }, [fetchCatalog, onSyncComplete])

  // ---- Delete handler ----
  const handleDelete = useCallback(async (catalogId: string) => {
    setActionLoading(catalogId)
    try {
      await syncApi.deleteDocument(catalogId)
      await fetchCatalog()
      onSyncComplete?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setActionLoading(null)
    }
  }, [fetchCatalog, onSyncComplete])

  // ---- Filter & group items ----
  const filteredItems = catalog?.items.filter((item) => {
    if (yearFilter !== 'all' && item.year !== yearFilter) return false
    if (activeSource && item.source !== activeSource) return false
    return true
  }) ?? []

  const missingCount = catalog?.items.filter(
    (i) => !i.imported && getUrlAvailable(i) !== false,
  ).length ?? 0
  const years = [2022, 2023, 2024, 2025]

  // ---- Loading state ----
  // ---- Loading state ----
  if (loading) {
    const content = (
      <div className="flex justify-center items-center py-16">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading Ottawa ED Update catalog...</p>
        </div>
      </div>
    )
    if (embedded) return content
    return <Card className="overflow-hidden"><CardContent>{content}</CardContent></Card>
  }

  // ---- Error state ----
  if (error && !catalog) {
    const content = (
      <div className="flex justify-center items-center py-16">
        <div className="text-center space-y-3">
          <AlertCircle className="h-8 w-8 mx-auto text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchCatalog}>
            <RefreshCw className="h-4 w-4 mr-2" /> Retry
          </Button>
        </div>
      </div>
    )
    if (embedded) return content
    return <Card className="overflow-hidden border-destructive/30"><CardContent>{content}</CardContent></Card>
  }

  const sources = catalog?.sources ?? []

  // Wrapper components based on embedded mode
  const Wrapper = embedded ? 'div' : Card
  const HeaderWrapper = embedded ? 'div' : CardHeader
  const ContentWrapper = embedded ? 'div' : CardContent

  return (
    <Wrapper className={embedded ? '' : 'overflow-hidden'}>
      {/* Header */}
      <HeaderWrapper className={embedded ? 'pb-3 px-4 pt-4' : 'pb-3'}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <CloudDownload className="h-4.5 w-4.5 text-primary" />
              </div>
              {missingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center">
                  {missingCount}
                </span>
              )}
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                Ottawa Resources
                <Badge variant="outline" className="text-[10px] font-normal">
                  Q1 2022 – Q4 2025
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {catalog?.imported_count ?? 0} of {catalog?.total ?? 0} imported
                {checkingUrls && (
                  <span className="ml-1 text-muted-foreground/60">
                    · checking links...
                  </span>
                )}
                {missingCount > 0 && !checkingUrls && (
                  <span className="text-primary font-medium ml-1">· {missingCount} available</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {missingCount > 0 && (
              <Button
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {syncing
                  ? 'Downloading...'
                  : selectedItems.size > 0
                    ? `Download Selected (${selectedItems.size})`
                    : `Download All (${missingCount})`
                }
              </Button>
            )}
            {missingCount === 0 && !checkingUrls && (
              <Badge variant="secondary" className="text-xs gap-1 h-8 px-3">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                All imported
              </Badge>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleCheckUrls}
              disabled={checkingUrls}
              title="Re-check URL availability"
            >
              {checkingUrls ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Globe className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={fetchCatalog}
              disabled={loading}
              title="Refresh catalog"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setExpanded(!expanded)}
              title={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {syncing && (
          <div className="mt-3">
            <Progress value={syncProgress} className="h-1.5" />
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" />
              Downloading documents...
            </p>
          </div>
        )}

        {syncResult && (
          <div className={cn(
            'mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
            syncResult.failed > 0
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          )}>
            {syncResult.failed > 0 ? (
              <AlertCircle className="h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            )}
            {syncResult.queued} document{syncResult.queued !== 1 ? 's' : ''} downloaded
            {syncResult.failed > 0 && ` · ${syncResult.failed} failed`}
          </div>
        )}

        {error && catalog && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-destructive/10 text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </HeaderWrapper>

      {expanded && (
        <ContentWrapper className={embedded ? 'px-4 pb-4' : 'pt-0'}>
          <Tabs
            value={activeSource || sources[0] || ''}
            onValueChange={setActiveSource}
          >
            {/* Source tabs */}
            {sources.length > 0 && (
              <TabsList className="mb-3 w-full justify-start">
                {sources.map((source) => {
                  const count = catalog?.items.filter((i) => i.source === source).length ?? 0
                  return (
                    <TabsTrigger key={source} value={source} className="gap-1.5 text-xs">
                      <Globe className="h-3 w-3" />
                      {source}
                      <Badge variant="secondary" className="text-[9px] px-1 py-0 ml-0.5 h-4">
                        {count}
                      </Badge>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            )}

            {/* Year filter pills + select all */}
            <div className="flex items-center gap-1.5 mb-3">
              <button
                onClick={() => setYearFilter('all')}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium transition-all border',
                  yearFilter === 'all'
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                )}
              >
                All
              </button>
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => setYearFilter(yearFilter === year ? 'all' : year)}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-medium transition-all border',
                    yearFilter === year
                      ? YEAR_COLORS[year] || 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                  )}
                >
                  {year}
                </button>
              ))}

              {missingCount > 0 && (
                <button
                  onClick={toggleSelectAll}
                  className="ml-auto px-2.5 py-1 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {allMissingSelected ? 'Deselect All' : 'Select All Missing'}
                </button>
              )}
            </div>

            {/* Tab content (one per source, but all share same table structure) */}
            {sources.map((source) => (
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
        </ContentWrapper>
      )}
    </Wrapper>
  )
}

// ============================================================
// CatalogTable — extracted for clarity
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
        No documents match the selected filter.
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            {missingCount > 0 && (
              <th className="w-10 px-3 py-2.5 text-center">
                <button
                  onClick={onToggleSelectAll}
                  className={cn(
                    'w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
                    allMissingSelected
                      ? 'bg-primary border-primary'
                      : 'border-muted-foreground/30 hover:border-primary/50'
                  )}
                >
                  {allMissingSelected && (
                    <Check className="h-3 w-3 text-primary-foreground" />
                  )}
                </button>
              </th>
            )}
            <th className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
              Document
            </th>
            <th className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider w-24">
              Period
            </th>
            <th className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider w-28">
              Status
            </th>
            <th className="text-right px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider w-36">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
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
                      ? 'bg-zinc-500/5 opacity-60'
                      : item.imported
                        ? 'bg-background'
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
                  <td className="px-3 py-2.5 text-center">
                    {!item.imported && !isUrlBroken ? (
                      <div
                        className={cn(
                          'w-4 h-4 rounded border-2 flex items-center justify-center transition-all mx-auto',
                          isSelected
                            ? 'bg-primary border-primary'
                            : 'border-muted-foreground/30 group-hover:border-primary/50',
                        )}
                      >
                        {isSelected && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                    ) : item.imported ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                    ) : (
                      <Unlink className="h-3.5 w-3.5 text-zinc-400 mx-auto" />
                    )}
                  </td>
                )}

                {/* Document title */}
                <td className="px-3 py-2.5">
                  <span className={cn(
                    'font-medium',
                    isUrlBroken && 'line-through text-muted-foreground',
                    item.imported && !isUrlBroken && 'text-muted-foreground',
                    isPreviewing && 'text-primary',
                  )}>
                    {item.title}
                  </span>
                </td>

                {/* Period */}
                <td className="px-3 py-2.5">
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] px-1.5 py-0', YEAR_COLORS[item.year])}
                  >
                    {item.quarter} {item.year}
                  </Badge>
                </td>

                {/* Status */}
                <td className="px-3 py-2.5">
                  <StatusBadge item={item} urlAvailable={urlAvail} />
                </td>

                {/* Actions — full status-based matrix */}
                <td className="px-3 py-2.5">
                  <div className="flex items-center justify-end gap-0.5">
                    {isActionBusy ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        {/* Preview — always except url broken */}
                        <Button
                          variant={isPreviewing ? 'secondary' : 'ghost'}
                          size="icon"
                          className="h-7 w-7"
                          title="Preview PDF"
                          disabled={isUrlBroken}
                          onClick={(e) => {
                            e.stopPropagation()
                            onPreview?.(item)
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>

                        {/* Open URL — always */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="Open original URL"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(item.url, '_blank')
                          }}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>

                        {/* Sync/Download — only for not-imported & url not broken */}
                        {!item.imported && !isUrlBroken && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Download this document"
                            onClick={(e) => {
                              e.stopPropagation()
                              onSyncSingle(item.id)
                            }}
                            disabled={syncing}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        {/* Retry — only for failed */}
                        {item.imported && item.status === 'failed' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-amber-600 hover:text-amber-700 dark:text-amber-400"
                            title="Retry pipeline"
                            onClick={(e) => {
                              e.stopPropagation()
                              onRetry(item.id)
                            }}
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        {/* Delete — for pending, indexed, or failed */}
                        {item.imported && (item.status === 'pending' || item.status === 'indexed' || item.status === 'failed') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-600 dark:text-red-400"
                            title="Remove from knowledge base"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDelete(item.id)
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

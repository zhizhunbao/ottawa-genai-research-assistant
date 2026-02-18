import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Database,
  Download,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ExternalLink,
  LayoutGrid,
  Search,
  CheckSquare,
  FileText,
  Archive,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Power,
  PowerOff,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Input } from '@/shared/components/ui/input'
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
  DialogTitle,
} from '@/shared/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { cn } from '@/lib/utils'

import type { CatalogItem, CatalogResponse } from '../types'
import * as api from '../services/datasource-api'
import { KnowledgeBaseList } from './knowledge/knowledge-base-list'

type SortKey = 'title' | 'date' | 'status'
type SortOrder = 'asc' | 'desc'

export default function DataSourceManager() {
  const [activeTab, setActiveTab] = useState('managed-catalogs')
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSource, setSelectedSource] = useState<string | 'all'>('all')
  const [disabledSources, setDisabledSources] = useState<Set<string>>(new Set())

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; order: SortOrder }>({
    key: 'date',
    order: 'desc',
  })

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<CatalogItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadCatalog = useCallback(async (checkUrls = false) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getCatalog(checkUrls)
      setCatalog(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load catalog')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'managed-catalogs') {
      loadCatalog()
    }
  }, [activeTab, loadCatalog])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedSource, disabledSources])

  // Enhanced statistics
  const stats = useMemo(() => {
    if (!catalog) return { total: 0, imported: 0, pending: 0, failed: 0, broken: 0 }
    return {
      total: catalog.items.length,
      imported: catalog.items.filter(i => i.imported && i.status === 'synced').length,
      pending: catalog.items.filter(i => !i.imported).length,
      failed: catalog.items.filter(i => i.status === 'failed').length,
      broken: catalog.items.filter(i => i.url_available === false).length
    }
  }, [catalog])

  const sourceStats = useMemo(() => {
    if (!catalog) return []
    const statsMap: Record<string, { total: number; imported: number; failed: number }> = {}
    
    catalog.items.forEach(item => {
      if (!statsMap[item.source]) {
        statsMap[item.source] = { total: 0, imported: 0, failed: 0 }
      }
      statsMap[item.source].total++
      if (item.imported && item.status === 'synced') statsMap[item.source].imported++
      if (item.status === 'failed') statsMap[item.source].failed++
    })

    return Object.entries(statsMap).map(([name, stats]) => ({
      name,
      ...stats,
      percent: Math.round((stats.imported / stats.total) * 100)
    }))
  }, [catalog])

  // Filtered and Sorted items
  const filteredItems = useMemo(() => {
    if (!catalog) return []
    let items = [...catalog.items]
    
    // Filter by enabled sources
    items = items.filter(item => !disabledSources.has(item.source))

    // Filter by selected individual source
    if (selectedSource !== 'all') {
      items = items.filter(i => i.source === selectedSource)
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.source.toLowerCase().includes(query) ||
          item.year.toString().includes(query)
      )
    }

    // Sort items
    items.sort((a, b) => {
      let comparison = 0
      if (sortConfig.key === 'title') {
        comparison = a.title.localeCompare(b.title)
      } else if (sortConfig.key === 'date') {
        const valA = a.year * 10 + (parseInt(a.quarter.replace('Q', '')) || 0)
        const valB = b.year * 10 + (parseInt(b.quarter.replace('Q', '')) || 0)
        comparison = valA - valB
      } else if (sortConfig.key === 'status') {
        const getStatusOrder = (item: CatalogItem) => {
          if (!item.imported) return 0
          if (item.status === 'synced') return 3
          if (item.status === 'processing') return 2
          return 1
        }
        comparison = getStatusOrder(a) - getStatusOrder(b)
      }
      return sortConfig.order === 'asc' ? comparison : -comparison
    })
    
    return items
  }, [catalog, searchQuery, selectedSource, disabledSources, sortConfig])

  // Paginated items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredItems.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredItems, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)

  // Handlers
  const handleSyncSelected = async (ids?: string[]) => {
    const targetIds = ids || Array.from(selectedItems)
    if (targetIds.length === 0) return
    
    setIsSyncing(true)
    try {
      await api.syncDocuments(targetIds)
      if (!ids) setSelectedItems(new Set())
      loadCatalog()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sync failed')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleDelete = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      await api.deleteDocument(itemToDelete.id)
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      loadCatalog()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleSource = (sourceName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const next = new Set(disabledSources)
    if (next.has(sourceName)) next.delete(sourceName)
    else next.add(sourceName)
    setDisabledSources(next)
  }

  const requestSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc',
    }))
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
    return sortConfig.order === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
  }

  return (
    <div className="p-6 space-y-6 flex flex-col h-full overflow-hidden bg-background/50">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Management</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Synchronize external catalogs and organize private knowledge clusters.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <Button 
              variant="outline" 
              size="sm" 
              className="h-9 px-3 text-xs font-bold border-muted-foreground/20"
              onClick={() => loadCatalog(true)}
              disabled={loading}
            >
              <RefreshCw className={cn("h-3.5 w-3.5 mr-2", loading && "animate-spin")} />
              Refresh Health
            </Button>
        </div>
      </div>

      {/* Global Dashboard Stats */}
      {activeTab === 'managed-catalogs' && !loading && catalog && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-emerald-500/5 border-emerald-500/10 h-20 flex items-center p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-700/70 uppercase tracking-widest leading-none mb-1">Indexed</p>
                <p className="text-xl font-bold">{stats.imported}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-primary/5 border-primary/10 h-20 flex items-center p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest leading-none mb-1">Available</p>
                <p className="text-xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-amber-500/5 border-amber-500/10 h-20 flex items-center p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20">
                <RefreshCw size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-amber-700/70 uppercase tracking-widest leading-none mb-1">Sync Issues</p>
                <p className="text-xl font-bold">{stats.failed}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-red-500/5 border-red-500/10 h-20 flex items-center p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600 border border-red-500/20">
                <XCircle size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-red-700/70 uppercase tracking-widest leading-none mb-1">Broken Links</p>
                <p className="text-xl font-bold">{stats.broken}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Main Tabs Interaction */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col space-y-4 overflow-hidden">
        <TabsList className="bg-muted/50 p-1 w-fit">
          <TabsTrigger value="managed-catalogs" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-6 py-2 text-xs font-bold uppercase tracking-tight">
            <LayoutGrid className="h-3.5 w-3.5 mr-2" /> Global Catalog
          </TabsTrigger>
          <TabsTrigger value="knowledge-bases" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-6 py-2 text-xs font-bold uppercase tracking-tight">
            <Database className="h-3.5 w-3.5 mr-2" /> Knowledge Clusters
          </TabsTrigger>
        </TabsList>

        <TabsContent value="managed-catalogs" className="flex-1 flex gap-6 overflow-hidden m-0">
          {/* Left Discovery Sidebar */}
          <div className="w-72 shrink-0 flex flex-col gap-4 overflow-hidden">
            <Card className="flex-1 border-muted/60 flex flex-col overflow-hidden bg-muted/5 shadow-sm">
              <CardHeader className="py-4 px-5 border-b bg-muted/20">
                <div className="flex items-center gap-2">
                   <Archive className="h-4 w-4 text-muted-foreground" />
                   <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Source Discovery</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 space-y-2 overflow-auto">
                <button
                  onClick={() => setSelectedSource('all')}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl transition-all border",
                    selectedSource === 'all' 
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20" 
                      : "bg-background hover:bg-muted border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <LayoutGrid size={16} />
                    <span className="text-sm font-bold">All Assets</span>
                  </div>
                  <Badge variant={selectedSource === 'all' ? 'secondary' : 'outline'} className="text-[10px] font-mono">
                    {catalog?.items.length || 0}
                  </Badge>
                </button>

                <div className="h-px bg-muted mx-2 my-2" />

                {sourceStats.map((source) => (
                  <div key={source.name} className="relative group">
                    <button
                      onClick={() => setSelectedSource(source.name)}
                      className={cn(
                        "w-full flex flex-col gap-2 p-3 rounded-xl transition-all border text-left",
                        selectedSource === source.name 
                          ? "bg-white border-primary shadow-sm" 
                          : "bg-background hover:bg-muted border-muted/50",
                        disabledSources.has(source.name) && "opacity-50"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm font-bold truncate max-w-[120px]">{source.name}</span>
                        <div className="flex items-center gap-1.5">
                           {source.failed > 0 && <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />}
                           <span className="text-[10px] font-bold text-muted-foreground">{source.percent}%</span>
                        </div>
                      </div>
                      
                      <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full transition-all duration-500", source.percent === 100 ? "bg-emerald-500" : "bg-primary")}
                          style={{ width: `${source.percent}%` }}
                        />
                      </div>
                    </button>
                    
                    <button
                      onClick={(e) => toggleSource(source.name, e)}
                      className={cn(
                        "absolute right-2 top-2 p-1.5 rounded-md transition-all",
                        disabledSources.has(source.name) 
                          ? "text-destructive hover:bg-destructive/10" 
                          : "text-emerald-600 hover:bg-emerald-500/10 opacity-0 group-hover:opacity-100"
                      )}
                      title={disabledSources.has(source.name) ? "Enable Source" : "Disable Source"}
                    >
                      {disabledSources.has(source.name) ? <PowerOff size={12} /> : <Power size={12} />}
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Document List Area */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <Card className="flex-1 flex flex-col overflow-hidden border-muted/60 shadow-sm">
              <CardHeader className="py-4 px-6 border-b flex-row items-center justify-between space-y-0 bg-background/50">
                <div className="flex items-center gap-3">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2 font-bold tracking-tight">
                      {selectedSource === 'all' ? 'Unified Catalog' : selectedSource}
                      {selectedSource !== 'all' && disabledSources.has(selectedSource) && (
                        <Badge variant="destructive" className="h-5 px-1.5 text-[9px] uppercase font-bold tracking-tighter">Disabled</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-[11px] font-medium text-muted-foreground/70 uppercase">
                      {filteredItems.length} documents identified
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Filter unified view..."
                      className="pl-9 h-8 bg-muted/30 border-none shadow-none text-xs"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="h-6 w-px bg-muted mx-1" />

                  {selectedItems.size > 0 ? (
                    <Button size="sm" className="h-8 px-3 text-xs font-bold shadow-sm" onClick={() => handleSyncSelected()} disabled={isSyncing}>
                      <Download className="h-3.5 w-3.5 mr-2" />
                      Sync ({selectedItems.size})
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="secondary"
                      className="h-8 px-3 text-xs font-bold border border-muted"
                      onClick={() => handleSyncSelected(filteredItems.filter(i => !i.imported).map(i => i.id))} 
                      disabled={isSyncing || filteredItems.every(i => i.imported)}
                    >
                      <Download className="h-3.5 w-3.5 mr-2" />
                      Auto-Sync Pending
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
                {error && (
                  <div className="m-4 p-3 rounded-lg border border-destructive/50 bg-destructive/5 text-xs text-destructive flex items-center justify-between">
                    <span className="font-medium">{error}</span>
                    <Button variant="ghost" size="sm" onClick={() => setError(null)} className="h-6 px-2 hover:bg-destructive/10">Dismiss</Button>
                  </div>
                )}
                
                <div className="flex-1 overflow-auto">
                  <Table className="relative">
                    <TableHeader className="bg-muted/30 sticky top-0 z-10 backdrop-blur-sm">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[40px] px-4 text-center">
                          <button 
                            className="h-4 w-4 rounded border border-primary/50 flex items-center justify-center transition-colors hover:border-primary"
                            onClick={() => {
                              const missing = filteredItems.filter(i => !i.imported)
                              if (selectedItems.size > 0) setSelectedItems(new Set())
                              else setSelectedItems(new Set(missing.map(i => i.id)))
                            }}
                          >
                            {selectedItems.size > 0 && <CheckSquare className="h-3 w-3 text-primary" />}
                          </button>
                        </TableHead>
                        <TableHead className="cursor-pointer select-none text-[11px] font-bold uppercase tracking-wider" onClick={() => requestSort('title')}>
                          <div className="flex items-center">
                            Asset Identity <SortIcon column="title" />
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer select-none text-[11px] font-bold uppercase tracking-wider text-center" onClick={() => requestSort('status')}>
                          <div className="flex items-center justify-center">
                            Process Status <SortIcon column="status" />
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer select-none text-[11px] font-bold uppercase tracking-wider text-center" onClick={() => requestSort('date')}>
                          <div className="flex items-center justify-center">
                            Discovery Date <SortIcon column="date" />
                          </div>
                        </TableHead>
                        <TableHead className="text-right pr-6 text-[11px] font-bold uppercase tracking-wider">Convenience</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-64 text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto opacity-10" />
                            <p className="text-xs text-muted-foreground mt-4 animate-pulse">Scanning federated sources...</p>
                          </TableCell>
                        </TableRow>
                      ) : paginatedItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-64 text-center text-muted-foreground p-8">
                            <div className="flex flex-col items-center gap-3">
                              <Archive size={40} className="opacity-10" />
                              <div className="space-y-1">
                                <p className="font-bold text-sm">No Assets Found</p>
                                <p className="text-xs opacity-60">Adjust your filters or enable sources in the discovery panel.</p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedItems.map(item => (
                          <TableRow key={item.id} className={cn("group transition-colors", !item.imported && "bg-primary/[0.02]")}>
                            <TableCell className="px-4 text-center">
                              {!item.imported && (
                                <button 
                                  className={cn("h-4 w-4 rounded border transition-all mx-auto", selectedItems.has(item.id) ? "bg-primary border-primary scale-110" : "border-muted-foreground/30 hover:border-primary")}
                                  onClick={() => {
                                    const next = new Set(selectedItems)
                                    if (next.has(item.id)) next.delete(item.id)
                                    else next.add(item.id)
                                    setSelectedItems(next)
                                  }}
                                >
                                  {selectedItems.has(item.id) && <CheckSquare className="h-3 w-3 text-white" />}
                                </button>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3 max-w-[340px]">
                                <FileText className={cn("h-4 w-4 shrink-0 transition-colors", item.imported ? "text-primary" : "text-muted-foreground/30")} />
                                <div className="flex flex-col min-w-0">
                                   <span className="truncate font-bold text-[13px] leading-tight" title={item.title}>{item.title}</span>
                                   <span className="truncate text-[10px] text-muted-foreground/60 mt-0.5">{item.source}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center gap-1">
                                <StatusBadge item={item} />
                                {item.url_available === false && (
                                  <Badge variant="destructive" className="h-3.5 px-1 text-[7px] border-none uppercase font-black bg-red-500/10 text-red-600 tracking-widest">
                                    Link Broken
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="text-[10px] font-mono font-bold text-muted-foreground/70 bg-muted/20 border-muted-foreground/5 px-1.5 h-5">
                                {item.year}-{item.quarter}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-4">
                              <div className="flex items-center justify-end gap-1.5">
                                {!item.imported && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-7 px-2 text-[10px] font-black text-primary hover:bg-primary/10 border border-primary/20 uppercase tracking-tighter" 
                                    onClick={() => handleSyncSelected([item.id])}
                                    disabled={isSyncing}
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    Process
                                  </Button>
                                )}
                                <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-muted border border-transparent hover:border-muted-foreground/10 rounded-lg" asChild title="Explore Source">
                                  <a href={item.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a>
                                </Button>
                                {item.imported && (
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-7 w-7 text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 rounded-lg" 
                                    onClick={() => { setItemToDelete(item); setDeleteDialogOpen(true); }}
                                    disabled={item.status === 'processing'}
                                    title="Purge Indices"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Intelligent Pagination */}
                {!loading && filteredItems.length > 0 && (
                  <div className="px-6 py-3 border-t bg-muted/5 flex items-center justify-between">
                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                      Entries <span className="text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> - {' '}
                      <span className="text-foreground">{Math.min(currentPage * itemsPerPage, filteredItems.length)}</span> of {' '}
                      <span className="text-foreground">{filteredItems.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[10px] font-bold uppercase transition-all"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-3 w-3 mr-1" /> Back
                      </Button>
                      <div className="flex items-center gap-1 font-mono text-[10px] font-bold px-3">
                        <span className="text-primary">{currentPage}</span>
                        <span className="opacity-30">/</span>
                        <span className="opacity-50">{totalPages}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[10px] font-bold uppercase transition-all"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="knowledge-bases" className="flex-1 overflow-auto m-0 animate-in fade-in slide-in-from-right-2 duration-300">
          <KnowledgeBaseList />
        </TabsContent>
      </Tabs>

      {/* Modern Purge Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-[400px] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-destructive/10 p-6 flex flex-col items-center text-destructive border-b border-destructive/20 text-center">
             <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
                <Trash2 className="h-6 w-6" />
             </div>
             <DialogTitle className="text-lg font-black uppercase tracking-tight">Irreversible Purge</DialogTitle>
             <p className="text-xs font-bold opacity-70 mt-1 uppercase">Vector Asset Liquidation</p>
          </div>
          <div className="p-6">
            <DialogDescription className="text-sm font-medium leading-relaxed text-center">
              Indices for <span className="font-black text-foreground underline decoration-destructive/30 decoration-2 underline-offset-4">"{itemToDelete?.title}"</span> will be purged.
              <br/><br/>
              <span className="text-[11px] opacity-70">The catalog anchor remains intact. Re-indexing will be required for future retrieval availability.</span>
            </DialogDescription>
            <DialogFooter className="mt-8 flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1 h-10 text-xs font-bold uppercase" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>Abort</Button>
              <Button variant="destructive" size="sm" className="flex-1 h-10 text-xs font-bold uppercase shadow-lg shadow-destructive/20" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Trash2 className="h-3.5 w-3.5 mr-2" />}
                Confirm Purge
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatusBadge({ item }: { item: CatalogItem }) {
  if (!item.imported) return <Badge variant="secondary" className="bg-transparent text-[9px] font-black border-dashed h-4 px-1.5 uppercase tracking-widest text-muted-foreground/50 border-muted-foreground/20">Inactive</Badge>
  if (item.status === 'processing') return <div className="flex items-center gap-1.5 text-[9px] text-amber-600 animate-pulse font-black uppercase tracking-widest"><Clock className="h-3 w-3" /> Syncing</div>
  if (item.status === 'failed') return <Badge variant="destructive" className="h-4 px-1.5 text-[9px] uppercase font-black border-none shadow-sm shadow-destructive/20 tracking-widest">Failed</Badge>
  return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600/20 border-none shadow-none h-4 px-1.5 text-[9px] uppercase font-black font-mono tracking-widest flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Ready</Badge>
}

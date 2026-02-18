import { useState, useEffect, useCallback } from 'react'
import { 
  FileText, 
  Search, 
  Trash2, 
  ExternalLink, 
  Clock, 
  Loader2,
  Archive,
  TrendingUp,
  XCircle
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Input } from '@/shared/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { knowledgeApi } from '../../services/knowledge-api'
import type { KBResponse, KBDocumentResponse } from '../../types'
import { cn } from '@/lib/utils'

interface KBDetailsProps {
  kbId: string
  onBack: () => void
}

export function KBDetails({ kbId, onBack }: KBDetailsProps) {
  const [kb, setKb] = useState<KBResponse | null>(null)
  const [docs, setDocs] = useState<KBDocumentResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [kbRes, docsRes] = await Promise.all([
        knowledgeApi.get(kbId),
        knowledgeApi.listDocuments(kbId)
      ])

      if (kbRes.success) setKb(kbRes.data)
      if (docsRes.success && docsRes.data) setDocs(docsRes.data.items)
      
      if (!kbRes.success || !docsRes.success) {
        setError(kbRes.error || docsRes.error || 'Failed to load details')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [kbId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredDocs = docs.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.file_name && doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading && !kb) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading data source details...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Dynamic Header & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
             <button onClick={onBack} className="hover:text-primary transition-colors">Workspace</button>
             <span>/</span>
             <span className="text-muted-foreground/80">{kb?.name || 'Loading'}</span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black tracking-tighter">{kb?.name || 'Data Pool'}</h2>
            {kb && (
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-2 h-5 bg-primary/5 text-primary border-primary/20">
                 {kb.type.replace('_', ' ')}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-bold border-muted-foreground/20 rounded-xl" onClick={loadData} disabled={loading}>
             <Loader2 className={cn("h-3.5 w-3.5 mr-2", loading && "animate-spin")} />
             Sync State
           </Button>
           <Button size="sm" className="h-9 px-4 text-xs font-bold rounded-xl shadow-lg shadow-primary/20">
             Import Assets
           </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Resource Intelligence Sidebar */}
        <div className="w-80 shrink-0 flex flex-col gap-4">
           <Card className="border-muted/40 shadow-sm bg-muted/5 overflow-hidden">
              <CardHeader className="py-4 px-5 border-b bg-muted/10">
                 <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Resource Intel</CardTitle>
                 </div>
              </CardHeader>
              <CardContent className="p-5 space-y-6">
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-muted-foreground">Indexing Efficiency</span>
                       <span className="text-xs font-black text-emerald-600">
                          {Math.round(((kb?.indexed_count || 0) / (kb?.doc_count || 1)) * 100)}%
                       </span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                       <div 
                          className="h-full bg-emerald-500 transition-all duration-1000" 
                          style={{ width: `${Math.round(((kb?.indexed_count || 0) / (kb?.doc_count || 1)) * 100)}%` }}
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-background rounded-2xl border border-muted/50">
                       <p className="text-[10px] font-black text-muted-foreground uppercase leading-none mb-2">Total</p>
                       <p className="text-xl font-black">{kb?.doc_count || 0}</p>
                    </div>
                    <div className="p-3 bg-background rounded-2xl border border-muted/50">
                       <p className="text-[10px] font-black text-muted-foreground uppercase leading-none mb-2">Ready</p>
                       <p className="text-xl font-black text-emerald-600">{kb?.indexed_count || 0}</p>
                    </div>
                 </div>

                 <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary mb-2">
                       <Clock size={12} />
                       Lifecycle
                    </div>
                    <div className="space-y-2">
                       <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground font-medium">Provisioned</span>
                          <span className="font-bold">{kb ? new Date(kb.created_at).toLocaleDateString() : '—'}</span>
                       </div>
                       <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground font-medium">Last Modified</span>
                          <span className="font-bold">{kb ? new Date(kb.updated_at).toLocaleDateString() : '—'}</span>
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <div className="flex-1 rounded-[2rem] border-2 border-dashed border-muted/30 flex flex-col items-center justify-center p-6 text-center opacity-40">
              <Archive size={40} className="mb-4" />
              <p className="text-xs font-medium">Drag assets here to perform instant batch ingestion</p>
           </div>
        </div>

        {/* Assets Explorer */}
        <div className="flex-1 flex flex-col overflow-hidden">
           <Card className="flex-1 flex flex-col overflow-hidden border-muted/60 shadow-sm rounded-[1.5rem]">
              <CardHeader className="py-4 px-6 border-b flex-row items-center justify-between space-y-0 bg-background/50">
                 <div className="flex flex-col">
                    <CardTitle className="text-sm font-black uppercase tracking-widest">Asset Registry</CardTitle>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">
                       {filteredDocs.length} granular resources mapped
                    </p>
                 </div>
                 <div className="relative w-72">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                    <Input
                       placeholder="Filter registry..."
                       className="pl-10 h-10 border-none bg-muted/30 rounded-xl text-sm font-medium shadow-none focus-visible:ring-1 ring-primary/20"
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
              </CardHeader>

              <CardContent className="p-0 flex-1 overflow-auto">
                 <Table>
                    <TableHeader className="bg-muted/30 sticky top-0 z-10 backdrop-blur-md">
                       <TableRow className="hover:bg-transparent">
                          <TableHead className="w-[100px] text-[10px] font-black uppercase tracking-widest pl-8">Identity</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Protocol</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Vector Density</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest text-right pr-12">Deployment</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {filteredDocs.length === 0 ? (
                          <TableRow>
                             <TableCell colSpan={4} className="h-64 text-center">
                                <Archive size={48} className="mx-auto opacity-5 mb-4" />
                                <div className="space-y-1">
                                   <p className="text-sm font-bold opacity-40">Registry Empty</p>
                                   <p className="text-[10px] font-medium text-muted-foreground/60 uppercase">Import assets to populate this workspace</p>
                                </div>
                             </TableCell>
                          </TableRow>
                       ) : (
                          filteredDocs.map(doc => (
                             <TableRow key={doc.id} className="group hover:bg-primary/[0.02] transition-colors border-muted/30">
                                <TableCell className="pl-8 py-4">
                                   <div className="flex items-center gap-4">
                                      <div className="h-10 w-10 rounded-xl bg-background border border-muted/60 flex items-center justify-center text-muted-foreground shrink-0 group-hover:border-primary/40 group-hover:text-primary transition-all">
                                         <FileText size={18} />
                                      </div>
                                      <div className="flex flex-col min-w-0">
                                         <span className="text-sm font-black truncate leading-tight group-hover:text-primary transition-colors">{doc.title}</span>
                                         <span className="text-[10px] font-bold text-muted-foreground/60 truncate mt-1">{doc.file_name || 'Virtual Entry'}</span>
                                      </div>
                                   </div>
                                </TableCell>
                                <TableCell className="text-center">
                                   <DocStatusBadge status={doc.status} />
                                </TableCell>
                                <TableCell className="text-center">
                                   <Badge variant="outline" className="text-[10px] font-mono font-black border-none bg-muted/40 text-muted-foreground/70 h-5 px-2">
                                      {doc.chunk_count || 0} SECTIONS
                                   </Badge>
                                </TableCell>
                                <TableCell className="text-right pr-8">
                                   <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-muted" asChild title="Explore Deployment">
                                         <a href={doc.url || '#'} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /></a>
                                      </Button>
                                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-destructive/40 hover:text-destructive hover:bg-destructive/10" title="Decommission Asset">
                                         <Trash2 size={14} />
                                      </Button>
                                   </div>
                                   <div className="text-[10px] font-bold text-muted-foreground group-hover:hidden uppercase tracking-widest opacity-50">
                                      {new Date(doc.created_at).toLocaleDateString()}
                                   </div>
                                </TableCell>
                             </TableRow>
                          ))
                       )}
                    </TableBody>
                 </Table>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}

function DocStatusBadge({ status }: { status: string }) {
  switch (status.toLowerCase()) {
    case 'synced':
    case 'ready':
    case 'indexed':
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-none shadow-none h-4 text-[9px] font-bold uppercase">Indexed</Badge>
    case 'processing':
    case 'syncing':
      return <div className="flex items-center gap-1.5 justify-center text-[10px] text-amber-600 animate-pulse font-bold tracking-tight uppercase">
        <Clock className="h-3 w-3" /> Syncing
      </div>
    case 'failed':
    case 'error':
      return <Badge variant="destructive" className="h-4 text-[9px] font-bold uppercase px-1.5"><XCircle className="h-3 w-3 mr-1" /> Error</Badge>
    default:
      return <Badge variant="secondary" className="bg-transparent text-[9px] font-bold border-dashed h-4 px-1.5 uppercase tracking-tight text-muted-foreground/60">Pending</Badge>
  }
}

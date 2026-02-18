import { useState, useEffect, useCallback } from 'react'
import { Database, Folder, Trash2, Loader2, AlertCircle, Globe, Settings2, Eye } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Switch } from '@/shared/components/ui/switch'
import { knowledgeApi } from '../../services/knowledge-api'
import type { KBResponse } from '../../types'
import { CreateKBDialog } from './create-kb-dialog'
import { KBDetails } from './kb-details'
import { cn } from '@/lib/utils'

export function KnowledgeBaseList() {
  const [items, setItems] = useState<KBResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enablingId, setEnablingId] = useState<string | null>(null)
  const [selectedKbId, setSelectedKbId] = useState<string | null>(null)

  const loadKBs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await knowledgeApi.listAll()
      if (res.success && res.data) {
        setItems(res.data.items)
      } else {
        setError(res.error || 'Failed to load knowledge bases')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadKBs()
  }, [loadKBs])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this data source? All documents inside will remain but the link will be broken.')) return
    
    try {
      const res = await knowledgeApi.delete(id)
      if (res.success) {
        loadKBs()
      }
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation()
    setEnablingId(id)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setItems(items.map(kb => kb.id === id ? { ...kb, is_active: !currentStatus } : kb))
    } finally {
      setEnablingId(null)
    }
  }

  if (selectedKbId) {
    return <KBDetails kbId={selectedKbId} onBack={() => setSelectedKbId(null)} />
  }

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold tracking-tight">Active Workspaces</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Custom logical collections for targeted RAG retrieval.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="sm" className="h-9 px-3 text-xs font-bold" onClick={loadKBs} disabled={loading}>
             <Loader2 className={cn("h-3.5 w-3.5 mr-2", loading && "animate-spin")} />
             Refresh
           </Button>
           <CreateKBDialog onSuccess={loadKBs} />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 text-xs font-bold text-destructive bg-destructive/5 rounded-2xl border border-destructive/10">
          <div className="h-6 w-6 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
             <AlertCircle className="h-3.5 w-3.5" />
          </div>
          {error}
        </div>
      )}

      {items.length === 0 && !loading ? (
        <Card className="border-dashed border-2 bg-muted/5 rounded-[2rem]">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-[2rem] bg-primary/5 flex items-center justify-center text-primary/30 mb-6 rotate-3 transform-gpu transition-transform hover:rotate-0">
               <Database className="h-10 w-10" />
            </div>
            <h3 className="font-bold text-xl tracking-tight">No Active Workspaces</h3>
            <p className="text-muted-foreground text-sm max-w-sm mt-3 mb-8">
              Workspaces are logical clusters where you organize documents for specific RAG queries. Start by building your first context pool.
            </p>
            <CreateKBDialog onSuccess={loadKBs} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {items.map((kb) => (
            <Card 
              key={kb.id} 
              className={cn(
                "group relative border-muted/60 hover:border-primary/40 transition-all duration-300 cursor-pointer overflow-hidden rounded-[1.5rem] bg-background shadow-sm hover:shadow-xl hover:shadow-primary/5",
                kb.status === 'inactive' && "opacity-60 saturate-50" 
              )}
              onClick={() => setSelectedKbId(kb.id)}
            >
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 group-hover:scale-110 transition-transform">
                        {kb.type === 'web_link' ? <Globe className="h-6 w-6" /> : <Database className="h-6 w-6" />}
                      </div>
                      <div className="flex flex-col min-w-0 pr-8">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-lg tracking-tight truncate">{kb.name}</h4>
                          <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2 h-4 bg-muted/30 border-none shrink-0">
                            {kb.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground line-clamp-2 mt-1.5 opacity-80 leading-relaxed">
                          {kb.description || (kb.type === 'web_link' ? `Automated crawling of ${kb.config.url}` : 'Private manual document collection')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="absolute top-6 right-6" onClick={e => e.stopPropagation()}>
                       <Switch 
                        checked={kb.status !== 'inactive'} 
                        disabled={enablingId === kb.id}
                        onCheckedChange={(checked) => handleToggleActive(kb.id, checked, { stopPropagation: () => {} } as any)}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">Documents</span>
                       <span className="text-sm font-bold flex items-center gap-1.5 leading-none">
                         <Folder size={12} className="text-primary" />
                         {kb.doc_count || 0}
                       </span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">Index Health</span>
                       <span className="text-sm font-bold flex items-center gap-1.5 leading-none">
                         <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                         {Math.round(((kb.indexed_count || 0) / (kb.doc_count || 1)) * 100)}%
                       </span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">Status</span>
                       <span className="text-xs font-bold leading-none mt-0.5">
                         {kb.status === 'inactive' ? (
                           <span className="text-muted-foreground/40 uppercase tracking-tighter">Standby</span>
                         ) : (
                           <span className="text-emerald-600 uppercase tracking-tighter flex items-center gap-1">
                             <div className="h-1 w-1 rounded-full bg-emerald-500 animate-ping" />
                             Online
                           </span>
                         )}
                       </span>
                    </div>
                  </div>
                </div>

                {/* Perspective Action Bar */}
                <div className="bg-muted/10 px-6 py-3 flex items-center justify-between border-t border-muted/50 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                      <Eye className="h-3.5 w-3.5" /> Explore Files
                    </button>
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                      <Settings2 className="h-3.5 w-3.5" /> Configure
                    </button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-full"
                    onClick={(e) => handleDelete(kb.id, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

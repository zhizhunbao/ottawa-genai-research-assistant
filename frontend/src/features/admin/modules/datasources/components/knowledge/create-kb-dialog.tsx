import { useState } from 'react'
import { Plus, Loader2, Upload, Link as LinkIcon, Globe } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { cn } from '@/lib/utils'
import { knowledgeApi } from '../../services/knowledge-api'
import type { KBCreate } from '../../types'

interface CreateKBDialogProps {
  onSuccess: () => void
}

type DataSourceType = 'manual_upload' | 'web_link'

export function CreateKBDialog({ onSuccess }: CreateKBDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<KBCreate>({
    name: '',
    description: '',
    type: 'manual_upload',
    config: {},
  })

  const [url, setUrl] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    if (formData.type === 'web_link' && !url.trim()) {
      setError('Please enter a valid URL for the link source.')
      return
    }

    setLoading(true)
    setError(null)

    const finalData = {
      ...formData,
      config: formData.type === 'web_link' ? { url: url.trim() } : {},
    }

    try {
      const res = await knowledgeApi.create(finalData)
      if (res.success) {
        setOpen(false)
        setFormData({ name: '', description: '', type: 'manual_upload', config: {} })
        setUrl('')
        onSuccess()
      } else {
        setError(res.error || 'Failed to create knowledge base')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const setKBType = (type: DataSourceType) => {
    setFormData((prev) => ({ ...prev, type }))
    setError(null)
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1" />
        New Data Source
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Create New Data Source</DialogTitle>
            <DialogDescription>
              Choose how you want to bring data into your knowledge base.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Type Selector */}
            <div className="space-y-3">
              <Label>Source Type</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setKBType('manual_upload')}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-left transition-all',
                    formData.type === 'manual_upload'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-muted bg-transparent hover:border-muted-foreground/30'
                  )}
                >
                  <div className={cn(
                    'p-2 rounded-lg',
                    formData.type === 'manual_upload' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  )}>
                    <Upload size={20} />
                  </div>
                  <div className="text-center">
                    <span className="font-semibold text-sm">Manual Upload</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Upload PDFs manually</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setKBType('web_link')}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-left transition-all',
                    formData.type === 'web_link'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-muted bg-transparent hover:border-muted-foreground/30'
                  )}
                >
                  <div className={cn(
                    'p-2 rounded-lg',
                    formData.type === 'web_link' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  )}>
                    <Globe size={20} />
                  </div>
                  <div className="text-center">
                    <span className="font-semibold text-sm">Web Link</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Sync from a URL</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Project Documentation"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {formData.type === 'web_link' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="url">Source URL</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="url"
                      className="pl-9"
                      placeholder="https://example.com/docs.pdf"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Supported: PDF links or public document pages.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="What's the purpose of this data source?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formData.name.trim()}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Data Source
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

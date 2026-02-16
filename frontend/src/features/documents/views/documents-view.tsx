/**
 * DocumentsView - Knowledge Base page with tabbed layout & PDF preview sidebar
 *
 * Top-level tabs:
 *   1. Ottawa Resources — SyncPanel catalog for official documents
 *   2. Upload — UploadPanel + UrlImportPanel for manual imports
 *   3. All Documents — DocumentList showing everything in the KB
 *
 * Right sidebar: collapsible PDF preview panel.
 *
 * @module features/documents/views
 * @template none
 * @reference docs/plans/MASTER-PLAN.md Phase 1.3
 */

import { useState, useCallback } from 'react'
import { X, ExternalLink, Download, FileText, Maximize2, Minimize2, CloudDownload, Upload, Library } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs'
import { UploadPanel } from '../components/upload-panel'
import { DocumentList } from '../components/document-list'
import { UrlImportPanel } from '../components/url-import-panel'
import { SyncPanel } from '../components/sync-panel'
import { syncApi, type CatalogItem } from '../services/sync-api'

export default function DocumentsView() {
  const [refreshCounter, setRefreshCounter] = useState(0)
  const [activeTab, setActiveTab] = useState('ottawa-resources')

  // Sidebar preview state
  const [previewItem, setPreviewItem] = useState<CatalogItem | null>(null)
  const [previewExpanded, setPreviewExpanded] = useState(false)

  const handleUploadComplete = useCallback(() => {
    setRefreshCounter((prev) => prev + 1)
  }, [])

  const handlePreview = useCallback((item: CatalogItem) => {
    // Toggle: clicking the same item closes the preview
    setPreviewItem((prev) => (prev?.id === item.id ? null : item))
  }, [])

  const closePreview = useCallback(() => {
    setPreviewItem(null)
    setPreviewExpanded(false)
  }, [])

  const isPreviewOpen = previewItem !== null

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left: Main scrollable content — sole scrollbar lives here */}
      <div className="flex-1 min-w-0 h-full overflow-y-auto">
        <div className={cn(
          'mx-auto py-8 px-4 space-y-6 transition-all duration-300',
          isPreviewOpen ? 'max-w-3xl' : 'max-w-5xl',
        )}>
          {/* Page header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
            <p className="text-muted-foreground mt-1">
              Upload, sync, and manage PDF documents for RAG-powered research chat.
            </p>
          </div>

          {/* Top-level tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start h-10">
              <TabsTrigger value="ottawa-resources" className="gap-1.5 text-sm">
                <CloudDownload className="h-3.5 w-3.5" />
                Ottawa Resources
              </TabsTrigger>
              <TabsTrigger value="upload" className="gap-1.5 text-sm">
                <Upload className="h-3.5 w-3.5" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="documents" className="gap-1.5 text-sm">
                <Library className="h-3.5 w-3.5" />
                All Documents
                {refreshCounter > 0 && (
                  <Badge variant="secondary" className="text-[9px] px-1 py-0 ml-0.5 h-4">
                    new
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Ottawa Resources */}
            <TabsContent value="ottawa-resources" className="mt-4">
              <SyncPanel
                onSyncComplete={handleUploadComplete}
                onPreview={handlePreview}
                previewingId={previewItem?.id}
              />
            </TabsContent>

            {/* Tab 2: Upload + URL Import */}
            <TabsContent value="upload" className="mt-4 space-y-6">
              <UploadPanel onUploadComplete={handleUploadComplete} />
              <UrlImportPanel onImportComplete={handleUploadComplete} />
            </TabsContent>

            {/* Tab 3: All Documents */}
            <TabsContent value="documents" className="mt-4">
              <DocumentList refreshTrigger={refreshCounter} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right: PDF Preview Sidebar */}
      <div className={cn(
        'h-full border-l border-border shrink-0 transition-all duration-300 ease-in-out overflow-hidden bg-background',
        isPreviewOpen
          ? previewExpanded
            ? 'w-[70vw]'
            : 'w-[50vw] max-w-[720px]'
          : 'w-0 border-l-0',
      )}>
        {previewItem && (
          <div className={cn(
            'h-full flex flex-col',
            previewExpanded ? 'w-[70vw]' : 'w-[50vw] max-w-[720px]',
          )}>
            {/* Sidebar header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30 shrink-0">
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{previewItem.title}</p>
                <p className="text-xs text-muted-foreground">
                  {previewItem.quarter} {previewItem.year} · {previewItem.source}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  title="Download PDF"
                  asChild
                >
                  <a href={previewItem.url} download target="_blank" rel="noopener noreferrer">
                    <Download className="h-3.5 w-3.5" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  title="Open in new tab"
                  onClick={() => window.open(previewItem.url, '_blank')}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  title={previewExpanded ? 'Restore size' : 'Maximize'}
                  onClick={() => setPreviewExpanded((p) => !p)}
                >
                  {previewExpanded ? (
                    <Minimize2 className="h-3.5 w-3.5" />
                  ) : (
                    <Maximize2 className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  title="Close preview"
                  onClick={closePreview}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* PDF iframe */}
            <div className="flex-1 min-h-0 bg-muted/10">
              <iframe
                key={previewItem.id}
                src={`${syncApi.getPreviewProxyUrl(previewItem.url)}#toolbar=1&navpanes=0`}
                className="w-full h-full border-0"
                title={`Preview: ${previewItem.title}`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

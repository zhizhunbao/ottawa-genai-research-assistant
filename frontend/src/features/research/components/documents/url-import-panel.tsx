/**
 * UrlImportPanel - Download PDF from URL
 *
 * Allows users to paste a URL to automatically download and import a PDF.
 * Includes preset Ottawa government document sources for quick access.
 *
 * @module features/documents/components
 */
import { useState, useCallback } from 'react'
import { Globe, Download, Loader2, CheckCircle, AlertCircle, Link2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UrlImportPanelProps {
    onImportComplete?: () => void
}

/** Preset Ottawa document sources */
const OTTAWA_SOURCES = [
    {
        label: 'Ottawa Budget 2025',
        url: 'https://pub-ottawa.escribemeetings.com/filestream.ashx?DocumentId=146553',
        desc: 'City of Ottawa annual budget document',
    },
    {
        label: 'Ottawa Official Plan',
        url: 'https://ottawa.ca/en/planning-development-and-construction/official-plan-and-master-plans/official-plan/volume-1-official-plan',
        desc: 'Urban planning policies and guidelines',
    },
    {
        label: 'Ottawa Open Data',
        url: 'https://open.ottawa.ca/',
        desc: 'Browse Ottawa open data portal for datasets',
    },
]

export function UrlImportPanel({ onImportComplete }: UrlImportPanelProps) {
    const [url, setUrl] = useState('')
    const [title, setTitle] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

    const handleImport = useCallback(async (importUrl?: string) => {
        const targetUrl = importUrl || url.trim()
        if (!targetUrl) return

        setIsLoading(true)
        setResult(null)

        try {
            const resp = await fetch('/api/v1/documents/download-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: targetUrl,
                    title: title.trim() || undefined,
                }),
            })

            const data = await resp.json()

            if (!resp.ok) {
                throw new Error(data.detail || data.error || `HTTP ${resp.status}`)
            }

            setResult({
                success: true,
                message: `Successfully imported: ${data.data?.file_name || 'document.pdf'}`,
            })
            setUrl('')
            setTitle('')
            onImportComplete?.()
        } catch (err) {
            setResult({
                success: false,
                message: err instanceof Error ? err.message : 'Import failed',
            })
        } finally {
            setIsLoading(false)
        }
    }, [url, title, onImportComplete])

    return (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Import from URL</h3>
                <span className="text-xs text-muted-foreground ml-auto">
                    Paste a PDF link to download and index
                </span>
            </div>

            {/* URL Input */}
            <div className="space-y-2">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://ottawa.ca/documents/example.pdf"
                            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                            disabled={isLoading}
                            onKeyDown={(e) => e.key === 'Enter' && handleImport()}
                        />
                    </div>
                    <button
                        onClick={() => handleImport()}
                        disabled={!url.trim() || isLoading}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                            'bg-primary text-primary-foreground hover:bg-primary/90',
                            'disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        {isLoading ? 'Downloading...' : 'Import'}
                    </button>
                </div>

                {/* Optional title */}
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Custom title (optional)"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    disabled={isLoading}
                />
            </div>

            {/* Result feedback */}
            {result && (
                <div className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                    result.success
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                        : 'bg-destructive/10 text-destructive'
                )}>
                    {result.success ? (
                        <CheckCircle className="w-4 h-4 shrink-0" />
                    ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    {result.message}
                </div>
            )}

            {/* Quick links */}
            <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Ottawa Resources
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {OTTAWA_SOURCES.map((source) => (
                        <button
                            key={source.label}
                            onClick={() => {
                                if (source.url.endsWith('.pdf') || source.url.includes('filestream')) {
                                    setUrl(source.url)
                                    setTitle(source.label)
                                } else {
                                    window.open(source.url, '_blank')
                                }
                            }}
                            className="flex flex-col items-start gap-1 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors text-left"
                        >
                            <span className="text-sm font-medium">{source.label}</span>
                            <span className="text-xs text-muted-foreground line-clamp-1">
                                {source.desc}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

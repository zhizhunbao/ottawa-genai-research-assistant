/**
 * useChatStream - NDJSON streaming hook for RAG chat with abort, retry, and typed events
 *
 * Connects to POST /api/v1/research/chat/stream and parses NDJSON events:
 * - { type: "sources", payload: [...] }
 * - { type: "text", text: "..." }
 * - { type: "confidence", payload: number }
 * - { type: "chart", payload: {...} }
 * - { type: "done" }
 *
 * @module features/chat/hooks
 * @template use-stream-chat.ts.template (adapted)
 * @reference azure/streaming.py.template
 */
import { useState, useCallback, useRef } from 'react'
import type { Source, ChartData } from '@/features/research/types'

// ==================== Types ====================

/** Backend search result (snake_case) */
interface BackendSearchResult {
    id: string
    title: string
    content: string
    score: number
    source?: string
    metadata?: {
        document_id?: string
        page_number?: number
        chunk_index?: number
    }
}

/** Streaming result after completion */
export interface StreamResult {
    content: string
    sources: Source[]
    confidence: number
    chart?: ChartData
}

/** Stream event callbacks */
export interface StreamCallbacks {
    /** Called with accumulated content on each text token */
    onToken?: (accumulated: string) => void
    /** Called when sources are received */
    onSources?: (sources: Source[]) => void
    /** Called when confidence is received */
    onConfidence?: (confidence: number) => void
    /** Called when chart data is received */
    onChart?: (chart: ChartData) => void
    /** Called when streaming completes */
    onDone?: (result: StreamResult) => void
    /** Called on error */
    onError?: (error: Error) => void
    /** Called when aborted */
    onAbort?: () => void
}

/** Configuration */
export interface StreamConfig {
    /** API base URL (default: /api/v1) */
    baseUrl?: string
    /** Function to get auth token */
    getToken?: () => string | null
    /** Max retries (default: 2) */
    maxRetries?: number
}

// ==================== Helpers ====================

/** Convert backend search result to frontend Source */
function toFrontendSource(result: BackendSearchResult): Source {
    return {
        documentId: result.metadata?.document_id || result.id,
        documentTitle: result.title,
        pageNumber: result.metadata?.page_number || 0,
        section: '',
        excerpt: result.content,
        relevanceScore: result.score,
    }
}

// ==================== Hook ====================

export function useChatStream(config: StreamConfig = {}) {
    const { baseUrl = '/api/v1', getToken, maxRetries = 2 } = config

    const [isStreaming, setIsStreaming] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const abortRef = useRef<AbortController | null>(null)

    /** Abort the current stream */
    const abort = useCallback(() => {
        abortRef.current?.abort()
        abortRef.current = null
    }, [])

    /**
     * Send a streaming chat message.
     *
     * @param messages - Chat history messages
     * @param callbacks - Event callbacks for stream processing
     * @param options - Additional request options (use_rag, temperature)
     */
    const sendMessage = useCallback(
        async (
            messages: Array<{ role: string; content: string }>,
            callbacks: StreamCallbacks = {},
            options: { use_rag?: boolean; temperature?: number } = {}
        ): Promise<StreamResult | null> => {
            // Abort any existing stream
            abort()

            const controller = new AbortController()
            abortRef.current = controller

            setIsStreaming(true)
            setError(null)

            let lastError: Error | null = null

            for (let attempt = 0; attempt <= maxRetries; attempt++) {
                // Retry delay (exponential backoff)
                if (attempt > 0) {
                    await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)))
                    if (controller.signal.aborted) {
                        setIsStreaming(false)
                        callbacks.onAbort?.()
                        return null
                    }
                }

                try {
                    const headers: Record<string, string> = {
                        'Content-Type': 'application/json',
                    }
                    const token = getToken?.()
                    if (token) {
                        headers['Authorization'] = `Bearer ${token}`
                    }

                    const response = await fetch(`${baseUrl}/research/chat/stream`, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                            messages,
                            use_rag: options.use_rag ?? true,
                            temperature: options.temperature ?? 0.7,
                            stream: true,
                        }),
                        signal: controller.signal,
                    })

                    if (!response.ok) {
                        const err = new Error(`HTTP ${response.status}`)
                        if (response.status === 401 || response.status === 403) {
                            // Auth error — don't retry
                            throw err
                        }
                        if (response.status >= 500 && attempt < maxRetries) {
                            lastError = err
                            continue
                        }
                        throw err
                    }

                    // Parse NDJSON stream
                    const reader = response.body?.getReader()
                    if (!reader) throw new Error('No response body reader')

                    const decoder = new TextDecoder()
                    let buffer = ''
                    let content = ''
                    let sources: Source[] = []
                    let confidence = 0
                    let chart: ChartData | undefined

                    while (true) {
                        const { done, value } = await reader.read()
                        if (done) break

                        buffer += decoder.decode(value, { stream: true })
                        const lines = buffer.split('\n')
                        buffer = lines.pop() || ''

                        for (const line of lines) {
                            if (!line.trim()) continue

                            try {
                                const data = JSON.parse(line)

                                switch (data.type) {
                                    case 'text':
                                        content += data.text
                                        callbacks.onToken?.(content)
                                        break

                                    case 'sources':
                                        sources = (data.payload as BackendSearchResult[]).map(toFrontendSource)
                                        callbacks.onSources?.(sources)
                                        break

                                    case 'confidence':
                                        confidence = data.payload as number
                                        callbacks.onConfidence?.(confidence)
                                        break

                                    case 'chart':
                                        chart = data.payload as ChartData
                                        callbacks.onChart?.(chart)
                                        break

                                    case 'done':
                                        // noop — will finish after loop
                                        break

                                    default:
                                        if (data.error) {
                                            throw new Error(data.error)
                                        }
                                }
                            } catch (parseErr) {
                                if (parseErr instanceof Error && parseErr.message.startsWith('HTTP')) {
                                    throw parseErr
                                }
                                console.warn('[chat-stream] Failed to parse line:', line)
                            }
                        }
                    }

                    // Build result
                    const result: StreamResult = { content, sources, confidence, chart }
                    setIsStreaming(false)
                    callbacks.onDone?.(result)
                    return result
                } catch (err) {
                    if (err instanceof DOMException && err.name === 'AbortError') {
                        setIsStreaming(false)
                        callbacks.onAbort?.()
                        return null
                    }

                    lastError = err instanceof Error ? err : new Error(String(err))

                    if (attempt >= maxRetries) {
                        setError(lastError)
                        setIsStreaming(false)
                        callbacks.onError?.(lastError)
                        return null
                    }
                }
            }

            // All retries exhausted
            const finalError = lastError || new Error('Stream failed')
            setError(finalError)
            setIsStreaming(false)
            callbacks.onError?.(finalError)
            return null
        },
        [baseUrl, getToken, maxRetries, abort]
    )

    return {
        /** Send a streaming chat message */
        sendMessage,
        /** Abort the current stream */
        abort,
        /** Whether streaming is active */
        isStreaming,
        /** Last error */
        error,
    }
}

export default useChatStream

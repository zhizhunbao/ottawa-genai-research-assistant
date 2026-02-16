/**
 * ChatTypes - Message, session, and source type definitions for chat feature
 *
 * @module features/chat
 * @template none
 * @reference none
 */

import { ChartData } from '../analysis/types'

export enum MessageRole {
    USER = 'user',
    ASSISTANT = 'assistant',
    SYSTEM = 'system'
}

export interface Source {
    documentId: string
    documentTitle: string
    pageNumber: number
    section: string
    excerpt: string
    relevanceScore: number
}

export interface ChatMessage {
    id: string
    role: MessageRole
    content: string
    timestamp: string
    sources?: Source[]
    confidence?: number
    isLoading?: boolean
    chart?: ChartData
}

export interface ChatSession {
    id: string
    title: string
    messages: ChatMessage[]
    createdAt: string
    updatedAt: string
}

// ── Component-Level Types (for UI rendering) ──

/** Agent reasoning step (for deep-search / multi-agent flows) */
export interface AgentStep {
    id: string
    type: string
    title: string
    content?: string
    status: 'pending' | 'running' | 'done' | 'error'
}

/** Local message type used by ChatInterface component */
export interface Message {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: number
    thought?: string
    status?: 'loading' | 'done' | 'error'
    steps?: AgentStep[]
    sources?: Source[]
    confidence?: number
    chart?: ChartData
}

/** Callbacks for the chat stream */
export interface ChatStreamOptions {
    onMessage?: (chunk: string) => void
    onThought?: (thought: string) => void
    onStep?: (step: AgentStep) => void
    onDone?: () => void
    onError?: (error: Error) => void
}


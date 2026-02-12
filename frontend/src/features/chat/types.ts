/**
 * Chat Feature Types
 *
 * @template T6 backend/features/chat/types.ts — RAG & Chat History Entities
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

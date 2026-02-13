/**
 * chatApi - REST API client for chat session and message persistence
 *
 * @module features/chat/services
 * @template none
 * @reference none
 */

import { apiService } from '@/shared/services/api-service'
import type { ChatMessage, ChatSession, Source } from '@/features/research/types'

// ============================================================
// Backend Response Types
// ============================================================

/** Session list item (from backend, without messages). */
export interface ChatSessionListItem {
  id: string
  title: string
  message_count: number
  last_message_preview: string | null
  created_at: string
  updated_at: string
}

/** Backend session response (with messages). */
interface BackendSessionResponse {
  id: string
  title: string
  messages: BackendMessage[]
  created_at: string
  updated_at: string
}

/** Backend message format. */
interface BackendMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  sources?: Source[]
  confidence?: number
}

// ============================================================
// Helpers
// ============================================================

/** Convert backend message to frontend ChatMessage. */
function toFrontendMessage(msg: BackendMessage): ChatMessage {
  return {
    id: msg.id,
    role: msg.role as ChatMessage['role'],
    content: msg.content,
    timestamp: msg.timestamp,
    sources: msg.sources,
    confidence: msg.confidence,
    isLoading: false,
  }
}

/** Convert backend session to frontend ChatSession. */
function toFrontendSession(session: BackendSessionResponse): ChatSession {
  return {
    id: session.id,
    title: session.title,
    messages: session.messages.map(toFrontendMessage),
    createdAt: session.created_at,
    updatedAt: session.updated_at,
  }
}

// ============================================================
// API Methods
// ============================================================

export const chatApi = {
  /**
   * Create a new chat session.
   */
  async createSession(title?: string): Promise<ChatSession> {
    const response = await apiService.post<BackendSessionResponse>(
      '/chat/sessions',
      { title }
    )
    if (!response.data) {
      throw new Error(response.error || 'Failed to create session')
    }
    return toFrontendSession(response.data)
  },

  /**
   * List sessions (summary, without full messages).
   */
  async listSessions(
    limit = 50,
    offset = 0
  ): Promise<ChatSessionListItem[]> {
    const response = await apiService.get<ChatSessionListItem[]>(
      '/chat/sessions',
      { limit: String(limit), offset: String(offset) }
    )
    if (!response.data) {
      throw new Error(response.error || 'Failed to list sessions')
    }
    return response.data
  },

  /**
   * Get a single session (with full message list).
   */
  async getSession(sessionId: string): Promise<ChatSession> {
    const response = await apiService.get<BackendSessionResponse>(
      `/chat/sessions/${sessionId}`
    )
    if (!response.data) {
      throw new Error(response.error || 'Session not found')
    }
    return toFrontendSession(response.data)
  },

  /**
   * Update session title.
   */
  async updateSessionTitle(
    sessionId: string,
    title: string
  ): Promise<ChatSession> {
    const response = await apiService.patch<BackendSessionResponse>(
      `/chat/sessions/${sessionId}`,
      { title }
    )
    if (!response.data) {
      throw new Error(response.error || 'Failed to update session')
    }
    return toFrontendSession(response.data)
  },

  /**
   * Delete a session.
   */
  async deleteSession(sessionId: string): Promise<void> {
    const response = await apiService.delete<{ deleted: boolean }>(
      `/chat/sessions/${sessionId}`
    )
    if (!response.data?.deleted) {
      throw new Error(response.error || 'Failed to delete session')
    }
  },

  /**
   * Append a message to a session.
   */
  async appendMessage(
    sessionId: string,
    role: 'user' | 'assistant',
    content: string,
    sources?: Source[],
    confidence?: number
  ): Promise<ChatMessage> {
    const body: Record<string, unknown> = { role, content }
    if (sources) body.sources = sources
    if (confidence !== undefined) body.confidence = confidence

    const response = await apiService.post<BackendMessage>(
      `/chat/sessions/${sessionId}/messages`,
      body
    )
    if (!response.data) {
      throw new Error(response.error || 'Failed to append message')
    }
    return toFrontendMessage(response.data)
  },
}

export default chatApi

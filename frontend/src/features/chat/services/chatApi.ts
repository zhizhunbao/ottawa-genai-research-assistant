/**
 * 聊天 API 服务
 *
 * 对接后端 /api/v1/chat 端点，管理聊天会话和消息的持久化。
 * 对应 Sprint 4 US-204: Chat History Persistence。
 */

import { apiService } from '@/shared/services/apiService'
import type { ChatMessage, ChatSession, Source } from '@/features/research/types'

// ─── Backend Response Types ─────────────────────────────────────────

/** 会话列表项（后端返回，不含 messages） */
export interface ChatSessionListItem {
  id: string
  title: string
  message_count: number
  last_message_preview: string | null
  created_at: string
  updated_at: string
}

/** 后端会话响应（含 messages） */
interface BackendSessionResponse {
  id: string
  title: string
  messages: BackendMessage[]
  created_at: string
  updated_at: string
}

/** 后端消息格式 */
interface BackendMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  sources?: Source[]
  confidence?: number
}

// ─── Helpers ────────────────────────────────────────────────────────

/** 将后端消息转换为前端 ChatMessage */
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

/** 将后端会话转换为前端 ChatSession */
function toFrontendSession(session: BackendSessionResponse): ChatSession {
  return {
    id: session.id,
    title: session.title,
    messages: session.messages.map(toFrontendMessage),
    createdAt: session.created_at,
    updatedAt: session.updated_at,
  }
}

// ─── API Methods ────────────────────────────────────────────────────

export const chatApi = {
  /**
   * 创建新的聊天会话
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
   * 获取会话列表（摘要，不含完整消息）
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
   * 获取单个会话（含完整消息列表）
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
   * 更新会话标题
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
   * 删除会话
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
   * 追加消息到会话
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

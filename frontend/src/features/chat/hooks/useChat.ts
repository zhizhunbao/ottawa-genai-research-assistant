/**
 * 聊天 Hook
 *
 * 提供聊天功能的业务逻辑：
 *  - 通过后端 chatApi 持久化会话和消息 (US-204)
 *  - 通过 researchApi.submitQuery 调用 RAG 管道 (US-202)
 *  - 保留本地 Zustand store 作为 UI 即时反馈层
 *
 * 对应 Sprint 4 US-202 / US-203 / US-204。
 */

import { useCallback, useEffect, useMemo, useRef, useState, FormEvent } from 'react'
import { useChatStore } from '@/stores/chatStore'
import { researchApi } from '@/features/research/services/researchApi'
import { chatApi } from '@/features/research/services/chatApi'
import { MessageRole } from '@/features/research/types'

export function useChat() {
  const {
    sessions,
    currentSessionId,
    isLoading,
    error,
    createSession,
    setCurrentSession,
    deleteSession,
    updateSessionTitle,
    addMessage,
    updateMessage,
    setLoading,
    setError,
    clearError,
  } = useChatStore()

  // 标记是否已从后端加载过会话列表
  const sessionsLoaded = useRef(false)

  // 当前会话 - 依赖 sessions 和 currentSessionId 以正确响应状态变化
  const currentSession = useMemo(
    () => sessions.find((s) => s.id === currentSessionId) ?? null,
    [sessions, currentSessionId]
  )

  // 当前会话的消息列表
  const messages = useMemo(
    () => currentSession?.messages ?? [],
    [currentSession]
  )

  // ─── 初始化：从后端加载会话列表 ───────────────────────────────────

  useEffect(() => {
    if (sessionsLoaded.current) return
    sessionsLoaded.current = true

    chatApi
      .listSessions()
      .then((backendSessions) => {
        const backendIds = new Set(backendSessions.map((s) => s.id))

        // 执行完全同步
        useChatStore.setState((state) => {
          // 1. 保留本地仍存在于后端的会话，并更新元数据
          const updatedSessions = state.sessions
            .filter((s) => backendIds.has(s.id))
            .map((s) => {
              const bs = backendSessions.find((b) => b.id === s.id)
              return bs ? { ...s, title: bs.title, updatedAt: bs.updated_at } : s
            })

          // 2. 添加后端有但本地没有的会话
          const localIds = new Set(updatedSessions.map((s) => s.id))
          const newSessions = backendSessions
            .filter((bs) => !localIds.has(bs.id))
            .map((bs) => ({
              id: bs.id,
              title: bs.title,
              messages: [],
              createdAt: bs.created_at,
              updatedAt: bs.updated_at,
            }))

          return {
            sessions: [...updatedSessions, ...newSessions],
          }
        })
      })
      .catch((err) => {
        console.warn('Failed to sync sessions from backend:', err)
      })
  }, [])

  // ─── 发送消息 ─────────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (content: string) => {
      let sessionId = currentSessionId

      // 如果没有当前会话，先创建一个
      if (!sessionId) {
        // 尝试通过后端创建
        try {
          const backendSession = await chatApi.createSession()
          sessionId = backendSession.id
          // 同步到本地 store
          useChatStore.setState((state) => ({
            sessions: [
              {
                id: backendSession.id,
                title: backendSession.title,
                messages: [],
                createdAt: backendSession.createdAt,
                updatedAt: backendSession.updatedAt,
              },
              ...state.sessions,
            ],
            currentSessionId: backendSession.id,
          }))
        } catch {
          // 回退到本地创建
          sessionId = createSession()
        }
      }

      // 添加用户消息到本地 store
      addMessage(sessionId, MessageRole.USER, content)

      // 异步持久化用户消息到后端
      chatApi
        .appendMessage(sessionId, 'user', content)
        .catch((err) => console.warn('Failed to persist user message:', err))

      // 添加助手消息占位
      const assistantMessageId = addMessage(sessionId, MessageRole.ASSISTANT, '')
      setLoading(true)

      try {
        // 构建聊天历史（排除当前占位消息）
        const session = useChatStore.getState().sessions.find((s) => s.id === sessionId)
        const chatHistory = (session?.messages || [])
          .filter((m) => m.id !== assistantMessageId && !m.isLoading)
          .slice(-10) // 保留最近 10 条
          .map((m) => ({ role: m.role, content: m.content }))
          .slice(0, -1) // 去掉刚添加的用户消息（submitQuery 会自己加）

        // 调用 RAG API (US-202)
        const response = await researchApi.submitQuery(content, chatHistory)

        // 更新助手消息 (US-203: 包含 sources 和 confidence, US-301: 包含 chart)
        updateMessage(sessionId, assistantMessageId, {
          content: response.answer,
          sources: response.sources,
          confidence: response.confidence,
          chart: response.chart,
          isLoading: false,
        })

        // 异步持久化助手消息到后端
        chatApi
          .appendMessage(
            sessionId,
            'assistant',
            response.answer,
            response.sources,
            response.confidence
          )
          .catch((err) => console.warn('Failed to persist assistant message:', err))

        // 首次消息自动设置会话标题
        if (session && session.messages.length <= 2) {
          const title = content.slice(0, 50) + (content.length > 50 ? '...' : '')
          updateSessionTitle(sessionId, title)
          // 同步到后端
          chatApi
            .updateSessionTitle(sessionId, title)
            .catch((err) => console.warn('Failed to update title:', err))
        }

        return { success: true, response }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to get response'
        setError(message)

        updateMessage(sessionId, assistantMessageId, {
          content: `Sorry, an error occurred: ${message}`,
          isLoading: false,
        })

        return { success: false, error: message }
      } finally {
        setLoading(false)
      }
    },
    [
      currentSessionId,
      createSession,
      addMessage,
      updateMessage,
      updateSessionTitle,
      setLoading,
      setError,
    ]
  )

  // ─── 会话操作 ─────────────────────────────────────────────────────

  /**
   * 新建会话
   * 注意：可能从 onClick 直接调用，需要忽略事件对象
   */
  const startNewSession = useCallback(
    async (titleOrEvent?: string | React.MouseEvent) => {
      // 忽略事件对象，只接受字符串
      const title = typeof titleOrEvent === 'string' ? titleOrEvent : undefined
      try {
        const backendSession = await chatApi.createSession(title)
        useChatStore.setState((state) => ({
          sessions: [
            {
              id: backendSession.id,
              title: backendSession.title,
              messages: [],
              createdAt: backendSession.createdAt,
              updatedAt: backendSession.updatedAt,
            },
            ...state.sessions,
          ],
          currentSessionId: backendSession.id,
        }))
        return backendSession.id
      } catch {
        // 回退到本地创建
        return createSession(title)
      }
    },
    [createSession]
  )

  /**
   * 切换会话（加载历史消息）
   */
  const switchSession = useCallback(
    async (sessionId: string) => {
      setCurrentSession(sessionId)

      // 如果该会话没有消息，尝试从后端加载
      const session = useChatStore.getState().sessions.find((s) => s.id === sessionId)
      if (session && session.messages.length === 0) {
        try {
          const fullSession = await chatApi.getSession(sessionId)
          // 更新本地 store 的消息
          useChatStore.setState((state) => ({
            sessions: state.sessions.map((s) =>
              s.id === sessionId
                ? {
                    ...s,
                    messages: fullSession.messages,
                    title: fullSession.title,
                    updatedAt: fullSession.updatedAt,
                  }
                : s
            ),
          }))
        } catch (err) {
          console.warn('Failed to load session messages from backend:', err)
        }
      }
    },
    [setCurrentSession]
  )

  /**
   * 删除会话
   */
  const removeSession = useCallback(
    async (sessionId: string) => {
      // 先更新本地
      deleteSession(sessionId)
      // 异步删除后端
      chatApi
        .deleteSession(sessionId)
        .catch((err) => console.warn('Failed to delete session from backend:', err))
    },
    [deleteSession]
  )

  /**
   * 重命名会话
   */
  const renameSession = useCallback(
    async (sessionId: string, title: string) => {
      updateSessionTitle(sessionId, title)
      chatApi
        .updateSessionTitle(sessionId, title)
        .catch((err) => console.warn('Failed to rename session on backend:', err))
    },
    [updateSessionTitle]
  )

  // ─── 输入处理 ─────────────────────────────────────────────────────

  const [inputValue, setInputValue] = useState('')

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value)
  }, [])

  const handleFormSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (inputValue.trim()) {
        sendMessage(inputValue)
        setInputValue('')
      }
    },
    [inputValue, sendMessage]
  )

  return {
    // 状态
    sessions,
    currentSession,
    currentSessionId,
    messages,
    isLoading,
    error,
    inputValue,

    // 输入处理
    handleInputChange,
    handleFormSubmit,

    // 消息操作
    sendMessage,

    // 会话操作
    startNewSession,
    switchSession,
    removeSession,
    renameSession,

    // 错误处理
    clearError,
  }
}

export default useChat

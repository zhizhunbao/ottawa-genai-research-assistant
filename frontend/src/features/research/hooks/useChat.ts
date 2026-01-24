/**
 * 聊天 Hook
 *
 * 提供聊天功能的业务逻辑，包括消息发送、会话管理等。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useCallback, useMemo, useState, FormEvent } from 'react'
import { useChatStore } from '@/stores/chatStore'
import { researchApi } from '@/features/research/services/researchApi'
import type { QueryRequest } from '@/features/research/types'
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
    getCurrentSession,
  } = useChatStore()

  // 当前会话
  const currentSession = useMemo(() => getCurrentSession(), [getCurrentSession])

  // 当前会话的消息列表
  const messages = useMemo(
    () => currentSession?.messages ?? [],
    [currentSession]
  )

  /**
   * 发送消息并获取回复
   */
  const sendMessage = useCallback(
    async (content: string, filters?: QueryRequest['filters']) => {
      let sessionId = currentSessionId

      // 如果没有当前会话，先创建一个
      if (!sessionId) {
        sessionId = createSession()
      }

      // 添加用户消息
      addMessage(sessionId, MessageRole.USER, content)

      // 添加助手消息占位
      const assistantMessageId = addMessage(sessionId, MessageRole.ASSISTANT, '')
      setLoading(true)

      try {
        // 调用 API
        const response = await researchApi.submitQuery({
          query: content,
          filters,
        })

        // 更新助手消息
        updateMessage(sessionId, assistantMessageId, {
          content: response.answer,
          sources: response.sources,
          confidence: response.confidence,
          isLoading: false,
        })

        // 更新会话标题（使用第一条消息）
        const session = useChatStore.getState().sessions.find(s => s.id === sessionId)
        if (session && session.messages.length <= 2) {
          const title = content.slice(0, 50) + (content.length > 50 ? '...' : '')
          updateSessionTitle(sessionId, title)
        }

        return { success: true, response }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to get response'
        setError(message)

        // 更新消息为错误状态
        updateMessage(sessionId, assistantMessageId, {
          content: `抱歉，发生了错误：${message}`,
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

  /**
   * 新建会话
   */
  const startNewSession = useCallback(
    (title?: string) => {
      const sessionId = createSession(title)
      return sessionId
    },
    [createSession]
  )

  /**
   * 切换会话
   */
  const switchSession = useCallback(
    (sessionId: string) => {
      setCurrentSession(sessionId)
    },
    [setCurrentSession]
  )

  /**
   * 删除当前会话
   */
  const removeSession = useCallback(
    (sessionId: string) => {
      deleteSession(sessionId)
    },
    [deleteSession]
  )

  /**
   * 重命名会话
   */
  const renameSession = useCallback(
    (sessionId: string, title: string) => {
      updateSessionTitle(sessionId, title)
    },
    [updateSessionTitle]
  )

  // 输入框状态（用于受控输入）
  const [inputValue, setInputValue] = useState('')

  /**
   * 输入框变化处理
   */
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value)
  }, [])

  /**
   * 表单提交处理
   */
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


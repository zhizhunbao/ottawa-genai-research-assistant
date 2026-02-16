/**
 * useChat - Chat business logic with backend persistence and streaming RAG pipeline
 *
 * @module features/chat/hooks
 * @template none
 * @reference none
 */

import { useCallback, useEffect, useMemo, useRef, useState, FormEvent } from 'react'
import { useChatStore } from '@/stores/chat-store'
import { chatApi } from '@/features/chat/services/chat-api'
import { useChatStream } from '@/features/chat/hooks/use-chat-stream'
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
    deleteMessage,
    setLoading,
    setError,
    clearError,
  } = useChatStore()

  // Streaming hook
  const { sendMessage: streamSend, abort: abortStream, isStreaming } = useChatStream({
    baseUrl: '/api/v1',
  })

  // Track whether session list has been loaded from backend
  const sessionsLoaded = useRef(false)

  // Current session - depends on sessions and currentSessionId for reactivity
  const currentSession = useMemo(
    () => sessions.find((s) => s.id === currentSessionId) ?? null,
    [sessions, currentSessionId]
  )

  // Messages for the current session
  const messages = useMemo(
    () => currentSession?.messages ?? [],
    [currentSession]
  )

  // ============================================================
  // Initialize: load session list from backend
  // ============================================================

  useEffect(() => {
    if (sessionsLoaded.current) return
    sessionsLoaded.current = true

    chatApi
      .listSessions()
      .then((backendSessions) => {
        const backendIds = new Set(backendSessions.map((s) => s.id))

        useChatStore.setState((state) => {
          const updatedSessions = state.sessions
            .filter((s) => backendIds.has(s.id))
            .map((s) => {
              const bs = backendSessions.find((b) => b.id === s.id)
              return bs ? { ...s, title: bs.title, updatedAt: bs.updated_at } : s
            })

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

  // ============================================================
  // Send message (with streaming)
  // ============================================================

  const sendMessage = useCallback(
    async (content: string, model?: string) => {
      let sessionId = currentSessionId

      // If no current session, create one first
      if (!sessionId) {
        try {
          const backendSession = await chatApi.createSession()
          sessionId = backendSession.id
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
          sessionId = createSession()
        }
      }

      // Add user message to local store
      addMessage(sessionId, MessageRole.USER, content)

      // Async persist user message to backend
      chatApi
        .appendMessage(sessionId, 'user', content)
        .catch((err) => console.warn('Failed to persist user message:', err))

      // Add assistant message placeholder
      const assistantMessageId = addMessage(sessionId, MessageRole.ASSISTANT, '')
      setLoading(true)

      // Build chat history (excluding current placeholder)
      const session = useChatStore.getState().sessions.find((s) => s.id === sessionId)
      const chatHistory = (session?.messages || [])
        .filter((m) => m.id !== assistantMessageId && !m.isLoading)
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }))
        .slice(0, -1)

      // Use streaming RAG
      const result = await streamSend(
        [...chatHistory, { role: 'user', content }],
        {
          onToken: (accumulated) => {
            updateMessage(sessionId!, assistantMessageId, {
              content: accumulated,
            })
          },
          onSources: (sources) => {
            updateMessage(sessionId!, assistantMessageId, { sources })
          },
          onConfidence: (confidence) => {
            updateMessage(sessionId!, assistantMessageId, { confidence })
          },
          onChart: (chart) => {
            updateMessage(sessionId!, assistantMessageId, { chart })
          },
          onUsage: (usage) => {
            updateMessage(sessionId!, assistantMessageId, { usage })
          },
          onDone: (streamResult) => {
            updateMessage(sessionId!, assistantMessageId, {
              content: streamResult.content,
              sources: streamResult.sources,
              confidence: streamResult.confidence,
              chart: streamResult.chart,
              usage: streamResult.usage,
              isLoading: false,
            })

            // Async persist assistant message to backend
            chatApi
              .appendMessage(
                sessionId!,
                'assistant',
                streamResult.content,
                streamResult.sources,
                streamResult.confidence
              )
              .catch((err) => console.warn('Failed to persist assistant message:', err))
          },
          onError: (err) => {
            setError(err.message)
            updateMessage(sessionId!, assistantMessageId, {
              content: `Sorry, an error occurred: ${err.message}`,
              isLoading: false,
            })
          },
          onAbort: () => {
            updateMessage(sessionId!, assistantMessageId, {
              isLoading: false,
            })
          },
        },
        { model }
      )

      // Auto-set session title on first message
      if (session && session.messages.length <= 2) {
        const title = content.slice(0, 50) + (content.length > 50 ? '...' : '')
        updateSessionTitle(sessionId, title)
        chatApi
          .updateSessionTitle(sessionId, title)
          .catch((err) => console.warn('Failed to update title:', err))
      }

      setLoading(false)
      return { success: !!result, response: result }
    },
    [
      currentSessionId,
      createSession,
      addMessage,
      updateMessage,
      updateSessionTitle,
      setLoading,
      setError,
      streamSend,
    ]
  )

  // ============================================================
  // Session operations
  // ============================================================

  /**
   * Create a new session
   * Note: may be called from onClick directly, must ignore event objects
   */
  const startNewSession = useCallback(
    async (titleOrEvent?: string | React.MouseEvent) => {
      // Ignore event objects, accept only string
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
        // Fallback to local creation
        return createSession(title)
      }
    },
    [createSession]
  )

  /**
   * Switch session (load history messages)
   */
  const switchSession = useCallback(
    async (sessionId: string) => {
      setCurrentSession(sessionId)

      // If session has no messages, try loading from backend
      const session = useChatStore.getState().sessions.find((s) => s.id === sessionId)
      if (session && session.messages.length === 0) {
        try {
          const fullSession = await chatApi.getSession(sessionId)
          // Update local store messages
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
   * Delete a session
   */
  const removeSession = useCallback(
    async (sessionId: string) => {
      // Update local first
      deleteSession(sessionId)
      // Async delete from backend
      chatApi
        .deleteSession(sessionId)
        .catch((err) => console.warn('Failed to delete session from backend:', err))
    },
    [deleteSession]
  )

  /**
   * Rename a session
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

  // ============================================================
  // Message actions (for hover action toolbar)
  // ============================================================

  /** Copy message content to clipboard */
  const copyMessage = useCallback(async (messageId: string) => {
    const msg = messages.find((m) => m.id === messageId)
    if (msg) {
      try {
        await navigator.clipboard.writeText(msg.content)
      } catch {
        // Fallback for older browsers
        const textarea = document.createElement('textarea')
        textarea.value = msg.content
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
    }
  }, [messages])

  /** Edit a user message and re-send (removes all messages after the edited one) */
  const editMessage = useCallback(
    async (messageId: string, newContent: string) => {
      if (!currentSessionId) return

      // Find the index of the message being edited
      const msgIndex = messages.findIndex((m) => m.id === messageId)
      if (msgIndex === -1) return

      // Remove all messages from the edited message onwards
      const messagesToDelete = messages.slice(msgIndex)
      messagesToDelete.forEach((m) => {
        deleteMessage(currentSessionId, m.id)
      })

      // Re-send with the new content
      await sendMessage(newContent)
    },
    [currentSessionId, messages, deleteMessage, sendMessage]
  )

  /** Retry: re-generate the AI response for a specific assistant message */
  const retryMessage = useCallback(
    async (messageId: string) => {
      if (!currentSessionId) return

      // Find the assistant message and the user message before it
      const msgIndex = messages.findIndex((m) => m.id === messageId)
      if (msgIndex === -1) return

      // Find the nearest user message before this assistant message
      let userContent = ''
      for (let i = msgIndex - 1; i >= 0; i--) {
        if (messages[i].role === 'user') {
          userContent = messages[i].content
          break
        }
      }
      if (!userContent) return

      // Remove the assistant message and all messages after
      const messagesToDelete = messages.slice(msgIndex)
      messagesToDelete.forEach((m) => {
        deleteMessage(currentSessionId, m.id)
      })

      // Re-send the user's message
      await sendMessage(userContent)
    },
    [currentSessionId, messages, deleteMessage, sendMessage]
  )

  /** Delete a single message */
  const removeMessage = useCallback(
    (messageId: string) => {
      if (!currentSessionId) return
      deleteMessage(currentSessionId, messageId)
    },
    [currentSessionId, deleteMessage]
  )

  // ============================================================
  // Input handling
  // ============================================================

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
    // State
    sessions,
    currentSession,
    currentSessionId,
    messages,
    isLoading,
    isStreaming,
    error,
    inputValue,

    // Input handling
    handleInputChange,
    handleFormSubmit,

    // Message operations
    sendMessage,

    // Message actions (hover toolbar)
    copyMessage,
    editMessage,
    retryMessage,
    removeMessage,

    // Streaming control
    abortStream,

    // Session operations
    startNewSession,
    switchSession,
    removeSession,
    renameSession,

    // Error handling
    clearError,
  }
}

export default useChat

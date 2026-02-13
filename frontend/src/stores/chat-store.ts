/**
 * useChatStore - Zustand store for chat sessions, messages, and interaction state
 *
 * @module stores
 * @template none
 * @reference none
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ChatSession, ChatMessage, MessageRole } from '@/features/research/types'

interface ChatState {
  sessions: ChatSession[]
  currentSessionId: string | null
  isLoading: boolean
  error: string | null
}

interface ChatStore extends ChatState {
  // Session actions
  createSession: (title?: string) => string
  setCurrentSession: (sessionId: string | null) => void
  deleteSession: (sessionId: string) => void
  updateSessionTitle: (sessionId: string, title: string) => void

  // Message actions
  addMessage: (sessionId: string, role: MessageRole, content: string) => string
  updateMessage: (sessionId: string, messageId: string, updates: Partial<ChatMessage>) => void
  setMessageLoading: (sessionId: string, messageId: string, isLoading: boolean) => void

  // State actions
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void

  // Getters
  getCurrentSession: () => ChatSession | null
  getSessionMessages: (sessionId: string) => ChatMessage[]
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`

const initialState: ChatState = {
  sessions: [],
  currentSessionId: null,
  isLoading: false,
  error: null,
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      createSession: (title) => {
        const id = generateId()
        const now = new Date().toISOString()
        const newSession: ChatSession = {
          id,
          title: title || `新会话 ${get().sessions.length + 1}`,
          messages: [],
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: id,
        }))

        return id
      },

      setCurrentSession: (sessionId) =>
        set({ currentSessionId: sessionId }),

      deleteSession: (sessionId) =>
        set((state) => {
          const newSessions = state.sessions.filter((s) => s.id !== sessionId)
          return {
            sessions: newSessions,
            currentSessionId:
              state.currentSessionId === sessionId
                ? newSessions[0]?.id ?? null
                : state.currentSessionId,
          }
        }),

      updateSessionTitle: (sessionId, title) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, title, updatedAt: new Date().toISOString() }
              : s
          ),
        })),

      addMessage: (sessionId, role, content) => {
        const messageId = generateId()
        const now = new Date().toISOString()
        const newMessage: ChatMessage = {
          id: messageId,
          role,
          content,
          timestamp: now,
          isLoading: role === 'assistant',
        }

        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                ...s,
                messages: [...s.messages, newMessage],
                updatedAt: now,
              }
              : s
          ),
        }))

        return messageId
      },

      updateMessage: (sessionId, messageId, updates) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === messageId ? { ...m, ...updates } : m
                ),
                updatedAt: new Date().toISOString(),
              }
              : s
          ),
        })),

      setMessageLoading: (sessionId, messageId, isLoading) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === messageId ? { ...m, isLoading } : m
                ),
              }
              : s
          ),
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      getCurrentSession: () => {
        const { sessions, currentSessionId } = get()
        return sessions.find((s) => s.id === currentSessionId) ?? null
      },

      getSessionMessages: (sessionId) => {
        const session = get().sessions.find((s) => s.id === sessionId)
        return session?.messages ?? []
      },
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
      }),
    }
  )
)

// Selectors
export const selectSessions = (state: ChatStore) => state.sessions
export const selectCurrentSessionId = (state: ChatStore) => state.currentSessionId
export const selectChatLoading = (state: ChatStore) => state.isLoading
export const selectChatError = (state: ChatStore) => state.error

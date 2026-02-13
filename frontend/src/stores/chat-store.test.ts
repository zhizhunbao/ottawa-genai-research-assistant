/**
 * ChatStore unit tests
 *
 * @module stores
 * @template none
 * @reference none
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useChatStore } from './chat-store'
import { MessageRole } from '@/features/research/types'

describe('chatStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useChatStore.setState({
      sessions: [],
      currentSessionId: null,
      isLoading: false,
      error: null
    })
    localStorage.clear()
  })

  it('initially has empty state', () => {
    const state = useChatStore.getState()
    expect(state.sessions).toEqual([])
    expect(state.currentSessionId).toBeNull()
  })

  it('can create a new session', () => {
    const { createSession } = useChatStore.getState()
    const sessionId = createSession('Test Session')
    
    const state = useChatStore.getState()
    expect(state.sessions).toHaveLength(1)
    expect(state.sessions[0].title).toBe('Test Session')
    expect(state.currentSessionId).toBe(sessionId)
  })

  it('can add messages to a session', () => {
    const { createSession, addMessage } = useChatStore.getState()
    const sessionId = createSession('Test Session')
    
    addMessage(sessionId, MessageRole.USER, 'Hello')

    const session = useChatStore.getState().sessions.find(s => s.id === sessionId)
    expect(session?.messages).toHaveLength(1)
    expect(session?.messages[0].content).toBe('Hello')
  })

  it('can delete a session', () => {
    const { createSession, deleteSession } = useChatStore.getState()
    const sessionId = createSession('To Delete')
    
    deleteSession(sessionId)
    
    const state = useChatStore.getState()
    expect(state.sessions).toHaveLength(0)
    expect(state.currentSessionId).toBeNull()
  })

  it('can rename a session', () => {
    const { createSession, updateSessionTitle } = useChatStore.getState()
    const sessionId = createSession('Old Title')
    
    updateSessionTitle(sessionId, 'New Title')
    
    const session = useChatStore.getState().sessions.find(s => s.id === sessionId)
    expect(session?.title).toBe('New Title')
  })
})

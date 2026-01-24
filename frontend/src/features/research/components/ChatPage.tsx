/**
 * 聊天页面组件
 *
 * 组合子组件构成完整的聊天界面。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FormEvent } from 'react'
import type { ChatSession, ChatMessage } from '@/features/research/types'
import { ChatSidebar } from './ChatSidebar'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'

interface ChatPageProps {
  isAuthenticated: boolean
  user?: { displayName?: string; email?: string } | null
  messages: ChatMessage[]
  sessions: ChatSession[]
  currentSession: ChatSession | null
  isLoading: boolean
  inputValue: string
  onInputChange: (value: string) => void
  onFormSubmit: (e: FormEvent<HTMLFormElement>) => void
  onNewSession: () => void
  onSwitchSession: (sessionId: string) => void
}

export function ChatPage({
  isAuthenticated,
  user,
  messages,
  sessions,
  currentSession,
  isLoading,
  inputValue,
  onInputChange,
  onFormSubmit,
  onNewSession,
  onSwitchSession,
}: ChatPageProps) {
  const { t: tCommon } = useTranslation('common')

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-indigo-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{tCommon('messages.error')}</h2>
          <p className="text-gray-600 mb-6">Please sign in to use the chat.</p>
          <Link to="/login" className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg">
            {tCommon('nav.login')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSession?.id || null}
        user={user}
        onNewSession={onNewSession}
        onSwitchSession={onSwitchSession}
      />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          <MessageList messages={messages} />
        </div>
        <ChatInput
          inputValue={inputValue}
          isLoading={isLoading}
          onInputChange={onInputChange}
          onFormSubmit={onFormSubmit}
        />
      </main>
    </div>
  )
}

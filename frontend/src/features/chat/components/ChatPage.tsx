/**
 * 聊天页面组件
 *
 * ChatSidebar (会话列表 + 删除/重命名) + 主聊天区 (MessageList + ChatInput)。
 * 未认证时自动触发 AuthDialog。
 * 对应 Sprint 4 US-202 / US-203 / US-204。
 */

import { useTranslation } from 'react-i18next'
import { FormEvent, useEffect } from 'react'
import type { ChatSession, ChatMessage } from '@/features/research/types'
import { useAuthDialog } from '@/features/auth/hooks/useAuthDialog'
import { ChatSidebar } from './ChatSidebar'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { Button } from '@/shared/components/ui'
import { LogIn } from 'lucide-react'

interface ChatPageProps {
  isAuthenticated: boolean
  messages: ChatMessage[]
  sessions: ChatSession[]
  currentSession: ChatSession | null
  isLoading: boolean
  inputValue: string
  onInputChange: (value: string) => void
  onFormSubmit: (e: FormEvent<HTMLFormElement>) => void
  onNewSession: () => void
  onSwitchSession: (sessionId: string) => void
  onDeleteSession?: (sessionId: string) => void
  onRenameSession?: (sessionId: string, title: string) => void
}

export function ChatPage({
  isAuthenticated,
  messages,
  sessions,
  currentSession,
  isLoading,
  inputValue,
  onInputChange,
  onFormSubmit,
  onNewSession,
  onSwitchSession,
  onDeleteSession,
  onRenameSession,
}: ChatPageProps) {
  const { t } = useTranslation('common')
  const { openAuthDialog } = useAuthDialog()

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthDialog('login')
    }
  }, [isAuthenticated, openAuthDialog])

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">{t('nav.chat')}</h2>
          <p className="text-muted-foreground mb-6">Please sign in to use the chat.</p>
          <Button onClick={() => openAuthDialog('login')} className="gap-2">
            <LogIn size={18} />
            {t('nav.login')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 h-full bg-background overflow-hidden">
      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSession?.id || null}
        onNewSession={onNewSession}
        onSwitchSession={onSwitchSession}
        onDeleteSession={onDeleteSession}
        onRenameSession={onRenameSession}
      />
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto">
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

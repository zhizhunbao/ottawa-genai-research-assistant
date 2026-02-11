/**
 * 聊天视图
 *
 * 视图层只组合组件和调用 Hooks。
 * 对应 Sprint 4 US-202 / US-203 / US-204。
 */

import { ChatPage } from '@/features/research/components/ChatPage'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useChat } from '@/features/research/hooks/useChat'

export default function ChatView() {
  const { isAuthenticated } = useAuth()
  const {
    messages,
    sessions,
    currentSession,
    isLoading,
    inputValue,
    handleInputChange,
    handleFormSubmit,
    startNewSession,
    switchSession,
    removeSession,
    renameSession,
  } = useChat()

  return (
    <ChatPage
      isAuthenticated={isAuthenticated}
      messages={messages}
      sessions={sessions}
      currentSession={currentSession}
      isLoading={isLoading}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onFormSubmit={handleFormSubmit}
      onNewSession={startNewSession}
      onSwitchSession={switchSession}
      onDeleteSession={removeSession}
      onRenameSession={renameSession}
    />
  )
}

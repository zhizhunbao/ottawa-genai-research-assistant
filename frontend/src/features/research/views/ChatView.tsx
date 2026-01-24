/**
 * 聊天视图
 *
 * 视图层只组合组件和调用 Hooks。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { ChatPage } from '@/features/research/components/ChatPage'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useChat } from '@/features/research/hooks/useChat'

export default function ChatView() {
  const { isAuthenticated, user } = useAuth()
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
  } = useChat()

  return (
    <ChatPage
      isAuthenticated={isAuthenticated}
      user={user}
      messages={messages}
      sessions={sessions}
      currentSession={currentSession}
      isLoading={isLoading}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onFormSubmit={handleFormSubmit}
      onNewSession={startNewSession}
      onSwitchSession={switchSession}
    />
  )
}

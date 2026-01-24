/**
 * 消息列表组件
 *
 * 显示聊天消息和来源引用。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { MessageItem } from './MessageItem'
import type { ChatMessage } from '@/features/research/types'

interface MessageListProps {
  messages: ChatMessage[]
}

export function MessageList({ messages }: MessageListProps) {
  const { t } = useTranslation('chat')

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-sm animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-glow flex items-center justify-center mx-auto mb-8 transform hover:scale-110 transition-transform cursor-default">
            <Search className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
            {t('welcome.title', { name: 'Ottawa GenAI' })}
          </h2>
          <p className="text-gray-500 leading-relaxed">
            {t('welcome.subtitle')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  )
}

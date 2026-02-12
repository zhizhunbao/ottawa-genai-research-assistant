/**
 * 消息列表组件
 *
 * 空状态显示居中的欢迎语，有消息时滚动显示消息。
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
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md px-6 animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 rounded-2xl bg-primary shadow-lg flex items-center justify-center mx-auto mb-6">
            <Search className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2 tracking-tight">
            {t('welcome.title')}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('welcome.subtitle')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  )
}

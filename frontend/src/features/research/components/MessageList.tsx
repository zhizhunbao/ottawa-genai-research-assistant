/**
 * 消息列表组件
 *
 * 显示聊天消息和来源引用。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useTranslation } from 'react-i18next'
import { Search, FileText } from 'lucide-react'
import type { ChatMessage } from '@/features/research/types'

interface MessageListProps {
  messages: ChatMessage[]
}

export function MessageList({ messages }: MessageListProps) {
  const { t } = useTranslation('chat')

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('title')}
          </h2>
          <p className="text-gray-600">{t('placeholder')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              message.role === 'user'
                ? 'bg-primary-500 text-white'
                : 'bg-white shadow-sm border border-gray-100'
            }`}
          >
            {message.isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            ) : (
              <p className={message.role === 'user' ? 'text-white' : 'text-gray-800'}>
                {message.content}
              </p>
            )}

            {message.sources && message.sources.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {t('sources.title')}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {message.sources.map((source, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {source.documentTitle} - p.{source.pageNumber}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * 聊天侧边栏组件
 *
 * 显示会话列表和用户信息。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useTranslation } from 'react-i18next'
import { Plus, User } from 'lucide-react'
import type { ChatSession } from '@/features/research/types'

interface ChatSidebarProps {
  sessions: ChatSession[]
  currentSessionId: string | null
  user?: {
    displayName?: string
    email?: string
  } | null
  onNewSession: () => void
  onSwitchSession: (sessionId: string) => void
}

export function ChatSidebar({
  sessions,
  currentSessionId,
  user,
  onNewSession,
  onSwitchSession,
}: ChatSidebarProps) {
  const { t } = useTranslation('chat')

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-lg font-semibold">{t('title')}</h1>
      </div>

      <div className="p-4">
        <button
          onClick={onNewSession}
          className="w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('newChat')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        <h3 className="px-2 py-2 text-xs text-gray-400 uppercase tracking-wider">
          {t('history')}
        </h3>
        {sessions.length === 0 ? (
          <p className="px-2 text-sm text-gray-500">{t('noHistory')}</p>
        ) : (
          <ul className="space-y-1">
            {sessions.map((session) => (
              <li key={session.id}>
                <button
                  onClick={() => onSwitchSession(session.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors ${
                    currentSessionId === session.id
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {session.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.displayName || user?.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}

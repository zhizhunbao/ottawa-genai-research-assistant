/**
 * ChatSidebar - Collapsible session list with new chat, search, rename, and delete
 *
 * @module features/chat
 * @template none
 * @reference .agent/templates/frontend/features/chat/components/conversation-list.tsx.template
 */

import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, MessageSquare, Trash2, Pencil, Check, X, MoreHorizontal, Search, PanelLeftClose } from 'lucide-react'
import type { ChatSession } from '@/features/research/types'
import {
  Button,
  ScrollArea,
  Input,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui'
import { cn } from '@/lib/utils'

interface ChatSidebarProps {
  sessions: ChatSession[]
  currentSessionId: string | null
  onNewSession: () => void
  onSwitchSession: (sessionId: string) => void
  onDeleteSession?: (sessionId: string) => void
  onRenameSession?: (sessionId: string, title: string) => void
  /** Whether the sidebar is visible */
  isOpen?: boolean
  /** Called to close/hide the sidebar */
  onClose?: () => void
}

export function ChatSidebar({
  sessions,
  currentSessionId,
  onNewSession,
  onSwitchSession,
  onDeleteSession,
  onRenameSession,
  isOpen = true,
  onClose,
}: ChatSidebarProps) {
  const { t } = useTranslation('chat')

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSessions = searchQuery.trim()
    ? sessions.filter((s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sessions

  const handleStartEdit = useCallback((session: ChatSession) => {
    setEditingId(session.id)
    setEditTitle(session.title)
  }, [])

  const handleConfirmEdit = useCallback(() => {
    if (editingId && editTitle.trim() && onRenameSession) {
      onRenameSession(editingId, editTitle.trim())
    }
    setEditingId(null)
  }, [editingId, editTitle, onRenameSession])

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
  }, [])

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'w-64 h-full bg-muted/40 flex flex-col border-r border-border shrink-0',
          'transition-all duration-300 ease-in-out z-40',
          'fixed lg:relative',
          isOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:-translate-x-full',
          !isOpen && 'lg:w-0 lg:border-r-0 lg:overflow-hidden',
        )}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Conversations
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Hide sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          )}
        </div>

        {/* New Chat + Search */}
        <div className="px-4 pb-2 space-y-2">
          <Button
            onClick={onNewSession}
            className="w-full gap-2 shadow-sm"
            size="default"
          >
            <Plus className="w-4 h-4" />
            {t('newChat')}
          </Button>

          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchSessions') || 'Search chats...'}
              className="w-full h-8 pl-8 pr-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Session List */}
        <ScrollArea className="flex-1">
          <div className="px-3 pb-4">
            <h3 className="px-3 py-2 text-xs font-medium text-muted-foreground">
              {t('history')}
            </h3>

            {sessions.length === 0 && !searchQuery ? (
              <div className="px-3 py-12 text-center">
                <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground/60">{t('noHistory')}</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredSessions.length === 0 ? (
                  <p className="px-3 py-4 text-xs text-muted-foreground/60 text-center">
                    No matching chats found
                  </p>
                ) : (
                  filteredSessions.map((session) => (
                    <div key={session.id}>
                      {/* Editing mode */}
                      {editingId === session.id ? (
                        <div className="flex items-center gap-1.5 px-1">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleConfirmEdit()
                              if (e.key === 'Escape') handleCancelEdit()
                            }}
                            className="h-9 text-sm flex-1"
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            onClick={handleConfirmEdit}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={handleCancelEdit}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        /* Normal mode */
                        <div
                          className={cn(
                            'group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors',
                            currentSessionId === session.id
                              ? 'bg-background shadow-sm border border-border/50'
                              : 'hover:bg-background/60'
                          )}
                          onClick={() => onSwitchSession(session.id)}
                        >
                          <MessageSquare className={cn(
                            'w-4 h-4 shrink-0',
                            currentSessionId === session.id
                              ? 'text-primary'
                              : 'text-muted-foreground/50'
                          )} />
                          <span className="flex-1 text-sm truncate">
                            {session.title}
                          </span>

                          {/* Actions dropdown */}
                          {(onRenameSession || onDeleteSession) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn(
                                    'h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity',
                                    currentSessionId === session.id && 'opacity-100'
                                  )}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                {onRenameSession && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleStartEdit(session)
                                    }}
                                  >
                                    <Pencil className="w-4 h-4 mr-2" />
                                    {t('session.rename')}
                                  </DropdownMenuItem>
                                )}
                                {onDeleteSession && (
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onDeleteSession(session.id)
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {t('session.delete')}
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>
    </>
  )
}

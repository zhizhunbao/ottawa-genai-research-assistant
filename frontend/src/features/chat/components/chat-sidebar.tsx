/**
 * ChatSidebar - Session list with new chat, rename, and delete actions
 *
 * @module features/chat
 * @template none
 * @reference none
 */

import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, MessageSquare, Trash2, Pencil, Check, X, MoreHorizontal } from 'lucide-react'
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
}

export function ChatSidebar({
  sessions,
  currentSessionId,
  onNewSession,
  onSwitchSession,
  onDeleteSession,
  onRenameSession,
}: ChatSidebarProps) {
  const { t } = useTranslation('chat')

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

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
    <aside className="w-64 h-full bg-muted/40 flex flex-col border-r border-border shrink-0">
      {/* New Chat Button */}
      <div className="p-4">
        <Button
          onClick={onNewSession}
          className="w-full gap-2 shadow-sm"
          size="default"
        >
          <Plus className="w-4 h-4" />
          {t('newChat')}
        </Button>
      </div>

      {/* Session List */}
      <ScrollArea className="flex-1">
        <div className="px-3 pb-4">
          <h3 className="px-3 py-2 text-xs font-medium text-muted-foreground">
            {t('history')}
          </h3>

          {sessions.length === 0 ? (
            <div className="px-3 py-12 text-center">
              <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground/60">{t('noHistory')}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => (
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
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}

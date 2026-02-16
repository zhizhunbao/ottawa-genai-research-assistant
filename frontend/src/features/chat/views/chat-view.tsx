/**
 * ChatView - Split-pane layout with File Explorer (left) and Chat Interface (right)
 *
 * The File Explorer is displayed side-by-side with the chat area so users can drag
 * files from the explorer directly into the chat input. The chat session list is
 * embedded as a dropdown in the chat top-bar instead of occupying a separate panel.
 *
 * @module features/chat/views
 * @template none
 * @reference .agent/templates/frontend/features/chat/components/conversation-layout.tsx.template
 */
import { useState, useCallback } from 'react';
import {
    PanelLeftClose,
    PanelLeft,
    Plus,
    MessageSquare,
    ChevronDown,
    Trash2,
} from 'lucide-react';
import { ChatInterface } from '../components/chat-interface';
import { FileExplorer } from '@/features/documents/components/file-explorer';
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/shared/components/ui';
import { cn } from '@/lib/utils';
import useChat from '../hooks/use-chat';

// ============================================================
// Main Component
// ============================================================

export default function ChatView() {
    const {
        sessions,
        currentSessionId,
        startNewSession,
        switchSession,
        removeSession,
    } = useChat();

    const [explorerOpen, setExplorerOpen] = useState(true);

    const toggleExplorer = useCallback(() => {
        setExplorerOpen((prev) => !prev);
    }, []);

    // Find current session title for the dropdown trigger
    const currentSession = sessions.find((s) => s.id === currentSessionId);
    const currentTitle = currentSession?.title || 'New Chat';

    return (
        <div className="flex h-full w-full overflow-hidden relative">
            {/* Left: File Explorer (collapsible) */}
            <div
                className={cn(
                    'h-full border-r border-border shrink-0 transition-all duration-300 ease-in-out overflow-hidden bg-muted/20',
                    explorerOpen ? 'w-64' : 'w-0 border-r-0',
                )}
            >
                <div className="w-64 h-full">
                    <FileExplorer />
                </div>
            </div>

            {/* Right: Chat area with session dropdown */}
            <div className="flex-1 min-w-0 flex flex-col">
                {/* Session bar — replaces the old ChatSidebar */}
                <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/50 bg-background/80 backdrop-blur-sm">
                    {/* Explorer toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        title={explorerOpen ? 'Hide Explorer' : 'Show Explorer'}
                        onClick={toggleExplorer}
                    >
                        {explorerOpen ? (
                            <PanelLeftClose className="h-4 w-4" />
                        ) : (
                            <PanelLeft className="h-4 w-4" />
                        )}
                    </Button>

                    {/* Session dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-8 gap-1.5 px-2 text-sm font-medium max-w-[240px]"
                            >
                                <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                <span className="truncate">{currentTitle}</span>
                                <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-64 max-h-80 overflow-y-auto">
                            {/* New chat button */}
                            <DropdownMenuItem
                                onClick={startNewSession}
                                className="gap-2 font-medium"
                            >
                                <Plus className="h-4 w-4" />
                                New Chat
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />

                            {/* Session list */}
                            {sessions.length === 0 ? (
                                <div className="px-2 py-3 text-xs text-muted-foreground text-center">
                                    No chat sessions yet
                                </div>
                            ) : (
                                sessions.map((session) => (
                                    <DropdownMenuItem
                                        key={session.id}
                                        onClick={() => switchSession(session.id)}
                                        className={cn(
                                            'gap-2 justify-between group',
                                            session.id === currentSessionId && 'bg-primary/5 font-medium',
                                        )}
                                    >
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                            <span className="truncate text-sm">
                                                {session.title || 'Untitled Chat'}
                                            </span>
                                        </div>
                                        {session.id !== currentSessionId && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeSession(session.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/10 transition-opacity"
                                                title="Delete session"
                                            >
                                                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                            </button>
                                        )}
                                    </DropdownMenuItem>
                                ))
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="flex-1" />
                </div>

                {/* Chat Interface (without its own sidebar toggle, we handle it above) */}
                <div className="flex-1 min-h-0">
                    <ChatInterface
                        sidebarOpen={true}
                        onToggleSidebar={toggleExplorer}
                    />
                </div>
            </div>
        </div>
    );
}

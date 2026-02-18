/**
 * ChatInterface - Main chat view composing virtualized message list and input area
 *
 * Uses the useChat hook which internally handles streaming via useChatStream.
 * Includes:
 * - Smart scroll: pauses auto-scroll when user scrolls up
 * - Floating scroll-to-bottom button
 * - Virtualized message list via @tanstack/react-virtual for 500+ messages
 *
 * @module features/chat
 * @template .agent/templates/frontend/features/chat/chat-interface.tsx.template
 * @reference .agent/templates/frontend/features/chat/components/message-list.tsx.template
 * @reference .agent/templates/frontend/features/chat/components/scroll-to-bottom.tsx.template
 */
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { MessageItem } from './message-item';
import { ChatInput } from './chat-input';
import { ModelSelector } from './model-selector';
import useChat from '../../hooks/use-chat';
import { ChevronDown, PanelLeft, FlaskConical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { benchmarkApi } from '../../services/benchmark-api';

/** Threshold for triggering virtualization (below this, render all) */
const VIRTUALIZE_THRESHOLD = 50;

/** Welcome screen shown when no messages exist */
function WelcomeScreen() {
    return (
        <div className="h-full flex flex-col items-center justify-center text-center mt-20 p-8">
            <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mb-6">
                <span className="text-3xl">🤖</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome to the Research Assistant</h2>
            <p className="text-muted-foreground max-w-sm">
                Upload papers, reports, or ask questions directly. I will provide in-depth analysis through multi-agent collaboration and deep search.
            </p>
        </div>
    );
}

interface ChatInterfaceProps {
    /** Whether the sidebar is currently open */
    sidebarOpen?: boolean;
    /** Toggle sidebar visibility */
    onToggleSidebar?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
    sidebarOpen = true,
    onToggleSidebar,
}) => {
    const {
        messages,
        isLoading,
        isStreaming,
        sendMessage,
        abortStream,
        copyMessage,
        editMessage,
        retryMessage,
        removeMessage,
    } = useChat();

    const navigate = useNavigate();

    // ============================================================
    // Smart Scroll Management
    // ============================================================

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const userScrolledRef = useRef(false);
    const isAutoScrollingRef = useRef(false);
    const [showScrollButton, setShowScrollButton] = useState(false);

    // Model selection (persisted)
    const [selectedModel, setSelectedModel] = useState(() => {
        try {
            return localStorage.getItem('chat-selected-model') ?? 'gpt-4o-mini';
        } catch {
            return 'gpt-4o-mini';
        }
    });

    // Active strategy from benchmark
    const [activeStrategy, setActiveStrategy] = useState<{
        strategy?: { name?: string; llm_model?: string; embedding_model?: string; search_engine?: string };
        overall_score?: number;
    } | null>(null);

    useEffect(() => {
        benchmarkApi.getLeaderboard()
            .then((data) => {
                if (data.leaderboard?.length) {
                    setActiveStrategy(data.leaderboard[0]);
                }
            })
            .catch(() => { /* no benchmark yet — ignore */ });
    }, []);

    const handleModelChange = useCallback((modelId: string) => {
        setSelectedModel(modelId);
        localStorage.setItem('chat-selected-model', modelId);
    }, []);

    const checkAtBottom = useCallback((): boolean => {
        const el = scrollContainerRef.current;
        if (!el) return true;
        return el.scrollHeight - el.scrollTop - el.clientHeight <= 24;
    }, []);

    const scrollToBottom = useCallback((instant = false) => {
        isAutoScrollingRef.current = true;
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior: instant ? 'instant' : 'smooth',
            });
        }
        setTimeout(() => {
            isAutoScrollingRef.current = false;
        }, 100);
    }, []);

    const handleScroll = useCallback(() => {
        const atBottom = checkAtBottom();
        setShowScrollButton(!atBottom);

        if (!atBottom && !isAutoScrollingRef.current) {
            userScrolledRef.current = true;
        } else if (atBottom) {
            userScrolledRef.current = false;
        }
    }, [checkAtBottom]);

    /** Auto-scroll during streaming if user hasn't scrolled up */
    useEffect(() => {
        if (isStreaming && !userScrolledRef.current) {
            scrollToBottom();
        }
    });

    /** Reset user scroll flag when streaming ends */
    useEffect(() => {
        if (!isStreaming) {
            userScrolledRef.current = false;
        }
    }, [isStreaming]);

    /** Scroll to bottom on new user message */
    useEffect(() => {
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.role === 'user') {
                scrollToBottom(true);
            }
        }
    }, [messages.length, scrollToBottom]);

    // ============================================================
    // Virtualization (only for large message lists)
    // ============================================================

    const shouldVirtualize = messages.length >= VIRTUALIZE_THRESHOLD;

    const virtualizer = useVirtualizer({
        count: messages.length,
        getScrollElement: () => scrollContainerRef.current,
        estimateSize: () => 120, // estimated average message height
        overscan: 5,
        enabled: shouldVirtualize,
    });

    const handleSendMessage = async (content: string, _options: { deepSearch: boolean; files: File[] }) => {
        await sendMessage(content, selectedModel);
    };

    // ============================================================
    // Render
    // ============================================================

    const renderMessages = () => {
        if (messages.length === 0) {
            return <WelcomeScreen />;
        }

        if (shouldVirtualize) {
            // Virtualized rendering for large lists
            const virtualItems = virtualizer.getVirtualItems();
            return (
                <div
                    className="max-w-4xl mx-auto relative"
                    style={{ height: virtualizer.getTotalSize(), width: '100%' }}
                >
                    {virtualItems.map((virtualRow) => {
                        const msg = messages[virtualRow.index];
                        return (
                            <div
                                key={virtualRow.key}
                                data-index={virtualRow.index}
                                ref={virtualizer.measureElement}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    transform: `translateY(${virtualRow.start}px)`,
                                }}
                            >
                                <MessageItem
                                    message={msg}
                                    onCopy={copyMessage}
                                    onEdit={editMessage}
                                    onRetry={retryMessage}
                                    onDelete={removeMessage}
                                />
                            </div>
                        );
                    })}
                </div>
            );
        }

        // Non-virtualized rendering for small lists
        return (
            <div className="max-w-4xl mx-auto py-8">
                {messages.map((m) => (
                    <MessageItem
                        key={m.id}
                        message={m}
                        onCopy={copyMessage}
                        onEdit={editMessage}
                        onRetry={retryMessage}
                        onDelete={removeMessage}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Top bar: sidebar toggle + model selector + strategy badge */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50 bg-background/80 backdrop-blur-sm">
                {/* Sidebar toggle – shown only when sidebar is hidden */}
                {!sidebarOpen && onToggleSidebar && (
                    <button
                        onClick={onToggleSidebar}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Show sidebar"
                    >
                        <PanelLeft size={18} />
                    </button>
                )}
                <ModelSelector
                    selectedModelId={selectedModel}
                    onModelChange={handleModelChange}
                />

                {/* Spacer */}
                <div className="flex-1" />

                {/* Active strategy badge */}
                {activeStrategy?.strategy && (
                    <button
                        onClick={() => navigate('/strategy-lab')}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                        title="Current best strategy from benchmark"
                    >
                        <FlaskConical className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                            {activeStrategy.strategy.llm_model} + {activeStrategy.strategy.search_engine}
                        </span>
                        {activeStrategy.overall_score != null && (
                            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px]">
                                {activeStrategy.overall_score.toFixed(1)}
                            </span>
                        )}
                    </button>
                )}
            </div>

            {/* Scrollable message area */}
            <div className="relative flex-1 overflow-hidden">
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="h-full overflow-y-auto overflow-x-hidden px-4"
                    style={{ overflowAnchor: 'none' }}
                >
                    <div className="max-w-3xl mx-auto py-4">
                        {renderMessages()}
                        {/* Scroll anchor */}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Floating scroll-to-bottom button */}
                <button
                    onClick={() => scrollToBottom()}
                    className={cn(
                        "absolute bottom-4 left-1/2 -translate-x-1/2 z-10",
                        "w-9 h-9 rounded-full border border-border bg-background shadow-lg",
                        "flex items-center justify-center",
                        "text-muted-foreground hover:text-foreground hover:bg-muted",
                        "transition-all duration-200",
                        showScrollButton
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-2 pointer-events-none"
                    )}
                    aria-label="Scroll to bottom"
                >
                    <ChevronDown size={18} />
                </button>
            </div>

            <footer className="border-t border-border bg-card/20 backdrop-blur-lg pt-3 pb-4">
                <div className="max-w-3xl mx-auto flex flex-col gap-2 px-4">
                    {isStreaming && (
                        <button
                            onClick={abortStream}
                            className="self-center px-4 py-1.5 text-xs rounded-full border border-destructive text-destructive hover:bg-destructive/10 transition-colors"
                        >
                            ■ Stop generating
                        </button>
                    )}
                    <ChatInput onSend={handleSendMessage} isLoading={isLoading || isStreaming} />
                </div>
            </footer>
        </div>
    );
};

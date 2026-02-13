/**
 * ChatInterface - Main chat view composing message list and input area
 *
 * Uses the useChat hook which internally handles streaming via useChatStream.
 *
 * @module features/chat
 * @template none
 * @reference none
 */
import React, { useRef, useEffect } from 'react';
import { MessageItem } from './message-item';
import { ChatInput } from './chat-input';
import useChat from '../hooks/use-chat';
import { ScrollArea } from '@/shared/components/ui';

export const ChatInterface: React.FC = () => {
    const {
        messages,
        isLoading,
        isStreaming,
        sendMessage,
        abortStream,
    } = useChat();

    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages]);

    const handleSendMessage = async (content: string, _options: { deepSearch: boolean; files: File[] }) => {
        await sendMessage(content);
    };

    return (
        <div className="flex flex-col h-full bg-background">
            <header className="px-6 py-4 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-10">
                <h1 className="text-lg font-semibold flex items-center gap-2">
                    AI Research Assistant
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] uppercase tracking-wider">v2.0</span>
                </h1>
            </header>

            <div className="flex-1 overflow-hidden" ref={scrollRef}>
                <ScrollArea className="h-full px-4 lg:px-0">
                    <div className="max-w-4xl mx-auto py-8">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center mt-20 p-8">
                                <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mb-6">
                                    <span className="text-3xl">🤖</span>
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Welcome to the Research Assistant</h2>
                                <p className="text-muted-foreground max-w-sm">
                                    Upload papers, reports, or ask questions directly. I will provide in-depth analysis through multi-agent collaboration and deep search.
                                </p>
                            </div>
                        ) : (
                            messages.map((m) => (
                                <MessageItem key={m.id} message={m} />
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>

            <footer className="border-t border-border bg-card/20 backdrop-blur-lg pb-4">
                <div className="max-w-4xl mx-auto flex flex-col gap-2">
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

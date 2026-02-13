/**
 * MessageItem - Renders individual chat messages with markdown, sources, and confidence
 *
 * @module features/chat
 * @template none
 * @reference none
 */
import React, { useState } from 'react';
import type { ChatMessage } from '@/features/research/types';
import ReactMarkdown from 'react-markdown';
import { ChevronDown, ChevronUp, Bot, User, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConfidenceIndicator } from './confidence-indicator';

interface MessageItemProps {
    message: ChatMessage;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
    const [isSourcesExpanded, setIsSourcesExpanded] = useState(false);
    const isAssistant = message.role === 'assistant';

    return (
        <div className={cn(
            "flex w-full mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300",
            isAssistant ? "justify-start" : "justify-end"
        )}>
            <div className={cn(
                "flex max-w-[85%] lg:max-w-[75%] gap-3",
                !isAssistant && "flex-row-reverse"
            )}>
                {/* Avatar */}
                <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    isAssistant ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                    {isAssistant ? <Bot size={18} /> : <User size={18} />}
                </div>

                {/* Content area */}
                <div className="flex flex-col gap-2">
                    {/* Message bubble */}
                    <div className={cn(
                        "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                        isAssistant
                            ? "bg-card border border-border text-card-foreground rounded-tl-none"
                            : "bg-primary text-primary-foreground rounded-tr-none"
                    )}>
                        {message.isLoading && !message.content ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <span className="inline-flex gap-1">
                                    <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </span>
                                <span className="text-xs">Thinking...</span>
                            </div>
                        ) : (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown>
                                    {message.content}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>

                    {/* Confidence indicator */}
                    {isAssistant && message.confidence !== undefined && !message.isLoading && (
                        <ConfidenceIndicator confidence={message.confidence} />
                    )}

                    {/* Sources section */}
                    {isAssistant && message.sources && message.sources.length > 0 && (
                        <div className="bg-muted/30 border border-border rounded-lg overflow-hidden">
                            <button
                                onClick={() => setIsSourcesExpanded(!isSourcesExpanded)}
                                className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <FileText size={14} />
                                    <span>{message.sources.length} source{message.sources.length > 1 ? 's' : ''}</span>
                                </div>
                                {isSourcesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                            {isSourcesExpanded && (
                                <div className="px-3 py-2 border-t border-border space-y-2">
                                    {message.sources.map((source, i) => (
                                        <div key={i} className="text-xs text-muted-foreground">
                                            <span className="font-medium text-foreground">{source.documentTitle}</span>
                                            {source.pageNumber > 0 && (
                                                <span className="ml-1">(p.{source.pageNumber})</span>
                                            )}
                                            <p className="mt-0.5 line-clamp-2">{source.excerpt}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Timestamp / Status */}
                    <div className={cn(
                        "text-[10px] text-muted-foreground px-1",
                        !isAssistant && "text-right"
                    )}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {message.isLoading && " · Streaming..."}
                    </div>
                </div>
            </div>
        </div>
    );
};

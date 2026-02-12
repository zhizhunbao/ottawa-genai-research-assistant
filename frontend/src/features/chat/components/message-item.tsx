/**
 * Message Item Component
 *
 * Renders individual chat messages with markdown support and thinking process visualization.
 *
 * @template — Custom Implementation
 */
import React, { useState } from 'react';
import { Message, AgentStep } from '../types';
import ReactMarkdown from 'react-markdown';
import { ChevronDown, ChevronUp, Bot, User, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils'; // 使用项目现有的 cn 工具

interface MessageItemProps {
    message: Message;
    steps?: AgentStep[];
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
    const [isThoughtExpanded, setIsThoughtExpanded] = useState(false);
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
                {/* 头像 */}
                <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    isAssistant ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                    {isAssistant ? <Bot size={18} /> : <User size={18} />}
                </div>

                {/* 内容区 */}
                <div className="flex flex-col gap-2">
                    {/* 思考过程 (如有) */}
                    {message.thought && (
                        <div className="bg-muted/30 border border-border rounded-lg overflow-hidden">
                            <button
                                onClick={() => setIsThoughtExpanded(!isThoughtExpanded)}
                                className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Cpu size={14} className="animate-pulse" />
                                    <span>Thinking process...</span>
                                </div>
                                {isThoughtExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                            {isThoughtExpanded && (
                                <div className="px-3 py-2 text-sm text-muted-foreground italic border-t border-border bg-muted/10 whitespace-pre-wrap">
                                    {message.thought}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 消息气泡 */}
                    <div className={cn(
                        "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                        isAssistant
                            ? "bg-card border border-border text-card-foreground rounded-tl-none"
                            : "bg-primary text-primary-foreground rounded-tr-none"
                    )}>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    </div>

                    {/* 时间戳/状态 */}
                    <div className={cn(
                        "text-[10px] text-muted-foreground px-1",
                        !isAssistant && "text-right"
                    )}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {message.status === 'loading' && " · 正在响应..."}
                    </div>
                </div>
            </div>
        </div>
    );
};

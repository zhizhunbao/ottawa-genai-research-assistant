/**
 * MessageItem - Renders individual chat messages with markdown, sources, confidence,
 * and hover action toolbar (copy/edit/delete/retry)
 *
 * @module features/chat
 * @template .agent/templates/frontend/features/chat/message-item.tsx.template
 * @reference .agent/templates/frontend/features/chat/components/chat-bubble.tsx.template
 */
import { useState, useCallback } from 'react';
import type { ChatMessage } from '@/features/research/types';
import ReactMarkdown from 'react-markdown';
import {
    ChevronDown,
    ChevronUp,
    Bot,
    User,
    FileText,
    AlertCircle,
    Copy,
    Check,
    Pencil,
    RefreshCw,
    Trash2,
    ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConfidenceIndicator } from './confidence-indicator';
import { usePreviewStore } from '@/stores/preview-store';
import { ChartContainer } from '@/shared/components/charts';

interface MessageItemProps {
    message: ChatMessage;
    /** Copy message content to clipboard */
    onCopy?: (messageId: string) => void;
    /** Edit user message (opens edit mode) */
    onEdit?: (messageId: string, newContent: string) => void;
    /** Retry AI response generation */
    onRetry?: (messageId: string) => void;
    /** Delete a message */
    onDelete?: (messageId: string) => void;
}

/** Check if message content is an error */
function isErrorMessage(content: string): boolean {
    return content.toLowerCase().includes('error') ||
           content.toLowerCase().includes('sorry') ||
           content.includes('500') ||
           content.includes('failed');
}

export const MessageItem = ({
    message,
    onCopy,
    onEdit,
    onRetry,
    onDelete,
}: MessageItemProps) => {
    const [isSourcesExpanded, setIsSourcesExpanded] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);
    const openPreview = usePreviewStore((s) => s.openPreview);

    const isAssistant = message.role === 'assistant';
    const hasError = isAssistant && isErrorMessage(message.content);

    /** Handle copy with visual feedback */
    const handleCopy = useCallback(() => {
        onCopy?.(message.id);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }, [message.id, onCopy]);

    /** Handle edit submit */
    const handleEditSubmit = useCallback(() => {
        if (editContent.trim() && editContent !== message.content) {
            onEdit?.(message.id, editContent.trim());
        }
        setIsEditing(false);
    }, [message.id, editContent, message.content, onEdit]);

    /** Handle edit cancel */
    const handleEditCancel = useCallback(() => {
        setEditContent(message.content);
        setIsEditing(false);
    }, [message.content]);

    return (
        <div className={cn(
            "group relative flex w-full mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
            isAssistant ? "justify-start" : "justify-end"
        )}>
            <div className={cn(
                "flex max-w-[85%] lg:max-w-[70%] gap-2.5",
                !isAssistant && "flex-row-reverse"
            )}>
                {/* Avatar */}
                <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                    isAssistant
                        ? "bg-linear-to-br from-primary to-primary/80 text-primary-foreground shadow-sm"
                        : "bg-primary text-primary-foreground"
                )}>
                    {isAssistant ? <Bot size={15} /> : <User size={15} />}
                </div>

                {/* Content area */}
                <div className="flex flex-col gap-1.5 min-w-0">
                    {/* Message bubble */}
                    <div className={cn(
                        "relative px-3.5 py-2.5 text-sm leading-relaxed",
                        isAssistant
                            ? "bg-muted/50 text-foreground rounded-2xl rounded-tl-md"
                            : "bg-primary text-primary-foreground rounded-2xl rounded-tr-md shadow-sm"
                    )}>
                        {message.isLoading && !message.content ? (
                            <div className="flex items-center gap-2 text-muted-foreground py-1">
                                <span className="inline-flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </span>
                            </div>
                        ) : hasError ? (
                            <div className="flex items-start gap-2 text-destructive/80">
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                <span className="text-sm">Something went wrong. Please try again.</span>
                            </div>
                        ) : isEditing ? (
                            /* Edit mode for user messages */
                            <div className="flex flex-col gap-2">
                                <textarea
                                    className="w-full bg-transparent border border-primary-foreground/20 rounded-lg px-2 py-1.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary-foreground/30"
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    rows={Math.min(editContent.split('\n').length + 1, 6)}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleEditSubmit();
                                        }
                                        if (e.key === 'Escape') {
                                            handleEditCancel();
                                        }
                                    }}
                                />
                                <div className="flex gap-1.5 justify-end">
                                    <button
                                        onClick={handleEditCancel}
                                        className="px-2.5 py-1 text-xs rounded-md bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleEditSubmit}
                                        className="px-2.5 py-1 text-xs rounded-md bg-primary-foreground/20 hover:bg-primary-foreground/30 font-medium transition-colors"
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-headings:my-2">
                                    <ReactMarkdown>
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                                {/* Inline chart visualization */}
                                {message.chart && (
                                    <div className="mt-3 -mx-1">
                                        <ChartContainer
                                            chart={{
                                                type: message.chart.type,
                                                title: message.chart.title,
                                                xKey: message.chart.xKey,
                                                yKeys: message.chart.yKeys,
                                                data: message.chart.data,
                                                stacked: message.chart.stacked,
                                            }}
                                            sources={message.sources?.map(s => ({
                                                document_id: s.documentId,
                                                document_name: s.documentTitle,
                                                page_number: s.pageNumber > 0 ? s.pageNumber : undefined,
                                            }))}
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        {/* Hover action toolbar */}
                        {!message.isLoading && !isEditing && (
                            <div className={cn(
                                "absolute flex items-center gap-0.5 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200",
                                "bg-background border border-border rounded-lg shadow-md p-0.5",
                                isAssistant
                                    ? "-top-8 left-0"
                                    : "-top-8 right-0"
                            )}>
                                {/* Copy */}
                                {onCopy && (
                                    <button
                                        onClick={handleCopy}
                                        title={isCopied ? 'Copied!' : 'Copy'}
                                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                    >
                                        {isCopied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                                    </button>
                                )}
                                {/* Edit (user messages only) */}
                                {onEdit && !isAssistant && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        title="Edit"
                                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                    >
                                        <Pencil size={13} />
                                    </button>
                                )}
                                {/* Retry (assistant messages only) */}
                                {onRetry && isAssistant && !hasError && (
                                    <button
                                        onClick={() => onRetry(message.id)}
                                        title="Regenerate"
                                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                    >
                                        <RefreshCw size={13} />
                                    </button>
                                )}
                                {/* Delete */}
                                {onDelete && (
                                    <button
                                        onClick={() => onDelete(message.id)}
                                        title="Delete"
                                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer: Confidence + Usage + Sources + Timestamp inline */}
                    {isAssistant && !message.isLoading && !hasError && (
                        <div className="flex items-center gap-2 px-1 flex-wrap">
                            {/* Confidence badge */}
                            {message.confidence !== undefined && (
                                <ConfidenceIndicator confidence={message.confidence} />
                            )}

                            {/* Token usage + cost */}
                            {message.usage && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/70 font-mono">
                                    <span>{message.usage.total_tokens.toLocaleString()} tokens</span>
                                    {message.usage.estimated_cost > 0 && (
                                        <>
                                            <span className="opacity-40">·</span>
                                            <span>${message.usage.estimated_cost < 0.01
                                                ? message.usage.estimated_cost.toFixed(4)
                                                : message.usage.estimated_cost.toFixed(2)}</span>
                                        </>
                                    )}
                                    {message.usage.estimated_cost === 0 && (
                                        <>
                                            <span className="opacity-40">·</span>
                                            <span className="text-emerald-500">free</span>
                                        </>
                                    )}
                                </span>
                            )}

                            {/* Sources toggle */}
                            {message.sources && message.sources.length > 0 && (
                                <button
                                    onClick={() => setIsSourcesExpanded(!isSourcesExpanded)}
                                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <FileText size={12} />
                                    <span>{message.sources.length} source{message.sources.length > 1 ? 's' : ''}</span>
                                    {isSourcesExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                </button>
                            )}

                            {/* Timestamp */}
                            <span className="text-[10px] text-muted-foreground/60 ml-auto">
                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    )}

                    {/* User message timestamp */}
                    {!isAssistant && (
                        <span className="text-[10px] text-muted-foreground/60 text-right px-1">
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}

                    {/* Expanded sources — each item is clickable to open the preview drawer */}
                    {isAssistant && isSourcesExpanded && message.sources && message.sources.length > 0 && (
                        <div className="bg-muted/30 rounded-lg p-2 space-y-1 ml-1">
                            {message.sources.map((source, i) => (
                                <button
                                    key={i}
                                    onClick={() => openPreview(source, source.pageNumber, source.excerpt)}
                                    className="w-full text-left flex items-start gap-2 text-xs text-muted-foreground rounded-lg px-2.5 py-2 hover:bg-primary/5 hover:text-foreground transition-colors group/source cursor-pointer"
                                    title="Click to preview source"
                                >
                                    <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/50 group-hover/source:text-primary transition-colors" />
                                    <div className="flex-1 min-w-0">
                                        <span className="font-medium text-foreground">{source.documentTitle}</span>
                                        {source.pageNumber > 0 && (
                                            <span className="ml-1 text-muted-foreground/70">(p.{source.pageNumber})</span>
                                        )}
                                        <p className="mt-0.5 line-clamp-2 text-muted-foreground/80">{source.excerpt}</p>
                                    </div>
                                    <ExternalLink className="h-3 w-3 mt-0.5 shrink-0 opacity-0 group-hover/source:opacity-100 text-primary transition-opacity" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * ChatInput - Rich chat input with file upload, deep search toggle, and stop generation
 *
 * @module features/chat
 * @template none
 * @reference none
 */
import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Search, StopCircle, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
    onSend: (message: string, options: { deepSearch: boolean; files: File[] }) => void;
    isLoading: boolean;
    onStop?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading, onStop }) => {
    const [input, setInput] = useState('');
    const [isDeepSearch, setIsDeepSearch] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'inherit';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
        }
    }, [input]);

    const handleSend = () => {
        if ((!input.trim() && files.length === 0) || isLoading) return;
        onSend(input, { deepSearch: isDeepSearch, files });
        setInput('');
        setFiles([]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="relative w-full max-w-4xl mx-auto p-4">
            {files.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2 p-2 bg-muted/40 rounded-lg border border-border/50">
                    {files.map((file, i) => (
                        <div key={i} className="flex items-center gap-2 bg-background px-2 py-1 rounded border text-xs text-muted-foreground">
                            <span className="truncate max-w-[100px]">{file.name}</span>
                            <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-destructive">×</button>
                        </div>
                    ))}
                </div>
            )}

            <div className="relative bg-background border border-border rounded-2xl shadow-lg transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask the AI research assistant anything..."
                    className="w-full bg-transparent border-0 focus:ring-0 resize-none py-4 px-12 text-sm leading-relaxed min-h-[56px] max-h-[200px]"
                    rows={1}
                />

                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute left-3 bottom-3 p-2 text-muted-foreground hover:text-primary transition-colors"
                    title="Upload file"
                >
                    <Paperclip size={20} />
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                        onChange={(e) => setFiles(prev => [...prev, ...Array.from(e.target.files || [])])}
                    />
                </button>

                <div className="flex items-center justify-between px-3 py-2 border-t border-border/50">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsDeepSearch(!isDeepSearch)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all",
                                isDeepSearch
                                    ? "bg-primary/10 text-primary border border-primary/20"
                                    : "bg-muted text-muted-foreground hover:bg-muted-foreground/10 border border-transparent"
                            )}
                        >
                            <Search size={14} className={isDeepSearch ? "animate-pulse" : ""} />
                            <span>Deep Research Mode</span>
                        </button>
                    </div>

                    <div className="flex items-center">
                        {isLoading ? (
                            <button
                                onClick={onStop}
                                className="bg-destructive text-destructive-foreground p-2 rounded-xl hover:opacity-90 transition-all scale-95"
                            >
                                <StopCircle size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() && files.length === 0}
                                className={cn(
                                    "p-2 rounded-xl transition-all",
                                    (input.trim() || files.length > 0)
                                        ? "bg-primary text-primary-foreground shadow-sm scale-100"
                                        : "bg-muted text-muted-foreground scale-95 opacity-50 cursor-not-allowed"
                                )}
                            >
                                <ArrowUp size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

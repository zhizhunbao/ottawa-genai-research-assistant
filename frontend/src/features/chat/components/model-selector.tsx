/**
 * ModelSelector - Inline model switcher displayed above the chat input
 *
 * Fetches available models dynamically from the backend API.
 * Uses a portal to render the dropdown to avoid overflow clipping.
 *
 * @module features/chat/components
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Cloud, Monitor, Sparkles, Zap, Brain, Check, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// Types
// ============================================================

export interface ModelInfo {
    id: string;
    name: string;
    provider: 'azure' | 'ollama';
    available: boolean;
    size?: number;
}

// ============================================================
// Helpers
// ============================================================

function getModelIcon(model: ModelInfo) {
    if (model.provider === 'ollama') return Brain;
    if (model.id.includes('4o-mini') || model.id.includes('35-turbo') || model.id.includes('3.5')) return Zap;
    return Sparkles;
}

function getModelDescription(model: ModelInfo): string {
    const id = model.id.toLowerCase();
    if (id.includes('4o-mini')) return 'Fast & cost-effective';
    if (id.includes('4o')) return 'Most capable, multimodal';
    if (id.includes('4-turbo')) return 'High performance, large context';
    if (id.includes('35-turbo') || id.includes('3.5')) return 'Fastest response time';
    if (id.includes('llama')) return 'Meta open-source model';
    if (id.includes('mistral')) return 'Efficient European model';
    if (id.includes('deepseek')) return 'Reasoning-focused model';
    if (id.includes('qwen')) return 'Multilingual, code-capable';
    if (id.includes('phi')) return 'Microsoft compact model';
    if (id.includes('gemma')) return 'Google open-source model';
    return 'Local model';
}

function formatSize(bytes?: number): string {
    if (!bytes) return '';
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) return `${gb.toFixed(1)} GB`;
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(0)} MB`;
}

const KNOWN_NAMES: Record<string, string> = {
    'gpt-4o': 'GPT-4o',
    'gpt-4o-mini': 'GPT-4o Mini',
    'gpt-4-turbo': 'GPT-4 Turbo',
    'gpt-4': 'GPT-4',
    'gpt-35-turbo': 'GPT-3.5 Turbo',
    'gpt-3.5-turbo': 'GPT-3.5 Turbo',
};

function formatModelName(raw: string): string {
    const known = KNOWN_NAMES[raw.toLowerCase()];
    if (known) return known;
    return raw
        .split(/[:\s]+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

// ============================================================
// Component
// ============================================================

interface ModelSelectorProps {
    selectedModelId: string;
    onModelChange: (modelId: string) => void;
    className?: string;
}

export function ModelSelector({ selectedModelId, onModelChange, className }: ModelSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [models, setModels] = useState<ModelInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

    // Fetch models from backend
    const fetchModels = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/v1/research/models');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            const data: ModelInfo[] = json.data ?? json ?? [];
            setModels(data);

            // If current selection doesn't exist in fetched models, auto-select first
            if (data.length > 0 && !data.some((m) => m.id === selectedModelId)) {
                onModelChange(data[0].id);
            }
        } catch (e) {
            setError((e as Error).message);
            setModels([]);
        } finally {
            setIsLoading(false);
        }
    }, [selectedModelId, onModelChange]);

    useEffect(() => {
        fetchModels();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Position dropdown relative to trigger button
    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + 4,
                left: rect.left,
            });
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!isOpen) return;
        function handleClickOutside(e: MouseEvent) {
            const target = e.target as Node;
            if (
                triggerRef.current && !triggerRef.current.contains(target) &&
                dropdownRef.current && !dropdownRef.current.contains(target)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        function handleEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') setIsOpen(false);
        }
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    const cloudModels = models.filter((m) => m.provider === 'azure');
    const localModels = models.filter((m) => m.provider === 'ollama');
    const selectedModel = models.find((m) => m.id === selectedModelId);
    const displayName = selectedModel ? formatModelName(selectedModel.name) : selectedModelId;
    const SelectedIcon = selectedModel ? getModelIcon(selectedModel) : Sparkles;

    const dropdown = isOpen ? createPortal(
        <div
            ref={dropdownRef}
            style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left }}
            className={cn(
                'z-[9999]',
                'w-72 bg-background border border-border rounded-xl shadow-xl',
                'max-h-[70vh] overflow-y-auto'
            )}
        >
            {/* Error state */}
            {error && (
                <div className="p-3 text-xs text-destructive flex items-center justify-between">
                    <span>Failed to load models</span>
                    <button onClick={fetchModels} className="p-1 hover:bg-muted rounded">
                        <RefreshCw size={12} />
                    </button>
                </div>
            )}

            {/* Cloud models */}
            {cloudModels.length > 0 && (
                <div className="p-1.5">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        <Cloud size={11} />
                        Cloud Models
                    </div>
                    {cloudModels.map((model) => {
                        const Icon = getModelIcon(model);
                        const isSelected = model.id === selectedModelId;
                        return (
                            <button
                                key={model.id}
                                onClick={() => {
                                    onModelChange(model.id);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    'w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg transition-colors text-left',
                                    isSelected
                                        ? 'bg-primary/5 text-foreground'
                                        : 'hover:bg-muted/60 text-foreground'
                                )}
                            >
                                <Icon size={16} className={cn(
                                    'mt-0.5 shrink-0',
                                    isSelected ? 'text-primary' : 'text-muted-foreground'
                                )} />
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium">{formatModelName(model.name)}</span>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        {getModelDescription(model)}
                                    </p>
                                </div>
                                {isSelected && <Check size={14} className="text-primary mt-0.5 shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Divider */}
            {cloudModels.length > 0 && localModels.length > 0 && (
                <hr className="border-border" />
            )}

            {/* Local models */}
            {localModels.length > 0 && (
                <div className="p-1.5">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        <Monitor size={11} />
                        Local Models (Ollama)
                    </div>
                    {localModels.map((model) => {
                        const Icon = getModelIcon(model);
                        const isSelected = model.id === selectedModelId;
                        return (
                            <button
                                key={model.id}
                                onClick={() => {
                                    onModelChange(model.id);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    'w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg transition-colors text-left',
                                    isSelected
                                        ? 'bg-primary/5 text-foreground'
                                        : 'hover:bg-muted/60 text-foreground'
                                )}
                            >
                                <Icon size={16} className={cn(
                                    'mt-0.5 shrink-0',
                                    isSelected ? 'text-primary' : 'text-muted-foreground'
                                )} />
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium">{formatModelName(model.name)}</span>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        {getModelDescription(model)}
                                        {model.size && (
                                            <span className="ml-1 opacity-60">· {formatSize(model.size)}</span>
                                        )}
                                    </p>
                                </div>
                                {isSelected && <Check size={14} className="text-primary mt-0.5 shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Empty state */}
            {models.length === 0 && !isLoading && !error && (
                <div className="p-4 text-center text-xs text-muted-foreground">
                    No models available
                </div>
            )}

            {/* Refresh button at bottom */}
            <div className="border-t border-border p-1.5">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        fetchModels();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] text-muted-foreground hover:bg-muted/60 transition-colors"
                >
                    <RefreshCw size={11} className={isLoading ? 'animate-spin' : ''} />
                    Refresh models
                </button>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <div className={cn('relative inline-block', className)}>
            {/* Trigger button */}
            <button
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
                className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-150',
                    'border border-transparent hover:border-border hover:bg-muted/50',
                    'text-sm font-medium text-foreground',
                    isOpen && 'border-border bg-muted/50',
                    isLoading && 'opacity-60'
                )}
            >
                {isLoading ? (
                    <Loader2 size={15} className="animate-spin text-muted-foreground" />
                ) : (
                    <SelectedIcon size={15} className="text-primary" />
                )}
                <span>{isLoading ? 'Loading...' : displayName}</span>
                <ChevronDown size={14} className={cn(
                    'text-muted-foreground transition-transform duration-200',
                    isOpen && 'rotate-180'
                )} />
            </button>

            {dropdown}
        </div>
    );
}

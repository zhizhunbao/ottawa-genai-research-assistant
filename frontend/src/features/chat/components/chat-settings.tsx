/**
 * ChatSettings - Per-conversation settings panel (model, temperature, system prompt, RAG toggle)
 *
 * Slide-over panel accessible from the chat sidebar for configuring
 * AI behavior on a per-conversation basis.
 *
 * @module features/chat/components
 * @template .agent/templates/frontend/features/chat/settings/chat-settings.tsx.template
 * @reference none
 */
import { useState, useCallback, useEffect } from 'react';
import { Settings2, X, RotateCcw, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// Types
// ============================================================

export interface ChatSettingsData {
    /** Selected model deployment name */
    model: string;
    /** System prompt for the AI */
    systemPrompt: string;
    /** Temperature (0-2, default 0.7) */
    temperature: number;
    /** Max tokens for the response */
    maxTokens: number;
    /** Whether to use RAG pipeline */
    useRag: boolean;
}

/** Available model options for the selector */
export interface ModelOption {
    id: string;
    name: string;
    provider: string;
    description: string;
}

/** Pre-configured model options (Azure OpenAI deployments) */
export const AVAILABLE_MODELS: ModelOption[] = [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'Azure OpenAI', description: 'Fast & cost-effective' },
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'Azure OpenAI', description: 'Most capable, multimodal' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'Azure OpenAI', description: '128K context window' },
    { id: 'gpt-35-turbo', name: 'GPT-3.5 Turbo', provider: 'Azure OpenAI', description: 'Fastest response time' },
];

export const DEFAULT_CHAT_SETTINGS: ChatSettingsData = {
    model: 'gpt-4o-mini',
    systemPrompt: 'You are a helpful research assistant specializing in analyzing Ottawa city council documents.',
    temperature: 0.7,
    maxTokens: 4096,
    useRag: true,
};

interface ChatSettingsProps {
    /** Whether the panel is open */
    isOpen: boolean;
    /** Close handler */
    onClose: () => void;
    /** Current settings */
    settings: ChatSettingsData;
    /** Change handler */
    onChange: (settings: ChatSettingsData) => void;
}

// ============================================================
// Slider field
// ============================================================

function SliderField({
    label,
    value,
    min,
    max,
    step,
    displayValue,
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    displayValue?: string;
    onChange: (v: number) => void;
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">{label}</label>
                <span className="text-xs text-muted-foreground font-mono">
                    {displayValue ?? value}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-muted accent-primary"
            />
        </div>
    );
}

// ============================================================
// Component
// ============================================================

export function ChatSettings({ isOpen, onClose, settings, onChange }: ChatSettingsProps) {
    const [local, setLocal] = useState<ChatSettingsData>(settings);

    // Sync local state when external settings change
    useEffect(() => {
        setLocal(settings);
    }, [settings]);

    const update = useCallback(<K extends keyof ChatSettingsData>(key: K, value: ChatSettingsData[K]) => {
        setLocal((prev) => {
            const next = { ...prev, [key]: value };
            onChange(next);
            return next;
        });
    }, [onChange]);

    const handleReset = useCallback(() => {
        setLocal(DEFAULT_CHAT_SETTINGS);
        onChange(DEFAULT_CHAT_SETTINGS);
    }, [onChange]);

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    onClick={onClose}
                />
            )}

            {/* Panel */}
            <div className={cn(
                "fixed right-0 top-0 h-full w-80 bg-background border-l border-border shadow-2xl z-50",
                "transform transition-transform duration-300 ease-out",
                "flex flex-col",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <Settings2 size={18} className="text-primary" />
                        <h3 className="text-sm font-semibold">Chat Settings</h3>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleReset}
                            title="Reset to defaults"
                            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            <RotateCcw size={14} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
                    {/* Model Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                            <Cpu size={14} className="text-primary" />
                            Model
                        </label>
                        <select
                            value={local.model}
                            onChange={(e) => update('model', e.target.value)}
                            className="w-full h-9 px-3 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
                        >
                            {AVAILABLE_MODELS.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name} — {m.description}
                                </option>
                            ))}
                        </select>
                        <p className="text-[10px] text-muted-foreground">
                            {AVAILABLE_MODELS.find((m) => m.id === local.model)?.provider ?? 'Azure OpenAI'} deployment
                        </p>
                    </div>

                    {/* Divider */}
                    <hr className="border-border" />

                    {/* System Prompt */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">System Prompt</label>
                        <textarea
                            className="w-full min-h-[100px] px-3 py-2 text-sm bg-muted/50 border border-border rounded-lg resize-y focus:outline-none focus:ring-1 focus:ring-primary/50"
                            value={local.systemPrompt}
                            onChange={(e) => update('systemPrompt', e.target.value)}
                            placeholder="You are a helpful assistant..."
                        />
                        <p className="text-[10px] text-muted-foreground">
                            Instructions for the AI about how to behave and respond.
                        </p>
                    </div>

                    {/* Divider */}
                    <hr className="border-border" />

                    {/* Parameters */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Parameters
                        </h4>

                        <SliderField
                            label="Temperature"
                            value={local.temperature}
                            min={0}
                            max={2}
                            step={0.1}
                            displayValue={local.temperature.toFixed(1)}
                            onChange={(v) => update('temperature', v)}
                        />

                        <SliderField
                            label="Max Tokens"
                            value={local.maxTokens}
                            min={256}
                            max={16384}
                            step={256}
                            displayValue={local.maxTokens.toLocaleString()}
                            onChange={(v) => update('maxTokens', v)}
                        />
                    </div>

                    {/* Divider */}
                    <hr className="border-border" />

                    {/* Toggles */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Features
                        </h4>

                        {/* RAG Toggle */}
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-sm font-medium text-foreground">RAG Pipeline</span>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                    Search uploaded documents for relevant context.
                                </p>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={local.useRag}
                                onClick={() => update('useRag', !local.useRag)}
                                className={cn(
                                    "relative w-10 h-5 rounded-full transition-colors shrink-0",
                                    local.useRag ? "bg-primary" : "bg-muted-foreground/30"
                                )}
                            >
                                <span className={cn(
                                    "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
                                    local.useRag ? "translate-x-5" : "translate-x-0.5"
                                )} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-border">
                    <p className="text-[10px] text-muted-foreground/60 text-center">
                        Settings are saved per session
                    </p>
                </div>
            </div>
        </>
    );
}

export default ChatSettings;

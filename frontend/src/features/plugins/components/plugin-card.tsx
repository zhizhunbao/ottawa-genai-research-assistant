/**
 * PluginCard - Plugin card with enable/disable toggle
 *
 * @module features/plugins/components
 */

import type { PluginInstance } from '../types';
import { usePluginStore } from '../stores/plugin-store';
import { cn } from '@/lib/utils';

interface PluginCardProps {
  plugin: PluginInstance;
}

export function PluginCard({ plugin }: PluginCardProps) {
  const { manifest } = plugin;
  const togglePlugin = usePluginStore((s) => s.togglePlugin);
  const pluginStates = usePluginStore((s) => s.pluginStates);
  const isEnabled = pluginStates[manifest.id]?.enabled ?? false;

  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border p-4 transition-colors',
        isEnabled
          ? 'border-primary/40 bg-primary/5'
          : 'border-border bg-card',
      )}
    >
      {/* Header: Name + Toggle */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold truncate">{manifest.name}</h3>
            <span className="text-[10px] font-mono text-muted-foreground">
              v{manifest.version}
            </span>
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={() => togglePlugin(manifest.id)}
          className={cn(
            'relative shrink-0 w-9 h-5 rounded-full transition-colors cursor-pointer',
            isEnabled ? 'bg-primary' : 'bg-muted',
          )}
          aria-label={`${isEnabled ? 'Disable' : 'Enable'} ${manifest.name}`}
        >
          <div
            className={cn(
              'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
              isEnabled ? 'translate-x-[18px]' : 'translate-x-0.5',
            )}
          />
        </button>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
        {manifest.description}
      </p>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="capitalize">{manifest.category}</span>
        <span>by {manifest.author}</span>
      </div>

      {isEnabled && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-primary">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          Active
        </div>
      )}
    </div>
  );
}

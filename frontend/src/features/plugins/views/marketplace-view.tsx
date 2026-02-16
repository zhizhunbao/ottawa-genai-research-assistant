/**
 * MarketplaceView - Plugin marketplace page
 *
 * Browsable grid of available plugins with search and category filters.
 *
 * @module features/plugins/views
 */

import { useEffect, useMemo } from 'react';
import { usePluginStore } from '../stores/plugin-store';
import { PluginCard } from '../components/plugin-card';
import { registerBuiltinPlugins } from '../builtin';
import { PluginRegistry } from '../core/plugin-registry';
import type { PluginInstance, PluginCategory } from '../types';
import { Search, Puzzle, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES: { value: PluginCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'communication', label: 'Communication' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'ai-tools', label: 'AI Tools' },
  { value: 'visualization', label: 'Visualization' },
];

export default function MarketplaceView() {
  const searchQuery = usePluginStore((s) => s.searchQuery);
  const categoryFilter = usePluginStore((s) => s.categoryFilter);
  const setSearchQuery = usePluginStore((s) => s.setSearchQuery);
  const setCategoryFilter = usePluginStore((s) => s.setCategoryFilter);
  const initializePlugins = usePluginStore((s) => s.initializePlugins);
  const pluginStates = usePluginStore((s) => s.pluginStates);
  const registryVersion = usePluginStore((s) => s.registryVersion);

  useEffect(() => {
    initializePlugins(registerBuiltinPlugins);
  }, [initializePlugins]);

  const filteredPlugins: PluginInstance[] = useMemo(() => {
    void registryVersion;
    let plugins = PluginRegistry.getAll();

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      plugins = plugins.filter(
        (p) =>
          p.manifest.name.toLowerCase().includes(q) ||
          p.manifest.description.toLowerCase().includes(q) ||
          p.manifest.tags?.some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (categoryFilter) {
      plugins = plugins.filter((p) => p.manifest.category === categoryFilter);
    }

    return plugins;
  }, [searchQuery, categoryFilter, registryVersion]);

  const activeCount = useMemo(
    () => Object.values(pluginStates).filter((s) => s.enabled).length,
    [pluginStates],
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Puzzle className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Plugin Marketplace</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {PluginRegistry.getAll().length} available · {activeCount} active
        </p>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-border flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search plugins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-md bg-background border border-border outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() =>
                setCategoryFilter(cat.value === 'all' ? null : cat.value)
              }
              className={cn(
                'shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                (cat.value === 'all' && !categoryFilter) ||
                  cat.value === categoryFilter
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground',
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {filteredPlugins.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2">
            <Puzzle className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No plugins found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPlugins.map((plugin: PluginInstance) => (
              <PluginCard key={plugin.manifest.id} plugin={plugin} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

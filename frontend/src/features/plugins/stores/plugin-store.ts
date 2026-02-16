/**
 * PluginStore - Zustand store for plugin state management
 *
 * Syncs with the PluginRegistry singleton and persists enable/disable
 * preferences + dashboard layout order to localStorage.
 *
 * Key design: uses a `registryVersion` counter to trigger re-renders
 * whenever the PluginRegistry changes (register / activate / deactivate).
 *
 * @module features/plugins/stores
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  PluginState,
  DashboardLayoutItem,
} from '../types';
import { PluginRegistry } from '../core/plugin-registry';

// ============================================================
// Store Shape
// ============================================================

interface PluginStoreState {
  /** Per-plugin state keyed by plugin ID */
  pluginStates: Record<string, PluginState>;
  /** Ordered list of dashboard widget layout items */
  dashboardLayout: DashboardLayoutItem[];
  /** Marketplace search query */
  searchQuery: string;
  /** Selected category filter */
  categoryFilter: string | null;
  /** Bumped every time the registry changes — drives re-renders */
  registryVersion: number;
  /** Whether initial registration has been done */
  initialized: boolean;

  // ── Actions ────────────────────────────────
  togglePlugin: (pluginId: string) => Promise<void>;
  enablePlugin: (pluginId: string) => Promise<void>;
  disablePlugin: (pluginId: string) => Promise<void>;
  setDashboardLayout: (layout: DashboardLayoutItem[]) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string | null) => void;
  /** Register all built-in plugins and restore previously-enabled state */
  initializePlugins: (registerFn: () => void) => void;
  /** Bump registryVersion to force re-render */
  bumpRegistry: () => void;
}

// ============================================================
// Default State
// ============================================================

const DEFAULT_PLUGIN_STATE: PluginState = {
  enabled: false,
  order: 999,
};

// ============================================================
// Store Implementation
// ============================================================

export const usePluginStore = create<PluginStoreState>()(
  persist(
    (set, get) => ({
      pluginStates: {},
      dashboardLayout: [],
      searchQuery: '',
      categoryFilter: null,
      registryVersion: 0,
      initialized: false,

      bumpRegistry: () => set((s) => ({ registryVersion: s.registryVersion + 1 })),

      // ── Toggle plugin on/off ──
      togglePlugin: async (pluginId: string) => {
        const states = get().pluginStates;
        const isEnabled = states[pluginId]?.enabled ?? false;
        if (isEnabled) {
          await get().disablePlugin(pluginId);
        } else {
          await get().enablePlugin(pluginId);
        }
      },

      // ── Enable a plugin ──
      enablePlugin: async (pluginId: string) => {
        await PluginRegistry.activate(pluginId);
        const plugin = PluginRegistry.get(pluginId);
        const currentLayout = get().dashboardLayout;

        // Build dashboard layout items for new plugin widgets
        const newItems: DashboardLayoutItem[] = [];
        if (plugin) {
          plugin.widgets.forEach((widget, widgetIndex) => {
            if (widget.slot === 'dashboard-widget') {
              const id = `${pluginId}__${widgetIndex}`;
              if (!currentLayout.find((item) => item.id === id)) {
                newItems.push({
                  pluginId,
                  widgetIndex,
                  id,
                  colSpan: widget.defaultWidth ?? 1,
                  rowSpan: widget.defaultHeight ?? 1,
                });
              }
            }
          });
        }

        set((s) => ({
          pluginStates: {
            ...s.pluginStates,
            [pluginId]: {
              ...s.pluginStates[pluginId],
              enabled: true,
              order: s.pluginStates[pluginId]?.order ?? 999,
            },
          },
          dashboardLayout: [...s.dashboardLayout, ...newItems],
          registryVersion: s.registryVersion + 1,
        }));
      },

      // ── Disable a plugin ──
      disablePlugin: async (pluginId: string) => {
        await PluginRegistry.deactivate(pluginId);
        set((s) => ({
          pluginStates: {
            ...s.pluginStates,
            [pluginId]: {
              ...s.pluginStates[pluginId],
              enabled: false,
            },
          },
          // Remove widgets from dashboard layout
          dashboardLayout: s.dashboardLayout.filter(
            (item) => item.pluginId !== pluginId,
          ),
          registryVersion: s.registryVersion + 1,
        }));
      },

      // ── Update dashboard layout (after drag-and-drop) ──
      setDashboardLayout: (layout) => set({ dashboardLayout: layout }),

      setSearchQuery: (query) => set({ searchQuery: query }),
      setCategoryFilter: (category) => set({ categoryFilter: category }),

      // ── Register & initialize plugins ──
      initializePlugins: (registerFn: () => void) => {
        if (get().initialized) return;

        // 1. Register all built-in plugins into the Registry
        registerFn();

        // 2. Restore previously-enabled plugins
        const { pluginStates } = get();
        const allPlugins = PluginRegistry.getAll();
        for (const plugin of allPlugins) {
          const state = pluginStates[plugin.manifest.id];
          if (state?.enabled) {
            PluginRegistry.activate(plugin.manifest.id);
          }
        }

        // 3. Bump version to trigger re-render so the UI sees the newly registered plugins
        set((s) => ({
          initialized: true,
          registryVersion: s.registryVersion + 1,
        }));
      },
    }),
    {
      name: 'plugin-store',
      partialize: (state) => ({
        pluginStates: state.pluginStates,
        dashboardLayout: state.dashboardLayout,
      }),
    },
  ),
);

// ── Helper: get plugin state outside of React (for non-reactive reads) ──
export function getPluginStateById(pluginId: string): PluginState {
  return usePluginStore.getState().pluginStates[pluginId] ?? { ...DEFAULT_PLUGIN_STATE };
}

// ── Convenience selectors ──
export const selectPluginStates = (s: PluginStoreState) => s.pluginStates;
export const selectDashboardLayout = (s: PluginStoreState) => s.dashboardLayout;
export const selectSearchQuery = (s: PluginStoreState) => s.searchQuery;
export const selectCategoryFilter = (s: PluginStoreState) => s.categoryFilter;
export const selectRegistryVersion = (s: PluginStoreState) => s.registryVersion;

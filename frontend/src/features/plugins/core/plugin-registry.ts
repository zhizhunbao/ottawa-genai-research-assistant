/**
 * PluginRegistry - Singleton registry managing plugin lifecycle
 *
 * Handles plugin registration, activation, deactivation, and provides
 * lookup methods for the UI layer. All state changes are pushed to the
 * Zustand plugin-store.
 *
 * @module features/plugins/core
 */

import type { PluginInstance, PluginWidget, PluginSlot } from '../types';

class PluginRegistryImpl {
  private plugins = new Map<string, PluginInstance>();
  private activePlugins = new Set<string>();
  private listeners = new Set<() => void>();

  // ──────────────────────────────────────────────
  // Registration
  // ──────────────────────────────────────────────

  /** Register a plugin instance. Does NOT activate it. */
  register(plugin: PluginInstance): void {
    if (this.plugins.has(plugin.manifest.id)) {
      console.warn(
        `[PluginRegistry] Plugin "${plugin.manifest.id}" is already registered. Skipping.`,
      );
      return;
    }
    this.plugins.set(plugin.manifest.id, plugin);
    this.notify();
  }

  /** Unregister and deactivate a plugin. */
  unregister(pluginId: string): void {
    if (this.activePlugins.has(pluginId)) {
      this.deactivate(pluginId);
    }
    this.plugins.delete(pluginId);
    this.notify();
  }

  // ──────────────────────────────────────────────
  // Lifecycle
  // ──────────────────────────────────────────────

  /** Activate a registered plugin. Calls its activate() hook. */
  async activate(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      console.error(`[PluginRegistry] Cannot activate unknown plugin "${pluginId}".`);
      return;
    }
    if (this.activePlugins.has(pluginId)) return;

    try {
      await plugin.activate?.();
      this.activePlugins.add(pluginId);
      this.notify();
    } catch (err) {
      console.error(`[PluginRegistry] Failed to activate "${pluginId}":`, err);
    }
  }

  /** Deactivate a plugin. Calls its deactivate() hook. */
  async deactivate(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin || !this.activePlugins.has(pluginId)) return;

    try {
      await plugin.deactivate?.();
    } catch (err) {
      console.error(`[PluginRegistry] Error deactivating "${pluginId}":`, err);
    }
    this.activePlugins.delete(pluginId);
    this.notify();
  }

  // ──────────────────────────────────────────────
  // Queries
  // ──────────────────────────────────────────────

  /** Get all registered plugins. */
  getAll(): PluginInstance[] {
    return Array.from(this.plugins.values());
  }

  /** Get a single plugin by ID. */
  get(pluginId: string): PluginInstance | undefined {
    return this.plugins.get(pluginId);
  }

  /** Check whether a plugin is currently active. */
  isActive(pluginId: string): boolean {
    return this.activePlugins.has(pluginId);
  }

  /** Get all widgets for a given slot from active plugins. */
  getWidgetsForSlot(slot: PluginSlot): (PluginWidget & { pluginId: string })[] {
    const results: (PluginWidget & { pluginId: string })[] = [];

    for (const pluginId of this.activePlugins) {
      const plugin = this.plugins.get(pluginId);
      if (!plugin) continue;

      for (const widget of plugin.widgets) {
        if (widget.slot === slot) {
          results.push({ ...widget, pluginId });
        }
      }
    }

    // Sort by priority (higher first)
    return results.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }

  /** Get IDs of all active plugins. */
  getActiveIds(): string[] {
    return Array.from(this.activePlugins);
  }

  // ──────────────────────────────────────────────
  // Subscription (for Zustand sync)
  // ──────────────────────────────────────────────

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }
}

/** Singleton plugin registry. */
export const PluginRegistry = new PluginRegistryImpl();

/**
 * Built-in Plugins - Register all built-in plugins with the PluginRegistry
 *
 * @module features/plugins/builtin
 */

import { PluginRegistry } from '../core/plugin-registry';
import { weatherPlugin } from './weather-plugin';
import { quickLinksPlugin } from './quick-links-plugin';
import { systemStatsPlugin } from './system-stats-plugin';

/** All built-in plugin instances */
export const builtinPlugins = [
  weatherPlugin,
  quickLinksPlugin,
  systemStatsPlugin,
];

/** Register all built-in plugins. Safe to call multiple times. */
export function registerBuiltinPlugins(): void {
  for (const plugin of builtinPlugins) {
    PluginRegistry.register(plugin);
  }
}

export { weatherPlugin, quickLinksPlugin, systemStatsPlugin };

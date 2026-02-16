/**
 * Plugins feature barrel export
 * @module features/plugins
 */

// Core
export { PluginRegistry } from './core/plugin-registry';

// Store
export {
  usePluginStore,
  getPluginStateById,
  selectPluginStates,
  selectDashboardLayout,
  selectSearchQuery,
  selectCategoryFilter,
  selectRegistryVersion,
} from './stores/plugin-store';

// Built-in plugins
export { registerBuiltinPlugins, builtinPlugins } from './builtin';

// Types
export type {
  PluginSlot,
  PluginManifest,
  PluginCategory,
  PluginWidget,
  PluginWidgetProps,
  PluginInstance,
  PluginState,
  DashboardLayoutItem,
} from './types';

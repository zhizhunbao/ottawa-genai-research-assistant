/**
 * PluginTypes - Core type definitions for the plugin system
 *
 * Defines the contract between plugins and the host application.
 * Inspired by VS Code extension model with React-specific adaptations.
 *
 * @module features/plugins/types
 */

import type { ComponentType } from 'react';

// ============================================================
// Plugin Slot — where a plugin can inject its UI
// ============================================================

/**
 * Defines named slots where plugins can inject components.
 * - 'dashboard-widget': draggable widget on the Dashboard page
 * - 'chat-toolbar': appended to the chat toolbar
 * - 'sidebar-panel': added as a sidebar panel
 * - 'settings-tab': added as a tab in plugin settings
 */
export type PluginSlot =
  | 'dashboard-widget'
  | 'chat-toolbar'
  | 'sidebar-panel'
  | 'settings-tab';

// ============================================================
// Plugin Manifest — static metadata about a plugin
// ============================================================

export interface PluginManifest {
  /** Unique plugin ID (kebab-case), e.g. "weather-widget" */
  id: string;
  /** Human-readable name */
  name: string;
  /** Short description */
  description: string;
  /** Semver version string */
  version: string;
  /** Author name or organization */
  author: string;
  /** Icon name from lucide-react */
  icon: string;
  /** Category for marketplace grouping */
  category: PluginCategory;
  /** Minimum host version required (optional) */
  minHostVersion?: string;
  /** Tags for search/filter */
  tags?: string[];
  /** Preview image URL (optional) */
  previewUrl?: string;
}

export type PluginCategory =
  | 'productivity'
  | 'analytics'
  | 'communication'
  | 'utilities'
  | 'ai-tools'
  | 'visualization';

// ============================================================
// Plugin Widget — a renderable UI contribution
// ============================================================

export interface PluginWidget {
  /** Slot where this widget should appear */
  slot: PluginSlot;
  /** React component to render */
  component: ComponentType<PluginWidgetProps>;
  /** Default grid width (1-4 columns) */
  defaultWidth?: 1 | 2 | 3 | 4;
  /** Default grid height (1-4 rows) */
  defaultHeight?: 1 | 2 | 3 | 4;
  /** Priority for ordering (higher = first) */
  priority?: number;
}

export interface PluginWidgetProps {
  /** Plugin instance ID */
  pluginId: string;
  /** Whether the widget is in compact/preview mode */
  compact?: boolean;
}

// ============================================================
// Plugin Instance — runtime representation of a loaded plugin
// ============================================================

export interface PluginInstance {
  /** Static manifest */
  manifest: PluginManifest;
  /** UI contributions */
  widgets: PluginWidget[];
  /** Called when the plugin is activated */
  activate?: () => void | Promise<void>;
  /** Called when the plugin is deactivated */
  deactivate?: () => void | Promise<void>;
}

// ============================================================
// Plugin State — stored in Zustand
// ============================================================

export interface PluginState {
  /** Whether this plugin is currently enabled */
  enabled: boolean;
  /** User-defined order index for dashboard widgets */
  order: number;
  /** Plugin-specific settings (JSON-serializable) */
  settings?: Record<string, unknown>;
}

// ============================================================
// Dashboard Layout Item
// ============================================================

export interface DashboardLayoutItem {
  /** Plugin ID */
  pluginId: string;
  /** Widget slot index within the plugin */
  widgetIndex: number;
  /** Unique key for dnd-kit */
  id: string;
  /** Column span (1-4) */
  colSpan: number;
  /** Row span (1-4) */
  rowSpan: number;
}

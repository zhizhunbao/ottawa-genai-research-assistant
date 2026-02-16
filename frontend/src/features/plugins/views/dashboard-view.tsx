/**
 * DashboardView - Drag-and-drop widget dashboard using @dnd-kit
 *
 * @module features/plugins/views
 */

import { useEffect, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { usePluginStore } from '../stores/plugin-store';
import { PluginRegistry } from '../core/plugin-registry';
import { registerBuiltinPlugins } from '../builtin';
import { GripVertical, LayoutDashboard, Puzzle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import type { DashboardLayoutItem } from '../types';

// ============================================================
// Sortable Widget Wrapper
// ============================================================

interface SortableWidgetProps {
  item: DashboardLayoutItem;
}

function SortableWidget({ item }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${item.colSpan}`,
    gridRow: `span ${item.rowSpan}`,
  };

  const plugin = PluginRegistry.get(item.pluginId);
  if (!plugin) return null;

  const widget = plugin.widgets[item.widgetIndex];
  if (!widget) return null;

  const WidgetComponent = widget.component;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-lg border bg-card overflow-hidden transition-shadow',
        isDragging ? 'z-50 shadow-lg border-primary/40' : 'hover:shadow-sm',
      )}
    >
      {/* Drag handle */}
      <div
        className="absolute top-2 right-2 z-10 p-1 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity bg-muted"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
      </div>

      {/* Plugin label */}
      <div className="absolute top-2 left-3 z-10">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {plugin.manifest.name}
        </span>
      </div>

      {/* Widget content */}
      <div className="pt-7 pb-3 px-3 h-full">
        <WidgetComponent pluginId={item.pluginId} />
      </div>
    </div>
  );
}

// ============================================================
// Dashboard View
// ============================================================

export default function DashboardView() {
  const dashboardLayout = usePluginStore((s) => s.dashboardLayout);
  const setDashboardLayout = usePluginStore((s) => s.setDashboardLayout);
  const initializePlugins = usePluginStore((s) => s.initializePlugins);
  const pluginStates = usePluginStore((s) => s.pluginStates);

  useEffect(() => {
    initializePlugins(registerBuiltinPlugins);
  }, [initializePlugins]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const activeItems = useMemo(
    () => dashboardLayout.filter((item) => pluginStates[item.pluginId]?.enabled),
    [dashboardLayout, pluginStates],
  );

  const itemIds = useMemo(() => activeItems.map((i) => i.id), [activeItems]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = dashboardLayout.findIndex((i) => i.id === active.id);
    const newIndex = dashboardLayout.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newLayout = [...dashboardLayout];
    const [removed] = newLayout.splice(oldIndex, 1);
    newLayout.splice(newIndex, 0, removed);
    setDashboardLayout(newLayout);
  };

  // Empty state
  if (activeItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
        <LayoutDashboard className="h-12 w-12 text-muted-foreground/30" />
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-1">Dashboard is empty</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Enable plugins from the Marketplace to add widgets here.
          </p>
          <Link
            to="/plugins"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Puzzle className="h-4 w-4" />
            Browse Plugins
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Drag widgets to rearrange · {activeItems.length} widget{activeItems.length !== 1 ? 's' : ''}
          </p>
        </div>

        <Link
          to="/plugins"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <Puzzle className="h-3.5 w-3.5" />
          Manage Plugins
        </Link>
      </div>

      {/* Widget Grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={itemIds} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-4 gap-4 auto-rows-[180px]">
              {activeItems.map((item) => (
                <SortableWidget key={item.id} item={item} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

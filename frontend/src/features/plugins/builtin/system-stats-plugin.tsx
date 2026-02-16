/**
 * SystemStatsPlugin - Example plugin providing system stats dashboard widget
 *
 * @module features/plugins/builtin
 */

import { useState, useEffect } from 'react';
import type { PluginInstance, PluginWidgetProps } from '../types';
import { Activity, Cpu, HardDrive, MemoryStick, Wifi, Clock } from 'lucide-react';

interface StatItem {
  label: string;
  value: number;
  max: number;
  unit: string;
  icon: typeof Cpu;
}

function SystemStatsWidgetComponent({ compact }: PluginWidgetProps) {
  const [stats, setStats] = useState<StatItem[]>([
    { label: 'CPU', value: 42, max: 100, unit: '%', icon: Cpu },
    { label: 'Memory', value: 6.2, max: 16, unit: 'GB', icon: MemoryStick },
    { label: 'Storage', value: 234, max: 512, unit: 'GB', icon: HardDrive },
    { label: 'Network', value: 12.5, max: 100, unit: 'Mbps', icon: Wifi },
  ]);

  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) =>
        prev.map((stat) => ({
          ...stat,
          value:
            stat.label === 'Storage'
              ? stat.value
              : Math.max(0, Math.min(stat.max, stat.value + (Math.random() - 0.5) * stat.max * 0.1)),
        })),
      );
      setUptime((prev) => prev + 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Activity className="h-4 w-4" />
        <span>CPU {stats[0].value.toFixed(0)}%</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-3 p-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Activity className="h-3.5 w-3.5" />
          <span className="font-medium">System Monitor</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{formatUptime(uptime + 14400)}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2.5 justify-center">
        {stats.map((stat) => {
          const percentage = (stat.value / stat.max) * 100;
          const IconComp = stat.icon;
          return (
            <div key={stat.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <IconComp className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{stat.label}</span>
                </div>
                <span className="font-mono tabular-nums">
                  {stat.value.toFixed(stat.unit === '%' ? 0 : 1)}
                  <span className="text-muted-foreground ml-0.5">{stat.unit}</span>
                </span>
              </div>
              <div className="h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const systemStatsPlugin: PluginInstance = {
  manifest: {
    id: 'system-stats',
    name: 'System Monitor',
    description: 'Real-time system resource monitoring. Track CPU, Memory, Storage, and Network usage.',
    version: '1.0.0',
    author: 'Built-in',
    icon: 'Activity',
    category: 'analytics',
    tags: ['system', 'monitor', 'analytics'],
  },
  widgets: [
    {
      slot: 'dashboard-widget',
      component: SystemStatsWidgetComponent,
      defaultWidth: 1,
      defaultHeight: 2,
      priority: 9,
    },
  ],
};

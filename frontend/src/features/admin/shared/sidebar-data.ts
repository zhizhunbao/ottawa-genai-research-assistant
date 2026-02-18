/**
 * Admin Sidebar Navigation Data
 *
 * Defines the sidebar navigation structure for the Admin Console,
 * organized into logical groups with lucide-react SVG icons.
 *
 * @module features/admin/shared
 * @reference shadcn-admin/src/components/layout/data/sidebar-data.ts
 */

import {
  LayoutDashboard,
  Database,
  Brain,
  Cpu,
  Search,
  FileText,
  BarChart3,
  Quote,
  LineChart,
  FlaskConical,
  MessageSquare,
  TrendingUp,
  Users,
  Settings,
} from 'lucide-react'
import type { AdminNavGroup } from '../types'

export const adminNavGroups: AdminNavGroup[] = [
  {
    title: 'General',
    items: [
      { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Infrastructure',
    items: [
      { title: 'Data Sources', url: '/admin/datasources', icon: Database },
      { title: 'LLM Models', url: '/admin/llm-models', icon: Brain },
      { title: 'Embedding Models', url: '/admin/embedding-models', icon: Cpu },
      { title: 'Search Engines', url: '/admin/search-engines', icon: Search },
    ],
  },
  {
    title: 'Content',
    items: [
      { title: 'Prompt Studio', url: '/admin/prompt-studio', icon: FileText },
      { title: 'Chart Templates', url: '/admin/chart-templates', icon: BarChart3 },
      { title: 'Citation Config', url: '/admin/citations', icon: Quote },
    ],
  },
  {
    title: 'Quality',
    items: [
      { title: 'Evaluation Center', url: '/admin/evaluation', icon: LineChart },
      { title: 'Benchmark Lab', url: '/admin/benchmark', icon: FlaskConical },
      { title: 'Analytics', url: '/admin/analytics', icon: TrendingUp },
      { title: 'Feedback', url: '/admin/feedback', icon: MessageSquare },
    ],
  },
  {
    title: 'System',
    items: [
      { title: 'Users & Roles', url: '/admin/users', icon: Users },
      { title: 'Settings', url: '/admin/settings', icon: Settings },
    ],
  },
]

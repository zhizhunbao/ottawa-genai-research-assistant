/**
 * Admin Module Types
 *
 * Type definitions for sidebar navigation, module configuration,
 * and admin-level data structures.
 *
 * @module features/admin
 * @reference shadcn-admin/src/components/layout/types.ts
 */

import type { LucideIcon } from 'lucide-react'

/** Single navigation link */
export interface AdminNavLink {
  title: string
  url: string
  icon: LucideIcon
  badge?: string
}

/** Navigation group containing links */
export interface AdminNavGroup {
  title: string
  items: AdminNavLink[]
}

/** Status for a service/model */
export type ServiceStatus = 'online' | 'offline' | 'loading' | 'error'

/** Dashboard stat card data */
export interface DashboardStat {
  label: string
  value: string | number
  description?: string
  trend?: 'up' | 'down' | 'neutral'
  unit?: string
}

export interface DashboardStatsResponse {
  stats: DashboardStat[]
}

export interface ServiceHealth {
  service: string
  status: 'healthy' | 'degraded' | 'unavailable' | 'unknown'
  message?: string
  latency_ms?: number
}

export interface DashboardHealthResponse {
  services: ServiceHealth[]
  overall_status: string
}

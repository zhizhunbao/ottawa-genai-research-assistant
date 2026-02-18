/**
 * RBAC Permission Guard
 *
 * Components and hooks for frontend role-based access control.
 * Hides/disables UI elements based on user role.
 *
 * @module shared/components/auth
 */

import type { ReactNode } from 'react'

// ─── Role & Permission Types ──────────────────────────────────────────

export type Role = 'admin' | 'researcher' | 'viewer' | 'api_user'

export type Permission =
  | 'documents:read'
  | 'documents:write'
  | 'documents:delete'
  | 'research:query'
  | 'research:export'
  | 'admin:users'
  | 'admin:settings'
  | 'admin:models'
  | 'evaluation:view'
  | 'evaluation:run'

// ─── Role → Permission Mapping ────────────────────────────────────────

const ALL_PERMISSIONS: Permission[] = [
  'documents:read', 'documents:write', 'documents:delete',
  'research:query', 'research:export',
  'admin:users', 'admin:settings', 'admin:models',
  'evaluation:view', 'evaluation:run',
]

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ALL_PERMISSIONS,
  researcher: [
    'documents:read', 'documents:write',
    'research:query', 'research:export',
    'evaluation:view', 'evaluation:run',
  ],
  viewer: [
    'documents:read',
    'research:query',
    'evaluation:view',
  ],
  api_user: [
    'documents:read',
    'research:query',
  ],
}

// ─── Permission Check Utilities ───────────────────────────────────────

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p))
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p))
}

// ─── PermissionGate Component ─────────────────────────────────────────

interface PermissionGateProps {
  /** Current user's role */
  role: Role
  /** Required permission(s) — user must have ALL of them */
  requires: Permission | Permission[]
  /** Content to show when user has permission */
  children: ReactNode
  /** Optional fallback when user lacks permission */
  fallback?: ReactNode
}

/**
 * Conditionally renders children based on user's role permissions.
 *
 * @example
 * <PermissionGate role={user.role} requires="admin:settings">
 *   <AdminSettingsPanel />
 * </PermissionGate>
 */
export function PermissionGate({
  role,
  requires,
  children,
  fallback = null,
}: PermissionGateProps) {
  const perms = Array.isArray(requires) ? requires : [requires]
  const allowed = hasAllPermissions(role, perms)
  return <>{allowed ? children : fallback}</>
}

// ─── RoleGate Component ───────────────────────────────────────────────

interface RoleGateProps {
  /** Current user's role */
  role: Role
  /** Allowed roles — user must have ONE of them */
  allowed: Role | Role[]
  /** Content to show when user has the role */
  children: ReactNode
  /** Optional fallback when user lacks the role */
  fallback?: ReactNode
}

/**
 * Conditionally renders children based on user's role.
 *
 * @example
 * <RoleGate role={user.role} allowed={['admin', 'researcher']}>
 *   <DocumentUpload />
 * </RoleGate>
 */
export function RoleGate({
  role,
  allowed,
  children,
  fallback = null,
}: RoleGateProps) {
  const roles = Array.isArray(allowed) ? allowed : [allowed]
  return <>{roles.includes(role) ? children : fallback}</>
}

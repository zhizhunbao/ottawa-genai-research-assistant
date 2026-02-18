/**
 * Auth Components - Barrel export for authentication/authorization components
 *
 * @module shared/components/auth
 */

export {
  PermissionGate,
  RoleGate,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  type Role,
  type Permission,
} from './permission-gate'

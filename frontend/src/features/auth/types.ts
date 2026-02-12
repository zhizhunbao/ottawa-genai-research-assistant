/**
 * AuthTypes - TypeScript interfaces for users, credentials, tokens, and Azure AD
 *
 * @module features/auth
 * @templateRef none
 * @reference none
 */

// ============================================================================
// 用户相关类型
// ============================================================================

/** 用户角色 */
export type UserRole = 'researcher' | 'analyst' | 'admin'

/** 用户实体 */
export interface User {
  id: string
  email: string
  displayName: string
  role: UserRole
  avatarUrl?: string
  createdAt: string
  lastLoginAt: string
}

/** 用户偏好设置 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'fr'
  notificationsEnabled: boolean
}

// ============================================================================
// 认证相关类型
// ============================================================================

/** 认证状态 */
export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

/** 登录请求 */
export interface LoginRequest {
  email: string
  password: string
}

/** 注册请求 */
export interface RegisterRequest {
  email: string
  password: string
  displayName: string
}

/** 登录响应 */
export interface LoginResponse {
  user: User
  token: string
  expiresAt: string
}

/** Token 信息 */
export interface TokenInfo {
  token: string
  expiresAt: string
  refreshToken?: string
}

// ============================================================================
// Azure Entra ID 相关类型
// ============================================================================

/** Azure AD 配置 */
export interface AzureAdConfig {
  clientId: string
  authority: string
  redirectUri: string
  scopes: string[]
}

/** Azure AD 认证结果 */
export interface AzureAdAuthResult {
  accessToken: string
  idToken: string
  account: {
    username: string
    name: string
    localAccountId: string
  }
  expiresOn: Date
}

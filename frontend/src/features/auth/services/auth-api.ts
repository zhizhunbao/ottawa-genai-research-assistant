/**
 * authApi - REST API client for login, registration, and session management
 *
 * Maps frontend auth types to backend /api/v1/users/* endpoints.
 * Backend returns: { success, data: { access_token, token_type } } for login
 *                  { success, data: { id, email, name, ... } } for register
 *
 * @module features/auth/services
 * @template none
 * @reference none
 */

import { apiService } from '@/shared/services/api-service'
import type { User, LoginRequest, RegisterRequest, LoginResponse } from '@/features/auth/types'

// Backend response shapes (differ from frontend types)
interface BackendTokenResponse {
  access_token: string
  token_type: string
}

interface BackendUserResponse {
  id: string
  email: string
  name: string | null
  is_active: boolean
  role: string
  created_at: string
}

/** Map backend user shape → frontend User type */
function mapBackendUser(bu: BackendUserResponse): User {
  const now = new Date().toISOString()
  return {
    id: bu.id,
    email: bu.email,
    displayName: bu.name || bu.email.split('@')[0],
    role: (bu.role === 'admin' ? 'admin' : 'researcher') as User['role'],
    createdAt: bu.created_at,
    lastLoginAt: now,
  }
}

export const authApi = {
  /**
   * 用户登录
   * POST /api/v1/users/login → { access_token, token_type }
   * Then GET /api/v1/users/me to fetch user profile
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Step 1: Authenticate and get token
    const tokenResp = await apiService.post<BackendTokenResponse>(
      '/users/login',
      credentials,
      { skipAuth: true }
    )
    if (!tokenResp.data?.access_token) {
      throw new Error(tokenResp.error || 'Login failed')
    }

    const token = tokenResp.data.access_token

    // Step 2: Fetch user profile using the new token
    const userResp = await apiService.get<BackendUserResponse>(
      '/users/me',
      undefined,
      {
        headers: { Authorization: `Bearer ${token}` },
        skipAuth: true,
      }
    )
    if (!userResp.data) {
      throw new Error(userResp.error || 'Failed to fetch user profile')
    }

    return {
      user: mapBackendUser(userResp.data),
      token,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min default
    }
  },

  /**
   * 用户注册
   * POST /api/v1/users/register → user profile, then auto-login
   */
  async register(data: RegisterRequest): Promise<LoginResponse> {
    // Step 1: Register the user
    const regResp = await apiService.post<BackendUserResponse>(
      '/users/register',
      { email: data.email, password: data.password, name: data.displayName },
      { skipAuth: true }
    )
    if (!regResp.data) {
      throw new Error(regResp.error || 'Registration failed')
    }

    // Step 2: Auto-login after registration
    return authApi.login({ email: data.email, password: data.password })
  },

  /**
   * 用户登出 (local-only, backend is stateless JWT)
   */
  async logout(): Promise<void> {
    // JWT is stateless — just clear local state (handled by auth store)
  },

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<BackendUserResponse>('/users/me')
    if (!response.data) {
      throw new Error(response.error || 'Failed to get user info')
    }
    return mapBackendUser(response.data)
  },

  /**
   * Azure AD 登录回调处理
   */
  async handleAzureAdCallback(code: string): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>(
      '/auth/azure-ad/callback',
      { code },
      { skipAuth: true }
    )
    if (!response.data) {
      throw new Error(response.error || 'Azure AD authentication failed')
    }
    return response.data
  },
}

export default authApi

/**
 * authApi - REST API client for login, registration, and session management
 *
 * @module features/auth/services
 * @templateRef none
 * @reference none
 */

import { apiService } from '@/shared/services/apiService'
import type { User, LoginRequest, RegisterRequest, LoginResponse } from '@/features/auth/types'

export const authApi = {
  /**
   * 用户登录
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>(
      '/auth/login',
      credentials,
      { skipAuth: true }
    )
    if (!response.data) {
      throw new Error(response.error || 'Login failed')
    }
    return response.data
  },

  /**
   * 用户注册
   */
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>(
      '/auth/register',
      data,
      { skipAuth: true }
    )
    if (!response.data) {
      throw new Error(response.error || 'Registration failed')
    }
    return response.data
  },

  /**
   * 用户登出
   */
  async logout(): Promise<void> {
    await apiService.post('/auth/logout')
  },

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<User>('/auth/me')
    if (!response.data) {
      throw new Error(response.error || 'Failed to get user info')
    }
    return response.data
  },

  /**
   * 刷新 token
   */
  async refreshToken(): Promise<{ token: string; expiresAt: string }> {
    const response = await apiService.post<{ token: string; expiresAt: string }>(
      '/auth/refresh'
    )
    if (!response.data) {
      throw new Error(response.error || 'Failed to refresh token')
    }
    return response.data
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

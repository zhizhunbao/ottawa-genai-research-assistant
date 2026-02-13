/**
 * authApi - REST API client for login, registration, and session management
 *
 * @module features/auth/services
 * @template none
 * @reference none
 */

import { apiService } from '@/shared/services/api-service'
import type { User, LoginRequest, RegisterRequest, LoginResponse } from '@/features/auth/types'

export const authApi = {
  /**
   * �û���¼
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
   * �û�ע��
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
   * �û��ǳ�
   */
  async logout(): Promise<void> {
    await apiService.post('/auth/logout')
  },

  /**
   * ��ȡ��ǰ�û���Ϣ
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<User>('/auth/me')
    if (!response.data) {
      throw new Error(response.error || 'Failed to get user info')
    }
    return response.data
  },

  /**
   * ˢ�� token
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
   * Azure AD ��¼�ص�����
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

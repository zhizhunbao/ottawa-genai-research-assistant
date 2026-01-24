/**
 * 设置 API 服务
 *
 * 封装设置相关的 API 调用。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import type {
  UserProfile,
  UserPreferences,
  UpdateProfileRequest,
  UpdatePreferencesRequest,
} from '@/features/settings/types'

const API_BASE = '/api/v1'

/**
 * 设置 API
 */
export const settingsApi = {
  /**
   * 获取用户资料
   */
  async getProfile(): Promise<UserProfile> {
    const response = await fetch(`${API_BASE}/users/me`)
    if (!response.ok) {
      throw new Error('Failed to fetch profile')
    }
    return response.json()
  },

  /**
   * 更新用户资料
   */
  async updateProfile(request: UpdateProfileRequest): Promise<UserProfile> {
    const response = await fetch(`${API_BASE}/users/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    if (!response.ok) {
      throw new Error('Failed to update profile')
    }
    return response.json()
  },

  /**
   * 获取用户偏好设置
   */
  async getPreferences(): Promise<UserPreferences> {
    const response = await fetch(`${API_BASE}/users/me/preferences`)
    if (!response.ok) {
      throw new Error('Failed to fetch preferences')
    }
    return response.json()
  },

  /**
   * 更新用户偏好设置
   */
  async updatePreferences(request: UpdatePreferencesRequest): Promise<UserPreferences> {
    const response = await fetch(`${API_BASE}/users/me/preferences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    if (!response.ok) {
      throw new Error('Failed to update preferences')
    }
    return response.json()
  },
}

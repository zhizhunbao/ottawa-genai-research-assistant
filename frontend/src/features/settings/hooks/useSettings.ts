/**
 * 设置 Hook
 *
 * 提供设置相关的业务逻辑。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useCallback, useEffect, useState } from 'react'
import { settingsApi } from '@/features/settings/services/settingsApi'
import type {
  UserProfile,
  UserPreferences,
  UpdateProfileRequest,
  UpdatePreferencesRequest,
} from '@/features/settings/types'

/**
 * 默认偏好设置
 */
const defaultPreferences: UserPreferences = {
  language: 'en',
  theme: 'system',
  notifications: {
    email: true,
    browser: true,
  },
}

/**
 * 设置 Hook 返回值
 */
interface UseSettingsReturn {
  /** 用户资料 */
  profile: UserProfile | null
  /** 偏好设置 */
  preferences: UserPreferences
  /** 是否正在加载 */
  isLoading: boolean
  /** 是否正在保存 */
  isSaving: boolean
  /** 错误信息 */
  error: string | null
  /** 保存成功 */
  saveSuccess: boolean
  /** 更新资料 */
  updateProfile: (data: UpdateProfileRequest) => Promise<void>
  /** 更新偏好设置 */
  updatePreferences: (data: UpdatePreferencesRequest) => Promise<void>
  /** 更新语言 */
  handleLanguageChange: (value: 'en' | 'fr') => void
  /** 更新主题 */
  handleThemeChange: (value: 'light' | 'dark' | 'system') => void
  /** 更新邮件通知 */
  handleEmailNotificationChange: (value: boolean) => void
  /** 更新浏览器通知 */
  handleBrowserNotificationChange: (value: boolean) => void
  /** 清除成功消息 */
  clearSuccess: () => void
}

/**
 * 设置 Hook
 */
export function useSettings(): UseSettingsReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  /**
   * 加载设置
   */
  const loadSettings = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [profileData, preferencesData] = await Promise.all([
        settingsApi.getProfile(),
        settingsApi.getPreferences(),
      ])
      setProfile(profileData)
      setPreferences(preferencesData)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load settings'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  /**
   * 更新资料
   */
  const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
    setIsSaving(true)
    setError(null)
    setSaveSuccess(false)

    try {
      const updated = await settingsApi.updateProfile(data)
      setProfile(updated)
      setSaveSuccess(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile'
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }, [])

  /**
   * 更新偏好设置
   */
  const updatePreferences = useCallback(async (data: UpdatePreferencesRequest) => {
    setIsSaving(true)
    setError(null)
    setSaveSuccess(false)

    try {
      const updated = await settingsApi.updatePreferences(data)
      setPreferences(updated)
      setSaveSuccess(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update preferences'
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }, [])

  /**
   * 更新语言
   */
  const handleLanguageChange = useCallback((value: 'en' | 'fr') => {
    setPreferences(prev => ({ ...prev, language: value }))
    updatePreferences({ language: value })
  }, [updatePreferences])

  /**
   * 更新主题
   */
  const handleThemeChange = useCallback((value: 'light' | 'dark' | 'system') => {
    setPreferences(prev => ({ ...prev, theme: value }))
    updatePreferences({ theme: value })
  }, [updatePreferences])

  /**
   * 更新邮件通知
   */
  const handleEmailNotificationChange = useCallback((value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notifications: { ...prev.notifications, email: value },
    }))
    updatePreferences({ notifications: { email: value } })
  }, [updatePreferences])

  /**
   * 更新浏览器通知
   */
  const handleBrowserNotificationChange = useCallback((value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notifications: { ...prev.notifications, browser: value },
    }))
    updatePreferences({ notifications: { browser: value } })
  }, [updatePreferences])

  /**
   * 清除成功消息
   */
  const clearSuccess = useCallback(() => {
    setSaveSuccess(false)
  }, [])

  return {
    profile,
    preferences,
    isLoading,
    isSaving,
    error,
    saveSuccess,
    updateProfile,
    updatePreferences,
    handleLanguageChange,
    handleThemeChange,
    handleEmailNotificationChange,
    handleBrowserNotificationChange,
    clearSuccess,
  }
}

export default useSettings

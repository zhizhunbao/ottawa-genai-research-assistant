/**
 * 认证 Hook
 *
 * 提供认证相关的业务逻辑和状态管理。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useState, useCallback } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/features/auth/services/authApi'
import type { LoginRequest, RegisterRequest } from '@/features/auth/types'

export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login: setLogin,
    logout: setLogout,
    setLoading,
    setError,
    clearError,
  } = useAuthStore()

  const [loginLoading, setLoginLoading] = useState(false)

  /**
   * 执行登录
   */
  const login = useCallback(
    async (credentials: LoginRequest) => {
      setLoginLoading(true)
      setError(null)

      try {
        const response = await authApi.login(credentials)
        setLogin(response.user, response.token)
        return { success: true, user: response.user }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed'
        setError(message)
        return { success: false, error: message }
      } finally {
        setLoginLoading(false)
      }
    },
    [setLogin, setError]
  )

  /**
   * 执行注册
   */
  const register = useCallback(
    async (data: RegisterRequest) => {
      setLoginLoading(true)
      setError(null)

      try {
        const response = await authApi.register(data)
        setLogin(response.user, response.token)
        return { success: true, user: response.user }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Registration failed'
        setError(message)
        return { success: false, error: message }
      } finally {
        setLoginLoading(false)
      }
    },
    [setLogin, setError]
  )

  /**
   * 执行登出
   */
  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await authApi.logout()
    } catch {
      // 忽略登出错误，本地状态仍然清除
      console.warn('Logout API call failed, clearing local state anyway')
    } finally {
      setLogout()
    }
  }, [setLogout, setLoading])

  /**
   * 刷新用户信息
   */
  const refreshUser = useCallback(async () => {
    if (!isAuthenticated) return

    setLoading(true)
    try {
      const user = await authApi.getCurrentUser()
      useAuthStore.setState({ user })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh user'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, setLoading, setError])

  return {
    user,
    token,
    isAuthenticated,
    isLoading: isLoading || loginLoading,
    error,
    login,
    register,
    logout,
    refreshUser,
    clearError,
  }
}

export default useAuth

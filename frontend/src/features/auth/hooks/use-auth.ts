/**
 * useAuth - Authentication state management with login, register, and logout flows
 *
 * @module features/auth/hooks
 * @template none
 * @reference none
 */

import { useState, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { authApi } from '@/features/auth/services/auth-api'
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
   * ִ�е�¼
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
   * ִ��ע��
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
   * ִ�еǳ�
   */
  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await authApi.logout()
    } catch {
      // ���Եǳ����󣬱���״̬��Ȼ���
      console.warn('Logout API call failed, clearing local state anyway')
    } finally {
      setLogout()
    }
  }, [setLogout, setLoading])

  /**
   * ˢ���û���Ϣ
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
    setError,
    setLoading,
  }
}

export default useAuth

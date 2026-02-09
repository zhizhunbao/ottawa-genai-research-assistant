/**
 * 登录 Hook
 *
 * 提供登录页面的业务逻辑，包括表单验证、提交处理等。
 * 支持 Azure AD SSO 登录。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAzureLogin } from '@/features/auth/components/MsalAuthProvider'

interface FormErrors {
  email?: string
  password?: string
}

export function useLogin() {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError, isAuthenticated, setError, setLoading } = useAuth()
  const { login: azureLogin } = useAzureLogin()

  const [formErrors, setFormErrors] = useState<FormErrors>({})

  // 验证表单
  const validateForm = useCallback((email: string, password: string): FormErrors => {
    const errors: FormErrors = {}

    if (!email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Invalid email format'
    }

    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    return errors
  }, [])

  // 提交表单 (legacy email/password login)
  const handleSubmit = useCallback(async (email: string, password: string) => {
    const errors = validateForm(email, password)

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    clearError()
    setFormErrors({})

    const result = await login({ email, password })
    if (result.success) {
      navigate('/chat')
    }
  }, [validateForm, clearError, login, navigate])

  // 输入变化时清除对应字段的错误
  const handleInputChange = useCallback((field: 'email' | 'password') => {
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }, [formErrors])

  // Azure AD 登录
  const handleAzureAdLogin = useCallback(async () => {
    try {
      setLoading(true)
      clearError()
      await azureLogin()
      // Navigation happens automatically via MsalAuthProvider state sync
      navigate('/chat')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Azure AD login failed'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [azureLogin, clearError, setError, setLoading, navigate])

  // 如果已认证，重定向
  const redirectIfAuthenticated = useCallback(() => {
    if (isAuthenticated) {
      navigate('/chat', { replace: true })
      return true
    }
    return false
  }, [isAuthenticated, navigate])

  return {
    // 状态
    isLoading,
    error,
    formErrors,
    isAuthenticated,

    // 方法
    handleSubmit,
    handleInputChange,
    handleAzureAdLogin,
    redirectIfAuthenticated,
  }
}

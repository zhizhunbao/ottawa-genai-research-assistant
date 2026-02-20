/**
 * useLogin - Login form state, validation, and submission for password and Azure AD SSO
 *
 * @module features/auth/hooks
 * @template none
 * @reference none
 */

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useAuthDialog } from '@/features/auth/hooks/use-auth-dialog'
import { useAzureLogin } from '@/features/auth/components/msal-auth-provider'

interface FormErrors {
  email?: string
  password?: string
}

export function useLogin() {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError, isAuthenticated, setError, setLoading } = useAuth()
  const { login: azureLogin } = useAzureLogin()
  const { closeAuthDialog } = useAuthDialog()

  const [formErrors, setFormErrors] = useState<FormErrors>({})

  // ��֤���
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

  // �ύ��� (legacy email/password login)
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
      closeAuthDialog()
      navigate('/chat')
    }
  }, [validateForm, clearError, login, navigate, closeAuthDialog])

  // ����仯ʱ�����Ӧ�ֶεĴ���
  const handleInputChange = useCallback((field: 'email' | 'password') => {
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }, [formErrors])

  // Azure AD ��¼
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

  // �������֤���ض���
  const redirectIfAuthenticated = useCallback(() => {
    if (isAuthenticated) {
      navigate('/chat', { replace: true })
      return true
    }
    return false
  }, [isAuthenticated, navigate])

  return {
    // ״̬
    isLoading,
    error,
    formErrors,
    isAuthenticated,

    // ����
    handleSubmit,
    handleInputChange,
    handleAzureAdLogin,
    redirectIfAuthenticated,
  }
}

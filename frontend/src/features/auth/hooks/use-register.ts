/**
 * useRegister - Registration form state, password validation, and account creation
 *
 * @module features/auth/hooks
 * @template none
 * @reference none
 */

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/use-auth'

interface FormErrors {
  displayName?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export function useRegister() {
  const navigate = useNavigate()
  const { register, isLoading, error, clearError, isAuthenticated } = useAuth()

  const [formErrors, setFormErrors] = useState<FormErrors>({})

  // ��֤���
  const validateForm = useCallback((displayName: string, email: string, password: string, confirmPassword?: string): FormErrors => {
    const errors: FormErrors = {}

    if (!displayName.trim()) {
      errors.displayName = 'Full Name is required'
    }

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

    if (confirmPassword !== undefined) {
      if (confirmPassword !== password) {
        errors.confirmPassword = 'Passwords do not match'
      }
    }

    return errors
  }, [])

  // �ύ���
  const handleSubmit = useCallback(async (displayName: string, email: string, password: string, confirmPassword?: string) => {
    const errors = validateForm(displayName, email, password, confirmPassword)

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    clearError()
    setFormErrors({})

    const result = await register({ displayName, email, password })
    if (result.success) {
      navigate('/chat')
    }
  }, [validateForm, clearError, register, navigate])

  // ����仯ʱ�����Ӧ�ֶεĴ���
  const handleInputChange = useCallback((field: keyof FormErrors) => {
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }, [formErrors])

  // Azure AD ע�� (ͬ��¼)
  const handleAzureAdRegister = useCallback(() => {
    // TODO: Implement Azure AD SSO
    alert('Azure AD registration coming soon...')
  }, [])

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
    handleAzureAdRegister,
    redirectIfAuthenticated,
  }
}

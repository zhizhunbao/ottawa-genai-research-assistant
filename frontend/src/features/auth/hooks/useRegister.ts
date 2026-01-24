/**
 * 注册 Hook
 *
 * 提供注册页面的业务逻辑，包括表单验证、提交处理等。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'

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

  // 验证表单
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

  // 提交表单
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

  // 输入变化时清除对应字段的错误
  const handleInputChange = useCallback((field: keyof FormErrors) => {
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }, [formErrors])

  // Azure AD 注册 (同登录)
  const handleAzureAdRegister = useCallback(() => {
    // TODO: Implement Azure AD SSO
    alert('Azure AD registration coming soon...')
  }, [])

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
    handleAzureAdRegister,
    redirectIfAuthenticated,
  }
}

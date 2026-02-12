/**
 * Login View
 *
 * High-level view component that orchestrates authentication hooks and page layout.
 *
 * @template — Custom Implementation
 */

import { LoginPage } from '@/features/auth/components/LoginPage'
import { useLogin } from '@/features/auth/hooks/useLogin'

export default function LoginView() {
  const {
    isLoading,
    error,
    formErrors,
    handleSubmit,
    handleInputChange,
    handleAzureAdLogin,
    redirectIfAuthenticated,
  } = useLogin()

  // 如果已登录，重定向
  if (redirectIfAuthenticated()) {
    return null
  }

  return (
    <LoginPage
      isLoading={isLoading}
      error={error}
      formErrors={formErrors}
      onSubmit={handleSubmit}
      onAzureAdLogin={handleAzureAdLogin}
      onInputChange={handleInputChange}
    />
  )
}

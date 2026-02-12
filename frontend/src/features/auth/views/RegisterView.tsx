/**
 * User Registration View
 *
 * Orchestrates registration-specific hooks and page-level layout.
 *
 * @template — Custom Implementation
 */

import { RegisterPage } from '@/features/auth/components/RegisterPage'
import { useRegister } from '@/features/auth/hooks/useRegister'

export default function RegisterView() {
  const {
    isLoading,
    error,
    formErrors,
    handleSubmit,
    handleInputChange,
    handleAzureAdRegister,
    redirectIfAuthenticated,
  } = useRegister()

  // 如果已登录，重定向
  if (redirectIfAuthenticated()) {
    return null
  }

  return (
    <RegisterPage
      isLoading={isLoading}
      error={error}
      formErrors={formErrors}
      onSubmit={handleSubmit}
      onAzureAdRegister={handleAzureAdRegister}
      onInputChange={handleInputChange}
    />
  )
}

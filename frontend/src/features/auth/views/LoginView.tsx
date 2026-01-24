/**
 * 登录视图
 *
 * 视图层只组合组件和调用 Hooks。
 * 遵循 dev-frontend_patterns skill 规范。
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

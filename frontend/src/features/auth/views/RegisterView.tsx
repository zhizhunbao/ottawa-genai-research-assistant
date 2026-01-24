/**
 * 注册视图
 *
 * 视图层只组合组件和调用 Hooks。
 * 遵循 dev-frontend_patterns skill 规范。
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

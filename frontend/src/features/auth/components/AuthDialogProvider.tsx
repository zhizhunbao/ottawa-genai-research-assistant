/**
 * AuthDialogProvider - 认证对话框提供者
 *
 * 连接 AuthDialog 组件和全局状态管理。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { AuthDialog } from './AuthDialog'
import { useAuthDialog } from '../hooks/useAuthDialog'

export function AuthDialogProvider() {
  const { isOpen, defaultTab, setIsOpen } = useAuthDialog()

  return (
    <AuthDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      defaultTab={defaultTab}
    />
  )
}

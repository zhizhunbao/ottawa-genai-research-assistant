/**
 * AuthDialogProvider - Connects global auth dialog state to the AuthDialog component
 *
 * @module features/auth
 * @templateRef none
 * @reference none
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

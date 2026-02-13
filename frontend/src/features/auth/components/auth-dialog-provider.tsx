/**
 * AuthDialogProvider - Connects global auth dialog state to the AuthDialog component
 *
 * @module features/auth
 * @template none
 * @reference none
 */

import { AuthDialog } from './auth-dialog'
import { useAuthDialog } from '../hooks/use-auth-dialog'

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

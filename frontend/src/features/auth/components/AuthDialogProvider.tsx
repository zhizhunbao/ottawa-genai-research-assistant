/**
 * AuthDialog Provider
 *
 * Connects the global AuthDialog state to the UI component.
 *
 * @template — Custom Implementation
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

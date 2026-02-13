/**
 * useAuthDialog - Global open/close state for the authentication modal
 *
 * @module features/auth/hooks
 * @template none
 * @reference none
 */

import { create } from 'zustand'

type AuthDialogTab = 'login' | 'register'

interface AuthDialogState {
  isOpen: boolean
  defaultTab: AuthDialogTab
  openAuthDialog: (tab?: AuthDialogTab) => void
  closeAuthDialog: () => void
  setIsOpen: (open: boolean) => void
}

export const useAuthDialog = create<AuthDialogState>((set) => ({
  isOpen: false,
  defaultTab: 'login',
  openAuthDialog: (tab: AuthDialogTab = 'login') =>
    set({ isOpen: true, defaultTab: tab }),
  closeAuthDialog: () => set({ isOpen: false }),
  setIsOpen: (open: boolean) => set({ isOpen: open }),
}))

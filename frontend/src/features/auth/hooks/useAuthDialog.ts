/**
 * useAuthDialog - 认证对话框状态管理 Hook
 *
 * 提供全局控制 AuthDialog 打开/关闭的能力。
 * 使用 Zustand 进行状态管理。
 * 遵循 dev-frontend_patterns skill 规范。
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

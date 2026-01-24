/**
 * 组件或工具
 *
 * 遵循 dev-frontend_patterns skill 规范。
 */

import '@testing-library/jest-dom'
import { vi } from 'vitest'

// 全局 Mock 或者配置
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

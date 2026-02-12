/**
 * Vitest Test Setup
 *
 * Configures the global test environment, including DOM matchers and i18n mocks.
 *
 * @template T4 frontend/test/setup.ts — Vitest Global Configuration
 */

import '@testing-library/jest-dom'
import { vi } from 'vitest'

// 全局 Mock 或者配置
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

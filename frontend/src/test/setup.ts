/**
 * TestSetup - Vitest global configuration with DOM matchers and i18n mocks
 *
 * @module test
 * @template T4 frontend/test/setup.ts
 * @reference none
 */
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// 全局 Mock 或者配置
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

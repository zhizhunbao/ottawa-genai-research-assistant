/**
 * Home Data Hook
 *
 * Provides static configuration and presentation data for the landing page.
 *
 * @template — Custom Implementation
 */

import { HOME_FEATURES_CONFIG, HOME_STATS_CONFIG } from '../enums'

export function useHomeData() {
  /** 
   * 返回首页配置
   * 遵循规范，所有固定数据已迁移至 enums.ts
   */
  return {
    features: HOME_FEATURES_CONFIG,
    stats: HOME_STATS_CONFIG
  }
}

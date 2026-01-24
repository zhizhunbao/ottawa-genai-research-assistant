/**
 * useHomeData - 首页数据 Hook
 *
 * 提供首页所需的静态展示数据和业务逻辑。
 * 遵循 dev-frontend_patterns 规范。
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

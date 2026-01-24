/**
 * 全局共享枚举
 *
 * 存放跨模块使用的枚举和固定配置。
 * 遵循 dev-frontend_patterns skill 规范。
 */

/** 语言类型 */
export enum Language {
  EN = 'en',
  FR = 'fr'
}

/** 布局模式 */
export enum LayoutMode {
  DEFAULT = 'default',
  NARROW = 'narrow',
  WIDE = 'wide'
}

/** 基础组件尺寸 */
export enum ComponentSize {
  SM = 'sm',
  MD = 'md',
  LG = 'lg'
}

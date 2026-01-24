/**
 * 设置模块类型定义
 *
 * 定义设置相关的 TypeScript 类型。
 * 遵循 dev-frontend_patterns skill 规范。
 */

/**
 * 用户偏好设置
 */
export interface UserPreferences {
  /** 语言 */
  language: 'en' | 'fr'
  /** 主题 */
  theme: 'light' | 'dark' | 'system'
  /** 通知设置 */
  notifications: {
    /** 邮件通知 */
    email: boolean
    /** 浏览器通知 */
    browser: boolean
  }
}

/**
 * 用户资料
 */
export interface UserProfile {
  /** 显示名 */
  displayName: string
  /** 邮箱 */
  email: string
  /** 部门 */
  department?: string
  /** 职位 */
  title?: string
  /** 头像 URL */
  avatarUrl?: string
}

/**
 * 更新用户资料请求
 */
export interface UpdateProfileRequest {
  /** 显示名 */
  displayName?: string
  /** 部门 */
  department?: string
  /** 职位 */
  title?: string
}

/**
 * 更新偏好设置请求
 */
export interface UpdatePreferencesRequest {
  /** 语言 */
  language?: 'en' | 'fr'
  /** 主题 */
  theme?: 'light' | 'dark' | 'system'
  /** 通知设置 */
  notifications?: {
    email?: boolean
    browser?: boolean
  }
}

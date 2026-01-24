/**
 * 文档模块常量
 *
 * 定义文档相关的常量和配置。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import type { DocumentStatus, Quarter, ReportType } from './types'

/**
 * 季度选项
 */
export const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4']

/**
 * 报告类型选项
 */
export const REPORT_TYPES: ReportType[] = ['ED_UPDATE', 'ECONOMIC_REPORT', 'TOURISM', 'OTHER']

/**
 * 状态选项
 */
export const DOCUMENT_STATUSES: DocumentStatus[] = ['pending', 'processing', 'indexed', 'failed']

/**
 * 年份选项（最近 5 年）
 */
const currentYear = new Date().getFullYear()
export const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i)

/**
 * 状态样式映射
 */
export const STATUS_STYLES: Record<DocumentStatus, string> = {
  pending: 'text-yellow-600 bg-yellow-50',
  processing: 'text-blue-600 bg-blue-50',
  indexed: 'text-green-600 bg-green-50',
  failed: 'text-red-600 bg-red-50',
}

/**
 * 默认分页大小
 */
export const DEFAULT_PAGE_SIZE = 10

/**
 * 最大文件大小 (50MB)
 */
export const MAX_FILE_SIZE = 50 * 1024 * 1024

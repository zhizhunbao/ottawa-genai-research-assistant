/**
 * 分析模块常量
 *
 * 定义分析相关的枚举、设置和颜色配置。
 * 遵循 dev-frontend_patterns skill 规范。
 */

export const ANALYSIS_TYPES = {
  CHART: 'chart',
  SPEAKING_NOTES: 'speaking_notes',
  SUMMARY: 'summary',
} as const

export const CHART_TYPES = {
  BAR: 'bar',
  LINE: 'line',
  PIE: 'pie',
} as const

export const DEFAULT_CHART_TYPE = CHART_TYPES.BAR

export const ANALYSIS_COLORS = {
  PRIMARY: 'indigo',
  SECONDARY: 'emerald',
  DANGER: 'red',
} as const

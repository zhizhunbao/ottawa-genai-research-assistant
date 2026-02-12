/**
 * Home Feature Enums & Static Configuration
 *
 * Visual configurations, statistics metadata, and feature mappings for the landing page.
 *
 * @template — Custom Implementation
 */

import {
  BarChart3,
  FileText,
  Brain,
  Upload,
  MessageSquare
} from 'lucide-react'

/** 首页统计键名枚举 */
export enum HomeStatKey {
  DOCUMENTS = 'documents',
  QUERIES = 'queries',
  LANGUAGES = 'languages',
  ACCESSIBILITY = 'accessibility'
}

/** 首页功能配置固定值 */
export const HOME_FEATURES_CONFIG = [
  { key: 'qa', Icon: Brain },
  { key: 'analysis', Icon: BarChart3 },
  { key: 'reports', Icon: FileText },
] as const

/** 首页流程建议配置 */
export const HOME_STEPS_CONFIG = [
  { key: 'step1', Icon: Upload },
  { key: 'step2', Icon: MessageSquare },
  { key: 'step3', Icon: BarChart3 },
] as const

/** 首页统计数据固定值 (Mock) */
export const HOME_STATS_CONFIG = [
  { key: HomeStatKey.DOCUMENTS, number: '1,000+' },
  { key: HomeStatKey.QUERIES, number: '5,000+' },
  { key: HomeStatKey.LANGUAGES, number: '2' },
  { key: HomeStatKey.ACCESSIBILITY, number: '100%' },
] as const

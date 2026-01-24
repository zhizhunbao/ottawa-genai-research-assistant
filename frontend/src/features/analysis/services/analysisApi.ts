/**
 * 分析模块 API 服务
 *
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { apiService } from '@/shared/services/apiService'
import type { AnalysisRequest, ChartData, SpeakingNotes } from '../types'
import type { ApiResponse } from '@/features/research/types'

export const analysisApi = {
  /**
   * 生成图表
   */
  async generateChart(request: AnalysisRequest): Promise<ApiResponse<ChartData>> {
    return apiService.post('/analysis/visualize', request)
  },

  /**
   * 生成发言稿
   */
  async generateSpeakingNotes(request: AnalysisRequest): Promise<ApiResponse<SpeakingNotes>> {
    return apiService.post('/analysis/speaking-notes', request)
  },
}

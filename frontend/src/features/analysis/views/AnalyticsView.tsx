/**
 * 分析视图
 *
 * 组合逻辑 Hook 与展示组件。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { AnalyticsPage } from '../components/AnalyticsPage'
import { useAnalysis } from '../hooks/useAnalysis'

export default function AnalyticsView() {
  const {
    isLoading,
    error,
    chartData,
    speakingNotes,
    performAnalysis,
  } = useAnalysis()

  return (
    <AnalyticsPage
      isLoading={isLoading}
      error={error}
      chartData={chartData}
      speakingNotes={speakingNotes}
      onAnalyze={performAnalysis}
    />
  )
}

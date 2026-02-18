/**
 * InlineCharts - Renders multiple charts from ResponseEnvelope.charts array
 *
 * Maps ChartData[] from the response into ChartContainer components,
 * displayed inline within the message bubble.
 *
 * @module features/chat
 */

import { ChartContainer } from '@/shared/components/charts'
import type { ChartData, Source } from '@/features/research/types'

interface InlineChartsProps {
  /** Array of chart data from ResponseEnvelope */
  charts: ChartData[]
  /** Optional sources for attribution */
  sources?: Source[]
}

export function InlineCharts({ charts, sources }: InlineChartsProps) {
  if (!charts || charts.length === 0) return null

  const sourceRefs = sources?.map(s => ({
    document_id: s.documentId,
    document_name: s.documentTitle,
    page_number: s.pageNumber > 0 ? s.pageNumber : undefined,
  }))

  return (
    <div className="mt-3 space-y-3 -mx-1">
      {charts.map((chart, i) => (
        <ChartContainer
          key={`chart-${i}-${chart.title ?? chart.type}`}
          chart={{
            type: chart.type,
            title: chart.title,
            xKey: chart.xKey,
            yKeys: chart.yKeys,
            data: chart.data,
            stacked: chart.stacked,
          }}
          sources={sourceRefs}
        />
      ))}
    </div>
  )
}

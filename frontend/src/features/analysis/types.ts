/**
 * AnalysisTypes - Chart and visualization type definitions
 *
 * @module features/analysis
 * @template none
 * @reference none
 */

export enum ChartType {
    LINE = 'line',
    BAR = 'bar',
    PIE = 'pie',
    AREA = 'area'
}

export interface ChartDataPoint {
    label: string
    value: number
    category?: string
}

/** Chart data structure matching backend ChartData schema. */
export interface ChartData {
    type: 'line' | 'bar' | 'pie'
    title?: string
    xKey?: string
    yKeys?: string[]
    data: Record<string, unknown>[]
    stacked?: boolean
}

export interface ChartConfig {
    type: ChartType
    title: string
    xAxisLabel?: string
    yAxisLabel?: string
    data: ChartDataPoint[]
}

export interface TableData {
    headers: string[]
    rows: (string | number)[][]
    title?: string
}

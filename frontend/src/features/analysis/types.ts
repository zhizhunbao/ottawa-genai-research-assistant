/**
 * Analysis & Visualization Types
 *
 * @template T6 backend/features/analysis/types.ts — Chart & Analysis Entities
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

/** 图表数据（来自后端 ChartData schema） */
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

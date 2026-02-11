/**
 * 图表主题配置
 *
 * 定义 Recharts 图表的颜色、字体等主题设置。
 * 对应 US-301: Chart Visualization
 */

export const chartTheme = {
  colors: {
    primary: '#2563eb',
    secondary: '#16a34a',
    tertiary: '#dc2626',
    quaternary: '#ca8a04',
    quinary: '#9333ea',
    background: '#ffffff',
    text: '#1f2937',
    grid: '#e5e7eb',
    muted: '#6b7280',
  },
  // 用于多系列图表的颜色数组
  seriesColors: ['#2563eb', '#16a34a', '#dc2626', '#ca8a04', '#9333ea', '#0891b2'],
  fonts: {
    family: 'Inter, system-ui, sans-serif',
    size: {
      small: 10,
      normal: 12,
      large: 14,
    },
  },
  chart: {
    margin: { top: 5, right: 30, left: 20, bottom: 5 },
    height: 300,
  },
} as const;

export type ChartTheme = typeof chartTheme;

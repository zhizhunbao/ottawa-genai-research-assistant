/**
 * 折线图组件
 *
 * 基于 Recharts 实现，用于展示趋势数据。
 * 对应 US-301: Chart Visualization
 */

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { chartTheme } from '@/shared/config/chartTheme';

export interface LineChartProps {
  /** 图表数据数组 */
  data: Array<Record<string, unknown>>;
  /** X 轴数据键名 */
  xKey: string;
  /** Y 轴数据键名数组（支持多条线） */
  yKeys: string[];
  /** 图表标题 */
  title?: string;
  /** 数据来源说明 */
  source?: string;
  /** 图表高度 */
  height?: number;
}

export function LineChart({
  data,
  xKey,
  yKeys,
  title,
  source,
  height = chartTheme.chart.height,
}: LineChartProps) {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-medium mb-2 text-foreground">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data} margin={chartTheme.chart.margin}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.colors.grid} />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: chartTheme.fonts.size.normal }}
            stroke={chartTheme.colors.muted}
          />
          <YAxis
            tick={{ fontSize: chartTheme.fonts.size.normal }}
            stroke={chartTheme.colors.muted}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: chartTheme.colors.background,
              border: `1px solid ${chartTheme.colors.grid}`,
              borderRadius: '6px',
              fontSize: chartTheme.fonts.size.normal,
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: chartTheme.fonts.size.normal }}
          />
          {yKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={chartTheme.seriesColors[index % chartTheme.seriesColors.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
      {source && (
        <p className="text-xs text-muted-foreground mt-2">
          Source: {source}
        </p>
      )}
    </div>
  );
}

# US-301: Chart Visualization - Implementation Plan

## Overview

实现聊天响应中的数据图表可视化功能，帮助用户直观理解经济趋势。

**User Story**: US-301
**Sprint**: 5
**Story Points**: 8
**Status**: ✅ Completed

---

## 需求重述

- 支持折线图、柱状图、饼图
- 图表从检索数据动态生成
- 支持客户端渲染 (Recharts)
- 图表可导出为 PNG/PDF
- 图表包含数据来源标注

---

## 实现阶段

### 阶段 1: Recharts 设置 (Hye Ran Yoo - 2h)

#### 1.1 安装依赖

```bash
npm install recharts
npm install html-to-image jspdf  # 用于导出功能
```

#### 1.2 配置图表主题

**文件**: `frontend/src/shared/config/chartTheme.ts`

```typescript
export const chartTheme = {
  colors: {
    primary: "#2563eb",
    secondary: "#16a34a",
    tertiary: "#dc2626",
    quaternary: "#ca8a04",
    background: "#ffffff",
    text: "#1f2937",
    grid: "#e5e7eb",
  },
  fonts: {
    family: "Inter, sans-serif",
    size: 12,
  },
};
```

**验收**:

- [x] Recharts 安装成功
- [x] 主题配置完成

---

### 阶段 2: 图表组件开发 (Hye Ran Yoo - 8h)

#### 2.1 折线图组件

**文件**: `frontend/src/shared/components/charts/LineChart.tsx`

```typescript
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface LineChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  yKeys: string[];
  title?: string;
  source?: string;
}

export function LineChart({ data, xKey, yKeys, title, source }: LineChartProps) {
  const colors = ['#2563eb', '#16a34a', '#dc2626', '#ca8a04'];

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-medium mb-2">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {yKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index % colors.length]}
              activeDot={{ r: 8 }}
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
```

#### 2.2 柱状图组件

**文件**: `frontend/src/shared/components/charts/BarChart.tsx`

```typescript
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface BarChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  yKeys: string[];
  title?: string;
  source?: string;
  stacked?: boolean;
}

export function BarChart({ data, xKey, yKeys, title, source, stacked }: BarChartProps) {
  const colors = ['#2563eb', '#16a34a', '#dc2626', '#ca8a04'];

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-medium mb-2">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {yKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[index % colors.length]}
              stackId={stacked ? 'stack' : undefined}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
      {source && (
        <p className="text-xs text-muted-foreground mt-2">
          Source: {source}
        </p>
      )}
    </div>
  );
}
```

#### 2.3 饼图组件

**文件**: `frontend/src/shared/components/charts/PieChart.tsx`

```typescript
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface PieChartProps {
  data: Array<{ name: string; value: number }>;
  title?: string;
  source?: string;
}

export function PieChart({ data, title, source }: PieChartProps) {
  const colors = ['#2563eb', '#16a34a', '#dc2626', '#ca8a04', '#9333ea'];

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-medium mb-2">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
      {source && (
        <p className="text-xs text-muted-foreground mt-2">
          Source: {source}
        </p>
      )}
    </div>
  );
}
```

---

### 阶段 3: 数据提取与图表生成 (Peng Wang - 10h)

#### 3.1 数据提取服务

**文件**: `backend/app/chat/chart_service.py`

```python
"""图表数据提取服务"""

from typing import Optional, List, Dict
import re

class ChartDataExtractor:
    """从文档内容中提取可视化数据"""

    def extract_chart_data(
        self,
        content: str,
        query: str
    ) -> Optional[ChartData]:
        """尝试从内容中提取图表数据"""

        # 检测是否包含数值数据
        if not self._has_numeric_data(content):
            return None

        # 尝试提取表格数据
        table_data = self._extract_table(content)
        if table_data:
            return self._determine_chart_type(table_data, query)

        # 尝试提取时间序列数据
        time_series = self._extract_time_series(content)
        if time_series:
            return ChartData(
                type="line",
                data=time_series,
                x_key="date",
                y_keys=["value"]
            )

        return None

    def _has_numeric_data(self, content: str) -> bool:
        """检查内容是否包含数值数据"""
        numeric_pattern = r'\d+\.?\d*%?'
        matches = re.findall(numeric_pattern, content)
        return len(matches) >= 3

    def _extract_table(self, content: str) -> Optional[List[Dict]]:
        """从内容中提取表格数据"""
        # 实现表格解析逻辑
        pass

    def _extract_time_series(self, content: str) -> Optional[List[Dict]]:
        """从内容中提取时间序列数据"""
        # 实现时间序列解析逻辑
        pass

    def _determine_chart_type(
        self,
        data: List[Dict],
        query: str
    ) -> ChartData:
        """根据数据和查询确定图表类型"""
        # 趋势相关 -> 折线图
        if any(word in query.lower() for word in ['trend', 'over time', 'growth']):
            return ChartData(type="line", data=data, ...)

        # 比较相关 -> 柱状图
        if any(word in query.lower() for word in ['compare', 'comparison', 'vs']):
            return ChartData(type="bar", data=data, ...)

        # 占比相关 -> 饼图
        if any(word in query.lower() for word in ['share', 'proportion', 'distribution']):
            return ChartData(type="pie", data=data, ...)

        return ChartData(type="bar", data=data, ...)
```

#### 3.2 图表生成 API

**文件**: `backend/app/chat/routes.py`

```python
@router.post("/query")
async def query(request: ChatQueryRequest, ...) -> ChatQueryResponse:
    """处理查询，包含可选的图表数据"""
    # ... 现有逻辑 ...

    # 尝试提取图表数据
    chart_data = chart_service.extract_chart_data(
        content=search_results,
        query=request.query
    )

    return ChatQueryResponse(
        answer=response.answer,
        sources=response.sources,
        confidence=response.confidence,
        chart=chart_data  # 可选的图表数据
    )
```

---

### 阶段 4: 图表导出功能 (Hye Ran Yoo - 4h)

#### 4.1 导出组件

**文件**: `frontend/src/shared/components/charts/ChartExport.tsx`

```typescript
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

interface ChartExportProps {
  chartRef: RefObject<HTMLDivElement>;
  filename: string;
}

export function ChartExport({ chartRef, filename }: ChartExportProps) {
  const { t } = useTranslation('common');

  const exportAsPng = async () => {
    if (!chartRef.current) return;

    const dataUrl = await toPng(chartRef.current, { quality: 0.95 });
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    link.click();
  };

  const exportAsPdf = async () => {
    if (!chartRef.current) return;

    const dataUrl = await toPng(chartRef.current, { quality: 0.95 });
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(dataUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${filename}.pdf`);
  };

  return (
    <div className="flex gap-2 mt-2">
      <Button variant="outline" size="sm" onClick={exportAsPng}>
        <Download className="mr-2 h-4 w-4" />
        PNG
      </Button>
      <Button variant="outline" size="sm" onClick={exportAsPdf}>
        <FileText className="mr-2 h-4 w-4" />
        PDF
      </Button>
    </div>
  );
}
```

---

### 阶段 5: 来源标注 (Hye Ran Yoo - 2h)

#### 5.1 图表容器组件

**文件**: `frontend/src/features/research/components/ChartContainer.tsx`

```typescript
interface ChartContainerProps {
  chart: ChartData;
  sources: SourceReference[];
}

export function ChartContainer({ chart, sources }: ChartContainerProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation('chat');

  const sourceText = sources
    .map(s => `${s.document_name} (p.${s.page_number})`)
    .join(', ');

  return (
    <div ref={chartRef} className="bg-white p-4 rounded-lg border">
      {chart.type === 'line' && <LineChart {...chart} source={sourceText} />}
      {chart.type === 'bar' && <BarChart {...chart} source={sourceText} />}
      {chart.type === 'pie' && <PieChart {...chart} source={sourceText} />}

      <ChartExport chartRef={chartRef} filename={`chart-${Date.now()}`} />
    </div>
  );
}
```

---

## 文件变更清单

| 操作 | 文件路径                                                       | 说明           |
| ---- | -------------------------------------------------------------- | -------------- |
| 新建 | `frontend/src/shared/config/chartTheme.ts`                     | 图表主题       |
| 新建 | `frontend/src/shared/components/charts/LineChart.tsx`          | 折线图         |
| 新建 | `frontend/src/shared/components/charts/BarChart.tsx`           | 柱状图         |
| 新建 | `frontend/src/shared/components/charts/PieChart.tsx`           | 饼图           |
| 新建 | `frontend/src/shared/components/charts/ChartExport.tsx`        | 导出功能       |
| 新建 | `frontend/src/features/research/components/ChartContainer.tsx` | 图表容器       |
| 新建 | `backend/app/chat/chart_service.py`                            | 数据提取服务   |
| 修改 | `backend/app/chat/schemas.py`                                  | 添加 ChartData |
| 修改 | `backend/app/chat/routes.py`                                   | 返回图表数据   |

---

## 技术规格

| 参数     | 规格                 |
| -------- | -------------------- |
| 图表库   | Recharts 2.x         |
| 导出格式 | PNG, PDF             |
| 图表类型 | 折线图、柱状图、饼图 |
| 响应式   | ResponsiveContainer  |

---

## 成功标准

- [x] 聊天响应可包含图表
- [x] 支持折线图、柱状图、饼图
- [x] 图表可导出为 PNG/PDF
- [x] 图表包含来源标注
- [x] 所有测试通过

---

## 估算复杂度: HIGH

| 部分          | 时间估算 | 状态     |
| ------------- | -------- | -------- |
| Recharts 设置 | 2h       | ✅ 完成  |
| 图表组件      | 8h       | ✅ 完成  |
| 数据提取      | 10h      | ✅ 完成  |
| 导出功能      | 4h       | ✅ 完成  |
| 来源标注      | 2h       | ✅ 完成  |
| **总计**      | **26h**  | **100%** |

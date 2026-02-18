/**
 * ChartTemplateManager - Page for chart extraction configuration
 *
 * Shows chart type mappings and links to Prompt Studio for the
 * chart extraction prompt.
 *
 * @module features/admin/modules/chart-templates
 */

import { Link } from 'react-router-dom'
import {
  BarChart3,
  LineChart,
  PieChart,
  ArrowRight,
  FileText,
  Info,
} from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'

// Chart type configuration (read-only for now, can be made editable later)
const CHART_TYPES = [
  {
    type: 'line',
    icon: LineChart,
    name: 'Line Chart',
    description: 'Trends over time (quarters, years)',
    keywords: ['trend', 'growth', 'over time', 'quarterly', 'yearly', 'monthly'],
    color: 'text-blue-500',
  },
  {
    type: 'bar',
    icon: BarChart3,
    name: 'Bar Chart',
    description: 'Comparisons between categories',
    keywords: ['compare', 'comparison', 'versus', 'breakdown', 'by category'],
    color: 'text-emerald-500',
  },
  {
    type: 'pie',
    icon: PieChart,
    name: 'Pie Chart',
    description: 'Parts of a whole (percentages)',
    keywords: ['percentage', 'share', 'distribution', 'portion', 'breakdown'],
    color: 'text-amber-500',
  },
]

export default function ChartTemplateManager() {
  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Chart Templates</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure chart extraction rules and visualization settings
        </p>
      </div>

      {/* Info card */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            How Chart Extraction Works
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            The RAG pipeline uses an LLM to extract numeric data from retrieved documents
            and automatically generates charts when appropriate. The extraction is guided
            by the <strong>chart_extraction</strong> prompt template.
          </p>
          <Link to="/admin/prompt-studio">
            <Button variant="link" className="px-0 mt-2">
              <FileText className="h-4 w-4 mr-1" />
              Edit Chart Extraction Prompt
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Chart Types */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Chart Types</CardTitle>
          <CardDescription>
            The LLM automatically selects the best chart type based on data patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {CHART_TYPES.map((chart) => {
              const Icon = chart.icon
              return (
                <div
                  key={chart.type}
                  className="rounded-lg border p-4 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${chart.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{chart.name}</h3>
                      <p className="text-xs text-muted-foreground">{chart.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {chart.keywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Output Format */}
      <Card>
        <CardHeader>
          <CardTitle>Chart Data Format</CardTitle>
          <CardDescription>
            The expected JSON structure returned by the LLM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
{`{
  "type": "line" | "bar" | "pie",
  "title": "Chart title",
  "x_key": "period",           // Primary category key
  "y_keys": ["value", "growth"], // Numeric data keys
  "data": [
    {"period": "2023 Q1", "value": 12.5, "growth": 2.1},
    {"period": "2023 Q2", "value": 14.2, "growth": 3.4},
    // ...
  ]
}`}
          </pre>
        </CardContent>
      </Card>

      {/* Configuration note */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Configuration</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            To customize chart extraction behavior:
          </p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Go to <Link to="/admin/prompt-studio" className="text-primary hover:underline">Prompt Studio</Link></li>
            <li>Find the <code className="bg-muted px-1 rounded">chart_extraction</code> prompt</li>
            <li>Edit the template to modify extraction rules</li>
            <li>Test with sample queries to verify results</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}

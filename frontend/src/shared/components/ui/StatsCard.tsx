/**
 * 仪表盘统计卡片
 *
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { LucideIcon } from 'lucide-react'
import { clsx } from 'clsx'

interface StatsCardProps {
  label: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  Icon: LucideIcon
  trend?: 'up' | 'down'
  color?: string
}

export function StatsCard({
  label,
  value,
  change,
  changeType = 'neutral',
  Icon,
  color = 'primary',
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className={clsx(
          'p-3 rounded-xl transition-colors',
          `bg-${color}-50 text-${color}-600 group-hover:bg-${color}-100`
        )}>
          <Icon className="w-6 h-6" />
        </div>
        {change && (
          <span className={clsx(
            'text-xs font-bold px-2 py-1 rounded-full',
            changeType === 'positive' && 'bg-green-50 text-green-600',
            changeType === 'negative' && 'bg-red-50 text-red-600',
            changeType === 'neutral' && 'bg-gray-50 text-gray-600'
          )}>
            {change}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium mb-1">{label}</h3>
        <div className="text-2xl font-bold text-gray-900 tracking-tight">
          {value}
        </div>
      </div>
    </div>
  )
}

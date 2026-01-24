/**
 * 消息项组件
 *
 * 处理单个消息的渲染，支持 Markdown 和 Recharts 图表。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import ReactMarkdown from 'react-markdown'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Copy, FileText, Download, TrendingUp } from 'lucide-react'
import type { ChatMessage } from '../types'
import { useTranslation } from 'react-i18next'
import { clsx } from 'clsx'

interface MessageItemProps {
  message: ChatMessage
}

export function MessageItem({ message }: MessageItemProps) {
  const { t } = useTranslation('chat')
  const isUser = message.role === 'user'

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
  }

  return (
    <div className={clsx('flex w-full mb-6 animate-in fade-in slide-in-from-bottom-2', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'max-w-[85%] sm:max-w-[75%] rounded-2xl p-5 transition-shadow',
          isUser
            ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-md'
            : 'bg-white shadow-soft border border-gray-100'
        )}
      >
        {/* 内容区 */}
        <div className={clsx('prose prose-sm max-w-none', isUser ? 'text-white prose-invert' : 'text-gray-800')}>
          {message.isLoading ? (
            <div className="flex items-center gap-1 py-2">
              <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          ) : (
            <ReactMarkdown>{message.content}</ReactMarkdown>
          )}
        </div>

        {/* 来源引用 */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-2">
              <FileText className="w-3 h-3" />
              {t('sources.title')}
            </p>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((source, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 text-[10px] bg-slate-50 text-slate-600 px-2 py-1 rounded-md border border-slate-100 hover:bg-slate-100 transition-colors cursor-default"
                >
                  <span className="font-bold text-primary-500 opacity-70">[{idx + 1}]</span>
                  <span className="truncate max-w-[120px]">{source.documentTitle}</span>
                  <span className="opacity-50">·</span>
                  <span>p.{source.pageNumber}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 扩展功能: 图表 (如果有) */}
        {message.metadata?.chartData && (
          <div className="mt-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary-500" />
                {message.metadata.chartTitle || 'Data Visualization'}
              </h4>
              <button className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-white rounded-md transition-all">
                <Download className="w-4 h-4" />
              </button>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={message.metadata.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" fontSize={10} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis fontSize={10} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f1f5f9' }}
                  />
                  <Bar dataKey="value" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 操作栏 */}
        {!isUser && !message.isLoading && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleCopy}
              className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-slate-50 rounded-md transition-all flex items-center gap-1.5 text-xs"
              title={t('actions.copy')}
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

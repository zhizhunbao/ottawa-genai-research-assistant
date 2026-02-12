/**
 * 消息项组件
 *
 * 使用 shadcn/ui Button, Badge, Tooltip 替代原生 HTML 元素。
 * 处理单个消息的渲染，支持 Markdown、Recharts 图表、置信度指示器和可点击引用。
 * 遵循 US-107 布局规范和 shadcn/ui 迁移计划。
 * 更新: US-203 置信度指示器 + 引用预览。
 */

import { useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { Copy, FileText, Check } from 'lucide-react'
import type { ChatMessage, Source } from '../types'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import {
  Button,
  Badge,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/shared/components/ui'
import { ChartContainer } from '@/shared/components/charts'
import { ConfidenceIndicator } from './ConfidenceIndicator'
import { SourcePreviewModal } from './SourcePreviewModal'

interface MessageItemProps {
  message: ChatMessage
}

export function MessageItem({ message }: MessageItemProps) {
  const { t } = useTranslation('chat')
  const isUser = message.role === 'user'

  // 复制状态
  const [copied, setCopied] = useState(false)

  // 引用预览状态
  const [previewSource, setPreviewSource] = useState<Source | null>(null)
  const [previewIndex, setPreviewIndex] = useState<number>(0)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [message.content])

  const handleSourceClick = useCallback((source: Source, idx: number) => {
    setPreviewSource(source)
    setPreviewIndex(idx + 1)
  }, [])

  return (
    <>
      <div className={cn('flex w-full mb-6 animate-in fade-in slide-in-from-bottom-2', isUser ? 'justify-end' : 'justify-start')}>
        <div
          className={cn(
            'max-w-[85%] sm:max-w-[75%] rounded-2xl p-5 transition-shadow',
            isUser
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-card shadow-sm border'
          )}
        >
          {/* 内容区 */}
          <div className={cn('prose prose-sm max-w-none', isUser ? 'text-primary-foreground prose-invert' : 'text-card-foreground')}>
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

          {/* 置信度指示器 + 来源引用 */}
          {!isUser && !message.isLoading && (
            <>
              {/* 置信度 */}
              {message.confidence !== undefined && (
                <div className="mt-3">
                  <ConfidenceIndicator confidence={message.confidence} />
                </div>
              )}

              {/* 来源引用 */}
              {message.sources && message.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2">
                    <FileText className="w-3 h-3" />
                    {t('sources.title')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {message.sources.map((source, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="gap-1.5 text-[10px] font-medium cursor-pointer hover:bg-secondary/80 transition-colors"
                        onClick={() => handleSourceClick(source, idx)}
                      >
                        <span className="font-bold text-primary/70">[{idx + 1}]</span>
                        <span className="truncate max-w-[120px]">{source.documentTitle}</span>
                        <span className="opacity-50">·</span>
                        <span>p.{source.pageNumber}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* 扩展功能: 图表 (US-301 Chart Visualization) */}
          {message.chart && (
            <div className="mt-4">
              <ChartContainer
                chart={{
                  type: message.chart.type,
                  title: message.chart.title,
                  xKey: message.chart.xKey,
                  yKeys: message.chart.yKeys,
                  data: message.chart.data,
                  stacked: message.chart.stacked,
                }}
                sources={message.sources?.map((s) => ({
                  document_id: s.documentId,
                  document_name: s.documentTitle,
                  page_number: s.pageNumber,
                }))}
                showExport={true}
              />
            </div>
          )}

          {/* 操作栏 */}
          {!isUser && !message.isLoading && (
            <div className="mt-3 flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="h-7 w-7"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{copied ? t('actions.copied') : t('actions.copy')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>

      {/* 来源预览模态框 */}
      <SourcePreviewModal
        source={previewSource}
        index={previewIndex}
        onClose={() => setPreviewSource(null)}
      />
    </>
  )
}

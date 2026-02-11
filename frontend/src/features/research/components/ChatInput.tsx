/**
 * 聊天输入组件
 *
 * 使用 shadcn/ui Input 和 Button 替代原生 HTML 元素。
 * 遵循 US-107 布局规范和 shadcn/ui 迁移计划。
 */

import { useTranslation } from 'react-i18next'
import { Send } from 'lucide-react'
import { FormEvent } from 'react'
import { Button, Input } from '@/shared/components/ui'

interface ChatInputProps {
  inputValue: string
  isLoading: boolean
  onInputChange: (value: string) => void
  onFormSubmit: (e: FormEvent<HTMLFormElement>) => void
}

export function ChatInput({
  inputValue,
  isLoading,
  onInputChange,
  onFormSubmit,
}: ChatInputProps) {
  const { t } = useTranslation('chat')

  return (
    <div className="border-t bg-background p-4">
      <form onSubmit={onFormSubmit} className="max-w-3xl mx-auto flex gap-4">
        <Input
          type="text"
          name="message"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={t('placeholder')}
          disabled={isLoading}
          className="flex-1 h-12 rounded-xl"
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 px-6 rounded-xl gap-2"
        >
          <Send className="w-4 h-4" />
          {t('send')}
        </Button>
      </form>
    </div>
  )
}

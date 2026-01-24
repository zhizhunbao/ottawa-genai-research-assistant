/**
 * 聊天输入组件
 *
 * 消息输入表单。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useTranslation } from 'react-i18next'
import { Send } from 'lucide-react'
import { FormEvent } from 'react'

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
    <div className="border-t border-gray-200 bg-white p-4">
      <form onSubmit={onFormSubmit} className="max-w-3xl mx-auto flex gap-4">
        <input
          type="text"
          name="message"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={t('placeholder')}
          disabled={isLoading}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          {t('send')}
        </button>
      </form>
    </div>
  )
}

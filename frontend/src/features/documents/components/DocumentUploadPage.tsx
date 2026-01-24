/**
 * 文档上传页面组件
 *
 * 提供文档上传界面。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { Quarter, ReportType } from '@/features/documents/types'
import { DocumentUploadForm } from './DocumentUploadForm'
import { ProcessingStatus } from './ProcessingStatus'
import { UploadGuidance } from './UploadGuidance'

interface DocumentUploadPageProps {
  /** 选中的文件 */
  file: File | null
  /** 标题 */
  title: string
  /** 季度 */
  quarter: Quarter | ''
  /** 年份 */
  year: string
  /** 报告类型 */
  reportType: ReportType | ''
  /** 表单错误 */
  formErrors: {
    file?: string
    title?: string
    quarter?: string
    year?: string
    reportType?: string
  }
  /** 是否正在上传 */
  isUploading: boolean
  /** 上传进度 */
  uploadProgress: number
  /** 上传成功 */
  uploadSuccess: boolean
  /** 上传错误 */
  uploadError: string | null
  /** 文件选择回调 */
  onFileChange: (file: File | null) => void
  /** 标题变化回调 */
  onTitleChange: (value: string) => void
  /** 季度变化回调 */
  onQuarterChange: (value: Quarter | '') => void
  /** 年份变化回调 */
  onYearChange: (value: string) => void
  /** 报告类型变化回调 */
  onReportTypeChange: (value: ReportType | '') => void
  /** 提交回调 */
  onSubmit: () => void
  /** 重置回调 */
  onReset: () => void
  /** 处理文件拖放 */
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void
  /** 处理文件选择 */
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function DocumentUploadPage({
  file,
  title,
  quarter,
  year,
  reportType,
  formErrors,
  isUploading,
  uploadProgress,
  uploadSuccess,
  uploadError,
  onFileChange,
  onTitleChange,
  onQuarterChange,
  onYearChange,
  onReportTypeChange,
  onSubmit,
  onReset,
  onDrop,
  onFileSelect,
}: DocumentUploadPageProps) {
  const { t } = useTranslation('documents')

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50">
      {/* 头部 */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/documents"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('upload.pageTitle')}</h1>
              <p className="text-sm text-gray-500">{t('upload.pageSubtitle')}</p>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DocumentUploadForm
          file={file}
          title={title}
          quarter={quarter}
          year={year}
          reportType={reportType}
          formErrors={formErrors}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          uploadSuccess={uploadSuccess}
          uploadError={uploadError}
          onFileChange={onFileChange}
          onTitleChange={onTitleChange}
          onQuarterChange={onQuarterChange}
          onYearChange={onYearChange}
          onReportTypeChange={onReportTypeChange}
          onSubmit={onSubmit}
          onReset={onReset}
          onDrop={onDrop}
          onFileSelect={onFileSelect}
        />

        {/* 处理状态 (仅在有文件或上传成功时显示) */}
        {(file || uploadSuccess) && <ProcessingStatus />}

        {/* 上传指引 */}
        <UploadGuidance />
      </main>
    </div>
  )
}

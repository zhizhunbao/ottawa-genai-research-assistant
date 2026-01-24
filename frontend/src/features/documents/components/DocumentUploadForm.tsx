/**
 * 文档上传表单组件
 *
 * 提供 PDF 文档上传表单。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useTranslation } from 'react-i18next'
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
import type { Quarter, ReportType } from '@/features/documents/types'
import { QUARTERS, REPORT_TYPES } from '@/features/documents/constants'

interface DocumentUploadFormProps {
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

export function DocumentUploadForm({
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
}: DocumentUploadFormProps) {
  const { t } = useTranslation('documents')

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('upload.title')}</h2>

      {/* 文件拖放区域 */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          file ? 'border-primary-300 bg-primary-50' : 'border-gray-200 hover:border-primary-300'
        }`}
      >
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-8 h-8 text-primary-500" />
            <div className="text-left">
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={() => onFileChange(null)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">{t('upload.dropzone')}</p>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 cursor-pointer transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={onFileSelect}
                className="hidden"
              />
              {t('upload.browse')}
            </label>
          </>
        )}
      </div>
      {formErrors.file && (
        <p className="mt-2 text-sm text-red-600">{formErrors.file}</p>
      )}

      {/* 元数据表单 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* 标题 */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('upload.titleLabel')}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={t('upload.titlePlaceholder')}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* 季度 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('upload.quarter')}
          </label>
          <select
            value={quarter}
            onChange={(e) => onQuarterChange(e.target.value as Quarter | '')}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">{t('upload.selectQuarter')}</option>
            {QUARTERS.map((q) => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
        </div>

        {/* 年份 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('upload.year')}
          </label>
          <input
            type="text"
            value={year}
            onChange={(e) => onYearChange(e.target.value)}
            placeholder={t('upload.yearPlaceholder')}
            maxLength={4}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {formErrors.year && (
            <p className="mt-1 text-sm text-red-600">{formErrors.year}</p>
          )}
        </div>

        {/* 报告类型 */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('upload.reportType')}
          </label>
          <select
            value={reportType}
            onChange={(e) => onReportTypeChange(e.target.value as ReportType | '')}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">{t('upload.selectReportType')}</option>
            {REPORT_TYPES.map((type) => (
              <option key={type} value={type}>{t(`reportTypes.${type}`)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 上传进度 */}
      {isUploading && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">{t('upload.uploading')}</span>
            <span className="text-sm font-medium text-gray-900">{uploadProgress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* 成功消息 */}
      {uploadSuccess && (
        <div className="mt-6 flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-lg">
          <CheckCircle className="w-5 h-5" />
          <p>{t('upload.success')}</p>
        </div>
      )}

      {/* 错误消息 */}
      {uploadError && (
        <div className="mt-6 flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <p>{uploadError}</p>
        </div>
      )}

      {/* 提交按钮 */}
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={onSubmit}
          disabled={isUploading || !file}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isUploading ? t('upload.uploading') : t('upload.submit')}
        </button>
        {(file || uploadSuccess) && (
          <button
            onClick={onReset}
            className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('upload.reset')}
          </button>
        )}
      </div>
    </div>
  )
}

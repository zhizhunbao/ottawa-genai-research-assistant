/**
 * 文档上传 Hook
 *
 * 提供文档上传相关的业务逻辑。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useCallback, useState } from 'react'
import { documentsApi } from '@/features/documents/services/documentsApi'
import type { DocumentUploadRequest, Quarter, ReportType } from '@/features/documents/types'

/**
 * 上传表单状态
 */
interface UploadFormState {
  file: File | null
  title: string
  quarter: Quarter | ''
  year: string
  reportType: ReportType | ''
}

/**
 * 表单错误
 */
interface FormErrors {
  file?: string
  title?: string
  quarter?: string
  year?: string
  reportType?: string
}

/**
 * 文档上传 Hook 返回值
 */
interface UseDocumentUploadReturn {
  /** 表单状态 */
  formState: UploadFormState
  /** 表单错误 */
  formErrors: FormErrors
  /** 是否正在上传 */
  isUploading: boolean
  /** 上传进度 */
  uploadProgress: number
  /** 上传成功 */
  uploadSuccess: boolean
  /** 上传错误 */
  uploadError: string | null
  /** 处理文件选择 */
  handleFileChange: (file: File | null) => void
  /** 处理标题变化 */
  handleTitleChange: (value: string) => void
  /** 处理季度变化 */
  handleQuarterChange: (value: Quarter | '') => void
  /** 处理年份变化 */
  handleYearChange: (value: string) => void
  /** 处理报告类型变化 */
  handleReportTypeChange: (value: ReportType | '') => void
  /** 提交上传 */
  handleSubmit: () => Promise<void>
  /** 重置表单 */
  resetForm: () => void
  /** 处理文件拖放 */
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void
  /** 处理文件选择输入 */
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
}

/**
 * 初始表单状态
 */
const initialFormState: UploadFormState = {
  file: null,
  title: '',
  quarter: '',
  year: '',
  reportType: '',
}

/**
 * 文档上传 Hook
 */
export function useDocumentUpload(): UseDocumentUploadReturn {
  const [formState, setFormState] = useState<UploadFormState>(initialFormState)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  /**
   * 验证表单
   */
  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {}

    if (!formState.file) {
      errors.file = 'Please select a file'
    } else if (!formState.file.name.toLowerCase().endsWith('.pdf')) {
      errors.file = 'Only PDF files are allowed'
    } else if (formState.file.size > 50 * 1024 * 1024) {
      errors.file = 'File size must be less than 50MB'
    }

    if (formState.year && !/^\d{4}$/.test(formState.year)) {
      errors.year = 'Invalid year format'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [formState])

  /**
   * 处理文件选择
   */
  const handleFileChange = useCallback((file: File | null) => {
    setFormState(prev => ({ ...prev, file }))
    setFormErrors(prev => ({ ...prev, file: undefined }))
    setUploadSuccess(false)
    setUploadError(null)
  }, [])

  /**
   * 处理标题变化
   */
  const handleTitleChange = useCallback((value: string) => {
    setFormState(prev => ({ ...prev, title: value }))
  }, [])

  /**
   * 处理季度变化
   */
  const handleQuarterChange = useCallback((value: Quarter | '') => {
    setFormState(prev => ({ ...prev, quarter: value }))
  }, [])

  /**
   * 处理年份变化
   */
  const handleYearChange = useCallback((value: string) => {
    setFormState(prev => ({ ...prev, year: value }))
    setFormErrors(prev => ({ ...prev, year: undefined }))
  }, [])

  /**
   * 处理报告类型变化
   */
  const handleReportTypeChange = useCallback((value: ReportType | '') => {
    setFormState(prev => ({ ...prev, reportType: value }))
  }, [])

  /**
   * 提交上传
   */
  const handleSubmit = useCallback(async () => {
    if (!validateForm() || !formState.file) {
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setUploadError(null)

    try {
      const request: DocumentUploadRequest = {
        file: formState.file,
        title: formState.title || undefined,
        quarter: formState.quarter || undefined,
        year: formState.year ? parseInt(formState.year, 10) : undefined,
        reportType: formState.reportType || undefined,
      }

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      await documentsApi.uploadDocument(request)

      clearInterval(progressInterval)
      setUploadProgress(100)
      setUploadSuccess(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setUploadError(message)
    } finally {
      setIsUploading(false)
    }
  }, [formState, validateForm])

  /**
   * 重置表单
   */
  const resetForm = useCallback(() => {
    setFormState(initialFormState)
    setFormErrors({})
    setUploadProgress(0)
    setUploadSuccess(false)
    setUploadError(null)
  }, [])

  /**
   * 处理文件拖放
   */
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileChange(droppedFile)
    }
  }, [handleFileChange])

  /**
   * 处理文件选择
   */
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileChange(selectedFile)
    }
  }, [handleFileChange])

  return {
    formState,
    formErrors,
    isUploading,
    uploadProgress,
    uploadSuccess,
    uploadError,
    handleFileChange,
    handleTitleChange,
    handleQuarterChange,
    handleYearChange,
    handleReportTypeChange,
    handleSubmit,
    resetForm,
    handleDrop,
    handleFileSelect,
  }
}

export default useDocumentUpload

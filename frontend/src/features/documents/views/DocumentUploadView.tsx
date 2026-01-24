/**
 * 文档上传视图
 *
 * 视图层只组合组件和调用 Hooks。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { DocumentUploadPage } from '@/features/documents/components/DocumentUploadPage'
import { useDocumentUpload } from '@/features/documents/hooks/useDocumentUpload'

export default function DocumentUploadView() {
  const {
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
  } = useDocumentUpload()

  return (
    <DocumentUploadPage
      file={formState.file}
      title={formState.title}
      quarter={formState.quarter}
      year={formState.year}
      reportType={formState.reportType}
      formErrors={formErrors}
      isUploading={isUploading}
      uploadProgress={uploadProgress}
      uploadSuccess={uploadSuccess}
      uploadError={uploadError}
      onFileChange={handleFileChange}
      onTitleChange={handleTitleChange}
      onQuarterChange={handleQuarterChange}
      onYearChange={handleYearChange}
      onReportTypeChange={handleReportTypeChange}
      onSubmit={handleSubmit}
      onReset={resetForm}
      onDrop={handleDrop}
      onFileSelect={handleFileSelect}
    />
  )
}

/**
 * 文档模块类型定义
 *
 * 定义文档相关的 TypeScript 类型。
 * 遵循 dev-frontend_patterns skill 规范。
 */

/**
 * 文档状态枚举
 */
export type DocumentStatus = 'pending' | 'processing' | 'indexed' | 'failed'

/**
 * 报告类型枚举
 */
export type ReportType = 'ED_UPDATE' | 'ECONOMIC_REPORT' | 'TOURISM' | 'OTHER'

/**
 * 季度枚举
 */
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4'

/**
 * 文档元数据
 */
export interface DocumentMetadata {
  /** 文档语言 */
  language: 'en' | 'fr'
  /** 主题标签 */
  topics: string[]
}

/**
 * 文档实体
 */
export interface Document {
  /** 唯一标识 */
  id: string
  /** 文档标题 */
  title: string
  /** 文件名 */
  fileName: string
  /** 上传日期 */
  uploadDate: string
  /** 季度 */
  quarter: Quarter
  /** 年份 */
  year: number
  /** 报告类型 */
  reportType: ReportType
  /** 处理状态 */
  status: DocumentStatus
  /** 页数 */
  pageCount: number
  /** 分块数量 */
  chunkCount: number
  /** 元数据 */
  metadata: DocumentMetadata
}

/**
 * 文档列表请求参数
 */
export interface DocumentListParams {
  /** 搜索关键词 */
  search?: string
  /** 季度过滤 */
  quarter?: Quarter
  /** 年份过滤 */
  year?: number
  /** 报告类型过滤 */
  reportType?: ReportType
  /** 状态过滤 */
  status?: DocumentStatus
  /** 页码 */
  page?: number
  /** 每页数量 */
  pageSize?: number
}

/**
 * 文档列表响应
 */
export interface DocumentListResponse {
  /** 文档列表 */
  documents: Document[]
  /** 总数 */
  total: number
  /** 当前页 */
  page: number
  /** 每页数量 */
  pageSize: number
}

/**
 * 文档上传请求
 */
export interface DocumentUploadRequest {
  /** 文件 */
  file: File
  /** 标题 */
  title?: string
  /** 季度 */
  quarter?: Quarter
  /** 年份 */
  year?: number
  /** 报告类型 */
  reportType?: ReportType
}

/**
 * 文档上传响应
 */
export interface DocumentUploadResponse {
  /** 文档 ID */
  id: string
  /** 上传状态 */
  status: DocumentStatus
  /** 消息 */
  message: string
}

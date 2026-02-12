/**
 * Document Feature Types
 *
 * @template T6 backend/features/documents/types.ts — Document Management Entities
 */

export enum DocumentStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    INDEXED = 'indexed',
    FAILED = 'failed'
}

export enum ReportType {
    ED_UPDATE = 'ED_UPDATE',
    QUARTERLY = 'QUARTERLY',
    ANNUAL = 'ANNUAL',
    SPECIAL = 'SPECIAL'
}

export interface DocumentMetadata {
    language: 'en' | 'fr'
    topics: string[]
}

export interface Document {
    id: string
    title: string
    fileName: string
    uploadDate: string
    quarter: string
    year: number
    reportType: ReportType
    status: DocumentStatus
    pageCount: number
    chunkCount: number
    metadata: DocumentMetadata
}

export interface UploadDocumentRequest {
    file: File
    quarter: string
    year: number
    reportType: ReportType
}

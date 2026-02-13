/**
 * DocumentTypes - Document metadata, status, and upload type definitions
 *
 * @module features/documents
 * @template T6 backend/features/documents/types.ts — Document Management Entities
 * @reference none
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

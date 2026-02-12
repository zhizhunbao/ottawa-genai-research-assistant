/**
 * Global API Type Definitions
 *
 * @template T6 backend/core/types/api.ts — API Response & Pagination Patterns
 */

export interface ApiResponse<T> {
    success: boolean
    data: T | null
    error: string | null
    timestamp: string
}

export interface PaginationParams {
    page: number
    pageSize: number
}

export interface PaginatedResult<T> {
    items: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

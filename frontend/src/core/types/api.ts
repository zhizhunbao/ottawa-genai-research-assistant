/**
 * ApiTypes - Shared API response and pagination type definitions
 *
 * @module core/types
 * @template T6 backend/core/types/api.ts — API Response & Pagination Patterns
 * @reference none
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

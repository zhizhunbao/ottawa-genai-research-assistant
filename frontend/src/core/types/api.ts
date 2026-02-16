/**
 * ApiTypes - Shared API response and pagination type definitions
 *
 * @module core/types
 * @template none
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

/**
 * API 基础服务
 *
 * 提供统一的 HTTP 请求处理，包括认证、错误处理等。
 * 遵循 dev-frontend_patterns skill 的服务层模式。
 */

import type { ApiResponse } from '@/features/research/types'

// API 配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'
const API_TIMEOUT = 30000

// 自定义错误类
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// 请求配置接口
interface RequestConfig extends RequestInit {
  timeout?: number
  skipAuth?: boolean
}

// 获取认证 token
function getAuthToken(): string | null {
  try {
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      const parsed = JSON.parse(authStorage)
      return parsed.state?.token ?? null
    }
  } catch {
    console.warn('Failed to parse auth storage')
  }
  return null
}

// 创建带超时的 fetch
async function fetchWithTimeout(
  url: string,
  config: RequestConfig = {}
): Promise<Response> {
  const { timeout = API_TIMEOUT, ...fetchConfig } = config

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchConfig,
      signal: controller.signal,
    })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

// 处理响应
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get('content-type')

  if (!contentType?.includes('application/json')) {
    if (!response.ok) {
      throw new ApiError(
        `HTTP error: ${response.status} ${response.statusText}`,
        response.status
      )
    }
    return {
      success: true,
      data: null as T,
      error: null,
      timestamp: new Date().toISOString(),
    }
  }

  const data: ApiResponse<T> = await response.json()

  if (!response.ok) {
    throw new ApiError(
      data.error || `HTTP error: ${response.status}`,
      response.status,
      data
    )
  }

  return data
}

// 构建完整 URL
function buildUrl(path: string, params?: Record<string, string>): string {
  const url = new URL(path, window.location.origin)
  if (!url.pathname.startsWith(API_BASE_URL)) {
    url.pathname = `${API_BASE_URL}${path}`
  }

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
  }

  return url.toString()
}

// API 请求方法
export const apiService = {
  /**
   * GET 请求
   */
  async get<T>(
    path: string,
    params?: Record<string, string>,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = buildUrl(path, params)
    const token = config?.skipAuth ? null : getAuthToken()

    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...config?.headers,
      },
      ...config,
    })

    return handleResponse<T>(response)
  },

  /**
   * POST 请求
   */
  async post<T>(
    path: string,
    body?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = buildUrl(path)
    const token = config?.skipAuth ? null : getAuthToken()

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...config?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...config,
    })

    return handleResponse<T>(response)
  },

  /**
   * PUT 请求
   */
  async put<T>(
    path: string,
    body?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = buildUrl(path)
    const token = config?.skipAuth ? null : getAuthToken()

    const response = await fetchWithTimeout(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...config?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...config,
    })

    return handleResponse<T>(response)
  },

  /**
   * DELETE 请求
   */
  async delete<T>(
    path: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = buildUrl(path)
    const token = config?.skipAuth ? null : getAuthToken()

    const response = await fetchWithTimeout(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...config?.headers,
      },
      ...config,
    })

    return handleResponse<T>(response)
  },

  /**
   * 文件上传
   */
  async upload<T>(
    path: string,
    formData: FormData,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = buildUrl(path)
    const token = config?.skipAuth ? null : getAuthToken()

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...config?.headers,
      },
      body: formData,
      ...config,
    })

    return handleResponse<T>(response)
  },
}

export default apiService

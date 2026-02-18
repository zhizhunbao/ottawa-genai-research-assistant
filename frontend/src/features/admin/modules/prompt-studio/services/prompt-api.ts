/**
 * Prompt Studio API Service
 *
 * API client for prompt template management endpoints.
 */

import type {
  PromptCategory,
  PromptCreate,
  PromptInfo,
  PromptListResponse,
  PromptTestResult,
  PromptUpdate,
  PromptVersion,
} from '../types'

const API_BASE = '/api/v1/admin/prompts'

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  const json: ApiResponse<T> = await response.json()
  if (!json.success) {
    throw new Error(json.error || 'API request failed')
  }
  return json.data
}

/**
 * List all prompts
 */
export async function listPrompts(category?: PromptCategory): Promise<PromptListResponse> {
  const params = category ? `?category=${category}` : ''
  return fetchApi<PromptListResponse>(`${API_BASE}${params}`)
}

/**
 * Get a specific prompt
 */
export async function getPrompt(promptId: string): Promise<PromptInfo> {
  return fetchApi<PromptInfo>(`${API_BASE}/${encodeURIComponent(promptId)}`)
}

/**
 * Create a new prompt
 */
export async function createPrompt(data: PromptCreate): Promise<PromptInfo> {
  return fetchApi<PromptInfo>(API_BASE, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Update a prompt
 */
export async function updatePrompt(promptId: string, data: PromptUpdate): Promise<PromptInfo> {
  return fetchApi<PromptInfo>(`${API_BASE}/${encodeURIComponent(promptId)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Delete a prompt
 */
export async function deletePrompt(promptId: string): Promise<boolean> {
  return fetchApi<boolean>(`${API_BASE}/${encodeURIComponent(promptId)}`, {
    method: 'DELETE',
  })
}

/**
 * Get prompt version history
 */
export async function getVersions(promptId: string): Promise<PromptVersion[]> {
  return fetchApi<PromptVersion[]>(`${API_BASE}/${encodeURIComponent(promptId)}/versions`)
}

/**
 * Test a prompt with variables
 */
export async function testPrompt(
  promptId: string,
  variables: Record<string, string>,
  model?: string
): Promise<PromptTestResult> {
  return fetchApi<PromptTestResult>(`${API_BASE}/test`, {
    method: 'POST',
    body: JSON.stringify({
      prompt_id: promptId,
      variables,
      model,
    }),
  })
}

/**
 * Render a prompt with variables
 */
export async function renderPrompt(
  promptId: string,
  variables: Record<string, string>
): Promise<string> {
  return fetchApi<string>(`${API_BASE}/${encodeURIComponent(promptId)}/render`, {
    method: 'POST',
    body: JSON.stringify(variables),
  })
}

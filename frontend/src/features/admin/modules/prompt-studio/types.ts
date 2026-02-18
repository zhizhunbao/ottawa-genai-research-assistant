/**
 * Prompt Studio Types
 *
 * Type definitions for prompt template management.
 */

export type PromptCategory =
  | 'system'
  | 'rag_context'
  | 'citation'
  | 'chart'
  | 'evaluation'
  | 'no_results'
  | 'custom'

export type PromptStatus = 'active' | 'draft' | 'archived'

export interface PromptInfo {
  id: string
  name: string
  category: PromptCategory
  template: string
  description: string | null
  variables: string[]
  version: number
  status: PromptStatus
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface PromptVersion {
  version: number
  template: string
  description: string | null
  created_at: string
  created_by: string | null
}

export interface PromptListResponse {
  prompts: PromptInfo[]
  total: number
  by_category: Record<string, number>
}

export interface PromptTestResult {
  prompt_id: string
  rendered: string
  response: string | null
  latency_ms: number | null
}

export interface PromptCreate {
  name: string
  category: PromptCategory
  template: string
  description?: string
  variables?: string[]
}

export interface PromptUpdate {
  template: string
  description?: string
  variables?: string[]
}

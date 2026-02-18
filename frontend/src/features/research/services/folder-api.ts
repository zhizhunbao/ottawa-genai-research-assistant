/**
 * folderApi - REST API client for folder CRUD and file-tree operations
 *
 * @module features/documents/services
 * @template none
 * @reference none
 */

import { apiService } from '@/shared/services/api-service'

// ============================================================
// Response Types
// ============================================================

/** Folder response from backend */
export interface FolderResponse {
  id: string
  name: string
  parent_id: string | null
  children_count: number
  created_at: string
  updated_at: string
}

/** Unified file tree node (folder or file) */
export interface FileNodeResponse {
  id: string
  name: string
  type: 'folder' | 'uploaded_file'
  parent_id: string | null
  status: string | null
  file_name: string | null
  children_count: number
  created_at: string
  updated_at: string
}

/** Folder contents response */
export interface FolderContentsResponse {
  folder: FolderResponse | null
  items: FileNodeResponse[]
  total: number
}

// ============================================================
// API Methods
// ============================================================

export const folderApi = {
  /**
   * Create a new folder.
   */
  async createFolder(name: string, parentId?: string | null): Promise<FolderResponse> {
    const response = await apiService.post<FolderResponse>('/folders', {
      name,
      parent_id: parentId ?? null,
    })
    if (!response.data) {
      throw new Error(response.error || 'Failed to create folder')
    }
    return response.data
  },

  /**
   * Get folder details by ID.
   */
  async getFolder(folderId: string): Promise<FolderResponse> {
    const response = await apiService.get<FolderResponse>(`/folders/${folderId}`)
    if (!response.data) {
      throw new Error(response.error || 'Folder not found')
    }
    return response.data
  },

  /**
   * Rename a folder.
   */
  async renameFolder(folderId: string, name: string): Promise<FolderResponse> {
    const response = await apiService.patch<FolderResponse>(
      `/folders/${folderId}/rename?name=${encodeURIComponent(name)}`
    )
    if (!response.data) {
      throw new Error(response.error || 'Failed to rename folder')
    }
    return response.data
  },

  /**
   * Delete a folder and all its contents.
   */
  async deleteFolder(folderId: string): Promise<void> {
    const response = await apiService.delete<boolean>(`/folders/${folderId}`)
    if (!response.data) {
      throw new Error(response.error || 'Failed to delete folder')
    }
  },

  /**
   * List root-level items (folders + files with no parent).
   */
  async listRoot(): Promise<FolderContentsResponse> {
    const response = await apiService.get<FolderContentsResponse>('/folders/tree/root')
    if (!response.data) {
      throw new Error(response.error || 'Failed to list root contents')
    }
    return response.data
  },

  /**
   * List direct children of a folder.
   */
  async listChildren(folderId: string): Promise<FolderContentsResponse> {
    const response = await apiService.get<FolderContentsResponse>(
      `/folders/${folderId}/children`
    )
    if (!response.data) {
      throw new Error(response.error || 'Failed to list folder children')
    }
    return response.data
  },

  /**
   * Move a file or folder to a new parent.
   */
  async moveNode(nodeId: string, targetParentId: string | null): Promise<FileNodeResponse> {
    const response = await apiService.patch<FileNodeResponse>(
      `/folders/${nodeId}/move`,
      { target_parent_id: targetParentId }
    )
    if (!response.data) {
      throw new Error(response.error || 'Failed to move node')
    }
    return response.data
  },
}

export default folderApi

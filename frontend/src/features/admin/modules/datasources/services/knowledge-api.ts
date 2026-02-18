/**
 * Knowledge Base API Service
 * 
 * Client for /api/v1/knowledge-bases endpoints.
 */

import { apiService } from '@/shared/services/api-service';
import type { ApiResponse } from '@/features/research/types';
import type { KBResponse, KBCreate, KBUpdate, KBListResponse, KBDocumentListResponse } from '../types';

const BASE_PATH = '/knowledge-bases';

export const knowledgeApi = {
  /** List all knowledge bases */
  async listAll(): Promise<ApiResponse<KBListResponse>> {
    return apiService.get<KBListResponse>(BASE_PATH);
  },

  /** Get a single KB */
  async get(id: string): Promise<ApiResponse<KBResponse>> {
    return apiService.get<KBResponse>(`${BASE_PATH}/${id}`);
  },

  /** Create a new KB */
  async create(data: KBCreate): Promise<ApiResponse<KBResponse>> {
    return apiService.post<KBResponse>(BASE_PATH, data);
  },

  /** Update a KB */
  async update(id: string, data: KBUpdate): Promise<ApiResponse<KBResponse>> {
    return apiService.patch<KBResponse>(`${BASE_PATH}/${id}`, data);
  },

  /** Delete a KB */
  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiService.delete<boolean>(`${BASE_PATH}/${id}`);
  },

  /** List documents in a KB */
  async listDocuments(id: string): Promise<ApiResponse<KBDocumentListResponse>> {
    return apiService.get<KBDocumentListResponse>(`${BASE_PATH}/${id}/documents`);
  }
};

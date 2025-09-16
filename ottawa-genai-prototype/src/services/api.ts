// Real API Service Layer - Production Implementation
import { Report, Message, UploadedFile, StatData, Translations } from '../mock/types';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

// HTTP client utility
class ApiClient {
  private baseURL: string;
  private headers: Record<string, string>;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: this.headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async upload<T>(endpoint: string, file: File): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }
}

// Initialize API client
const apiClient = new ApiClient(API_BASE_URL);

// Real API implementation
export const realApi = {
  // Reports API
  getReports: async (): Promise<Report[]> => {
    return apiClient.get<Report[]>('/reports');
  },

  getReport: async (id: string): Promise<Report> => {
    return apiClient.get<Report>(`/reports/${id}`);
  },

  generateReport: async (query: string): Promise<Report> => {
    return apiClient.post<Report>('/reports/generate', { query });
  },

  // Chat API
  sendMessage: async (message: string, conversationId?: string): Promise<Message> => {
    return apiClient.post<Message>('/chat/message', { 
      message, 
      conversationId 
    });
  },

  getConversationHistory: async (conversationId: string): Promise<Message[]> => {
    return apiClient.get<Message[]>(`/chat/conversations/${conversationId}`);
  },

  // File Upload API
  uploadFile: async (file: File): Promise<UploadedFile> => {
    return apiClient.upload<UploadedFile>('/files/upload', file);
  },

  getUploadedFiles: async (): Promise<UploadedFile[]> => {
    return apiClient.get<UploadedFile[]>('/files');
  },

  deleteFile: async (fileId: string): Promise<void> => {
    const url = `${API_BASE_URL}/files/${fileId}`;
    await fetch(url, { method: 'DELETE' });
  },

  // Statistics API
  getStats: async (): Promise<StatData[]> => {
    return apiClient.get<StatData[]>('/stats');
  },

  // Translations API
  getTranslations: async (language: string): Promise<Translations> => {
    return apiClient.get<Translations>(`/translations/${language}`);
  },

  // Health Check
  healthCheck: async (): Promise<{ status: string; version: string }> => {
    return apiClient.get('/health');
  },
};

export default realApi; 
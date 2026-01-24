// Mock API layer - This will be replaced with real API calls in production
import { mockUploadedFiles } from '../data/files';
import {
    mockEconomicData,
    mockInitialMessage,
    mockResponsePatterns
} from '../data/messages';
import {
    mockBusinessData,
    mockEmploymentData,
    mockReports
} from '../data/reports';
import { getMockStats } from '../data/stats';
import { mockTranslations } from '../data/translations';
import { Message, Report, StatData, Translations, UploadedFile } from '../types';

// Simulate API delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API endpoints - Future: Replace with real HTTP calls
export const mockApi = {
  // Reports API
  async getReports(): Promise<Report[]> {
    await delay(500);
    return mockReports;
  },

  async getReportById(id: string): Promise<Report | null> {
    await delay(300);
    return mockReports.find((report: Report) => report.id === id) || null;
  },

  // Chat API
  async sendMessage(message: string): Promise<Message> {
    await delay(1500); // Simulate AI processing time
    
    const lowerMessage = message.toLowerCase();
    let response;
    
    if (lowerMessage.includes('business') || lowerMessage.includes('growth') || lowerMessage.includes('trend')) {
      response = mockResponsePatterns.business;
    } else if (lowerMessage.includes('unemploy') || lowerMessage.includes('job') || lowerMessage.includes('employment')) {
      response = mockResponsePatterns.employment;
    } else {
      response = mockResponsePatterns.default;
    }

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: response.content,
      timestamp: new Date(),
      hasChart: response.hasChart,
      chart: (response as any).chart
    };
  },

  async getInitialMessage(): Promise<Message> {
    await delay(200);
    return mockInitialMessage;
  },

  // File Upload API
  async uploadFile(file: File): Promise<UploadedFile> {
    await delay(2000); // Simulate upload time
    
    return {
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'completed',
      progress: 100,
      uploadedAt: new Date()
    };
  },

  async getUploadedFiles(): Promise<UploadedFile[]> {
    await delay(300);
    return mockUploadedFiles;
  },

  async deleteFile(fileId: string): Promise<boolean> {
    await delay(500);
    // Simulate successful deletion
    return true;
  },

  // Analytics API
  async getBusinessData() {
    await delay(400);
    return mockBusinessData;
  },

  async getEmploymentData() {
    await delay(400);
    return mockEmploymentData;
  },

  async getEconomicData() {
    await delay(400);
    return mockEconomicData;
  },

  // Settings API
  async getStats(): Promise<StatData[]> {
    await delay(300);
    // Create a mock translation function for this context
    const mockT = (key: string) => key;
    return getMockStats(mockT);
  },

  async getTranslations(): Promise<Translations> {
    await delay(200);
    return mockTranslations;
  },

  // Search API
  async searchDocuments(query: string): Promise<any[]> {
    await delay(800);
    // Simulate search results
    return [
      {
        id: '1',
        title: 'Economic Development Q1 Report',
        excerpt: `Relevant excerpt containing "${query}"...`,
        relevance: 0.95
      }
    ];
  }
};

// Export types for API responses
export type ApiResponse<T> = {
  data: T;
  status: 'success' | 'error';
  message?: string;
};

// Wrapper functions that simulate real API response format
export const apiWrapper = {
  async get<T>(endpoint: string, mockFn: () => Promise<T>): Promise<ApiResponse<T>> {
    try {
      const data = await mockFn();
      return {
        data,
        status: 'success'
      };
    } catch (error) {
      return {
        data: null as any,
        status: 'error',
        message: 'Mock API error'
      };
    }
  }
}; 
// Hybrid API Service - Graceful fallback from real API to mock data
import { mockApi } from '../mock/api/mockApi';
import { realApi } from './api';
import { Report, Message, UploadedFile, StatData, Translations } from '../mock/types';

// Configuration
const FALLBACK_TO_MOCK = process.env.REACT_APP_FALLBACK_TO_MOCK !== 'false';
const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT || '5000');

// Utility function to check if real API is available
const checkApiHealth = async (): Promise<boolean> => {
  try {
    await Promise.race([
      realApi.healthCheck(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), API_TIMEOUT)
      )
    ]);
    return true;
  } catch (error) {
    console.warn('Real API health check failed:', error);
    return false;
  }
};

// Generic fallback wrapper
async function withFallback<T>(
  realApiCall: () => Promise<T>,
  mockApiCall: () => Promise<T>,
  operationName: string
): Promise<T> {
  try {
    // Try real API first
    return await Promise.race([
      realApiCall(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('API Timeout')), API_TIMEOUT)
      )
    ]);
  } catch (error) {
    console.warn(`Real API failed for ${operationName}:`, error);
    
    if (FALLBACK_TO_MOCK) {
      console.info(`Falling back to mock data for ${operationName}`);
      return await mockApiCall();
    } else {
      throw error;
    }
  }
}

// Hybrid API implementation
export const hybridApi = {
  // Reports API with fallback
  getReports: async (): Promise<Report[]> => {
    return withFallback(
      () => realApi.getReports(),
      () => mockApi.getReports(),
      'getReports'
    );
  },

  getReport: async (id: string): Promise<Report | null> => {
    return withFallback(
      () => realApi.getReport(id),
      () => mockApi.getReportById(id),
      'getReport'
    );
  },

  // Chat API with fallback
  sendMessage: async (message: string, conversationId?: string): Promise<Message> => {
    return withFallback(
      () => realApi.sendMessage(message, conversationId),
      () => mockApi.sendMessage(message),
      'sendMessage'
    );
  },

  // Note: getConversationHistory not available in mockApi
  // getConversationHistory: async (conversationId: string): Promise<Message[]> => {
  //   return withFallback(
  //     () => realApi.getConversationHistory(conversationId),
  //     () => Promise.resolve([]), // Return empty array as fallback
  //     'getConversationHistory'
  //   );
  // },

  // File Upload API with fallback
  uploadFile: async (file: File): Promise<UploadedFile> => {
    return withFallback(
      () => realApi.uploadFile(file),
      () => mockApi.uploadFile(file),
      'uploadFile'
    );
  },

  getUploadedFiles: async (): Promise<UploadedFile[]> => {
    return withFallback(
      () => realApi.getUploadedFiles(),
      () => mockApi.getUploadedFiles(),
      'getUploadedFiles'
    );
  },

  deleteFile: async (fileId: string): Promise<void> => {
    return withFallback(
      () => realApi.deleteFile(fileId),
      async () => { await mockApi.deleteFile(fileId); }, // Convert boolean to void
      'deleteFile'
    );
  },

  // Statistics API with fallback
  getStats: async (): Promise<StatData[]> => {
    return withFallback(
      () => realApi.getStats(),
      () => mockApi.getStats(),
      'getStats'
    );
  },

  // Translations API with fallback
  getTranslations: async (language: string): Promise<Translations> => {
    return withFallback(
      () => realApi.getTranslations(language),
      () => mockApi.getTranslations(), // mockApi.getTranslations doesn't take parameters
      'getTranslations'
    );
  },

  // Health check for the hybrid system
  healthCheck: async (): Promise<{ 
    status: string; 
    version: string; 
    usingRealApi: boolean;
    usingMockFallback: boolean;
  }> => {
    const isRealApiHealthy = await checkApiHealth();
    
    if (isRealApiHealthy) {
      const health = await realApi.healthCheck();
      return {
        ...health,
        usingRealApi: true,
        usingMockFallback: false,
      };
    } else {
      return {
        status: 'healthy',
        version: '1.0.0-prototype-mock',
        usingRealApi: false,
        usingMockFallback: true,
      };
    }
  },
};

export default hybridApi; 
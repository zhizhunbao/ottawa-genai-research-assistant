// API Configuration - Controls whether to use mock data or real API
import { mockApi } from '../mock/api/mockApi';
import { realApi } from '../services/api';
import { hybridApi } from '../services/hybridApi';

// API Strategy Configuration
type ApiStrategy = 'mock' | 'real' | 'hybrid';

const getApiStrategy = (): ApiStrategy => {
  const strategy = process.env.REACT_APP_API_STRATEGY as ApiStrategy;
  
  // Default strategy based on environment
  if (strategy) return strategy;
  
  // Development and Production: use real API by default
  return 'real';
};

const API_STRATEGY = getApiStrategy();

// Select API implementation based on strategy
const getApiImplementation = () => {
  switch (API_STRATEGY) {
    case 'mock':
      return mockApi;
    case 'real':
      return realApi;
    case 'hybrid':
      return hybridApi;
    default:
      return hybridApi; // Safe default
  }
};

// Export the appropriate API based on configuration
export const api = getApiImplementation();

// Export configuration for components to check
export const config = {
  apiStrategy: API_STRATEGY,
  useMockApi: API_STRATEGY === 'mock',
  useHybridApi: API_STRATEGY === 'hybrid',
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1',
  fallbackToMock: process.env.REACT_APP_FALLBACK_TO_MOCK !== 'false',
  apiTimeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '5000'),
  version: '1.0.0-prototype'
};

// Utility functions
export const isPrototypeMode = () => API_STRATEGY !== 'real';
export const isHybridMode = () => API_STRATEGY === 'hybrid';
export const isMockMode = () => API_STRATEGY === 'mock'; 
// Mock Data Layer - Central data management for prototype
// This layer will be replaced with real database connections in production

export * from './data/aiResponses';
export * from './data/auth';
export * from './data/charts';
export * from './data/features';
export * from './data/files';
export * from './data/messages';
export * from './data/quickActions';
export * from './data/reports';
export * from './data/stats';
export * from './data/translations';

// Types
export * from './types';

// Configuration
export * from './config';

// Future: Replace with real API calls
export * from './api/mockApi';

// Utils and services
export * from './services/authService';
export * from './utils/dataManager';


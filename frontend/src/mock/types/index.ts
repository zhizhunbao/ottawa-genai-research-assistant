// Shared types for mock data
export interface Report {
  id: string;
  title: string;
  generatedAt: Date;
  type: 'summary' | 'analysis' | 'trend';
  status: 'completed' | 'processing' | 'error';
}

export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  chart?: any;
  hasChart?: boolean;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  uploadedAt: Date;
}

export interface ChartData {
  [key: string]: any;
}

export interface BusinessData {
  sector: string;
  growth: number;
  businesses: number;
}

export interface EmploymentData {
  name: string;
  value: number;
  color: string;
}

export interface EconomicData {
  month: string;
  businesses: number;
  growth: number;
}

export interface StatData {
  number: string;
  label: string;
}

export interface Translations {
  [language: string]: {
    [key: string]: string;
  };
}

// Authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user';
  createdAt: string;
  lastLoginAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
} 
import { AuthResponse, User } from '../types';

// Mock users
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    email: 'user@example.com',
    name: 'Regular User',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
    role: 'user',
    createdAt: '2024-01-05T00:00:00Z',
    lastLoginAt: '2024-01-15T09:15:00Z'
  },
  {
    id: '3',
    email: 'researcher@example.com',
    name: 'Research Assistant',
    avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=32&h=32&fit=crop&crop=face',
    role: 'user',
    createdAt: '2024-01-10T00:00:00Z',
    lastLoginAt: '2024-01-14T14:20:00Z'
  }
];

// Mock authentication responses
export const mockAuthResponse: AuthResponse = {
  user: mockUsers[0],
  token: 'mock-jwt-token-12345',
  refreshToken: 'mock-refresh-token-67890'
};

// Default credentials for testing
export const defaultCredentials = {
  email: 'admin@example.com',
  password: 'password123'
};

// Mock current user (for authenticated state)
export const mockCurrentUser = mockUsers[0]; 
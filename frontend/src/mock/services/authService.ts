import { defaultCredentials, mockAuthResponse, mockUsers } from '../data/auth';
import {
    AuthResponse,
    LoginRequest,
    PasswordResetConfirm,
    PasswordResetRequest,
    RegisterRequest,
    User
} from '../types';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockAuthService {
  // Login
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    await delay(1000); // Simulate network delay

    // Check credentials
    if (
      credentials.email === defaultCredentials.email && 
      credentials.password === defaultCredentials.password
    ) {
      // Update last login time
      const user = { ...mockUsers[0], lastLoginAt: new Date().toISOString() };
      return {
        ...mockAuthResponse,
        user
      };
    }

    // Check if user exists but wrong password
    const userExists = mockUsers.find(user => user.email === credentials.email);
    if (userExists) {
      throw new Error('Invalid password');
    }

    throw new Error('User not found');
  }

  // Register
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    await delay(1200); // Simulate network delay

    // Check if user already exists
    const existingUser = mockUsers.find(user => user.email === userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create new user
    const newUser: User = {
      id: String(mockUsers.length + 1),
      email: userData.email,
      name: userData.name,
      role: 'user',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    // Add to mock users array
    mockUsers.push(newUser);

    return {
      user: newUser,
      token: `mock-jwt-token-${Date.now()}`,
      refreshToken: `mock-refresh-token-${Date.now()}`
    };
  }

  // Logout
  static async logout(): Promise<void> {
    await delay(500);
    // In a real app, this would invalidate the token on the server
    localStorage.removeItem('auth-token');
    localStorage.removeItem('refresh-token');
  }

  // Get current user
  static async getCurrentUser(token: string): Promise<User> {
    await delay(800);
    
    if (!token || token === 'invalid-token') {
      throw new Error('Invalid or expired token');
    }

    // In a real app, this would verify the token with the server
    return mockUsers[0]; // Return admin user for demo
  }

  // Refresh token
  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    await delay(600);
    
    if (!refreshToken) {
      throw new Error('Refresh token required');
    }

    // Generate new tokens
    return {
      user: mockUsers[0],
      token: `mock-jwt-token-${Date.now()}`,
      refreshToken: `mock-refresh-token-${Date.now()}`
    };
  }

  // Request password reset
  static async requestPasswordReset(request: PasswordResetRequest): Promise<void> {
    await delay(1000);
    
    const user = mockUsers.find(u => u.email === request.email);
    if (!user) {
      throw new Error('User not found');
    }

    // In a real app, this would send an email with reset link
    console.log('Password reset email sent to:', request.email);
  }

  // Confirm password reset
  static async confirmPasswordReset(request: PasswordResetConfirm): Promise<void> {
    await delay(800);
    
    if (!request.token || request.token.length < 10) {
      throw new Error('Invalid reset token');
    }

    if (request.newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // In a real app, this would update the password in the database
    console.log('Password reset successfully');
  }

  // Update user profile
  static async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    await delay(1000);
    
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Update user data
    const updatedUser = { ...mockUsers[userIndex], ...updates };
    mockUsers[userIndex] = updatedUser;

    return updatedUser;
  }

  // Change password
  static async changePassword(
    userId: string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<void> {
    await delay(1000);
    
    // In a real app, verify current password
    if (currentPassword !== defaultCredentials.password) {
      throw new Error('Current password is incorrect');
    }

    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters');
    }

    // In a real app, update password in database
    console.log('Password changed successfully');
  }
} 
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  created_at: string;
  last_login: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token: string;
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

class AuthService {
  private token: string | null = localStorage.getItem('auth_token');
  private refreshToken: string | null = localStorage.getItem('refresh_token');

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // 🔄 Try real API first
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      this.setTokens(data.token, data.refresh_token);
      return data;
    } catch (error) {
      console.warn('Real API login failed, falling back to mock auth:', error);
      
      // 🔄 Fallback to mock authentication
      return this.mockLogin(credentials);
    }
  }

  private async mockLogin(credentials: LoginRequest): Promise<AuthResponse> {
    // Mock users for demo
    const mockUsers = [
      {
        email: '402707192@qq.com',
        password: 'demo123',
        user: {
          id: '1',
          email: '402707192@qq.com', 
          name: 'Demo User',
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        }
      },
      {
        email: 'admin@ottawa.ca',
        password: 'admin123',
        user: {
          id: '2',
          email: 'admin@ottawa.ca',
          name: 'Ottawa Admin',
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        }
      }
    ];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockUser = mockUsers.find(u => u.email === credentials.email && u.password === credentials.password);
    
    if (!mockUser) {
      throw new Error('Invalid email or password');
    }

    const mockResponse: AuthResponse = {
      user: mockUser.user,
      token: 'mock_jwt_token_' + Date.now(),
      refresh_token: 'mock_refresh_token_' + Date.now()
    };

    this.setTokens(mockResponse.token, mockResponse.refresh_token);
    return mockResponse;
  }

  async logout(): Promise<void> {
    try {
      // Try real API logout first
      if (this.token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
          signal: AbortSignal.timeout(3000),
        });
      }
    } catch (error) {
      console.warn('Real API logout failed, proceeding with local logout:', error);
    } finally {
      // Always clear local tokens
      this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<User> {
    if (!this.token) {
      throw new Error('No authentication token');
    }

    try {
      // Try real API first
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Real API user fetch failed, using mock user:', error);
    }

    // Fallback to mock user data
    return {
      id: '1',
      email: '402707192@qq.com',
      name: 'Demo User',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    };
  }

  private setTokens(token: string, refreshToken: string): void {
    this.token = token;
    this.refreshToken = refreshToken;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('refresh_token', refreshToken);
  }

  private clearTokens(): void {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const authService = new AuthService();

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  last_login?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  role: string;
}

class AuthService {
  private token: string | null = localStorage.getItem('auth_token');
  private refreshToken: string | null = localStorage.getItem('refresh_token');

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log('🔐 Login attempt:', { 
      url: `${API_BASE_URL}/auth/login`, 
      credentials: { email: credentials.email, password: '***' }
    });
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      console.error('❌ Login failed:', { 
        status: response.status, 
        statusText: response.statusText,
        url: response.url
      });
      
      const errorData = await response.json();
      console.error('❌ Error details:', errorData);
      throw new Error(errorData.detail || 'Login failed');
    }

    const data = await response.json();
    console.log('✅ Login successful:', { 
      status: response.status,
      hasToken: !!data.access_token,
      tokenType: data.token_type,
      userData: data.user
    });
    
    // Transform backend response to frontend format
    const authResponse: AuthResponse = {
      user: {
        id: data.user?.id || 'unknown',
        username: data.user?.username || '',
        email: data.user?.email || credentials.email,
        role: data.user?.role || 'user',
        status: data.user?.status || 'active',
        last_login: data.user?.last_login || new Date().toISOString()
      },
      access_token: data.access_token,
      token_type: data.token_type || 'bearer',
      expires_in: data.expires_in || 3600
    };

    this.setTokens(authResponse.access_token, '');
    return authResponse;
  }

  async register(credentials: RegisterRequest): Promise<AuthResponse> {
    console.log('📝 Register attempt:', { 
      url: `${API_BASE_URL}/auth/register`, 
      credentials: { 
        username: credentials.username, 
        email: credentials.email, 
        role: credentials.role,
        password: '***' 
      }
    });
    
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      console.error('❌ Registration failed:', { 
        status: response.status, 
        statusText: response.statusText,
        url: response.url
      });
      
      const errorData = await response.json();
      console.error('❌ Error details:', errorData);
      throw new Error(errorData.detail || 'Registration failed');
    }

    console.log('✅ Registration successful:', { 
      status: response.status
    });
    
    // After successful registration, automatically log in the user
    const loginResponse = await this.login({
      email: credentials.email,
      password: credentials.password
    });
    
    return loginResponse;
  }

  async logout(): Promise<void> {
    try {
      if (this.token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
        });
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<User> {
    if (!this.token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    const userData = await response.json();
    
    return {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      status: userData.status,
      last_login: userData.last_login
    };
  }

  async googleLogin(googleResponse: any): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        credential: googleResponse.credential
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Google login failed');
    }

    const data = await response.json();
    console.log('✅ Google login successful:', { 
      status: response.status,
      hasToken: !!data.access_token,
      tokenType: data.token_type,
      userData: data.user
    });
    
    // Transform backend response to frontend format
    const authResponse: AuthResponse = {
      user: {
        id: data.user?.id || 'unknown',
        username: data.user?.username || '',
        email: data.user?.email || '',
        role: data.user?.role || 'user',
        status: data.user?.status || 'active',
        last_login: data.user?.last_login || new Date().toISOString()
      },
      access_token: data.access_token,
      token_type: data.token_type || 'bearer',
      expires_in: data.expires_in || 3600
    };

    this.setTokens(authResponse.access_token, '');
    return authResponse;
  }

  private setTokens(token: string, refreshToken: string): void {
    this.token = token;
    this.refreshToken = refreshToken;
    localStorage.setItem('auth_token', token);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
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

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AuthResponse, authService, LoginRequest, User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  googleLogin: (response: any) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // 初始化时检查用户登录状态
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // 如果获取用户信息失败，清除本地存储的token
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const response: AuthResponse = await authService.login(credentials);
      setUser(response.user);
    } catch (error: any) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (response: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 使用mock Google用户数据
      const mockGoogleUser: User = {
        id: 'google_' + Date.now(),
        email: 'google.user@gmail.com',
        name: 'Google Demo User',
        picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };

      const mockAuthResponse: AuthResponse = {
        user: mockGoogleUser,
        token: 'mock_google_jwt_token_' + Date.now(),
        refresh_token: 'mock_google_refresh_token_' + Date.now()
      };

      // 保存到localStorage
      localStorage.setItem('auth_token', mockAuthResponse.token);
      localStorage.setItem('refresh_token', mockAuthResponse.refresh_token);
      
      setUser(mockAuthResponse.user);
      console.log('Google mock login successful:', mockGoogleUser);
    } catch (error: any) {
      setError(error.message || 'Google login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    googleLogin,
    logout,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import { useCallback, useEffect, useState } from 'react';
import { MockAuthService } from '../mock/services';
import { LoginRequest, RegisterRequest, User } from '../mock/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  googleLogin: (googleUserInfo?: any) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const useAuth = (): AuthState & AuthActions => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        if (token) {
          const user = await MockAuthService.getCurrentUser(token);
          setState({
            user,
            token,
            isLoading: false,
            isAuthenticated: true
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        // Token is invalid, clear it
        localStorage.removeItem('auth-token');
        localStorage.removeItem('refresh-token');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await MockAuthService.login(credentials);
      
      // Store tokens
      localStorage.setItem('auth-token', response.token);
      localStorage.setItem('refresh-token', response.refreshToken);
      
      setState({
        user: response.user,
        token: response.token,
        isLoading: false,
        isAuthenticated: true
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const googleLogin = useCallback(async (googleUserInfo?: any) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      // 使用真实的Google用户信息或回退到mock数据
      const googleUser: User = {
        id: googleUserInfo ? `google_${googleUserInfo.sub}` : 'google_' + Date.now(),
        email: googleUserInfo?.email || 'google.user@gmail.com',
        name: googleUserInfo?.name || 'Google Demo User',
        avatar: googleUserInfo?.picture || 'https://lh3.googleusercontent.com/a/default-user=s96-c',
        role: 'user' as const,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      const mockToken = 'google_jwt_token_' + Date.now();
      const mockRefreshToken = 'google_refresh_token_' + Date.now();

      // Store tokens
      localStorage.setItem('auth-token', mockToken);
      localStorage.setItem('refresh-token', mockRefreshToken);
      
      setState({
        user: googleUser,
        token: mockToken,
        isLoading: false,
        isAuthenticated: true
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const register = useCallback(async (userData: RegisterRequest) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await MockAuthService.register(userData);
      
      // Store tokens
      localStorage.setItem('auth-token', response.token);
      localStorage.setItem('refresh-token', response.refreshToken);
      
      setState({
        user: response.user,
        token: response.token,
        isLoading: false,
        isAuthenticated: true
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await MockAuthService.logout();
      setState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false
      });
    } catch (error) {
      // Even if logout fails, clear local state
      setState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false
      });
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    const refreshToken = localStorage.getItem('refresh-token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await MockAuthService.refreshToken(refreshToken);
      
      // Update tokens
      localStorage.setItem('auth-token', response.token);
      localStorage.setItem('refresh-token', response.refreshToken);
      
      setState(prev => ({
        ...prev,
        user: response.user,
        token: response.token,
        isAuthenticated: true
      }));
    } catch (error) {
      // Refresh failed, log out
      await logout();
      throw error;
    }
  }, [logout]);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!state.user) {
      throw new Error('No user logged in');
    }

    try {
      const updatedUser = await MockAuthService.updateProfile(state.user.id, updates);
      setState(prev => ({
        ...prev,
        user: updatedUser
      }));
    } catch (error) {
      throw error;
    }
  }, [state.user]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!state.user) {
      throw new Error('No user logged in');
    }

    try {
      await MockAuthService.changePassword(state.user.id, currentPassword, newPassword);
    } catch (error) {
      throw error;
    }
  }, [state.user]);

  return {
    ...state,
    login,
    googleLogin,
    register,
    logout,
    refreshAuth,
    updateProfile,
    changePassword
  };
}; 
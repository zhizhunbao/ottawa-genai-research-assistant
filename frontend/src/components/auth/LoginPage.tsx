import React, { useState } from 'react';
import { useLanguage } from '../../App';
import { useAuth } from '../../hooks/useAuth';
import GoogleLoginButton from '../GoogleLoginButton';

interface LoginPageProps {
  onSuccess?: () => void;
  onRegisterClick?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onRegisterClick }) => {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await login(formData);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || t('login.error') || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Google login success!');
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleGoogleError = (error: any) => {
    console.error('Google login error:', error);
    setError('Google登录失败，请重试');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t('login.welcome') || 'Welcome back'}
            </h2>
            <p className="text-gray-600">
              {t('login.subtitle') || 'Sign in to your account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('login.email') || 'Email'}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder={t('login.emailPlaceholder') || 'Enter your email'}
                disabled={isSubmitting || isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('login.password') || 'Password'}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder={t('login.passwordPlaceholder') || 'Enter your password'}
                disabled={isSubmitting || isLoading}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting || isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {t('login.signingIn') || 'Signing in...'}
                </div>
              ) : (
                t('login.signIn') || 'Sign In'
              )}
            </button>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">或者</span>
                </div>
              </div>

              <div className="mt-6">
                <GoogleLoginButton
                  onSuccess={handleGoogleLogin}
                  onError={handleGoogleError}
                />
              </div>

              {onRegisterClick && (
                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    {t('login.register') || "Don't have an account? Sign up"}
                  </span>
                  <button
                    type="button"
                    onClick={onRegisterClick}
                    className="ml-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {t('login.registerLink') || 'here'}
                  </button>
                </div>
              )}
            </div>
          </form>

          <div className="mt-8 text-center">
            <div className="text-xs text-gray-500 space-y-1">
              <p>{t('login.demo') || 'Demo credentials:'}</p>
              <p>📧 demo@example.com</p>
              <p>🔒 password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 
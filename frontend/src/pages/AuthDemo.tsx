import React, { useState } from 'react';
import { LoginPage } from '../components/auth/LoginPage';
import { RegisterPage } from '../components/auth/RegisterPage';
import { useAuth } from '../hooks/useAuth';

export const AuthDemo: React.FC = () => {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<'login' | 'register'>('login');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Welcome!</h1>
          
          <div className="space-y-4">
            <div className="text-center">
              {user.avatar && (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-16 h-16 rounded-full mx-auto mb-4"
                />
              )}
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">Role: {user.role}</p>
            </div>
            
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600">
                <strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Last login:</strong> {new Date(user.lastLoginAt).toLocaleDateString()}
              </p>
            </div>
            
            <button
              onClick={logout}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {currentView === 'login' ? (
        <LoginPage
          onSuccess={() => console.log('Login successful!')}
          onRegisterClick={() => setCurrentView('register')}
        />
      ) : (
        <RegisterPage
          onSuccess={() => console.log('Registration successful!')}
          onLoginClick={() => setCurrentView('login')}
        />
      )}
    </div>
  );
}; 
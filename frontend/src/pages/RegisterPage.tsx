import { GoogleLogin } from '@react-oauth/google';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css'; // Reuse login page styles

const RegisterPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear form error when user starts typing
    if (formError) {
      setFormError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setFormError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    try {
      // Mock registration - automatically log in with demo credentials
      await login({
        email: formData.email,
        password: 'demo123' // Default demo password
      });
      navigate('/');
    } catch (error: any) {
      setFormError(error.message || 'Registration failed');
    }
  };

  const handleGoogleSuccess = async (response: any) => {
    try {
      // Mock Google registration
      await login({
        email: 'demo@google.com',
        password: 'demo123'
      });
      navigate('/');
    } catch (error: any) {
      setFormError(error.message || 'Google registration failed');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form">
          <h2>Create Account</h2>
          <p className="login-subtitle">Join our research community</p>

          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setFormError('Google registration failed')}
            text="signup_with"
          />

          <div className="divider">
            <span>or</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a password"
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                disabled={isLoading}
                required
              />
            </div>

            {formError && (
              <div className="error-message">
                {formError}
              </div>
            )}

            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="signup-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 
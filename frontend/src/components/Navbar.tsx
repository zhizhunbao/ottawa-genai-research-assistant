import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../App';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLanguageToggle = () => {
    // 切换到另一种语言
    const newLanguage = language === 'en' ? 'fr' : 'en';
    setLanguage(newLanguage);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsProfileMenuOpen(false);
    } catch (error) {
      // 生产环境中应该使用适当的错误处理
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-logo">
            <span className="logo-icon">🍁</span>
            <span className="brand-text">CA GenAI Research</span>
          </div>
        </Link>

        <div className="navbar-menu">
          <div className="navbar-links">
            <Link 
              to="/" 
              className={`navbar-link ${isActive('/') ? 'active' : ''}`}
            >
              {t('nav.home')}
            </Link>
            
            {isAuthenticated && (
              <>
                <Link 
                  to="/chat" 
                  className={`navbar-link ${isActive('/chat') ? 'active' : ''}`}
                >
                  {t('nav.chat')}
                </Link>
                <Link 
                  to="/upload" 
                  className={`navbar-link ${isActive('/upload') ? 'active' : ''}`}
                >
                  {t('nav.upload')}
                </Link>
                <Link 
                  to="/reports" 
                  className={`navbar-link ${isActive('/reports') ? 'active' : ''}`}
                >
                  {t('nav.reports')}
                </Link>
                <Link 
                  to="/settings" 
                  className={`navbar-link ${isActive('/settings') ? 'active' : ''}`}
                >
                  {t('nav.settings')}
                </Link>
              </>
            )}
          </div>

          <div className="navbar-actions">
            {/* Language Toggle Button */}
            <div className="language-selector">
              <button
                className="language-button"
                onClick={handleLanguageToggle}
                title={language === 'en' ? 'Switch to Français' : 'Switch to English'}
              >
                {language === 'en' ? 'FR' : 'EN'}
              </button>
            </div>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="user-menu">
                <button
                  className="user-button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  {user?.picture ? (
                    <img 
                      src={user.picture} 
                      alt={user.name} 
                      className="user-avatar"
                    />
                  ) : (
                    <div className="user-avatar-placeholder">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="user-name">{user?.name}</span>
                </button>
                {isProfileMenuOpen && (
                  <div className="profile-menu">
                    <div className="profile-info">
                      <div className="profile-name">{user?.name}</div>
                      <div className="profile-email">{user?.email}</div>
                    </div>
                    <div className="profile-menu-divider"></div>
                    <button
                      className="profile-menu-item"
                      onClick={handleLogout}
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="login-button">
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          className="mobile-menu-button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

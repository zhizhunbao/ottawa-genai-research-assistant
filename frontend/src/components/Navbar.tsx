import {
    FileText,
    Globe,
    Home,
    MessageSquare,
    Settings,
    Upload
} from 'lucide-react';
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

  // 导航项配置
  const navigationItems = [
    {
      path: '/',
      icon: Home,
      label: t('nav.home') || 'Home'
    },
    ...(isAuthenticated ? [
      {
        path: '/chat',
        icon: MessageSquare,
        label: t('nav.chat') || 'Chat'
      },
      {
        path: '/upload',
        icon: Upload,
        label: t('nav.upload') || 'Upload Documents'
      },
      {
        path: '/reports',
        icon: FileText,
        label: t('nav.reports') || 'Reports'
      },
      {
        path: '/settings',
        icon: Settings,
        label: t('nav.settings') || 'Settings'
      }
    ] : [])
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand/Logo */}
        <Link to="/" className="navbar-brand">
          <div className="brand-logo">
            <span className="logo-icon">🍁</span>
            <span className="brand-text">Ottawa GenAI Research</span>
          </div>
        </Link>

        {/* Navigation Menu */}
        <div className="navbar-menu">
          <div className="navbar-links">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`navbar-link ${isActive(item.path) ? 'active' : ''}`}
                >
                  <IconComponent size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          {/* Language Toggle Button */}
          <div className="language-selector">
            <button
              className="language-button"
              onClick={handleLanguageToggle}
              title={language === 'en' ? 'Switch to Français' : 'Switch to English'}
            >
              <Globe size={16} />
              <span>{language.toUpperCase()}</span>
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

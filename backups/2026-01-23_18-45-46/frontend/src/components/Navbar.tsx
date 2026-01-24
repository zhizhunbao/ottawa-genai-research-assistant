import {
    FileText,
    Globe,
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

  // 检查是否在认证页面（登录/注册）
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // 导航项配置 - 移除Homepage选项，让Logo承担回首页功能
  const navigationItems = [
    // 认证用户的功能选项 - 只有登录用户且不在认证页面时显示
    ...(!isAuthPage && isAuthenticated ? [
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
                <div className="user-avatar">
                  {/* 使用用户名首字母作为头像 */}
                  <div className="avatar-circle">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="user-name">{user?.username}</span>
                </div>
              </button>
              {isProfileMenuOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="profile-avatar">
                      <div className="avatar-circle">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="profile-name">{user?.username}</div>
                    </div>
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
                            <Link to="/login" className="navbar-login-button">
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

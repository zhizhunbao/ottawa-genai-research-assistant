import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Upload, FileText, Settings, Globe } from 'lucide-react';
import { useLanguage } from '../App';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: t('nav.home') },
    { path: '/chat', icon: MessageSquare, label: t('nav.chat') },
    { path: '/upload', icon: Upload, label: t('nav.upload') },
    { path: '/reports', icon: FileText, label: t('nav.reports') },
    { path: '/settings', icon: Settings, label: t('nav.settings') }
  ];

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-container">
        {/* Logo and Title */}
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <div className="logo">
              <span className="logo-text">GenAI</span>
            </div>
            <span className="brand-title">{t('app.title')}</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <ul className="navbar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path} className="nav-item">
                <Link 
                  to={item.path} 
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={20} aria-hidden="true" />
                  <span className="nav-text">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Language Toggle */}
        <div className="navbar-actions">
          <button
            className="language-toggle"
            onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
            aria-label={`Switch to ${language === 'en' ? 'French' : 'English'}`}
            title={`Switch to ${language === 'en' ? 'French' : 'English'}`}
          >
            <Globe size={20} aria-hidden="true" />
            <span className="language-text">{language.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 
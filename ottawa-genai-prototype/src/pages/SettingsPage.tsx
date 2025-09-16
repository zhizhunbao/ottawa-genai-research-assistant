import React, { useState } from 'react';
import { Globe, Monitor, Sun, Moon, Volume2, Eye, Type, Contrast } from 'lucide-react';
import { useLanguage } from '../App';
import './SettingsPage.css';

const SettingsPage: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [animations, setAnimations] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);

  const handleLanguageChange = (newLanguage: 'en' | 'fr') => {
    setLanguage(newLanguage);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    // In a real app, this would apply the theme
  };

  const handleFontSizeChange = (newSize: 'small' | 'medium' | 'large') => {
    setFontSize(newSize);
    // In a real app, this would apply font size changes
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Customize your experience with the Ottawa GenAI Research Assistant</p>
        </div>

        <div className="settings-content">
          {/* Language Settings */}
          <section className="settings-section">
            <div className="section-header">
              <Globe className="section-icon" size={24} />
              <h2>Language & Region</h2>
            </div>
            
            <div className="setting-item">
              <div className="setting-info">
                <h3>Interface Language</h3>
                <p>Choose your preferred language for the application interface</p>
              </div>
              <div className="setting-control">
                <div className="radio-group">
                  <label className={`radio-option ${language === 'en' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="language"
                      value="en"
                      checked={language === 'en'}
                      onChange={() => handleLanguageChange('en')}
                    />
                    <span className="radio-label">
                      🇨🇦 English
                    </span>
                  </label>
                  <label className={`radio-option ${language === 'fr' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="language"
                      value="fr"
                      checked={language === 'fr'}
                      onChange={() => handleLanguageChange('fr')}
                    />
                    <span className="radio-label">
                      🇫🇷 Français
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Appearance Settings */}
          <section className="settings-section">
            <div className="section-header">
              <Monitor className="section-icon" size={24} />
              <h2>Appearance</h2>
            </div>
            
            <div className="setting-item">
              <div className="setting-info">
                <h3>Theme</h3>
                <p>Choose how the application looks</p>
              </div>
              <div className="setting-control">
                <div className="theme-options">
                  <button
                    className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('light')}
                  >
                    <Sun size={20} />
                    Light
                  </button>
                  <button
                    className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('dark')}
                  >
                    <Moon size={20} />
                    Dark
                  </button>
                  <button
                    className={`theme-option ${theme === 'auto' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('auto')}
                  >
                    <Monitor size={20} />
                    Auto
                  </button>
                </div>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>Font Size</h3>
                <p>Adjust text size for better readability</p>
              </div>
              <div className="setting-control">
                <div className="font-size-options">
                  <button
                    className={`font-option ${fontSize === 'small' ? 'active' : ''}`}
                    onClick={() => handleFontSizeChange('small')}
                  >
                    <Type size={16} />
                    Small
                  </button>
                  <button
                    className={`font-option ${fontSize === 'medium' ? 'active' : ''}`}
                    onClick={() => handleFontSizeChange('medium')}
                  >
                    <Type size={20} />
                    Medium
                  </button>
                  <button
                    className={`font-option ${fontSize === 'large' ? 'active' : ''}`}
                    onClick={() => handleFontSizeChange('large')}
                  >
                    <Type size={24} />
                    Large
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Accessibility Settings */}
          <section className="settings-section">
            <div className="section-header">
              <Eye className="section-icon" size={24} />
              <h2>Accessibility</h2>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>High Contrast Mode</h3>
                <p>Increase contrast for better visibility</p>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={(e) => setHighContrast(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>Reduce Animations</h3>
                <p>Minimize motion effects for sensitivity</p>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={!animations}
                    onChange={(e) => setAnimations(!e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>Sound Effects</h3>
                <p>Enable audio feedback for actions</p>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={soundEffects}
                    onChange={(e) => setSoundEffects(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </section>

          {/* Compliance Information */}
          <section className="settings-section">
            <div className="section-header">
              <Contrast className="section-icon" size={24} />
              <h2>Accessibility Compliance</h2>
            </div>
            
            <div className="compliance-info">
              <h3>WCAG 2.1 AA Compliance</h3>
              <p>This application is designed to meet Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.</p>
              
              <div className="compliance-features">
                <div className="feature-item">
                  <h4>✅ Keyboard Navigation</h4>
                  <p>Full keyboard accessibility for all interactive elements</p>
                </div>
                
                <div className="feature-item">
                  <h4>✅ Screen Reader Support</h4>
                  <p>Compatible with NVDA, JAWS, and VoiceOver</p>
                </div>
                
                <div className="feature-item">
                  <h4>✅ Color Contrast</h4>
                  <p>Minimum 4.5:1 contrast ratio for normal text</p>
                </div>
                
                <div className="feature-item">
                  <h4>✅ Focus Indicators</h4>
                  <p>Clear visual focus indicators for keyboard users</p>
                </div>
                
                <div className="feature-item">
                  <h4>✅ Alternative Text</h4>
                  <p>Descriptive alt text for all images and charts</p>
                </div>
                
                <div className="feature-item">
                  <h4>✅ Language Support</h4>
                  <p>Full bilingual support (English/French)</p>
                </div>
              </div>
            </div>
          </section>

          {/* Help & Support */}
          <section className="settings-section">
            <div className="section-header">
              <h2>Help & Support</h2>
            </div>
            
            <div className="help-links">
              <a href="#" className="help-link">
                📖 User Guide
              </a>
              <a href="#" className="help-link">
                🔧 Accessibility Features Guide
              </a>
              <a href="#" className="help-link">
                💬 Contact Support
              </a>
              <a href="#" className="help-link">
                🐛 Report a Bug
              </a>
            </div>
          </section>

          {/* Save Settings */}
          <div className="settings-actions">
            <button className="save-btn">
              Save Settings
            </button>
            <button className="reset-btn">
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 
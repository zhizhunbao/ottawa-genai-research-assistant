import {
    ArrowRight,
    BarChart3,
    Brain,
    FileText,
    MessageSquare,
    Upload
} from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../App';
import { mockDataManager } from '../mock/utils/dataManager';
import './HomePage.css';

const HomePage: React.FC = () => {
  const { t } = useLanguage();
  
  // 🔄 Use mock data instead of hardcoded values
  const currentData = mockDataManager.getCurrentData();
  const dynamicStats = currentData.stats;

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              {t('home.hero.title')}
              <span className="hero-title-highlight">{t('home.hero.titleHighlight')}</span>
            </h1>
            
            <p className="hero-subtitle">
              {t('home.hero.subtitle')}
            </p>
            
            <div className="hero-cta">
              <Link to="/chat" className="btn-hero-primary">
                <MessageSquare size={20} />
                {t('home.hero.startChat')}
                <ArrowRight size={18} />
              </Link>
              
              <Link to="/upload" className="btn-hero-secondary">
                <Upload size={18} />
                {t('home.hero.uploadDocs')}
              </Link>
            </div>
            
            <div className="hero-stats">
              {dynamicStats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{t(stat.label)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>{t('home.features.title')}</h2>
            <p>{t('home.features.subtitle')}</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Brain size={32} />
              </div>
              <h3>{t('home.features.qa.title')}</h3>
              <p>{t('home.features.qa.desc')}</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <BarChart3 size={32} />
              </div>
              <h3>{t('home.features.analysis.title')}</h3>
              <p>{t('home.features.analysis.desc')}</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FileText size={32} />
              </div>
              <h3>{t('home.features.reports.title')}</h3>
              <p>{t('home.features.reports.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <h2>{t('home.howItWorks.title')}</h2>
            <p>{t('home.howItWorks.subtitle')}</p>
          </div>
          
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">
                <Upload size={32} />
              </div>
              <h3>{t('home.howItWorks.step1.title')}</h3>
              <p>{t('home.howItWorks.step1.desc')}</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">
                <MessageSquare size={32} />
              </div>
              <h3>{t('home.howItWorks.step2.title')}</h3>
              <p>{t('home.howItWorks.step2.desc')}</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">
                <BarChart3 size={32} />
              </div>
              <h3>{t('home.howItWorks.step3.title')}</h3>
              <p>{t('home.howItWorks.step3.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>{t('home.cta.title')}</h2>
            <p>{t('home.cta.subtitle')}</p>
            
            <div className="cta-buttons">
              <Link to="/chat" className="btn-cta-primary">
                <MessageSquare size={20} />
                {t('home.cta.startSession')}
              </Link>
              
              <Link to="/upload" className="btn-cta-secondary">
                <Upload size={18} />
                {t('home.cta.uploadDocs')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 
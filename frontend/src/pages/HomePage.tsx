import {
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  FileText,
  Globe,
  MessageSquare,
  Shield,
  Sparkles,
  Star,
  Upload,
  Users,
  Zap
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
        <div className="hero-background">
          <div className="hero-particles"></div>
          <div className="hero-gradient"></div>
        </div>
        
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={16} />
              <span>{t('home.hero.badge')}</span>
            </div>
            
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
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="hero-demo-container">
              <div className="demo-window">
                <div className="demo-header">
                  <div className="demo-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div className="demo-title">{t('home.hero.demoTitle')}</div>
                </div>
                <div className="demo-content">
                  <div className="demo-message user">
                    {t('home.hero.demoQuestion')}
                  </div>
                  <div className="demo-message ai">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    {t('home.hero.demoResponse')}
                  </div>
                </div>
              </div>
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
            <div className="feature-card primary">
              <div className="feature-icon">
                <Brain size={32} />
              </div>
              <h3>{t('home.features.qa.title')}</h3>
              <p>{t('home.features.qa.desc')}</p>
              <div className="feature-benefits">
                <div className="benefit">
                  <Check size={16} />
                  <span>{t('home.features.qa.benefit1')}</span>
                </div>
                <div className="benefit">
                  <Check size={16} />
                  <span>{t('home.features.qa.benefit2')}</span>
                </div>
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <BarChart3 size={32} />
              </div>
              <h3>{t('home.features.analysis.title')}</h3>
              <p>{t('home.features.analysis.desc')}</p>
              <div className="feature-benefits">
                <div className="benefit">
                  <Check size={16} />
                  <span>{t('home.features.analysis.benefit1')}</span>
                </div>
                <div className="benefit">
                  <Check size={16} />
                  <span>{t('home.features.analysis.benefit2')}</span>
                </div>
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FileText size={32} />
              </div>
              <h3>{t('home.features.reports.title')}</h3>
              <p>{t('home.features.reports.desc')}</p>
              <div className="feature-benefits">
                <div className="benefit">
                  <Check size={16} />
                  <span>{t('home.features.reports.benefit1')}</span>
                </div>
                <div className="benefit">
                  <Check size={16} />
                  <span>{t('home.features.reports.benefit2')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-section">
        <div className="container">
          <div className="why-choose-content">
            <div className="why-choose-text">
              <h2>{t('home.whyChoose.title')}</h2>
              <p>{t('home.whyChoose.subtitle')}</p>
              
              <div className="advantages-list">
                <div className="advantage">
                  <div className="advantage-icon">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h4>{t('home.whyChoose.secure.title')}</h4>
                    <p>{t('home.whyChoose.secure.desc')}</p>
                  </div>
                </div>
                
                <div className="advantage">
                  <div className="advantage-icon">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h4>{t('home.whyChoose.fast.title')}</h4>
                    <p>{t('home.whyChoose.fast.desc')}</p>
                  </div>
                </div>
                
                <div className="advantage">
                  <div className="advantage-icon">
                    <Globe size={24} />
                  </div>
                  <div>
                    <h4>{t('home.whyChoose.bilingual.title')}</h4>
                    <p>{t('home.whyChoose.bilingual.desc')}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="why-choose-visual">
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill="#f59e0b" />
                    ))}
                  </div>
                  <p>{t('home.whyChoose.testimonial')}</p>
                  <div className="testimonial-author">
                    <div className="author-avatar">DR</div>
                    <div>
                      <div className="author-name">{t('home.whyChoose.testimonialAuthor')}</div>
                      <div className="author-title">{t('home.whyChoose.testimonialTitle')}</div>
                    </div>
                  </div>
                </div>
              </div>
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
            
            <div className="step-arrow">
              <ArrowRight size={24} />
            </div>
            
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">
                <MessageSquare size={32} />
              </div>
              <h3>{t('home.howItWorks.step2.title')}</h3>
              <p>{t('home.howItWorks.step2.desc')}</p>
            </div>
            
            <div className="step-arrow">
              <ArrowRight size={24} />
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
            
            <div className="cta-note">
              <Users size={16} />
              <span>{t('home.cta.note')}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 
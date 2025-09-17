import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Upload, TrendingUp, FileText, Brain, BarChart3, Globe, Shield } from 'lucide-react';
import { useLanguage } from '../App';
import { mockStats } from '../mock/data/stats';
import './HomePage.css';

const HomePage: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: MessageSquare,
      title: t('features.qa.title'),
      description: t('features.qa.desc'),
      color: '#667eea'
    },
    {
      icon: BarChart3,
      title: t('features.analysis.title'),
      description: t('features.analysis.desc'),
      color: '#10b981'
    },
    {
      icon: FileText,
      title: t('features.reports.title'),
      description: t('features.reports.desc'),
      color: '#f59e0b'
    },
    {
      icon: Shield,
      title: t('features.accessibility.title'),
      description: t('features.accessibility.desc'),
      color: '#8b5cf6'
    }
  ];

  const quickActions = [
    {
      title: 'Start AI Chat',
      description: 'Begin asking questions about economic development data',
      link: '/chat',
      icon: Brain,
      primary: true
    },
    {
      title: 'Upload Documents',
      description: 'Add PDF reports to the knowledge base',
      link: '/upload',
      icon: Upload,
      primary: false
    },
    {
      title: 'View Reports',
      description: 'Access generated analysis reports',
      link: '/reports',
      icon: TrendingUp,
      primary: false
    }
  ];

  // Use mock data instead of hardcoded data
  const stats = mockStats;

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section" role="banner">
        <div className="hero-content">
          <h1>{t('home.title')}</h1>
          <p className="hero-subtitle">{t('home.subtitle')}</p>
          
          <div className="hero-actions">
            <Link to="/chat" className="btn-large btn-primary">
              <MessageSquare size={20} aria-hidden="true" />
              {t('home.cta.start')}
            </Link>
            <Link to="/upload" className="btn-large btn-secondary">
              <Upload size={20} aria-hidden="true" />
              {t('home.cta.upload')}
            </Link>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="floating-card">
            <div className="card-icon">📊</div>
            <h3>Economic Trends</h3>
            <p>Real-time analysis</p>
          </div>
          <div className="floating-card">
            <div className="card-icon">🤖</div>
            <h3>AI Insights</h3>
            <p>Intelligent responses</p>
          </div>
          <div className="floating-card">
            <div className="card-icon">📋</div>
            <h3>Smart Reports</h3>
            <p>Automated generation</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" role="region" aria-labelledby="features-heading">
        <div className="section-header">
          <h2 id="features-heading">Key Features</h2>
          <p>Powerful AI capabilities designed for economic development professionals</p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="feature-card">
                <div className="feature-icon" style={{ backgroundColor: feature.color }}>
                  <Icon size={24} aria-hidden="true" />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="quick-actions-section" role="region" aria-labelledby="actions-heading">
        <div className="section-header">
          <h2 id="actions-heading">Get Started</h2>
          <p>Choose your path to exploring economic development data</p>
        </div>
        
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link 
                key={index} 
                to={action.link} 
                className={`quick-action-card ${action.primary ? 'primary' : ''}`}
              >
                <div className="action-icon">
                  <Icon size={24} aria-hidden="true" />
                </div>
                <h3>{action.title}</h3>
                <p>{action.description}</p>
                <span className="action-arrow">→</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section" role="region" aria-labelledby="stats-heading">
        <div className="section-header">
          <h2 id="stats-heading">Platform Statistics</h2>
        </div>
        
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage; 
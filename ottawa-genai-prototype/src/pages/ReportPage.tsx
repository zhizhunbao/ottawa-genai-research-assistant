import React, { useState } from 'react';
import { Calendar, Download, FileText, TrendingUp, Users, Building2, Share2, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useLanguage } from '../App';
import { mockReports } from '../mock/data/reports';
import { mockChartData } from '../mock/data/charts';
import { Report } from '../mock/types';
import './ReportPage.css';

const ReportPage: React.FC = () => {
  const { t } = useLanguage();
  const [selectedReport, setSelectedReport] = useState<string>('1');

  // Use mock data instead of hardcoded data
  const reports = mockReports;
  const businessData = mockChartData.sectorAnalysis;
  const employmentData = mockChartData.employmentDistribution;

  const currentReport = reports.find(r => r.id === selectedReport);

  return (
    <div className="report-page">
      <div className="report-container">
        {/* Sidebar */}
        <aside className="report-sidebar">
          <div className="sidebar-header">
            <h2>Generated Reports</h2>
            <button className="generate-btn">
              <FileText size={16} />
              Generate New
            </button>
          </div>

          <div className="report-list">
            {reports.map(report => (
              <div
                key={report.id}
                className={`report-item ${selectedReport === report.id ? 'active' : ''}`}
                onClick={() => setSelectedReport(report.id)}
              >
                <div className="report-icon">
                  {report.type === 'analysis' && <BarChart3 size={20} />}
                  {report.type === 'summary' && <FileText size={20} />}
                  {report.type === 'trend' && <TrendingUp size={20} />}
                </div>
                <div className="report-info">
                  <h4>{report.title}</h4>
                  <p>{report.generatedAt.toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="report-main">
          {currentReport && (
            <>
              {/* Report Header */}
              <header className="report-header">
                <div className="header-content">
                  <h1>{currentReport.title}</h1>
                  <div className="report-meta">
                    <span className="meta-item">
                      <Calendar size={16} />
                      Generated {currentReport.generatedAt.toLocaleDateString()}
                    </span>
                    <span className="meta-item">
                      <FileText size={16} />
                      {currentReport.type.charAt(0).toUpperCase() + currentReport.type.slice(1)} Report
                    </span>
                  </div>
                </div>
                
                <div className="header-actions">
                  <button className="action-btn secondary">
                    <Share2 size={16} />
                    Share
                  </button>
                  <button className="action-btn primary">
                    <Download size={16} />
                    Export PDF
                  </button>
                </div>
              </header>

              {/* Report Content */}
              <div className="report-content">
                {/* Executive Summary */}
                <section className="report-section">
                  <h2>Executive Summary</h2>
                  <div className="summary-grid">
                    <div className="summary-card">
                      <h3>📈 Business Growth</h3>
                      <div className="summary-value">+15.2%</div>
                      <p>New business registrations increased significantly in Q1 2024</p>
                    </div>
                    <div className="summary-card">
                      <h3>👥 Employment</h3>
                      <div className="summary-value">4.2%</div>
                      <p>Unemployment rate decreased from 5.1% to 4.2%</p>
                    </div>
                    <div className="summary-card">
                      <h3>💰 Investment</h3>
                      <div className="summary-value">$12.5M</div>
                      <p>Total investment in small business support programs</p>
                    </div>
                  </div>
                </section>

                {/* Key Findings */}
                <section className="report-section">
                  <h2>Key Findings</h2>
                  <div className="findings-content">
                    <h3>Business Sector Performance</h3>
                    <p>The technology sector continues to lead economic growth in Ottawa, with a remarkable 22.1% increase in new business registrations. This growth is primarily attributed to:</p>
                    
                    <ul>
                      <li>Increased government investment in digital transformation initiatives</li>
                      <li>Strong partnership with local educational institutions</li>
                      <li>Favorable startup ecosystem and incubator programs</li>
                      <li>Remote work policies attracting talent from other regions</li>
                    </ul>

                    <h3>Employment Trends</h3>
                    <p>The labor market showed significant improvement with unemployment decreasing to 4.2%. Key employment indicators include:</p>
                    
                    <ul>
                      <li>12,500 new job postings across all sectors</li>
                      <li>Average salary growth of 3.8% year-over-year</li>
                      <li>Increased demand for skilled technical workers</li>
                      <li>Growth in part-time and flexible work arrangements</li>
                    </ul>
                  </div>
                </section>

                {/* Data Visualizations */}
                <section className="report-section">
                  <h2>Data Analysis</h2>
                  
                  <div className="chart-grid">
                    <div className="chart-container">
                      <h3>Business Growth by Sector</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={businessData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="sector" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="growth" fill="#667eea" name="Growth %" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="chart-container">
                      <h3>Employment Distribution</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Tooltip />
                          <Pie
                            data={employmentData}
                            cx="50%"
                            cy="50%"
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                            label
                          >
                            {employmentData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </section>

                {/* Recommendations */}
                <section className="report-section">
                  <h2>Recommendations</h2>
                  <div className="recommendations">
                    <div className="recommendation-item">
                      <h4>🎯 Short-term Actions (0-6 months)</h4>
                      <ul>
                        <li>Expand digital skills training programs</li>
                        <li>Increase small business loan program funding</li>
                        <li>Launch downtown revitalization initiative</li>
                        <li>Strengthen partnerships with technology incubators</li>
                      </ul>
                    </div>

                    <div className="recommendation-item">
                      <h4>📈 Medium-term Goals (6-18 months)</h4>
                      <ul>
                        <li>Develop sector-specific support programs</li>
                        <li>Create innovation hubs in key districts</li>
                        <li>Implement talent retention strategies</li>
                        <li>Expand international business attraction</li>
                      </ul>
                    </div>

                    <div className="recommendation-item">
                      <h4>🚀 Long-term Vision (18+ months)</h4>
                      <ul>
                        <li>Position Ottawa as a leading tech hub</li>
                        <li>Develop sustainable economic diversification</li>
                        <li>Build resilient supply chain networks</li>
                        <li>Create climate-smart economic zones</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Methodology */}
                <section className="report-section methodology">
                  <h2>Methodology</h2>
                  <p>This report was generated using AI analysis of the following data sources:</p>
                  <ul>
                    <li>Ottawa Economic Development quarterly reports</li>
                    <li>Statistics Canada employment data</li>
                    <li>Business registration records from City of Ottawa</li>
                    <li>Survey results from local business associations</li>
                    <li>Provincial economic indicators and trends</li>
                  </ul>
                  <p>Data analysis period: January 1, 2024 - March 31, 2024</p>
                </section>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ReportPage; 
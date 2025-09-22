import { BarChart3, Calendar, Download, Eye, Filter, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Report } from '../mock/types';
import { realApi } from '../services/api';
import './ReportsPage.css';

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load reports from real API on component mount
  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const reportsData = await realApi.getReports();
      setReports(reportsData);
      setFilteredReports(reportsData);
    } catch (error) {
      console.error('Error loading reports:', error);
      setError('Failed to load reports. Please try again later.');
      // Don't fall back to mock data - show error instead
      setReports([]);
      setFilteredReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter reports based on search term and type
  useEffect(() => {
    let currentFilteredReports = [...reports];

    if (searchTerm) {
      currentFilteredReports = currentFilteredReports.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      currentFilteredReports = currentFilteredReports.filter(report =>
        report.type === selectedType
      );
    }

    setFilteredReports(currentFilteredReports);
  }, [searchTerm, selectedType, reports]);

  if (isLoading) {
    return (
      <div className="reports-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-page">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={loadReports} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1>Research Reports</h1>
        <p>Generated insights from Ottawa's economic development data</p>
      </div>

      <div className="reports-controls">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-dropdown">
          <Filter size={20} />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="summary">Summary</option>
            <option value="analysis">Analysis</option>
            <option value="trend">Trend</option>
          </select>
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <div className="empty-state">
          <BarChart3 size={64} className="empty-icon" />
          <h3>No reports found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="reports-grid">
          {filteredReports.map((report) => (
            <div key={report.id} className="report-card">
              <div className="report-header">
                <div className="report-type-badge">
                  {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                </div>
                <div className={`report-status ${report.status}`}>
                  {report.status}
                </div>
              </div>
              
              <div className="report-content">
                <h3>{report.title}</h3>
                <div className="report-meta">
                  <div className="meta-item">
                    <Calendar size={16} />
                    <span>{report.generatedAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="report-actions">
                <button 
                  className="action-btn primary"
                  disabled={report.status !== 'completed'}
                >
                  <Eye size={16} />
                  View Report
                </button>
                <button 
                  className="action-btn secondary"
                  disabled={report.status !== 'completed'}
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportsPage; 
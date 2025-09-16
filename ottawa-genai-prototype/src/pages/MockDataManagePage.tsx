import React, { useState } from 'react';
import { Database, FileText, MessageSquare, BarChart3, Upload, Home, TrendingUp, Code, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../App';
import './MockDataManagePage.css';

// Import all mock data
import { mockReports } from '../mock/data/reports';
import { mockChartData } from '../mock/data/charts';
import { mockStats } from '../mock/data/stats';
import { mockUploadedFiles } from '../mock/data/files';
import { mockInitialMessage } from '../mock/data/messages';

const MockDataManagePage: React.FC = () => {
  const { t } = useLanguage();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const mockDataSources = [
    {
      id: 'reports',
      name: 'Reports Data',
      file: '/src/mock/data/reports.ts',
      icon: FileText,
      color: '#3b82f6',
      usedBy: [
        { component: 'ReportPage', file: '/src/pages/ReportPage.tsx', usage: 'mockReports' }
      ],
      data: mockReports,
      dataType: 'Report[]',
      description: 'Mock data for generated reports including economic summaries and analysis'
    },
    {
      id: 'charts',
      name: 'Chart Data',
      file: '/src/mock/data/charts.ts',
      icon: BarChart3,
      color: '#10b981',
      usedBy: [
        { component: 'ReportPage', file: '/src/pages/ReportPage.tsx', usage: 'mockChartData.sectorAnalysis, mockChartData.employmentDistribution' },
        { component: 'ChatPage', file: '/src/pages/ChatPage.tsx', usage: 'mockChartData.businessGrowth' }
      ],
      data: mockChartData,
      dataType: 'ChartData',
      description: 'Chart data for business growth, sector analysis, and employment distribution'
    },
    {
      id: 'stats',
      name: 'Statistics Data',
      file: '/src/mock/data/stats.ts',
      icon: TrendingUp,
      color: '#8b5cf6',
      usedBy: [
        { component: 'HomePage', file: '/src/pages/HomePage.tsx', usage: 'mockStats' }
      ],
      data: mockStats,
      dataType: 'StatData[]',
      description: 'Statistics displayed on the home page showing system metrics'
    },
    {
      id: 'files',
      name: 'Uploaded Files Data',
      file: '/src/mock/data/files.ts',
      icon: Upload,
      color: '#f59e0b',
      usedBy: [
        { component: 'DocumentUploadPage', file: '/src/pages/DocumentUploadPage.tsx', usage: 'mockUploadedFiles' }
      ],
      data: mockUploadedFiles,
      dataType: 'UploadedFile[]',
      description: 'Mock data for uploaded documents with processing status'
    },
    {
      id: 'messages',
      name: 'Chat Messages Data',
      file: '/src/mock/data/messages.ts',
      icon: MessageSquare,
      color: '#ef4444',
      usedBy: [
        { component: 'ChatPage', file: '/src/pages/ChatPage.tsx', usage: 'mockInitialMessage' }
      ],
      data: [mockInitialMessage],
      dataType: 'Message',
      description: 'Initial chat message data for conversation starting point'
    }
  ];

  const getDataPreview = (data: any) => {
    if (Array.isArray(data)) {
      return `Array(${data.length}) - ${data.length > 0 ? JSON.stringify(data[0], null, 2).substring(0, 200) + '...' : 'Empty'}`;
    } else if (typeof data === 'object') {
      return JSON.stringify(data, null, 2).substring(0, 300) + '...';
    }
    return String(data);
  };

  return (
    <div className="mock-data-page">
      <div className="mock-data-header">
        <div className="mock-data-title">
          <Database size={32} style={{ color: '#3b82f6' }} />
          <h1>Mock Data Management</h1>
        </div>
        <p className="mock-data-subtitle">
          Overview of all mock data sources and their usage across components
        </p>
      </div>

      {/* Summary Statistics */}
      <div className="summary-grid">
        <div className="summary-card" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
          <div className="summary-number">{mockDataSources.length}</div>
          <div className="summary-label">Mock Data Sources</div>
        </div>
        <div className="summary-card" style={{ background: 'linear-gradient(135deg, #10b981, #047857)' }}>
          <div className="summary-number">
            {mockDataSources.reduce((total, source) => total + source.usedBy.length, 0)}
          </div>
          <div className="summary-label">Component Usages</div>
        </div>
        <div className="summary-card" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
          <div className="summary-number">4</div>
          <div className="summary-label">Pages Using Mock Data</div>
        </div>
      </div>

      {/* Mock Data Sources */}
      <div className="data-sources-list">
        {mockDataSources.map((source) => {
          const isExpanded = expandedSections.includes(source.id);
          const IconComponent = source.icon;

          return (
            <div
              key={source.id}
              className="data-source-card"
            >
              {/* Header */}
              <div
                style={{
                  padding: '1.5rem',
                  background: `linear-gradient(135deg, ${source.color}15, ${source.color}08)`,
                  borderBottom: '1px solid #e5e7eb',
                  cursor: 'pointer'
                }}
                onClick={() => toggleSection(source.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <IconComponent size={24} style={{ color: source.color }} />
                    <div>
                      <h3 style={{ margin: 0, color: '#1f2937', fontSize: '1.25rem' }}>{source.name}</h3>
                      <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
                        {source.description}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                      background: source.color,
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      {source.dataType}
                    </span>
                    {isExpanded ? <EyeOff size={20} /> : <Eye size={20} />}
                  </div>
                </div>
              </div>

              {/* Content */}
              {isExpanded && (
                <div style={{ padding: '1.5rem' }}>
                  {/* File Info */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>📁 File Location</h4>
                    <code style={{
                      background: '#f3f4f6',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      color: '#1f2937'
                    }}>
                      {source.file}
                    </code>
                  </div>

                  {/* Used By */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', color: '#374151' }}>🔗 Used By Components</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {source.usedBy.map((usage, index) => (
                        <div
                          key={index}
                          style={{
                            background: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '0.75rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: '500', color: '#374151' }}>{usage.component}</div>
                              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{usage.file}</div>
                            </div>
                            <code style={{
                              background: '#e5e7eb',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.8rem'
                            }}>
                              {usage.usage}
                            </code>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Data Preview */}
                  <div>
                    <h4 style={{ margin: '0 0 0.75rem 0', color: '#374151' }}>📊 Data Preview</h4>
                    <pre style={{
                      background: '#1f2937',
                      color: '#f9fafb',
                      padding: '1rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      overflow: 'auto',
                      maxHeight: '300px'
                    }}>
                      {getDataPreview(source.data)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '3rem',
        padding: '1.5rem',
        background: '#f9fafb',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#374151' }}>💡 Mock Data Usage Guidelines</h3>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#6b7280' }}>
          <li>All mock data is centralized in <code>/src/mock/data/</code> directory</li>
          <li>Components import mock data instead of using hardcoded values</li>
          <li>Type definitions are available in <code>/src/mock/types/</code></li>
          <li>To modify data, edit the corresponding file in the mock data directory</li>
          <li>When adding new mock data, update this management page accordingly</li>
        </ul>
      </div>
    </div>
  );
};

export default MockDataManagePage; 
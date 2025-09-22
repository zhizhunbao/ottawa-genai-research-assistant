import { BarChart3, FileText, MessageSquare, TrendingUp, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { mockChartData } from '../mock';
import { mockActivities } from '../mock/data/activities';
import { StatData } from '../mock/types';
import { mockDataManager } from '../mock/utils/dataManager';
import { realApi } from '../services/api';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<StatData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load statistics from real API
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const statsData = await realApi.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
      setError('Failed to load dashboard data. Please try again later.');
      // Don't fall back to mock data - show error instead
      setStats([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={loadStats} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Get chart data from mock data manager instead of hardcoding
  const currentData = mockDataManager.getCurrentData();
  const businessData = currentData.charts.sectorAnalysis || mockChartData.sectorAnalysis;
  const employmentData = currentData.charts.employmentDistribution || mockChartData.employmentDistribution;
  const trendData = currentData.charts.businessGrowth || mockChartData.businessGrowth;
  
  // Use stats data if available, otherwise fallback to mock data
  const dashboardStats = stats.length > 0 ? stats : currentData.stats;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Economic Development Dashboard</h1>
        <p>Real-time insights into Ottawa's business ecosystem</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="metrics-grid">
        {dashboardStats.map((stat: any, index: number) => {
          const IconComponent = index === 0 ? Users : 
                               index === 1 ? TrendingUp :
                               index === 2 ? FileText : MessageSquare;
          
          return (
            <div key={index} className="metric-card">
              <div className="metric-icon">
                <IconComponent size={24} />
              </div>
              <div className="metric-content">
                <h3>{stat.label}</h3>
                <div className="metric-value">{stat.number}</div>
                <div className="metric-change positive">{stat.change || '+0% from last period'}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Business Growth by Sector */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Business Growth by Sector</h3>
            <BarChart3 size={20} />
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={businessData}>
                <XAxis dataKey="sector" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="businesses" fill="#667eea" name="Businesses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Employment Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Employment Distribution</h3>
            <Users size={20} />
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={employmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                                      {employmentData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Trend */}
        <div className="chart-card wide">
          <div className="chart-header">
            <h3>Monthly Growth Trend</h3>
            <TrendingUp size={20} />
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="businesses" 
                  stroke="#667eea" 
                  strokeWidth={3}
                  name="Total Businesses"
                />
                <Line 
                  type="monotone" 
                  dataKey="growth" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Growth Rate (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {mockActivities.map((activity: any) => {
            const IconComponent = activity.icon === 'FileText' ? FileText : 
                                 activity.icon === 'MessageSquare' ? MessageSquare :
                                 activity.icon === 'Users' ? Users : FileText;
            
            return (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  <IconComponent size={16} />
                </div>
                <div className="activity-content">
                  <p><strong>{activity.title}:</strong> {activity.description}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 
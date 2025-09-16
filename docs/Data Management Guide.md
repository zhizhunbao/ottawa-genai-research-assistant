# Data Management Guide

This guide provides detailed instructions on how to manage, configure, and switch Mock data in the Ottawa GenAI Research Assistant prototype.

## 📚 Table of Contents

- [Mock Data Overview](#mock-data-overview)
- [Data Structure Details](#data-structure-details)
- [How to Switch Mock Data](#how-to-switch-mock-data)
- [Custom Mock Data](#custom-mock-data)
- [Data Update Strategies](#data-update-strategies)
- [Debugging and Testing](#debugging-and-testing)
- [Migration to Backend API](#migration-to-backend-api)

## 🎯 Mock Data Overview

The Mock data layer is located in the `ottawa-genai-prototype/src/mock/` directory, providing a complete set of simulated data that supports all prototype functionality without requiring a real backend.

### 📁 File Structure
```
ottawa-genai-prototype/src/mock/
├── api/
│   └── mockApi.ts           # Mock API endpoint implementation
├── data/                    # All Mock data files
│   ├── charts.ts           # Chart data
│   ├── files.ts            # File upload data
│   ├── messages.ts         # Chat message data
│   ├── reports.ts          # Report data
│   ├── stats.ts            # Statistics data
│   ├── translations.ts     # Multi-language translations
│   └── index.ts            # Data exports
├── types/
│   └── index.ts            # TypeScript type definitions
└── index.ts                # Mock layer exports
```

## 📊 Data Structure Details

### 1. Report Data (`reports.ts`)

```typescript
interface Report {
  id: string;                              // Unique identifier
  title: string;                          // Report title
  generatedAt: Date;                      // Generation time
  type: 'summary' | 'analysis' | 'trend'; // Report type
  status: 'completed' | 'processing' | 'error'; // Status
}
```

**Current Mock Data**:
- Q1 2024 Economic Development Summary
- Small Business Growth Analysis  
- Employment Trends Report

**How to add new reports**:
```typescript
export const mockReports: Report[] = [
  // ... existing reports
  {
    id: '4', // Ensure unique ID
    title: 'Q2 2024 Technology Sector Analysis',
    generatedAt: new Date('2024-04-15'),
    type: 'analysis',
    status: 'completed'
  }
];
```

### 2. Chat Message Data (`messages.ts`)

```typescript
interface Message {
  id: string;           // Message ID
  type: 'user' | 'assistant'; // Message type
  content: string;      // Message content
  timestamp: Date;      // Timestamp
  chart?: any;          // Optional chart data
  hasChart?: boolean;   // Whether includes chart
}
```

**Preset Response Patterns**:
- `business`: Business growth analysis
- `employment`: Employment trend analysis
- `default`: Default help information

**Custom AI Responses**:
```typescript
export const mockResponsePatterns = {
  // Add new response patterns
  housing: {
    content: `## Housing Market Analysis
    
### Key Indicators:
- **New Housing**: Growth 12.5%
- **Average Price**: $485,000 (+3.2%)
- **Rental Market**: Vacancy rate 4.1%
    
### Trend Analysis:
Housing demand continues to grow, especially in the tech corridor area...`,
    hasChart: true,
    chart: [/* housing data */]
  }
};
```

### 3. File Upload Data (`files.ts`)

```typescript
interface UploadedFile {
  id: string;                                    // File ID
  name: string;                                  // File name
  size: number;                                  // File size (bytes)
  type: string;                                  // MIME type
  status: 'uploading' | 'completed' | 'error';  // Upload status
  progress: number;                              // Upload progress (0-100)
  uploadedAt: Date;                             // Upload time
}
```

**Adding new files**:
```typescript
export const mockUploadedFiles: UploadedFile[] = [
  // ... existing files
  {
    id: '3',
    name: 'Tourism Impact Study.pdf',
    size: 3200000,
    type: 'application/pdf',
    status: 'completed',
    progress: 100,
    uploadedAt: new Date('2024-02-01')
  }
];
```

### 4. Statistics Data (`stats.ts`)

```typescript
interface StatData {
  number: string;  // Statistical number
  label: string;   // Statistical label
}
```

**Current Statistics**:
- 10+ Documents Processed
- 500+ Questions Answered
- 2 Languages Supported  
- 100% WCAG Compliant

### 5. Chart Data (`charts.ts`)

Contains various visualization data:

**Business Growth Data**:
```typescript
businessGrowth: [
  { month: 'Jan', businesses: 120, growth: 5.2 },
  { month: 'Feb', businesses: 125, growth: 6.1 },
  // ...
]
```

**Sector Analysis Data**:
```typescript
sectorAnalysis: [
  { sector: 'Technology', growth: 22, businesses: 145 },
  { sector: 'Healthcare', growth: 18, businesses: 98 },
  // ...
]
```

**Employment Distribution Data**:
```typescript
employmentDistribution: [
  { name: 'Full-time', value: 65, color: '#667eea' },
  { name: 'Part-time', value: 25, color: '#10b981' },
  // ...
]
```

### 6. Multi-language Translations (`translations.ts`)

```typescript
interface Translations {
  [language: string]: {
    [key: string]: string;
  };
}
```

**Supported Languages**: English (en), Français (fr)

**Adding new translations**:
```typescript
export const mockTranslations: Translations = {
  en: {
    // ... existing translations
    'reports.new': 'New Report Generated',
    'analysis.complete': 'Analysis Complete'
  },
  fr: {
    // ... existing translations  
    'reports.new': 'Nouveau Rapport Généré',
    'analysis.complete': 'Analyse Terminée'
  }
};
```

## 🔄 How to Switch Mock Data

### 1. Control through Environment Variables

```bash
# Use Mock data (development/demo)
export REACT_APP_API_STRATEGY=mock

# Hybrid mode (recommended for development stage)
export REACT_APP_API_STRATEGY=hybrid

# Real API (production environment)
export REACT_APP_API_STRATEGY=real
```

### 2. Dynamic Data Switching

If you need to switch between different Mock data sets at runtime:

```typescript
// Create multiple data sets
export const mockDataSets = {
  demo: {
    reports: demoReports,
    messages: demoMessages,
    stats: demoStats
  },
  development: {
    reports: devReports, 
    messages: devMessages,
    stats: devStats
  },
  testing: {
    reports: testReports,
    messages: testMessages,
    stats: testStats
  }
};

// Select data set based on environment in mockApi.ts
const getCurrentDataSet = () => {
  const env = process.env.REACT_APP_MOCK_DATA_SET || 'demo';
  return mockDataSets[env] || mockDataSets.demo;
};
```

### 3. Time-based Dynamic Data

Create time-based dynamic Mock data:

```typescript
// Generate reports with dynamic dates
const generateDynamicReports = (): Report[] => {
  const now = new Date();
  return [
    {
      id: '1',
      title: `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()} Economic Summary`,
      generatedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Yesterday
      type: 'summary',
      status: 'completed'
    }
    // ...
  ];
};
```

## ✨ Custom Mock Data

### 1. Creating New Data Types

1. **Define TypeScript Interface** (`src/mock/types/index.ts`):
```typescript
export interface ProjectData {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'pending';
  budget: number;
  startDate: Date;
  department: string;
}
```

2. **Create Mock Data File** (`src/mock/data/projects.ts`):
```typescript
import { ProjectData } from '../types';

export const mockProjects: ProjectData[] = [
  {
    id: '1',
    name: 'Downtown Revitalization',
    status: 'active', 
    budget: 2500000,
    startDate: new Date('2024-01-01'),
    department: 'Urban Planning'
  }
  // ...
];
```

3. **Add API Endpoint** (`src/mock/api/mockApi.ts`):
```typescript
import { mockProjects } from '../data/projects';

export const mockApi = {
  // ... existing endpoints
  
  async getProjects(): Promise<ProjectData[]> {
    await delay(300);
    return mockProjects;
  },
  
  async getProject(id: string): Promise<ProjectData | null> {
    await delay(200);
    return mockProjects.find(p => p.id === id) || null;
  }
};
```

### 2. Advanced Mock Data Features

**Search and Filtering**:
```typescript
async searchReports(query: string): Promise<Report[]> {
  await delay(400);
  return mockReports.filter(report => 
    report.title.toLowerCase().includes(query.toLowerCase())
  );
}
```

**Pagination Support**:
```typescript
async getReportsPaginated(page: number = 1, limit: number = 10): Promise<{
  reports: Report[];
  total: number;
  hasMore: boolean;
}> {
  await delay(500);
  const start = (page - 1) * limit;
  const end = start + limit;
  const reports = mockReports.slice(start, end);
  
  return {
    reports,
    total: mockReports.length,
    hasMore: end < mockReports.length
  };
}
```

**State Simulation**:
```typescript
async generateReport(type: string): Promise<Report> {
  const report: Report = {
    id: Date.now().toString(),
    title: `${type} Report - ${new Date().toLocaleDateString()}`,
    generatedAt: new Date(),
    type: type as any,
    status: 'processing'
  };
  
  // Simulate processing
  setTimeout(() => {
    report.status = 'completed';
  }, 3000);
  
  return report;
}
```

## 📈 Data Update Strategies

### 1. Real-time Data Simulation

```typescript
// Simulate real-time statistics updates
class MockDataManager {
  private updateInterval: NodeJS.Timeout;
  
  constructor() {
    this.startRealtimeUpdates();
  }
  
  private startRealtimeUpdates() {
    this.updateInterval = setInterval(() => {
      // Update statistics data
      mockStats[0].number = `${Math.floor(Math.random() * 100) + 10}+`;
      mockStats[1].number = `${Math.floor(Math.random() * 1000) + 500}+`;
      
      // Trigger update event
      window.dispatchEvent(new CustomEvent('mockDataUpdate'));
    }, 30000); // Update every 30 seconds
  }
  
  stopUpdates() {
    clearInterval(this.updateInterval);
  }
}
```

### 2. User Interaction Response

```typescript
// Update data based on user actions
const simulateUserImpact = (action: string) => {
  switch (action) {
    case 'upload_file':
      mockStats[0].number = `${parseInt(mockStats[0].number) + 1}+`;
      break;
    case 'ask_question':
      mockStats[1].number = `${parseInt(mockStats[1].number) + 1}+`;
      break;
  }
};
```

## 🧪 Debugging and Testing

### 1. Mock Data Validation

```typescript
// Data validation tools
const validateMockData = () => {
  const issues = [];
  
  // Check ID uniqueness
  const reportIds = mockReports.map(r => r.id);
  const uniqueIds = [...new Set(reportIds)];
  if (reportIds.length !== uniqueIds.length) {
    issues.push('Duplicate report IDs found');
  }
  
  // Check required fields
  mockReports.forEach(report => {
    if (!report.title || !report.id) {
      issues.push(`Invalid report: ${report.id}`);
    }
  });
  
  return issues;
};

// Run validation in development mode
if (process.env.NODE_ENV === 'development') {
  const issues = validateMockData();
  if (issues.length > 0) {
    console.warn('Mock data issues:', issues);
  }
}
```

### 2. Data Export Tools

```typescript
// Export Mock data for analysis
const exportMockData = () => {
  const data = {
    reports: mockReports,
    files: mockUploadedFiles,
    stats: mockStats,
    translations: mockTranslations,
    timestamp: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mock-data-${Date.now()}.json`;
  a.click();
};
```

### 3. A/B Testing Support

```typescript
// Support different versions of Mock data
const getTestVariant = () => {
  const userId = localStorage.getItem('userId') || 'anonymous';
  const hash = userId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return Math.abs(hash) % 2 === 0 ? 'A' : 'B';
};

const getMockDataForVariant = (variant: string) => {
  return variant === 'A' ? mockDataVariantA : mockDataVariantB;
};
```

## 🎛️ Configuration Options

Add Mock data configuration in `.env` file:

```bash
# Mock data configuration
REACT_APP_API_STRATEGY=mock
REACT_APP_MOCK_DATA_SET=demo
REACT_APP_MOCK_DELAY_MIN=200
REACT_APP_MOCK_DELAY_MAX=800
REACT_APP_MOCK_ERROR_RATE=0.05
REACT_APP_ENABLE_MOCK_LOGS=true
```

Use configuration in code:

```typescript
const mockConfig = {
  dataSet: process.env.REACT_APP_MOCK_DATA_SET || 'demo',
  delayMin: parseInt(process.env.REACT_APP_MOCK_DELAY_MIN || '200'),
  delayMax: parseInt(process.env.REACT_APP_MOCK_DELAY_MAX || '800'),
  errorRate: parseFloat(process.env.REACT_APP_MOCK_ERROR_RATE || '0'),
  enableLogs: process.env.REACT_APP_ENABLE_MOCK_LOGS === 'true'
};
```

## 🚀 Best Practices

### 1. Data Consistency
- Maintain ID uniqueness
- Use consistent date formats
- Ensure referential integrity

### 2. Performance Optimization
- Use appropriate delays to simulate real networks
- Avoid overly large Mock data sets
- Implement data lazy loading

### 3. Maintainability
- Regularly update Mock data
- Keep consistency with real APIs
- Add data version control

### 4. Test Coverage
- Test various data states
- Simulate error conditions
- Validate edge cases

## 🔄 Migration to Backend API

When prototype development is complete and real backend API integration is needed, the Mock data layer design makes migration smooth and gradual.

### 1. API Strategy Configuration

The project supports three API strategies for gradual migration:

```bash
# 1. Pure Mock mode (prototype stage)
REACT_APP_API_STRATEGY=mock

# 2. Hybrid mode (migration stage)
REACT_APP_API_STRATEGY=hybrid

# 3. Real API mode (production stage)
REACT_APP_API_STRATEGY=real
```

### 2. Progressive Migration Steps

#### Step 1: Establish API Contract

First, define real API interface specifications based on Mock data:

```typescript
// src/api/types.ts - API contract definition
export interface ApiReport {
  id: string;
  title: string;
  generatedAt: string; // ISO 8601 format
  type: 'summary' | 'analysis' | 'trend';
  status: 'completed' | 'processing' | 'error';
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}
```

#### Step 2: Create API Adapter

```typescript
// src/api/realApi.ts - Real API implementation
export class RealApiService {
  private baseUrl = process.env.REACT_APP_API_BASE_URL;
  
  async getReports(): Promise<ApiResponse<ApiReport[]>> {
    const response = await fetch(`${this.baseUrl}/api/reports`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
  
  async generateReport(type: string): Promise<ApiResponse<ApiReport>> {
    const response = await fetch(`${this.baseUrl}/api/reports/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type })
    });
    
    return response.json();
  }
  
  private getToken(): string {
    return localStorage.getItem('auth_token') || '';
  }
}
```

#### Step 3: Create Unified Service Layer

```typescript
// src/services/dataService.ts - Unified data service
import { mockApi } from '../mock/api/mockApi';
import { RealApiService } from '../api/realApi';

export class DataService {
  private mockApi = mockApi;
  private realApi = new RealApiService();
  private strategy = process.env.REACT_APP_API_STRATEGY || 'mock';
  
  async getReports(): Promise<Report[]> {
    try {
      switch (this.strategy) {
        case 'mock':
          return await this.mockApi.getReports();
          
        case 'real':
          const response = await this.realApi.getReports();
          return this.transformApiReports(response.data);
          
        case 'hybrid':
          try {
            const response = await this.realApi.getReports();
            return this.transformApiReports(response.data);
          } catch (error) {
            console.warn('API failed, falling back to mock:', error);
            return await this.mockApi.getReports();
          }
          
        default:
          return await this.mockApi.getReports();
      }
    } catch (error) {
      if (this.strategy === 'hybrid') {
        console.warn('Using mock fallback due to error:', error);
        return await this.mockApi.getReports();
      }
      throw error;
    }
  }
  
  private transformApiReports(apiReports: ApiReport[]): Report[] {
    return apiReports.map(apiReport => ({
      id: apiReport.id,
      title: apiReport.title,
      generatedAt: new Date(apiReport.generatedAt),
      type: apiReport.type,
      status: apiReport.status
    }));
  }
}

// Create singleton instance
export const dataService = new DataService();
```

### 3. Migration Checklist

#### 🔍 Pre-migration Checks
- [ ] Are API endpoints defined and accessible?
- [ ] Is authentication mechanism implemented?
- [ ] Are data formats compatible with Mock data?
- [ ] Is error handling comprehensive?
- [ ] Are network timeout configurations reasonable?

#### 🧪 Testing Steps
1. **Hybrid Mode Testing**: Set `REACT_APP_API_STRATEGY=hybrid`
2. **API Availability Testing**: Verify all endpoints work properly
3. **Error Scenario Testing**: Test network disconnection, server errors, etc.
4. **Performance Testing**: Compare Mock and real API response times
5. **Data Consistency Testing**: Ensure API returns correct data format

#### 🚀 Deployment Steps
1. **Phase 1**: Use hybrid mode in development environment
2. **Phase 2**: Use real API in testing environment
3. **Phase 3**: Gradually switch modules in production environment
4. **Phase 4**: Completely switch to real API
5. **Phase 5**: Remove Mock code (optional)

---

Through this guide, you can fully control Mock data behavior, create rich prototype experiences, and prepare for migration to real APIs. 
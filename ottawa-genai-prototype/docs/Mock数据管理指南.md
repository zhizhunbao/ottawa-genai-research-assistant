# Mock Data Management Guide

本指南详细说明了如何管理、配置和切换Ottawa GenAI Research Assistant原型中的Mock数据。

## 📚 目录

- [Mock数据概览](#mock数据概览)
- [数据结构详解](#数据结构详解)
- [如何切换Mock数据](#如何切换mock数据)
- [自定义Mock数据](#自定义mock数据)
- [数据更新策略](#数据更新策略)
- [调试和测试](#调试和测试)
- [迁移到后端API](#迁移到后端api)

## 🎯 Mock数据概览

Mock数据层位于 `src/mock/` 目录，提供完整的模拟数据集，支持原型的所有功能而无需真实后端。

### 📁 文件结构
```
src/mock/
├── api/
│   └── mockApi.ts           # Mock API 端点实现
├── data/                    # 所有Mock数据文件
│   ├── charts.ts           # 图表数据
│   ├── files.ts            # 文件上传数据
│   ├── messages.ts         # 聊天消息数据
│   ├── reports.ts          # 报告数据
│   ├── stats.ts            # 统计数据
│   ├── translations.ts     # 多语言翻译
│   └── index.ts            # 数据导出
├── types/
│   └── index.ts            # TypeScript类型定义
└── index.ts                # Mock层导出
```

## 📊 数据结构详解

### 1. 报告数据 (`reports.ts`)

```typescript
interface Report {
  id: string;                              // 唯一标识符
  title: string;                          // 报告标题
  generatedAt: Date;                      // 生成时间
  type: 'summary' | 'analysis' | 'trend'; // 报告类型
  status: 'completed' | 'processing' | 'error'; // 状态
}
```

**当前Mock数据**:
- Q1 2024 Economic Development Summary
- Small Business Growth Analysis  
- Employment Trends Report

**如何添加新报告**:
```typescript
export const mockReports: Report[] = [
  // ... 现有报告
  {
    id: '4', // 确保ID唯一
    title: 'Q2 2024 Technology Sector Analysis',
    generatedAt: new Date('2024-04-15'),
    type: 'analysis',
    status: 'completed'
  }
];
```

### 2. 聊天消息数据 (`messages.ts`)

```typescript
interface Message {
  id: string;           // 消息ID
  type: 'user' | 'assistant'; // 消息类型
  content: string;      // 消息内容
  timestamp: Date;      // 时间戳
  chart?: any;          // 可选图表数据
  hasChart?: boolean;   // 是否包含图表
}
```

**预设响应模式**:
- `business`: 商业增长分析
- `employment`: 就业趋势分析
- `default`: 默认帮助信息

**自定义AI响应**:
```typescript
export const mockResponsePatterns = {
  // 添加新的响应模式
  housing: {
    content: `## 住房市场分析
    
### 关键指标:
- **新建住房**: 增长12.5%
- **平均房价**: $485,000 (+3.2%)
- **租赁市场**: 空置率4.1%
    
### 趋势分析:
住房需求持续增长，特别是在科技走廊地区...`,
    hasChart: true,
    chart: [/* 住房数据 */]
  }
};
```

### 3. 文件上传数据 (`files.ts`)

```typescript
interface UploadedFile {
  id: string;                                    // 文件ID
  name: string;                                  // 文件名
  size: number;                                  // 文件大小(字节)
  type: string;                                  // MIME类型
  status: 'uploading' | 'completed' | 'error';  // 上传状态
  progress: number;                              // 上传进度(0-100)
  uploadedAt: Date;                             // 上传时间
}
```

**添加新文件**:
```typescript
export const mockUploadedFiles: UploadedFile[] = [
  // ... 现有文件
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

### 4. 统计数据 (`stats.ts`)

```typescript
interface StatData {
  number: string;  // 统计数字
  label: string;   // 统计标签
}
```

**当前统计项**:
- 10+ Documents Processed
- 500+ Questions Answered
- 2 Languages Supported  
- 100% WCAG Compliant

### 5. 图表数据 (`charts.ts`)

包含多种可视化数据:

**商业增长数据**:
```typescript
businessGrowth: [
  { month: 'Jan', businesses: 120, growth: 5.2 },
  { month: 'Feb', businesses: 125, growth: 6.1 },
  // ...
]
```

**行业分析数据**:
```typescript
sectorAnalysis: [
  { sector: 'Technology', growth: 22, businesses: 145 },
  { sector: 'Healthcare', growth: 18, businesses: 98 },
  // ...
]
```

**就业分布数据**:
```typescript
employmentDistribution: [
  { name: 'Full-time', value: 65, color: '#667eea' },
  { name: 'Part-time', value: 25, color: '#10b981' },
  // ...
]
```

### 6. 多语言翻译 (`translations.ts`)

```typescript
interface Translations {
  [language: string]: {
    [key: string]: string;
  };
}
```

**支持语言**: English (en), Français (fr)

**添加新翻译**:
```typescript
export const mockTranslations: Translations = {
  en: {
    // ... 现有翻译
    'reports.new': 'New Report Generated',
    'analysis.complete': 'Analysis Complete'
  },
  fr: {
    // ... 现有翻译  
    'reports.new': 'Nouveau Rapport Généré',
    'analysis.complete': 'Analyse Terminée'
  }
};
```

## 🔄 如何切换Mock数据

### 1. 通过环境变量控制

```bash
# 使用Mock数据 (开发/演示)
export REACT_APP_API_STRATEGY=mock

# 混合模式 (开发阶段推荐)
export REACT_APP_API_STRATEGY=hybrid

# 真实API (生产环境)
export REACT_APP_API_STRATEGY=real
```

### 2. 动态数据切换

如果需要在运行时切换不同的Mock数据集:

```typescript
// 创建多个数据集
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

// 在mockApi.ts中根据环境选择数据集
const getCurrentDataSet = () => {
  const env = process.env.REACT_APP_MOCK_DATA_SET || 'demo';
  return mockDataSets[env] || mockDataSets.demo;
};
```

### 3. 时间基础的动态数据

创建基于时间的动态Mock数据:

```typescript
// 生成动态日期的报告
const generateDynamicReports = (): Report[] => {
  const now = new Date();
  return [
    {
      id: '1',
      title: `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()} Economic Summary`,
      generatedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 昨天
      type: 'summary',
      status: 'completed'
    }
    // ...
  ];
};
```

## ✨ 自定义Mock数据

### 1. 创建新的数据类型

1. **定义TypeScript接口** (`src/mock/types/index.ts`):
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

2. **创建Mock数据文件** (`src/mock/data/projects.ts`):
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

3. **添加API端点** (`src/mock/api/mockApi.ts`):
```typescript
import { mockProjects } from '../data/projects';

export const mockApi = {
  // ... 现有端点
  
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

### 2. 高级Mock数据功能

**搜索和过滤**:
```typescript
async searchReports(query: string): Promise<Report[]> {
  await delay(400);
  return mockReports.filter(report => 
    report.title.toLowerCase().includes(query.toLowerCase())
  );
}
```

**分页支持**:
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

**状态模拟**:
```typescript
async generateReport(type: string): Promise<Report> {
  const report: Report = {
    id: Date.now().toString(),
    title: `${type} Report - ${new Date().toLocaleDateString()}`,
    generatedAt: new Date(),
    type: type as any,
    status: 'processing'
  };
  
  // 模拟处理过程
  setTimeout(() => {
    report.status = 'completed';
  }, 3000);
  
  return report;
}
```

## 📈 数据更新策略

### 1. 实时数据模拟

```typescript
// 模拟实时统计更新
class MockDataManager {
  private updateInterval: NodeJS.Timeout;
  
  constructor() {
    this.startRealtimeUpdates();
  }
  
  private startRealtimeUpdates() {
    this.updateInterval = setInterval(() => {
      // 更新统计数据
      mockStats[0].number = `${Math.floor(Math.random() * 100) + 10}+`;
      mockStats[1].number = `${Math.floor(Math.random() * 1000) + 500}+`;
      
      // 触发更新事件
      window.dispatchEvent(new CustomEvent('mockDataUpdate'));
    }, 30000); // 每30秒更新
  }
  
  stopUpdates() {
    clearInterval(this.updateInterval);
  }
}
```

### 2. 用户交互响应

```typescript
// 根据用户操作更新数据
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

## 🧪 调试和测试

### 1. Mock数据验证

```typescript
// 数据验证工具
const validateMockData = () => {
  const issues = [];
  
  // 检查ID唯一性
  const reportIds = mockReports.map(r => r.id);
  const uniqueIds = [...new Set(reportIds)];
  if (reportIds.length !== uniqueIds.length) {
    issues.push('Duplicate report IDs found');
  }
  
  // 检查必填字段
  mockReports.forEach(report => {
    if (!report.title || !report.id) {
      issues.push(`Invalid report: ${report.id}`);
    }
  });
  
  return issues;
};

// 在开发模式下运行验证
if (process.env.NODE_ENV === 'development') {
  const issues = validateMockData();
  if (issues.length > 0) {
    console.warn('Mock data issues:', issues);
  }
}
```

### 2. 数据导出工具

```typescript
// 导出Mock数据用于分析
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

### 3. A/B测试支持

```typescript
// 支持不同版本的Mock数据
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

## 🎛️ 配置选项

在 `.env` 文件中添加Mock数据配置:

```bash
# Mock数据配置
REACT_APP_API_STRATEGY=mock
REACT_APP_MOCK_DATA_SET=demo
REACT_APP_MOCK_DELAY_MIN=200
REACT_APP_MOCK_DELAY_MAX=800
REACT_APP_MOCK_ERROR_RATE=0.05
REACT_APP_ENABLE_MOCK_LOGS=true
```

在代码中使用配置:

```typescript
const mockConfig = {
  dataSet: process.env.REACT_APP_MOCK_DATA_SET || 'demo',
  delayMin: parseInt(process.env.REACT_APP_MOCK_DELAY_MIN || '200'),
  delayMax: parseInt(process.env.REACT_APP_MOCK_DELAY_MAX || '800'),
  errorRate: parseFloat(process.env.REACT_APP_MOCK_ERROR_RATE || '0'),
  enableLogs: process.env.REACT_APP_ENABLE_MOCK_LOGS === 'true'
};
```

## 🚀 最佳实践

### 1. 数据一致性
- 保持ID的唯一性
- 使用相同的日期格式
- 确保引用完整性

### 2. 性能优化
- 使用适当的延迟模拟真实网络
- 避免过大的Mock数据集
- 实现数据懒加载

### 3. 维护性
- 定期更新Mock数据
- 保持与真实API的一致性
- 添加数据版本控制

### 4. 测试覆盖
- 测试各种数据状态
- 模拟错误情况
- 验证边界条件

## 🔄 迁移到后端API

当原型开发完成，需要集成真实后端API时，Mock数据层的设计让迁移变得平滑和渐进。

### 1. API策略配置

项目支持三种API策略，可以逐步迁移：

```bash
# 1. 纯Mock模式 (原型阶段)
REACT_APP_API_STRATEGY=mock

# 2. 混合模式 (迁移阶段)
REACT_APP_API_STRATEGY=hybrid

# 3. 真实API模式 (生产阶段)
REACT_APP_API_STRATEGY=real
```

### 2. 渐进式迁移步骤

#### Step 1: 建立API契约

首先基于Mock数据定义真实API的接口规范：

```typescript
// src/api/types.ts - API契约定义
export interface ApiReport {
  id: string;
  title: string;
  generatedAt: string; // ISO 8601格式
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

#### Step 2: 创建API适配器

```typescript
// src/api/realApi.ts - 真实API实现
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

#### Step 3: 创建统一服务层

```typescript
// src/services/dataService.ts - 统一数据服务
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

// 创建单例实例
export const dataService = new DataService();
```

#### Step 4: 更新组件使用

```typescript
// src/components/ReportsPage.tsx - 使用统一服务
import { dataService } from '../services/dataService';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dataService.getReports();
        setReports(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadReports();
  }, []);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  
  return (
    <div>
      {reports.map(report => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  );
};
```

### 3. 数据转换和映射

#### Mock到API的数据映射

```typescript
// src/utils/dataTransformers.ts
export class DataTransformers {
  // Mock格式转API格式
  static mockToApi = {
    report: (mockReport: MockReport): ApiReportRequest => ({
      title: mockReport.title,
      type: mockReport.type,
      metadata: {
        generated_at: mockReport.generatedAt.toISOString()
      }
    }),
    
    message: (mockMessage: MockMessage): ApiMessageRequest => ({
      content: mockMessage.content,
      type: mockMessage.type,
      timestamp: mockMessage.timestamp.toISOString(),
      has_chart: mockMessage.hasChart || false
    })
  };
  
  // API格式转前端格式
  static apiToFrontend = {
    report: (apiReport: ApiReport): Report => ({
      id: apiReport.id,
      title: apiReport.title,
      generatedAt: new Date(apiReport.generatedAt),
      type: apiReport.type,
      status: apiReport.status
    }),
    
    message: (apiMessage: ApiMessage): Message => ({
      id: apiMessage.id,
      type: apiMessage.type,
      content: apiMessage.content,
      timestamp: new Date(apiMessage.timestamp),
      hasChart: apiMessage.has_chart,
      chart: apiMessage.chart_data
    })
  };
}
```

### 4. 认证集成

```typescript
// src/services/authService.ts
export class AuthService {
  private token: string | null = null;
  
  async login(username: string, password: string): Promise<boolean> {
    if (process.env.REACT_APP_API_STRATEGY === 'mock') {
      // Mock认证
      this.token = 'mock_token_' + Date.now();
      localStorage.setItem('auth_token', this.token);
      return true;
    }
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      if (data.success) {
        this.token = data.token;
        localStorage.setItem('auth_token', data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }
  
  getToken(): string | null {
    return this.token || localStorage.getItem('auth_token');
  }
  
  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }
}
```

### 5. 错误处理和回退机制

```typescript
// src/utils/apiErrorHandler.ts
export class ApiErrorHandler {
  static handle(error: any, fallbackToMock: boolean = true): any {
    console.error('API Error:', error);
    
    // 网络错误
    if (error.name === 'NetworkError' || !navigator.onLine) {
      if (fallbackToMock) {
        console.warn('Network error, using mock data');
        return this.getMockFallback();
      }
      throw new Error('网络连接失败，请检查网络设置');
    }
    
    // 认证错误
    if (error.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      return;
    }
    
    // 服务器错误
    if (error.status >= 500) {
      if (fallbackToMock) {
        console.warn('Server error, using mock data');
        return this.getMockFallback();
      }
      throw new Error('服务器暂时不可用，请稍后重试');
    }
    
    throw error;
  }
  
  private static getMockFallback() {
    // 返回基础Mock数据
    return mockApi;
  }
}
```

### 6. 环境配置管理

```bash
# .env.development - 开发环境
REACT_APP_API_STRATEGY=hybrid
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_MOCK_FALLBACK=true

# .env.staging - 测试环境  
REACT_APP_API_STRATEGY=real
REACT_APP_API_BASE_URL=https://api-staging.ottawa.ca
REACT_APP_MOCK_FALLBACK=true

# .env.production - 生产环境
REACT_APP_API_STRATEGY=real
REACT_APP_API_BASE_URL=https://api.ottawa.ca
REACT_APP_MOCK_FALLBACK=false
```

### 7. 迁移检查清单

#### 🔍 迁移前检查
- [ ] API端点是否已定义并可访问
- [ ] 认证机制是否已实现
- [ ] 数据格式是否与Mock数据兼容
- [ ] 错误处理是否完善
- [ ] 网络超时配置是否合理

#### 🧪 测试步骤
1. **混合模式测试**: 设置`REACT_APP_API_STRATEGY=hybrid`
2. **API可用性测试**: 验证所有端点正常工作
3. **错误场景测试**: 测试网络断开、服务器错误等情况
4. **性能测试**: 比较Mock和真实API的响应时间
5. **数据一致性测试**: 确保API返回数据格式正确

#### 🚀 上线步骤
1. **阶段1**: 在开发环境使用混合模式
2. **阶段2**: 在测试环境使用真实API
3. **阶段3**: 逐步在生产环境切换模块
4. **阶段4**: 完全切换到真实API
5. **阶段5**: 移除Mock代码(可选)

### 8. 性能优化

```typescript
// src/utils/apiCache.ts - API缓存机制
export class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  set(key: string, data: any, ttl: number = 300000): void { // 5分钟默认TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
}

// 在DataService中使用缓存
export class DataService {
  private cache = new ApiCache();
  
  async getReports(useCache: boolean = true): Promise<Report[]> {
    const cacheKey = 'reports';
    
    if (useCache) {
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;
    }
    
    const reports = await this.fetchReports();
    this.cache.set(cacheKey, reports);
    return reports;
  }
}
```

### 9. 监控和日志

```typescript
// src/utils/apiMonitor.ts
export class ApiMonitor {
  static logApiCall(method: string, url: string, duration: number, success: boolean): void {
    const logData = {
      method,
      url,
      duration,
      success,
      timestamp: new Date().toISOString(),
      strategy: process.env.REACT_APP_API_STRATEGY
    };
    
    console.log('API Call:', logData);
    
    // 发送到分析服务
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(logData);
    }
  }
  
  private static sendToAnalytics(data: any): void {
    // 发送到你的分析平台
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(console.error);
  }
}
```

通过这个迁移指南，你可以平滑地从Mock数据过渡到真实的后端API，确保应用在整个迁移过程中保持稳定和可用。

---

通过这个指南，你可以完全控制Mock数据的行为，创建丰富的原型体验，并为向真实API的迁移做好准备。 
// Mock Data Manager - 用于动态管理和切换Mock数据
import { mockChartData } from '../data/charts';
import { mockUploadedFiles } from '../data/files';
import { mockResponsePatterns } from '../data/messages';
import { mockReports } from '../data/reports';
import { getMockStats } from '../data/stats';
import { mockTranslations } from '../data/translations';

// 数据集类型定义
export interface MockDataSet {
  name: string;
  description: string;
  reports: any[];
  files: any[];
  stats: any[];
  translations: any;
  charts: any;
  responsePatterns: any;
}

// 预定义的数据集
export const mockDataSets: Record<string, MockDataSet> = {
  demo: {
    name: 'Demo Data',
    description: '演示用数据集 - 用于展示和演讲',
    reports: mockReports,
    files: mockUploadedFiles,
    stats: getMockStats((key: string) => key), // Use default key as fallback
    translations: mockTranslations,
    charts: mockChartData,
    responsePatterns: mockResponsePatterns
  },
  
  development: {
    name: 'Development Data',
    description: '开发用数据集 - 包含更多测试数据',
    reports: [
      ...mockReports,
      {
        id: '4',
        title: 'Development Test Report',
        generatedAt: new Date('2024-02-01'),
        type: 'analysis',
        status: 'processing'
      }
    ],
    files: [
      ...mockUploadedFiles,
      {
        id: '3',
        name: 'Test Document.pdf',
        size: 1500000,
        type: 'application/pdf',
        status: 'uploading',
        progress: 75,
        uploadedAt: new Date()
      }
    ],
    stats: getMockStats((key: string) => key), // Use translation keys directly
    translations: mockTranslations,
    charts: mockChartData,
    responsePatterns: mockResponsePatterns
  },
  
  testing: {
    name: 'Testing Data',
    description: '测试用数据集 - 包含边界情况',
    reports: [
      {
        id: '1',
        title: 'Empty Report',
        generatedAt: new Date(),
        type: 'summary',
        status: 'error'
      }
    ],
    files: [],
    stats: [
      { number: '0', label: 'stats.documents' },
      { number: '0', label: 'stats.queries' },
      { number: '0', label: 'stats.languages' },
      { number: '0%', label: 'stats.accessibility' }
    ],
    translations: mockTranslations,
    charts: {},
    responsePatterns: {
      default: {
        content: 'Testing mode - Limited functionality available',
        hasChart: false
      }
    }
  },
  
  showcase: {
    name: 'Showcase Data',
    description: '展示用数据集 - 最佳视觉效果',
    reports: [
      {
        id: '1',
        title: '2024 Annual Economic Growth Report',
        generatedAt: new Date('2024-01-15'),
        type: 'analysis',
        status: 'completed'
      },
      {
        id: '2',
        title: 'Innovation Hub Impact Analysis',
        generatedAt: new Date('2024-01-10'),
        type: 'trend',
        status: 'completed'
      },
      {
        id: '3',
        title: 'Digital Transformation Initiative',
        generatedAt: new Date('2024-01-05'),
        type: 'summary',
        status: 'completed'
      }
    ],
    files: [
      {
        id: '1',
        name: 'Annual Economic Report 2024.pdf',
        size: 4200000,
        type: 'application/pdf',
        status: 'completed',
        progress: 100,
        uploadedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Innovation Strategy Document.pdf',
        size: 3100000,
        type: 'application/pdf',
        status: 'completed',
        progress: 100,
        uploadedAt: new Date('2024-01-10')
      }
    ],
    stats: [
      { number: '50+', label: 'Documents Processed' },
      { number: '2,500+', label: 'Questions Answered' },
      { number: '3', label: 'Languages Supported' },
      { number: '100%', label: 'WCAG Compliant' }
    ],
    translations: mockTranslations,
    charts: {
      ...mockChartData,
      showcaseGrowth: [
        { month: 'Jan', businesses: 180, growth: 8.5 },
        { month: 'Feb', businesses: 195, growth: 9.2 },
        { month: 'Mar', businesses: 212, growth: 10.1 },
        { month: 'Apr', businesses: 235, growth: 11.3 },
        { month: 'May', businesses: 258, growth: 12.8 },
        { month: 'Jun', businesses: 285, growth: 14.2 }
      ]
    },
    responsePatterns: {
      ...mockResponsePatterns,
      innovation: {
        content: `## 创新生态系统分析

### 核心指标:
- **创新企业**: 285家 (+14.2%)
- **研发投资**: $125M (+18.5%)
- **专利申请**: 450件 (+22.1%)

### 重点领域:
- 人工智能和机器学习
- 清洁技术和可持续发展
- 数字健康解决方案

### 政策建议:
1. 增加创新孵化器支持
2. 扩大税收优惠政策
3. 加强产学研合作`,
        hasChart: true,
        chart: 'showcaseGrowth'
      }
    }
  }
};

// Mock数据管理器类
export class MockDataManager {
  private currentDataSet: string;
  private listeners: Array<(dataSet: string) => void> = [];

  constructor() {
    this.currentDataSet = this.getStoredDataSet();
  }

  // 获取当前数据集名称
  getCurrentDataSet(): string {
    return this.currentDataSet;
  }

  // 获取当前数据集
  getCurrentData(): MockDataSet {
    return mockDataSets[this.currentDataSet] || mockDataSets.demo;
  }

  // 切换数据集
  switchDataSet(dataSetName: string): boolean {
    if (!mockDataSets[dataSetName]) {
      console.warn(`Data set '${dataSetName}' not found`);
      return false;
    }

    this.currentDataSet = dataSetName;
    this.storeDataSet(dataSetName);
    this.notifyListeners();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Switched to data set: ${dataSetName}`);
    }
    
    return true;
  }

  // 获取所有可用数据集
  getAvailableDataSets(): Array<{ key: string; name: string; description: string }> {
    return Object.entries(mockDataSets).map(([key, dataSet]) => ({
      key,
      name: dataSet.name,
      description: dataSet.description
    }));
  }

  // 添加监听器
  addListener(callback: (dataSet: string) => void): void {
    this.listeners.push(callback);
  }

  // 移除监听器
  removeListener(callback: (dataSet: string) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // 通知所有监听器
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentDataSet);
      } catch (error) {
        console.error('Error in data set listener:', error);
      }
    });
  }

  // 从环境变量或本地存储获取数据集
  private getStoredDataSet(): string {
    // 首先检查环境变量
    const envDataSet = process.env.REACT_APP_MOCK_DATA_SET;
    if (envDataSet && mockDataSets[envDataSet]) {
      return envDataSet;
    }

    // 然后检查本地存储（仅开发模式）
    if (process.env.NODE_ENV === 'development') {
      const stored = localStorage.getItem('mock_data_set');
      if (stored && mockDataSets[stored]) {
        return stored;
      }
    }

    // 默认返回demo
    return 'demo';
  }

  // 存储数据集选择（仅开发模式）
  private storeDataSet(dataSetName: string): void {
    if (process.env.NODE_ENV === 'development') {
      localStorage.setItem('mock_data_set', dataSetName);
    }
  }

  // 重置为默认数据集
  reset(): void {
    this.switchDataSet('demo');
  }

  // 验证当前数据集
  validate(): Array<string> {
    const issues: string[] = [];
    const data = this.getCurrentData();

    // 检查报告数据
    if (!Array.isArray(data.reports)) {
      issues.push('Reports data is not an array');
    }

    // 检查文件数据
    if (!Array.isArray(data.files)) {
      issues.push('Files data is not an array');
    }

    // 检查统计数据
    if (!Array.isArray(data.stats)) {
      issues.push('Stats data is not an array');
    }

    // 检查翻译数据
    if (!data.translations || typeof data.translations !== 'object') {
      issues.push('Translations data is invalid');
    }

    return issues;
  }

  // 导出当前数据集
  exportCurrentDataSet(): string {
    const data = this.getCurrentData();
    return JSON.stringify({
      ...data,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    }, null, 2);
  }

  // 获取数据集统计信息
  getDataSetStats(): Record<string, any> {
    const data = this.getCurrentData();
    return {
      dataSet: this.currentDataSet,
      reports: data.reports.length,
      files: data.files.length,
      stats: data.stats.length,
      translations: Object.keys(data.translations).length,
      charts: Object.keys(data.charts).length,
      responsePatterns: Object.keys(data.responsePatterns).length
    };
  }
}

// 创建全局实例
export const mockDataManager = new MockDataManager();

// 开发者工具 (仅开发模式)
if (process.env.NODE_ENV === 'development') {
  // 添加到全局对象方便调试
  (window as any).mockDataManager = mockDataManager;
  
  // 添加快捷键切换数据集
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case '1':
          mockDataManager.switchDataSet('demo');
          break;
        case '2':
          mockDataManager.switchDataSet('development');
          break;
        case '3':
          mockDataManager.switchDataSet('testing');
          break;
        case '4':
          mockDataManager.switchDataSet('showcase');
          break;
      }
    }
  };
  
  document.addEventListener('keydown', handleKeyPress);
  
  // 输出帮助信息
  console.log(`
🛠️  Mock Data Manager 开发者工具已启用

快捷键:
- Ctrl/Cmd + 1: Demo 数据集
- Ctrl/Cmd + 2: Development 数据集  
- Ctrl/Cmd + 3: Testing 数据集
- Ctrl/Cmd + 4: Showcase 数据集

全局对象:
- window.mockDataManager: 数据管理器实例

当前数据集: ${mockDataManager.getCurrentDataSet()}
  `);
}

// 导出工具函数
export const mockDataUtils = {
  // 快速切换到特定数据集
  switchToDemo: () => mockDataManager.switchDataSet('demo'),
  switchToDevelopment: () => mockDataManager.switchDataSet('development'),
  switchToTesting: () => mockDataManager.switchDataSet('testing'),
  switchToShowcase: () => mockDataManager.switchDataSet('showcase'),
  
  // 获取当前数据
  getCurrentReports: () => mockDataManager.getCurrentData().reports,
  getCurrentFiles: () => mockDataManager.getCurrentData().files,
  getCurrentStats: () => mockDataManager.getCurrentData().stats,
  getCurrentTranslations: () => mockDataManager.getCurrentData().translations,
  getCurrentCharts: () => mockDataManager.getCurrentData().charts,
  getCurrentResponsePatterns: () => mockDataManager.getCurrentData().responsePatterns,
  
  // 数据验证
  validateCurrentData: () => mockDataManager.validate(),
  
  // 数据导出
  exportData: () => mockDataManager.exportCurrentDataSet(),
  
  // 获取统计信息
  getStats: () => mockDataManager.getDataSetStats()
};

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
    if (mockDataSets[dataSetName]) {
      this.currentDataSet = dataSetName;
      this.storeDataSet(dataSetName);
      this.notifyListeners();
      return true;
    }
    console.warn(`数据集 "${dataSetName}" 不存在`);
    return false;
  }

  // 添加监听器
  addListener(callback: (dataSet: string) => void): void {
    this.listeners.push(callback);
  }

  // 移除监听器
  removeListener(callback: (dataSet: string) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // 通知监听器
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentDataSet);
      } catch (error) {
        console.error('监听器执行错误:', error);
      }
    });
  }

  // 获取存储的数据集
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

    if (!Array.isArray(data.reports)) {
      issues.push('Reports data is not an array');
    }

    if (!Array.isArray(data.files)) {
      issues.push('Files data is not an array');
    }

    if (!Array.isArray(data.stats)) {
      issues.push('Stats data is not an array');
    }

    if (!data.translations || typeof data.translations !== 'object') {
      issues.push('Translations data is invalid');
    }

    if (!data.charts || typeof data.charts !== 'object') {
      issues.push('Charts data is invalid');
    }

    if (!data.responsePatterns || typeof data.responsePatterns !== 'object') {
      issues.push('Response patterns data is invalid');
    }

    return issues;
  }

  // 导出当前数据集
  exportCurrentDataSet(): any {
    return {
      dataSet: this.currentDataSet,
      data: this.getCurrentData(),
      exportedAt: new Date().toISOString()
    };
  }

  // 获取数据集统计信息
  getDataSetStats(): any {
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

// 开发模式下的调试工具
if (process.env.NODE_ENV === 'development') {
  // 将管理器暴露到全局作用域
  (window as any).mockDataManager = mockDataManager;
  
  // 添加键盘快捷键
  const handleKeyPress = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key >= '1' && event.key <= '4') {
      event.preventDefault();
      switch (event.key) {
        case '1':
          mockDataManager.switchDataSet('demo');
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

全局对象:
- window.mockDataManager: 数据管理器实例

当前数据集: ${mockDataManager.getCurrentDataSet()}
  `);
}

// 导出工具函数
export const mockDataUtils = {
  // 快速切换到特定数据集
  switchToDemo: () => mockDataManager.switchDataSet('demo'),
  
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

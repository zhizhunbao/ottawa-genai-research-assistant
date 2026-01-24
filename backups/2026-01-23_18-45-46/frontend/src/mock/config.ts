// Mock Data Configuration
// 统一管理所有Mock数据的配置和切换

export const MOCK_CONFIG = {
  // 当前使用的数据集
  currentDataSet: 'demo', // 'demo'
  
  // API模拟延迟时间 (毫秒)
  apiDelay: {
    short: 300,   // 快速操作
    medium: 800,  // 中等操作
    long: 1500    // 复杂操作
  },
  
  // 数据更新频率
  dataRefreshInterval: 30000, // 30秒
  
  // 开发模式设置
  development: {
    enableConsoleLog: true,
    enablePerformanceTracking: true,
    showDataSourceInUI: true
  },
  
  // 数据验证设置
  validation: {
    enableDataValidation: true,
    strictModeEnabled: false
  }
};

// 环境特定配置
export const getEnvironmentConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    ...MOCK_CONFIG,
    development: {
      ...MOCK_CONFIG.development,
      enableConsoleLog: isDevelopment,
      enablePerformanceTracking: isDevelopment,
      showDataSourceInUI: isDevelopment
    }
  };
};

// 数据集描述
export const DATA_SET_DESCRIPTIONS = {
  demo: {
    name: 'Demo Data',
    description: '演示用数据集 - 用于展示和演讲',
    recommended: 'presentations',
    features: ['完整功能展示', '美观的视觉效果', '真实的数据场景']
  }
};

// 导出便捷访问函数
export const getCurrentConfig = () => getEnvironmentConfig();
export const isDevMode = () => process.env.NODE_ENV === 'development';
export const isMockEnabled = () => true; // Always true for this prototype 
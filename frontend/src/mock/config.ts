// Mock Data Configuration
// 统一管理所有Mock数据的配置和切换

export const MOCK_CONFIG = {
  // 当前使用的数据集
  currentDataSet: 'demo', // 'demo' | 'development' | 'testing' | 'showcase'
  
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
  },
  development: {
    name: 'Development Data',
    description: '开发用数据集 - 包含更多测试数据',
    recommended: 'development',
    features: ['大量测试数据', '边界情况测试', '性能测试数据']
  },
  testing: {
    name: 'Testing Data',
    description: '测试用数据集 - 包含边界情况',
    recommended: 'testing',
    features: ['错误状态测试', '空数据测试', '异常情况模拟']
  },
  showcase: {
    name: 'Showcase Data',
    description: '展示用数据集 - 最佳视觉效果',
    recommended: 'demos',
    features: ['最佳视觉效果', '高质量数据', '专业展示']
  }
};

// 导出便捷访问函数
export const getCurrentConfig = () => getEnvironmentConfig();
export const isDevMode = () => process.env.NODE_ENV === 'development';
export const isMockEnabled = () => true; // Always true for this prototype 
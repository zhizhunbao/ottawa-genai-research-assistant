module.exports = {
  // 测试环境
  testEnvironment: 'jsdom',
  
  // 根目录
  rootDir: '../..',
  
  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/tests/integration/**/*.test.{js,jsx,ts,tsx}'
  ],
  
  // 模块名映射 (修复拼写错误)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^react-markdown$': '<rootDir>/tests/integration/__mocks__/react-markdown.js',
    '^recharts$': '<rootDir>/tests/integration/__mocks__/recharts.js'
  },
  
  // 设置文件
  setupFilesAfterEnv: [
    '<rootDir>/tests/integration/setup.js'
  ],
  
  // 转换配置
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript'
      ]
    }]
  },
  
  // 转换忽略模式 - 使用默认设置，有问题的模块已被Mock
  transformIgnorePatterns: [
    'node_modules/(?!(@testing-library|lucide-react)/)'
  ],
  
  // 模块文件扩展名
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  
  // 覆盖率收集
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts'
  ],
  
  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // 测试超时
  testTimeout: 10000,
  
  // 环境变量
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  }
}; 
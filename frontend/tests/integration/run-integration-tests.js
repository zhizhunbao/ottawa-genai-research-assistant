#!/usr/bin/env node

/**
 * 前端集成测试运行脚本
 * 
 * 这个脚本会：
 * 1. 检查后端API是否可用
 * 2. 运行所有集成测试
 * 3. 生成测试报告
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 配置
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
const JEST_CONFIG_PATH = path.join(__dirname, 'jest.config.js');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(` ${message}`, colors.cyan);
  log(`${'='.repeat(60)}`, colors.cyan);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

// 检查后端API是否可用
async function checkBackendAPI() {
  logHeader('检查后端API连接');
  
  try {
    // 动态导入node-fetch以支持ES模块
    const { default: fetch } = await import('node-fetch');
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      logSuccess(`后端API连接成功: ${data.service}`);
      return true;
    } else {
      logError(`后端API响应错误: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    logError(`后端API连接失败: ${error.message}`);
    logWarning('提示: 请确保后端服务正在运行 (python -m uvicorn app.main:app --reload)');
    return false;
  }
}

// 运行Jest测试
function runJestTests() {
  return new Promise((resolve, reject) => {
    logHeader('运行集成测试');
    
    const jestArgs = [
      '--config', JEST_CONFIG_PATH,
      '--verbose',
      '--coverage',
      '--coverageDirectory', path.join(__dirname, 'coverage'),
      '--testResultsProcessor', 'jest-junit'
    ];
    
    // 如果是CI环境，添加额外参数
    if (process.env.CI) {
      jestArgs.push('--ci', '--watchAll=false');
    }
    
    logInfo(`运行命令: npx jest ${jestArgs.join(' ')}`);
    
    const jest = spawn('npx', ['jest', ...jestArgs], {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '../..'),
      shell: true, // 修复Windows环境下的spawn问题
      env: {
        ...process.env,
        NODE_ENV: 'test',
        REACT_APP_API_BASE_URL: API_BASE_URL
      }
    });
    
    jest.on('close', (code) => {
      if (code === 0) {
        logSuccess('所有集成测试通过！');
        resolve(code);
      } else {
        logError(`测试失败，退出码: ${code}`);
        reject(new Error(`Jest exited with code ${code}`));
      }
    });
    
    jest.on('error', (error) => {
      logError(`Jest运行错误: ${error.message}`);
      reject(error);
    });
  });
}

// 生成测试报告摘要
function generateTestSummary() {
  logHeader('测试报告摘要');
  
  const coveragePath = path.join(__dirname, 'coverage', 'lcov-report', 'index.html');
  const junitPath = path.join(__dirname, '../../junit.xml');
  
  if (fs.existsSync(coveragePath)) {
    logSuccess(`覆盖率报告生成: ${coveragePath}`);
  }
  
  if (fs.existsSync(junitPath)) {
    logSuccess(`JUnit报告生成: ${junitPath}`);
  }
  
  logInfo('测试类型说明:');
  log('  • 认证集成测试: 登录、注册、token管理', colors.reset);
  log('  • 聊天集成测试: 消息发送、历史记录、上下文', colors.reset);
  log('  • 文档集成测试: 上传、列表、删除', colors.reset);
  log('  • 报告集成测试: 生成、历史、下载', colors.reset);
}

// 主函数
async function main() {
  try {
    log(`${colors.bright}🚀 Ottawa GenAI Research Assistant - 前端集成测试${colors.reset}`);
    log(`API地址: ${API_BASE_URL}`);
    
    // 检查Jest配置文件是否存在
    if (!fs.existsSync(JEST_CONFIG_PATH)) {
      logError(`Jest配置文件不存在: ${JEST_CONFIG_PATH}`);
      process.exit(1);
    }
    
    // 检查后端API（可选）
    const apiAvailable = await checkBackendAPI();
    if (!apiAvailable) {
      logWarning('后端API不可用，但测试将继续运行（使用Mock数据）');
    }
    
    // 运行测试
    await runJestTests();
    
    // 生成报告摘要
    generateTestSummary();
    
    logHeader('集成测试完成');
    logSuccess('所有集成测试执行完毕！');
    
  } catch (error) {
    logHeader('测试执行失败');
    logError(`错误: ${error.message}`);
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('unhandledRejection', (reason, promise) => {
  logError(`未处理的Promise拒绝: ${reason}`);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logError(`未捕获的异常: ${error.message}`);
  process.exit(1);
});

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  checkBackendAPI,
  runJestTests,
  generateTestSummary
}; 
#!/bin/bash

# 前端集成测试运行脚本
# Frontend Integration Test Runner Script

echo "🚀 Ottawa GenAI Research Assistant - 前端集成测试"
echo "============================================================"

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在frontend目录下运行此脚本"
    echo "Error: Please run this script from the frontend directory"
    exit 1
fi

# 检查Node.js和npm
echo "📋 检查环境..."
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 设置环境变量
export NODE_ENV=test
export REACT_APP_API_BASE_URL=http://localhost:8000/api/v1

echo ""
echo "🧪 运行集成测试..."
echo "============================================================"

# 运行Jest集成测试
npx jest \
    --config tests/integration/jest.config.js \
    --verbose \
    --coverage \
    --coverageDirectory tests/integration/coverage \
    --testResultsProcessor jest-junit

# 检查测试结果
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 所有集成测试通过！"
    echo "All integration tests passed!"
    
    # 显示覆盖率报告路径
    if [ -f "tests/integration/coverage/lcov-report/index.html" ]; then
        echo "📊 覆盖率报告: tests/integration/coverage/lcov-report/index.html"
    fi
    
    if [ -f "junit.xml" ]; then
        echo "📋 JUnit报告: junit.xml"
    fi
else
    echo ""
    echo "❌ 集成测试失败"
    echo "Integration tests failed"
    exit 1
fi

echo ""
echo "🎉 集成测试完成！"
echo "Integration tests completed!" 
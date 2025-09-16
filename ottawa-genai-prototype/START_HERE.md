# 🚀 Ottawa GenAI Research Assistant Prototype

## 快速启动指南

### 方法1: React开发模式 (推荐)
```bash
cd ottawa-genai-prototype
npm install
npm start
```
然后在浏览器打开 `http://localhost:3000`

### 方法2: 生产构建模式
```bash
cd ottawa-genai-prototype
npm run build
npx serve -s build -p 3001
```
然后在浏览器打开 `http://localhost:3001`

### 方法3: 如果端口被占用
```bash
cd ottawa-genai-prototype
npm start -- --port 3002
```
然后在浏览器打开 `http://localhost:3002`

## 🎯 原型功能测试

1. **首页** - 查看功能概览和快速开始
2. **AI聊天** - 尝试以下问题：
   - "What are the latest business trends in Ottawa?"
   - "Show me employment statistics"
   - "Help me with market research"
3. **文档上传** - 测试PDF上传功能
4. **报告生成** - 查看分析报告示例
5. **设置** - 测试语言切换和无障碍功能

## 📱 设备测试
- 桌面端 (1200px+)
- 平板端 (768px-1199px)
- 移动端 (320px-767px)

## ♿ 无障碍测试
- 键盘导航 (Tab键)
- 屏幕阅读器支持
- 高对比度模式
- 语言切换 (EN/FR)

## 🔧 故障排除

### 如果启动失败：
1. 确保在正确目录：`cd ottawa-genai-prototype`
2. 删除 `node_modules` 并重新安装：
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
3. 检查Node.js版本：`node --version` (需要 >= 16.0.0)

### 如果端口被占用：
```bash
# Windows
taskkill /F /IM node.exe
# 然后重新启动

# 或使用不同端口
npm start -- --port 3003
```

## 📝 项目结构
```
ottawa-genai-prototype/
├── src/
│   ├── components/     # 可复用组件
│   ├── pages/         # 页面组件
│   ├── App.tsx        # 主应用组件
│   └── index.tsx      # 入口文件
├── public/            # 静态资源
└── build/            # 构建输出 (npm run build 后)
```

## 🌟 已实现功能
- ✅ 响应式设计
- ✅ 双语支持 (EN/FR)
- ✅ 无障碍功能 (WCAG 2.1)
- ✅ AI聊天界面
- ✅ 文档上传
- ✅ 报告生成
- ✅ 数据可视化
- ✅ 设置页面

原型已完成！请在浏览器中测试所有功能。 
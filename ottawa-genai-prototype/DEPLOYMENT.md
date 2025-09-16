# 部署指南 - Ottawa GenAI Research Assistant

本指南将帮助您将 Ottawa GenAI Research Assistant 部署到 Render 平台。

## 🚀 快速部署到 Render

### 前提条件

1. **GitHub 账户**：确保您的项目已推送到 GitHub 仓库
2. **Render 账户**：在 [render.com](https://render.com) 注册免费账户
3. **项目文件**：确认项目包含以下关键文件：
   - `package.json` - 项目依赖
   - `render.yaml` - Render 部署配置
   - `build/` 目录 - 构建输出（运行 `npm run build` 生成）

### 方法一：使用 render.yaml 自动部署（推荐）

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

2. **连接 Render 和 GitHub**
   - 登录 [Render Dashboard](https://dashboard.render.com)
   - 点击 "New +" → "Blueprint"
   - 选择您的 GitHub 仓库
   - Render 会自动读取 `render.yaml` 配置

3. **部署**
   - 点击 "Apply" 开始部署
   - 等待构建完成（通常需要 3-5 分钟）
   - 部署成功后，您会获得一个公开的 URL

### 方法二：手动创建服务

1. **创建新的静态站点**
   - 登录 Render Dashboard
   - 点击 "New +" → "Static Site"
   - 连接您的 GitHub 仓库

2. **配置构建设置**
   - **Name**: `ottawa-genai-prototype`
   - **Branch**: `main`
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: `build`

3. **环境变量**（可选）
   - `NODE_VERSION`: `18`
   - `NPM_VERSION`: `9`

4. **部署**
   - 点击 "Create Static Site"
   - 等待构建和部署完成

## 📋 部署配置详情

### render.yaml 配置说明

```yaml
services:
  - type: web
    name: ottawa-genai-prototype
    env: static
    buildCommand: npm ci && npm run build
    staticPublishPath: ./build
    envVars:
      - key: NODE_VERSION
        value: 18
      - key: NPM_VERSION
        value: 9
    headers:
      - path: /*
        name: X-Frame-Options
        value: DENY
      - path: /*
        name: X-Content-Type-Options
        value: nosniff
```

### 关键配置项解释

- **type: web**: 创建 Web 服务
- **env: static**: 静态站点环境
- **buildCommand**: 安装依赖并构建项目
- **staticPublishPath**: 静态文件发布目录
- **headers**: 安全头设置

## 🔧 本地测试

在部署前，建议先本地测试：

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 本地预览构建结果
npx serve -s build
```

## 🌐 部署后验证

部署成功后，验证以下功能：

1. **首页加载**: 确认应用正常启动
2. **路由功能**: 测试不同页面的导航
3. **响应式设计**: 在不同设备上查看
4. **性能**: 检查加载速度

## 🔄 更新部署

每次推送代码到 main 分支，Render 会自动重新部署：

```bash
git add .
git commit -m "Update application"
git push origin main
```

## 📊 监控和日志

- **部署状态**: 在 Render Dashboard 查看部署状态
- **构建日志**: 查看详细的构建和部署日志
- **性能监控**: 使用 Render 内置的性能监控工具

## ⚠️ 常见问题

### 构建失败
- 检查 `package.json` 中的 Node.js 版本兼容性
- 确认所有依赖都在 `package.json` 中声明
- 查看构建日志中的错误信息

### 页面无法访问
- 确认 `build` 目录包含 `index.html` 文件
- 检查路由配置是否正确
- 验证静态资源路径

### 性能问题
- 优化图片和静态资源
- 启用 Gzip 压缩（Render 默认启用）
- 使用 CDN 加速（Render Pro 功能）

## 💰 成本说明

- **免费套餐**: 适合个人项目和原型
  - 750 小时/月的运行时间
  - 100GB 带宽
  - 自定义域名支持

- **付费套餐**: 适合生产环境
  - 无限运行时间
  - 更多带宽
  - 高级功能和支持

## 🔗 有用链接

- [Render 官方文档](https://render.com/docs)
- [React 部署指南](https://create-react-app.dev/docs/deployment/)
- [GitHub 集成文档](https://render.com/docs/github)

---

**祝您部署顺利！** 🎉

如果遇到问题，请查看 Render 的官方文档或联系技术支持。 
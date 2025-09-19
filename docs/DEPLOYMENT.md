# 🚀 Ottawa GenAI Research Assistant - 部署指南

## 📋 部署概览

本项目采用前后端分离架构，分别部署到 Render 平台：

- **前端**: React 应用 → `ottawa-genai-frontend`
- **后端**: FastAPI 应用 → `ottawa-genai-backend`  
- **数据库**: PostgreSQL → `ottawa-genai-db`

## 🔧 部署步骤

### 1. 后端部署

```bash
cd backend
git add render.yaml
git commit -m "Add backend render config"
git push
```

在 Render 控制台：
1. 点击 "New +"
2. 选择 "Blueprint"
3. 连接 GitHub 仓库
4. 选择 `backend/render.yaml`
5. 点击 "Apply"

### 2. 前端部署

```bash
cd frontend  
git add render.yaml
git commit -m "Update frontend render config"
git push
```

在 Render 控制台：
1. 点击 "New +"
2. 选择 "Blueprint" 
3. 连接 GitHub 仓库
4. 选择 `frontend/render.yaml`
5. 点击 "Apply"

## 🌐 访问地址

部署完成后：

- **前端**: https://ottawa-genai-frontend.onrender.com
- **后端 API**: https://ottawa-genai-backend.onrender.com
- **API 文档**: https://ottawa-genai-backend.onrender.com/docs

## 🔑 环境变量配置

### 后端环境变量 (在 Render 控制台设置)

```bash
# AI API Keys (必需)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# 安全配置 (必需)
SECRET_KEY=your_super_secret_key_here

# CORS 配置
ALLOWED_ORIGINS=["https://ottawa-genai-frontend.onrender.com"]

# 其他可选配置
MAX_FILE_SIZE_MB=50
DEFAULT_AI_MODEL=gpt-3.5-turbo
```

### 前端环境变量 (已在 render.yaml 中配置)

```bash
REACT_APP_API_STRATEGY=real
REACT_APP_API_BASE_URL=https://ottawa-genai-backend.onrender.com/api/v1
REACT_APP_FALLBACK_TO_MOCK=true
```

## 📊 部署架构

```
GitHub Repository
├── frontend/
│   ├── render.yaml ← 前端部署配置
│   └── src/
└── backend/
    ├── render.yaml ← 后端部署配置
    └── app/

                    ↓ 自动部署

Render Platform
├── ottawa-genai-frontend (Frontend)
├── ottawa-genai-backend (Backend)  
└── ottawa-genai-db (PostgreSQL)
```

## 🔄 自动部署流程

1. **推送代码** → GitHub 仓库
2. **触发构建** → Render 自动检测变化
3. **构建应用** → 安装依赖、构建前端
4. **部署上线** → 自动替换旧版本
5. **健康检查** → 确保服务正常运行

## 🛠️ 故障排查

### 常见问题

1. **构建失败**
   - 检查 `requirements.txt` 依赖
   - 查看 Render 构建日志

2. **API 连接失败**  
   - 确认后端服务已启动
   - 检查 CORS 配置
   - 验证环境变量设置

3. **数据库连接问题**
   - 确认 PostgreSQL 服务运行
   - 检查 `DATABASE_URL` 环境变量

### 查看日志

在 Render 控制台：
1. 进入对应服务
2. 点击 "Logs" 标签
3. 查看实时日志输出

## 🎯 生产环境注意事项

- ✅ 设置强密码的 `SECRET_KEY`
- ✅ 配置正确的 `ALLOWED_ORIGINS`
- ✅ 添加必需的 API Keys
- ✅ 启用 HTTPS (Render 自动提供)
- ✅ 监控服务健康状态

## 🚀 快速开始

如果是第一次部署，只需：

```bash
git add .
git commit -m "Ready for deployment"
git push
```

然后在 Render 控制台分别创建两个 Blueprint 服务即可！ 
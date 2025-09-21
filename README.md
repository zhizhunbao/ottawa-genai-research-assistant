# 🏛️ Ottawa GenAI Research Assistant | 渥太华生成式AI研究助手

[![CI Pipeline](https://github.com/username/ottawa-genai-research-assistant/actions/workflows/ci.yml/badge.svg)](https://github.com/username/ottawa-genai-research-assistant/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/username/ottawa-genai-research-assistant/actions/workflows/deploy-github-pages.yml/badge.svg)](https://github.com/username/ottawa-genai-research-assistant/actions/workflows/deploy-github-pages.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen)](https://username.github.io/ottawa-genai-research-assistant)

A comprehensive AI-powered research assistant application designed for Ottawa City government, featuring intelligent research capabilities, document analysis, and bilingual support.

基于AI的综合研究助手应用，专为渥太华市政府设计，具备智能研究功能、文档分析和双语支持。

## 🚀 Live Demo | 在线演示

**[🌐 Access the live application](https://ottawa-genai-frontend.onrender.com)**

*Production deployment powered by Render platform.*

*生产环境由 Render 平台提供支持。*

## 🌟 Features | 功能特性

### ✅ Core Features | 核心功能
- 🤖 **AI-Powered Chat** | AI智能对话 - OpenAI GPT-4 integration
- 🔐 **Google OAuth 2.0** | 谷歌身份验证 - Secure authentication with JWT token verification
- 👤 **Intelligent User Management** | 智能用户管理 - Auto-create users from Google accounts with smart username generation
- 📄 **Document Management** | 文档管理 - Upload, analyze, and manage documents
- 📊 **Report Generation** | 报告生成 - Automated research reports
- 🌐 **Bilingual Support** | 双语支持 - English/French (EN/FR)
- ♿ **Accessibility** | 无障碍 - WCAG 2.1 compliant
- 📱 **Responsive Design** | 响应式设计 - Modern, mobile-friendly UI

### 🏗️ Architecture | 系统架构
- **Frontend**: React 18 + TypeScript + Context API
- **Backend**: FastAPI + Pydantic + Repository Pattern
- **Storage**: JSON file storage (monk/ directory)
- **Authentication**: JWT + Google OAuth 2.0
- **AI Integration**: OpenAI API

## 📁 Project Structure | 项目结构

```
ottawa-genai-research-assistant/
├── 📚 docs/                      # Documentation | 文档
│   ├── CODING_STANDARDS.md              # 🚫 Coding standards & NO TODO rules
│   ├── 编码规范.md                       # 🚫 中文编码规范 & 禁止TODO规则
│   ├── System Architecture Guide.md      # English architecture guide
│   ├── 系统架构指南.md                    # Chinese architecture guide
│   ├── Data Management Guide.md          # English data management
│   ├── 数据管理指南.md                    # Chinese data management
│   ├── Project Status Report.md          # English status report
│   ├── 项目现状报告.md                    # Chinese status report
│   ├── Product Requirements Document (PRD).md   # English PRD
│   └── 产品需求文档（PRD）.md             # Chinese PRD
├── 🚀 backend/                   # Backend API Service | 后端API服务
│   ├── app/                     # FastAPI Application | FastAPI应用
│   │   ├── api/                # API Routes | API路由
│   │   │   ├── auth.py         # Authentication endpoints
│   │   │   ├── chat.py         # Chat conversation endpoints
│   │   │   ├── documents.py    # Document management endpoints
│   │   │   ├── reports.py      # Report generation endpoints
│   │   │   ├── users.py        # User management endpoints
│   │   │   └── settings.py     # System settings endpoints
│   │   ├── core/               # Core Configuration | 核心配置
│   │   │   ├── config.py       # Application configuration
│   │   │   └── security.py     # Security & authentication
│   │   ├── models/             # Data Models | 数据模型
│   │   │   ├── user.py         # User data model
│   │   │   ├── document.py     # Document data model
│   │   │   ├── report.py       # Report data model
│   │   │   └── chat.py         # Chat data model
│   │   ├── repositories/       # Data Repositories | 数据仓库
│   │   │   ├── base.py         # Base repository class
│   │   │   ├── user_repository.py      # User repository
│   │   │   ├── document_repository.py  # Document repository
│   │   │   ├── report_repository.py    # Report repository
│   │   │   └── chat_repository.py      # Chat repository
│   │   ├── services/           # Business Logic | 业务逻辑
│   │   │   ├── user_service.py         # User service
│   │   │   ├── document_service.py     # Document service
│   │   │   ├── report_service.py       # Report service
│   │   │   └── chat_service.py         # AI chat service
│   │   └── __init__.py        # Package initialization | 包初始化
│   ├── monk/                  # Data Storage | 数据存储
│   │   ├── users/            # User data files
│   │   ├── documents/        # Document files
│   │   ├── reports/          # Generated reports
│   │   └── chats/            # Chat conversations
│   ├── uploads/              # File Upload Directory | 文件上传目录
│   ├── main.py              # FastAPI entry point | FastAPI入口
│   ├── Dockerfile           # Container configuration | 容器配置
│   └── requirements.txt      # Python Dependencies | Python依赖
├── 🎨 frontend/                 # React Frontend | React前端
│   ├── public/               # Static Assets | 静态资源
│   ├── src/                  # Source Code | 源代码
│   │   ├── components/       # React Components | React组件
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── ui/          # UI components
│   │   │   └── Navbar.tsx   # Navigation bar
│   │   ├── pages/           # Page Components | 页面组件
│   │   │   ├── HomePage.tsx            # Home page
│   │   │   ├── ChatPage.tsx            # AI chat interface
│   │   │   ├── DocumentUploadPage.tsx  # Document upload
│   │   │   ├── ReportPage.tsx          # Report generation
│   │   │   └── SettingsPage.tsx        # User settings
│   │   ├── contexts/        # React Context | React上下文
│   │   │   ├── AuthContext.tsx        # Authentication state
│   │   │   ├── LanguageContext.tsx     # Language management
│   │   │   └── ThemeContext.tsx        # Theme management
│   │   ├── services/        # API Services | API服务
│   │   │   ├── api.ts                 # API service
│   │   │   ├── authService.ts         # Authentication service
│   │   │   └── mockApi.ts             # Mock data service
│   │   ├── config/          # Configuration | 配置
│   │   │   └── googleAuth.ts          # Google OAuth config
│   │   ├── App.tsx          # Root Component | 根组件
│   │   └── index.tsx        # Application Entry | 应用入口
│   ├── package.json         # Project Configuration | 项目配置
│   ├── tsconfig.json        # TypeScript Configuration | TS配置
│   └── Dockerfile          # Container Configuration | 容器配置
├── docker-compose.yml       # Docker Compose Configuration | Docker编排
├── .env.example            # Environment Variables Template | 环境变量模板
└── README.md               # Project Documentation | 项目文档
```

## 🚀 Quick Start | 快速开始

### Prerequisites | 前置要求
- **Node.js** 18+ and npm
- **Python** 3.8+
- **Google OAuth 2.0** Client ID
- **OpenAI API** Key

### 1. Environment Setup | 环境设置

Create environment files | 创建环境变量文件：

```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment  
cp frontend/.env.example frontend/.env.local
```

Configure your API keys | 配置API密钥：

```bash
# backend/.env (只需要这两个必需的配置)
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_CLIENT_ID=your_google_client_id_here

# frontend/.env.local (只需要这两个必需的配置)
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
```

### 2. Backend Setup | 后端设置

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start backend service
uvicorn app.main:app --reload --port 8000
```

Backend API will be available at | 后端API地址: http://localhost:8000

### 3. Frontend Setup | 前端设置

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start frontend service
npm start
```

Frontend application will be available at | 前端应用地址: http://localhost:3000

### 4. Docker Setup (Alternative) | Docker设置（可选）

```bash
# Start all services with Docker Compose
docker-compose up --build

# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

## 🔐 Google OAuth Setup | Google OAuth设置

### 1. Google Cloud Console Configuration | 谷歌云控制台配置

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google Identity Services API**
4. Go to "Credentials" page
5. Click "Create Credentials" → "OAuth 2.0 Client ID"
6. Select "Web application"
7. Add authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - Your production domain
8. Add authorized redirect URIs (if needed):
   - `http://localhost:3000/auth/callback`
9. Copy the generated **Client ID** and **Client Secret**

### 2. Application Configuration | 应用配置

Add your Google OAuth credentials to environment files | 将Google OAuth凭据添加到环境文件：

```bash
# frontend/.env.local
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here

# backend/.env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### 3. How Google OAuth Works | Google OAuth工作原理

1. **Frontend Authentication** | 前端认证
   - User clicks "Sign in with Google" button
   - Google Identity Services popup appears
   - User selects Google account and grants permissions
   - Google returns JWT credential token

2. **Backend Verification** | 后端验证
   - Frontend sends JWT token to `/api/v1/auth/google`
   - Backend decodes JWT and extracts user information
   - System checks if user exists by email
   - If new user: creates account with smart username generation
   - If existing user: updates last login timestamp
   - Returns application JWT token for authenticated sessions

3. **Smart Username Generation** | 智能用户名生成
   - Primary: Uses Google display name (e.g., "John Doe" → "john_doe")
   - Fallback: Uses email prefix if name unavailable
   - Uniqueness: Adds numeric suffix if username exists (e.g., "john_doe_1")

## 📊 API Documentation | API文档

After starting the backend service, access API documentation at | 启动后端服务后，访问API文档：

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Core API Endpoints | 核心API端点

```
🔐 Authentication | 身份验证
  POST   /api/v1/auth/login       # User login
  POST   /api/v1/auth/google      # Google OAuth login
  POST   /api/v1/auth/logout      # User logout
  GET    /api/v1/auth/me          # Get current user

💬 Chat Interface | 聊天界面
  POST   /api/v1/chat/message     # Send chat message
  GET    /api/v1/chat/history     # Get chat history
  DELETE /api/v1/chat/{id}        # Delete conversation

📄 Document Management | 文档管理
  POST   /api/v1/documents/upload # Upload document
  GET    /api/v1/documents        # List documents
  GET    /api/v1/documents/{id}   # Get document
  DELETE /api/v1/documents/{id}   # Delete document
```

## 📚 Documentation | 项目文档

### English Documentation
- [📋 System Architecture Guide](./docs/System%20Architecture%20Guide.md) - Complete system architecture
- [🗄️ Data Management Guide](./docs/Data%20Management%20Guide.md) - Data management strategies
- [📊 Project Status Report](./docs/Project%20Status%20Report.md) - Current project status
- [📋 Product Requirements Document](./docs/Product%20Requirements%20Document%20(PRD).md) - Product requirements
- [🚀 Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment guide

### Chinese Documentation | 中文文档
- [📋 系统架构指南](./docs/系统架构指南.md) - 完整系统架构说明
- [🗄️ 数据管理指南](./docs/数据管理指南.md) - 数据管理策略
- [📊 项目现状报告](./docs/项目现状报告.md) - 当前项目状态
- [📋 产品需求文档（PRD）](./docs/产品需求文档（PRD）.md) - 产品需求说明
- [🚀 部署指南](./docs/DEPLOYMENT.md) - 生产环境部署指南

## 🧪 Development | 开发指南

### Running Tests | 运行测试

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Code Formatting | 代码格式化

```bash
# Backend formatting
cd backend
black .
isort .

# Frontend formatting
cd frontend
npm run format
npm run lint
```

### Development Mode | 开发模式

The application supports different API strategies | 应用支持不同的API策略：

```bash
# Mock mode (frontend only)
REACT_APP_API_STRATEGY=mock

# Hybrid mode (real API with mock fallback)
REACT_APP_API_STRATEGY=hybrid

# Real API mode (full integration)
REACT_APP_API_STRATEGY=real
```

## 🚢 Deployment | 部署

### 🎯 Production Deployment | 生产环境部署

**推荐使用 Render 平台进行一键部署：**

1. **快速部署** | Quick Deploy:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **在 Render 控制台创建 Blueprint 服务**
   - 前端服务: `ottawa-genai-frontend`
   - 后端服务: `ottawa-genai-backend`
   - 数据库: PostgreSQL

3. **访问地址** | Live URLs:
   - 🌐 **Frontend**: https://ottawa-genai-frontend.onrender.com
   - 🔗 **Backend API**: https://ottawa-genai-backend.onrender.com
   - 📚 **API Docs**: https://ottawa-genai-backend.onrender.com/docs

📖 **完整部署指南**: [DEPLOYMENT.md](./docs/DEPLOYMENT.md) - 详细的部署步骤、环境配置和故障排查

### 🛠️ Development Deployment | 开发环境部署

### GitHub Pages (前端演示)

**Quick Start** | 快速开始:

1. **Configure homepage** | 配置主页:
   ```bash
   # Update frontend/package.json
   "homepage": "https://YOUR_USERNAME.github.io/ottawa-genai-research-assistant"
   ```

2. **Enable GitHub Pages** | 启用 GitHub Pages:
   - Go to repository **Settings** > **Pages**
   - Set Source to **GitHub Actions**

3. **Deploy** | 部署:
   ```bash
   git push origin main  # Triggers automatic deployment
   ```

### Docker Deployment | Docker部署

```bash
# Build and start all services
docker-compose up --build

# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

## 📈 Version Updates | 版本更新

### v1.2.0 (Latest) - Google OAuth Integration | Google OAuth集成
- ✅ **Real Google OAuth 2.0 Login** | 真实Google OAuth 2.0登录
- ✅ **JWT Token Verification** | JWT令牌验证  
- ✅ **Smart User Creation** | 智能用户创建
- ✅ **Username Generation Algorithm** | 用户名生成算法
- ✅ **Automatic Account Linking** | 自动账户关联
- ✅ **Enhanced Security** | 增强安全性

### v1.1.0 - Core Features | 核心功能
- ✅ AI-powered chat interface
- ✅ Document management system
- ✅ Report generation capabilities
- ✅ Bilingual support (EN/FR)
- ✅ Responsive design

### v1.0.0 - Initial Release | 初始版本
- ✅ Basic authentication system
- ✅ FastAPI backend architecture
- ✅ React frontend framework
- ✅ Mock API integration

## 🤝 Contributing | 贡献指南

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📝 License | 许可证

This project is developed for Ottawa Economic Development.

本项目为渥太华经济发展部门开发。

## 🆘 Support | 技术支持

For issues and questions | 问题和疑问：
- Create an issue on GitHub
- Check documentation in `docs/` directory
- Review API documentation at `/docs` endpoint

---

**Built with ❤️ for Ottawa City Government | 为渥太华市政府倾情打造** 
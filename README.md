# Ottawa GenAI 研究助手

这是一个基于AI的研究助手应用，为渥太华市政府提供智能研究和分析功能。

## 功能特性

- ✅ Google OAuth 2.0 用户认证
- ✅ FastAPI 后端 API
- ✅ React 前端界面
- ✅ 用户管理系统
- ✅ 基于AI的研究助手功能
- ✅ 响应式现代UI设计

## 项目结构

```
ottawa-genai-research-assistant/
├── backend/                  # 后端API服务
│   ├── app/                 # FastAPI应用
│   │   ├── api/            # API路由
│   │   ├── core/           # 核心配置
│   │   ├── models/         # 数据模型
│   │   ├── repositories/   # 数据仓库
│   │   └── services/       # 业务逻辑
│   └── monk/               # 数据存储
├── frontend/               # React前端应用
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── pages/         # 页面组件
│   │   └── services/      # API服务
│   └── public/
└── README.md
```

## 快速开始

### 后端设置

1. **安装Python依赖**
```bash
cd backend
pip install -r requirements.txt
```

2. **启动后端服务**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

后端API将在 http://localhost:8000 启动

### 前端设置

1. **安装Node.js依赖**
```bash
cd frontend
npm install
```

2. **启动前端服务**
```bash
cd frontend
npm start
```

前端应用将在 http://localhost:3000 启动

## Google OAuth 设置

### 1. 获取 Google Client ID

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google Identity Services API
4. 转到"凭据"页面
5. 点击"创建凭据" → "OAuth 2.0 客户端 ID"
6. 选择"Web 应用程序"
7. 添加授权的 JavaScript 来源：
   - `http://localhost:3000` (开发环境)
   - 您的生产域名
8. 复制生成的客户端 ID

### 2. 配置应用

#### 选项 1: 环境变量 (推荐)
创建 `frontend/.env.local` 文件：
```
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
```

#### 选项 2: 直接修改代码
在 `frontend/src/components/GoogleLoginButton.tsx` 中修改：
```typescript
const GOOGLE_CLIENT_ID = 'your_google_client_id_here';
```

### 3. 测试登录

1. 确保前后端服务都在运行
2. 访问 http://localhost:3000
3. 点击 Google 登录按钮
4. 使用 Google 账号登录

### OAuth 注意事项

- 开发环境需要使用 `http://localhost:3000`
- 生产环境必须使用 HTTPS
- 确保域名已添加到 Google Console 的授权列表中

### 当前OAuth实现

- ✅ 使用真实的 Google OAuth 2.0 API
- ✅ 获取用户真实信息 (姓名、邮箱、头像)
- ✅ 与后端用户系统集成
- ✅ JWT token认证

## API文档

启动后端服务后，访问以下地址查看API文档：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 开发指南

### 运行测试

后端测试：
```bash
cd backend
pytest
```

前端测试：
```bash
cd frontend
npm test
```

### 代码格式化

后端：
```bash
cd backend
black .
```

前端：
```bash
cd frontend
npm run format
```

## 部署

### 生产环境配置

1. 设置环境变量
2. 配置Google OAuth生产域名
3. 构建前端应用：`npm run build`
4. 配置反向代理服务器 
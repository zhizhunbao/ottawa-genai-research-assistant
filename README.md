# ottawa-genai-research-assistant

Enterprise-grade research assistant for the City of Ottawa

## 快速开始

### 前置要求

- Node.js >= 16.0.0
- uv (推荐)
- Python >=3.12

### 安装依赖

```bash
uv sync
```

### 环境配置

```bash
cp .env.example .env.local
```

配置以下环境变量：

| 变量名 | 描述 | 示例值 |
|--------|------|--------|
| `APP_NAME` | 配置项 | `Ottawa GenAI Research Assistant` |
| `APP_ENV` | 配置项 | `development` |
| `DEBUG` | 配置项 | `true` |
| `HOST` | 配置项 | `0.0.0.0` |
| `PORT` | 端口号 | `8000` |
| `DATABASE_URL` | 服务地址 | `sqlite+aiosqlite:///./app.db` |
| `SECRET_KEY` | 密钥/签名 Key | `your-secret-key-here-change-in-production` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 配置项 | `30` |
| `ALGORITHM` | 配置项 | `HS256` |
| `AZURE_OPENAI_ENDPOINT` | 服务地址 | `https://your-resource.openai.azure.com/` |
| `AZURE_OPENAI_API_KEY` | API 密钥 | `your-api-key` |
| `AZURE_OPENAI_DEPLOYMENT` | 配置项 | `gpt-4` |
| `AZURE_OPENAI_API_VERSION` | 配置项 | `2024-02-15-preview` |
| `AZURE_SEARCH_ENDPOINT` | 服务地址 | `https://your-search.search.windows.net` |
| `AZURE_SEARCH_API_KEY` | API 密钥 | `your-search-api-key` |
| `AZURE_SEARCH_INDEX_NAME` | 配置项 | `research-index` |
| `CORS_ORIGINS` | 配置项 | `["http://localhost:3000","http://localhost:5173"]` |



### 运行项目

```bash
# 开发模式
uv run start

# 构建项目
# 构建脚本待配置

# 运行测试
uv run test
```

## 项目结构

详细架构请参考 [架构文档](docs/codemaps/index.md)

### 主要模块

- [后端服务 (Backend)](backend/README.md) - FastAPI + Python 核心逻辑
- [前端应用 (Frontend)](frontend/README.md) - React + Vite 用户界面

### 目录说明

- `backend/` - 后端服务 (FastAPI)
- `frontend/` - 前端应用 (React)
- `docs/` - 项目文档
- `.agent/` - AI 助手配置与 Skills

## 可用脚本

| 脚本 | 命令 | 描述 |
|------|------|------|
| `test` | `pytest` | 运行测试 |
| `start` | `uvicorn backend.app.main:app --reload` | 启动生产服务器 |


## 文档

- [设置指南](docs/guides/setup.md) - 详细的开发环境设置
- [API 参考](docs/guides/api.md) - API 接口文档
- [贡献指南](docs/project/contributing.md) - 如何参与项目开发
- [变更日志](docs/project/changelog.md) - 项目历史记录
- [架构设计](docs/codemaps/index.md) - 系统架构概览

## 技术栈

### 主要依赖

- **fastapi** latest - 高性能 API 框架
- **uvicorn[standard** latest - ASGI 服务器
- **i18next** ^25.8.0 - 核心依赖库
- **lucide-react** ^0.563.0 - React 框架
- **react** ^18.2.0 - React 框架
- **react-dom** ^18.2.0 - React 框架
- **react-i18next** ^16.5.3 - React 框架
- **react-markdown** ^10.1.0 - React 框架
- **react-router-dom** ^6.21.0 - React 框架
- **zustand** ^4.4.0 - 核心依赖库

### 开发工具

- **@typescript-eslint/eslint-plugin** ^6.0.0 - 核心依赖库
- **@typescript-eslint/parser** ^6.0.0 - 核心依赖库
- **eslint** ^8.55.0 - 核心依赖库
- **eslint-plugin-react-hooks** ^4.6.0 - React 框架
- **eslint-plugin-react-refresh** ^0.4.5 - React 框架
- **prettier** ^3.1.0 - 核心依赖库
- **typescript** ^5.3.0 - 核心依赖库
- **vitest** ^1.0.0 - 核心依赖库

## 许可证

Apache-2.0

---

*由 update-docs.js 自动生成 - 最后更新: 2026-01-24*

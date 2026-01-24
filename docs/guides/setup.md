# 开发环境设置指南

**最后更新:** 2026-01-24

## 系统要求

### 必需软件

- **Node.js** >= 16.0.0 ([下载地址](https://nodejs.org/))
- **Git** ([下载地址](https://git-scm.com/))
- **uv** ([安装指南](https://docs.astral.sh/uv/))

### 推荐工具

- **VS Code** - 推荐的代码编辑器
- **Docker** - 容器化开发 (可选)
- **Postman** - API 测试工具 (可选)

## 安装步骤

### 1. 克隆项目

```bash
git clone <repository-url>
cd ottawa-genai-research-assistant
```

### 2. 安装依赖

```bash
uv sync
```

### 3. 环境配置


复制环境变量模板：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，配置以下变量：


#### APP_NAME
- **描述**: 配置项
- **示例值**: `Ottawa GenAI Research Assistant`


#### APP_ENV
- **描述**: 配置项
- **示例值**: `development`


#### DEBUG
- **描述**: 配置项
- **示例值**: `true`


#### HOST
- **描述**: 配置项
- **示例值**: `0.0.0.0`


#### PORT
- **描述**: 端口号
- **示例值**: `8000`


#### DATABASE_URL
- **描述**: 服务地址
- **示例值**: `sqlite+aiosqlite:///./app.db`


#### SECRET_KEY
- **描述**: 密钥/签名 Key
- **示例值**: `your-secret-key-here-change-in-production`


#### ACCESS_TOKEN_EXPIRE_MINUTES
- **描述**: 配置项
- **示例值**: `30`


#### ALGORITHM
- **描述**: 配置项
- **示例值**: `HS256`


#### AZURE_OPENAI_ENDPOINT
- **描述**: 服务地址
- **示例值**: `https://your-resource.openai.azure.com/`


#### AZURE_OPENAI_API_KEY
- **描述**: API 密钥
- **示例值**: `your-api-key`


#### AZURE_OPENAI_DEPLOYMENT
- **描述**: 配置项
- **示例值**: `gpt-4`


#### AZURE_OPENAI_API_VERSION
- **描述**: 配置项
- **示例值**: `2024-02-15-preview`


#### AZURE_SEARCH_ENDPOINT
- **描述**: 服务地址
- **示例值**: `https://your-search.search.windows.net`


#### AZURE_SEARCH_API_KEY
- **描述**: API 密钥
- **示例值**: `your-search-api-key`


#### AZURE_SEARCH_INDEX_NAME
- **描述**: 配置项
- **示例值**: `research-index`


#### CORS_ORIGINS
- **描述**: 配置项
- **示例值**: `["http://localhost:3000","http://localhost:5173"]`



### 4. 启动开发服务器

```bash
uv run start
```

## 开发工作流

### 日常开发

1. **启动开发服务器**
   ```bash
   uv run start
   ```

2. **运行测试**
   ```bash
   uv run test
   ```

## VS Code 配置

推荐的 VS Code 扩展：

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss"
  ]
}
```

---

*由 update-docs.js 自动生成 - 2026-01-24T22:08:02.323Z*

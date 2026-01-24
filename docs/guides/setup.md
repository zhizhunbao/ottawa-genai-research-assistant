# 开发环境设置指南

**最后更新:** 2026-01-23

---

## 系统要求

### 必需软件

| 软件        | 版本   | 下载地址                            |
| ----------- | ------ | ----------------------------------- |
| **Python**  | ≥ 3.12 | [python.org](https://python.org/)   |
| **Node.js** | ≥ 18.0 | [nodejs.org](https://nodejs.org/)   |
| **Git**     | 最新   | [git-scm.com](https://git-scm.com/) |
| **uv**      | 最新   | `pip install uv`                    |

### 推荐工具

- **VS Code** - 推荐的代码编辑器
- **Docker** - 容器化开发 (可选)
- **Azure CLI** - Azure 服务管理

---

## 安装步骤

### 1. 克隆项目

```powershell
git clone <repository-url>
cd ottawa-genai-research-assistant
```

### 2. 后端设置

```powershell
# 进入后端目录
cd backend

# 安装依赖（使用 uv）
uv sync

# 创建环境变量文件
Copy-Item .env.example .env
# 编辑 .env 填写 Azure 凭证
```

### 3. 前端设置

```powershell
# 进入前端目录
cd frontend

# 安装依赖
npm install
```

### 4. 环境配置

在 `backend/.env` 中配置：

```bash
# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://xxx.openai.azure.com/
AZURE_OPENAI_KEY=your-key-here
AZURE_OPENAI_DEPLOYMENT_GPT4=gpt-4o
AZURE_OPENAI_DEPLOYMENT_EMBEDDING=text-embedding-ada-002

# Azure AI Search
AZURE_SEARCH_ENDPOINT=https://xxx.search.windows.net
AZURE_SEARCH_KEY=your-key-here
AZURE_SEARCH_INDEX=documents

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=your-connection-string
AZURE_STORAGE_CONTAINER=documents
```

---

## 启动开发服务器

### 后端 (FastAPI)

```powershell
cd backend
uv run uvicorn app.main:app --reload --port 8000
```

后端将在 http://localhost:8000 运行

### 前端 (React)

```powershell
cd frontend
npm run dev
```

前端将在 http://localhost:3000 运行

---

## 开发工作流

### 日常开发

1. **启动服务器**

   ```powershell
   # 终端 1 - 后端
   cd backend; uv run uvicorn app.main:app --reload

   # 终端 2 - 前端
   cd frontend; npm run dev
   ```

2. **运行测试**

   ```powershell
   # 后端测试
   cd backend; uv run pytest

   # 前端测试
   cd frontend; npm test
   ```

3. **代码检查**

   ```powershell
   # Python 类型检查
   cd backend; uv run mypy app/

   # TypeScript 类型检查
   cd frontend; npm run type-check
   ```

4. **代码格式化**

   ```powershell
   # Python
   cd backend; uv run ruff format .

   # TypeScript/JavaScript
   cd frontend; npm run format
   ```

### 构建生产版本

```powershell
# 前端构建
cd frontend; npm run build

# 后端无需构建，直接部署即可
```

---

## 常用命令速查

### 后端 (Python)

| 命令                                   | 功能           |
| -------------------------------------- | -------------- |
| `uv run uvicorn app.main:app --reload` | 启动开发服务器 |
| `uv run pytest`                        | 运行测试       |
| `uv run pytest --cov=app`              | 测试 + 覆盖率  |
| `uv run mypy app/`                     | 类型检查       |
| `uv run ruff check .`                  | 代码检查       |
| `uv run ruff format .`                 | 代码格式化     |

### 前端 (TypeScript)

| 命令                 | 功能           |
| -------------------- | -------------- |
| `npm run dev`        | 启动开发服务器 |
| `npm test`           | 运行测试       |
| `npm run build`      | 生产构建       |
| `npm run type-check` | 类型检查       |
| `npm run lint`       | 代码检查       |
| `npm run format`     | 代码格式化     |

---

## 故障排除

### 依赖安装失败

```powershell
# Python - 重新创建虚拟环境
cd backend
Remove-Item -Recurse -Force .venv
uv sync

# Node.js - 重新安装
cd frontend
Remove-Item -Recurse -Force node_modules
npm install
```

### 端口被占用

```powershell
# 查找占用端口的进程
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# 杀死进程
taskkill /PID <pid> /F
```

### Azure 连接问题

1. 确认 `.env` 文件存在且变量正确
2. 检查 Azure 服务状态
3. 验证 API 密钥是否有效

---

## VS Code 配置

### 推荐扩展

```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.vscode-pylance",
    "charliermarsh.ruff",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### 工作区设置

```json
{
  "editor.formatOnSave": true,
  "python.defaultInterpreterPath": "${workspaceFolder}/backend/.venv/Scripts/python.exe",
  "[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## 相关文档

- [AGENTS.md](../../AGENTS.md) - 项目主配置
- [系统架构](../ARCHITECTURE/system-architecture.md) - 架构详情
- [代码地图](../CODEMAPS/INDEX.md) - 代码结构

---

_此文档由开发团队维护 - 最后更新: 2026-01-23_

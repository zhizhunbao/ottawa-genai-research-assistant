# Ottawa GenAI Research Assistant

**Version**: 2.0 | **Status**: Phase 1 - Development

---

## 项目概述

基于 RAG (Retrieval-Augmented Generation) 的 AI 研究助手，为渥太华市经济发展 (EcDev) 分析师提供智能问答、报告生成和数据可视化服务。

### 核心功能

- 🤖 **智能问答** - 基于经济发展报告的自然语言查询
- 📄 **文档分析** - PDF 语料库处理与语义搜索
- 📊 **可视化生成** - 自动图表和报告生成
- 🔗 **源引用追踪** - 可信度评分和引用验证

---

## 技术栈

### 后端

- **框架**: FastAPI + Python 3.12+
- **AI 服务**: Azure OpenAI (GPT-4o, ADA-002)
- **向量存储**: Azure AI Search
- **文档存储**: Azure Blob Storage

### 前端

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **状态管理**: Zustand

### 基础设施

- **云平台**: Microsoft Azure
- **容器**: Docker
- **CI/CD**: GitHub Actions

---

## 核心规则

### 代码规范 (参考 `.agent/skills/dev-coding_standards/`)

- **不可变性**: 永远不直接修改对象或数组，使用展开操作符
- **类型安全**: TypeScript 使用严格类型，Python 使用 Pydantic + type hints
- **文件大小**: 200-400 行为宜，最大 800 行
- **函数大小**: 最大 50 行，复杂逻辑拆分
- **嵌套深度**: 最大 4 层，使用 early return

### 测试要求 (参考 `.agent/skills/dev-tdd_workflow/`)

- **TDD 流程**: 先写测试，再实现代码
- **覆盖率**: 最低 80%
- **测试类型**: 单元测试 + 集成测试 + E2E 测试

### 安全规则 (参考 `.agent/workflows/security-guidelines.md`)

- **无硬编码密钥**: 所有敏感信息存储在 Azure Key Vault
- **环境变量**: 使用 `.env` 文件（不提交到 Git）
- **输入验证**: Pydantic (后端) + Zod (前端)
- **参数化查询**: 防止 SQL 注入

### Git 工作流 (参考 `.agent/workflows/git-workflow.md`)

- **提交格式**: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- **分支策略**: 不直接提交到 main
- **PR 要求**: 所有测试通过

---

## 项目结构

项目结构参考以下 skills 中的规范：

- **后端结构**: `.agent/skills/dev-backend_patterns/` - Repository/Service 分层架构
- **前端结构**: `.agent/skills/dev-frontend_patterns/` - React 组件化架构
- **文档结构**: `.agent/skills/dev-project_docs/` - 文档体系和自动化

---

## 可用工作流

使用斜杠命令调用工作流：

### 开发流程

| 命令           | 功能                            |
| -------------- | ------------------------------- |
| `/plan`        | ⭐ 实现前规划，等待确认后再编码 |
| `/code-review` | 代码审查（安全 + 质量）         |
| `/build-fix`   | 逐步修复构建错误                |

### 代码标准

| 命令                    | 功能             |
| ----------------------- | ---------------- |
| `/code-quality`         | 代码质量标准检查 |
| `/security-guidelines`  | 安全问题检查     |
| `/testing-requirements` | 测试要求和 TDD   |

### 测试与重构

| 命令              | 功能                       |
| ----------------- | -------------------------- |
| `/e2e`            | 生成 E2E 测试 (Playwright) |
| `/refactor-clean` | 清理死代码和未使用导入     |

### 参考指南

| 命令                | 功能                    |
| ------------------- | ----------------------- |
| `/performance`      | 性能优化建议            |
| `/patterns`         | 设计模式参考            |
| `/git-workflow`     | Git 规范                |
| `/windows-commands` | Windows PowerShell 命令 |

---

## 环境变量

```bash
# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://xxx.openai.azure.com/
AZURE_OPENAI_KEY=<from-key-vault>
AZURE_OPENAI_DEPLOYMENT_GPT4=gpt-4o
AZURE_OPENAI_DEPLOYMENT_EMBEDDING=text-embedding-ada-002

# Azure AI Search
AZURE_SEARCH_ENDPOINT=https://xxx.search.windows.net
AZURE_SEARCH_KEY=<from-key-vault>
AZURE_SEARCH_INDEX=documents

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=<from-key-vault>
AZURE_STORAGE_CONTAINER=documents
```

---

## 开发命令

### 后端

```powershell
# 启动开发服务器
uv run uvicorn app.main:app --reload

# 运行测试
uv run pytest

# 类型检查
uv run mypy app/
```

### 前端

```powershell
# 启动开发服务器
npm run dev

# 运行测试
npm test

# 类型检查
npm run type-check
```

---

## 成功标准

- ✅ 所有测试通过（覆盖率 ≥ 80%）
- ✅ 无安全漏洞
- ✅ 代码可读性和可维护性
- ✅ 响应时间 < 3秒 (P95)
- ✅ RAG 准确率 ≥ 75%
- ✅ 忠实度 ≥ 90%

---

## 相关文档

- [系统架构](docs/ARCHITECTURE/system-architecture.md)
- [产品需求文档](docs/REQUIREMENTS/PRD.md)
- [设置指南](docs/GUIDES/setup.md)
- [代码地图](docs/CODEMAPS/INDEX.md)

---

_此配置文件供 Antigravity AI 助手使用，自动提供项目上下文_

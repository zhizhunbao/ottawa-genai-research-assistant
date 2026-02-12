# 🏗️ Ottawa GenAI — Template System Design (v3.4)

> **最后更新**: 2026-02-11
> **设计原则**: 只收录 **通用、可复用** 的工业级模板，去除项目自研模板

本文档定义了 `.agent/templates/` 中**通用模板**的完整蓝图。每个模板均可追溯到 `.github/references/` 中的具体参考项目。

---

## 📐 1. 设计原则

| 原则               | 说明                                                                               |
| :----------------- | :--------------------------------------------------------------------------------- |
| **有据可查** | 每个模板必须有来自 references 的明确出处                                           |
| **通用复用** | 不收录项目特定逻辑 (如特定业务 chunker/generator 等)；Azure 层只收录平台级通用模式 |
| **行业标准** | 遵循 Netflix/Dispatch、FastAPI 官方、bulletproof-react 等公认最佳实践              |
| **渐进增强** | 新模板可叠加引入，不破坏已有结构                                                   |

---

## 📂 2. 模板文档索引

| # | 文档 | 层级 | 模板数 | 说明 |
|---|------|------|--------|------|
| A | [01-backend-templates.md](./01-backend-templates.md) | ⚡ Backend | 18 | FastAPI / Python 后端模板 (core + domain + shared) |
| B | [02-frontend-templates.md](./02-frontend-templates.md) | 🌐 Frontend | 18 | React / TypeScript 前端模板 (lib + feature + layout + data-table + context + hooks + AI chat) |
| C | [03-ai-agent-templates.md](./03-ai-agent-templates.md) | 🤖 AI Agent | 4 | MetaGPT Role → Action → Memory 架构 |
| D | [04-azure-cloud-templates.md](./04-azure-cloud-templates.md) | ☁️ Azure / Cloud | 6 | Azure 平台级通用模式 |
| E | [05-orchestration-templates.md](./05-orchestration-templates.md) | 🚀 Multi-Agent | 6 | JDGenie Plan-and-Execute 双层调度 |
| F | [06-doc-intelligence-templates.md](./06-doc-intelligence-templates.md) | 📄 Doc Intelligence | 5 | RAGFlow + PageIndex 文档智能 |
| G | [07-testing-templates.md](./07-testing-templates.md) | 🧪 Testing | 4 | Pytest + Playwright 测试模板 |
| H | [08-devops-templates.md](./08-devops-templates.md) | 🛠️ DevOps | 5 | Docker + CI/CD 部署模板 |

---

## 🗂️ 3. Template 总览 (目录树)

### ⚡ A. Backend Templates (FastAPI / Python)

基于 Netflix/Dispatch 的 **每域一包** 结构，每个 domain package 可包含以下通用文件：

```
backend/
├── core/                              # 全局共享基础设施
│   ├── config.py.template             # Pydantic BaseSettings 全局配置
│   ├── base_schema.py.template        # 自定义 Pydantic BaseModel (标准序列化)
│   ├── exceptions.py.template         # 全局异常 + 域错误码体系
│   ├── security.py.template           # JWT 认证 + 密码哈希
│   ├── database.py.template           # 数据库引擎初始化 + Session 管理
│   └── document_store.py.template     # 通用文档存储 (EAV / JSONB 模式)
│
├── domain/                            # Per-domain 模块标准文件集
│   ├── __init__.py.template           # 模块导出
│   ├── router.py.template             # API 端点 (路由)
│   ├── schemas.py.template            # Pydantic 请求/响应模型 (Create/Update/Public)
│   ├── models.py.template             # 数据库模型 (SQLModel / SQLAlchemy)
│   ├── service.py.template            # 业务逻辑层 (class-based)
│   ├── dependencies.py.template       # 路由依赖注入 (Annotated + Depends)
│   ├── constants.py.template          # 模块级常量 + 错误码
│   ├── exceptions.py.template         # 模块级异常 (如 PostNotFound)
│   └── utils.py.template              # 工具函数 (非业务逻辑)
│
├── crud.py.template                   # 通用 CRUD 函数模式
├── middleware.py.template             # 请求日志 + 全局错误处理中间件
└── main.py.template                   # FastAPI App 入口 (中间件注册, 路由挂载, Sentry)
```

### 🌐 B. Frontend Templates (React / TypeScript)

基于 bulletproof-react + shadcn-admin + JDGenie UI 的 **Feature-First** 结构：

```
frontend/
├── lib/                               # 全局共享库
│   ├── api-client.ts.template         # B1: Axios 实例 + 拦截器 (auth, error toast, 401 跳转)
│   ├── react-query.ts.template        # B2: TanStack Query 全局配置 + 类型工具
│   ├── authorization.tsx.template     # B3: RBAC 权限控制 (useAuthorization + <Authorization>)
│   └── handle-server-error.ts.template # B6: 统一错误处理 (AxiosError → toast)
│
├── feature/                           # Feature-First 标准文件集
│   ├── api/
│   │   ├── get-items.ts.template      # B4: TanStack useQuery hook (查询)
│   │   └── create-item.ts.template    # B5: TanStack useMutation hook (变更)
│   └── index.ts.template              # Barrel Export (Public API)
│
├── components/
│   ├── layouts/
│   │   ├── dashboard-layout.tsx.template  # B7:  响应式布局 (侧边栏 + Drawer + 进度条 + RBAC)
│   │   ├── auth-layout.tsx.template       # B8:  认证页居中卡片布局
│   │   └── sidebar-nav.tsx.template       # B9:  可折叠侧边栏导航 (多级 + badge + 用户菜单)
│   ├── data-table/
│   │   ├── data-table.tsx.template        # B10: TanStack Table 完整套件 (7 子组件)
│   │   ├── column-header.tsx              #      排序指示器
│   │   ├── pagination.tsx                 #      分页控件
│   │   ├── toolbar.tsx                    #      工具栏 (搜索 + 筛选 + 重置)
│   │   ├── faceted-filter.tsx             #      分面筛选器 (Popover + Command)
│   │   ├── bulk-actions.tsx               #      批量操作
│   │   └── view-options.tsx               #      列可见性切换
│   └── seo/
│       └── head.tsx.template              # B17: SEO Head (title + meta description)
│
├── context/
│   ├── theme-provider.tsx.template    # B12: dark/light/system 主题切换 + Cookie 持久化
│   └── search-provider.tsx.template   # B13: Cmd+K 全局搜索 + CommandMenu
│
├── features/
│   └── errors/
│       └── error-pages.tsx.template   # B14: 错误页套件 (500/404/403/401/503)
│
├── stores/
│   └── auth-store.ts.template         # B15: Zustand Auth Store (Cookie 持久化)
│
├── hooks/
│   ├── use-table-url-state.ts.template # B11: 表格状态 URL 同步 (分页/筛选/搜索)
│   ├── use-dialog-state.tsx.template   # B16: 类型安全 Dialog toggle hook
│   └── use-typewriter.ts.template      # B18: AI 打字机效果引擎 (动态速度 + 字符队列)
│
└── config/
    └── env.ts.template                # 环境变量配置
```

### 🤖 C. AI Agent Templates (Intelligence Layer)

基于 MetaGPT 的 **Role → Action → Memory** 架构 (SDK/框架级抽象)：

```
agent/
├── role.py.template                   # Agent 角色 (think → act → react)
├── action.py.template                 # 原子任务 (SRP, 可注入 LLM)
├── memory.py.template                 # 上下文/对话历史管理
└── prompt_registry.yaml.template      # 外部化 Prompt 版本管理
```

> **注**: C 层是 SDK/框架级抽象 (MetaGPT)，下面的 G 层则是**产品级实现** (JDGenie)。两者互补。

### 🚀 G. Multi-Agent Orchestration Templates (Product Layer)

基于京东 `joyagent-jdgenie` 的 **Plan-and-Execute 双层调度** 架构 (产品级模式)：

```
orchestration/
├── base_agent.py.template             # Agent 基类 (状态机 + Memory + 并发工具执行)
├── tool_collection.py.template        # 工具注册中心 (本地 BaseTool + MCP 远程工具)
├── agent_context.py.template          # 请求上下文 (requestId, sessionId, printer, tools, files)
├── printer.py.template                # SSE 推流抽象 (Printer → SSEPrinter / LogPrinter)
├── llm_adapter.py.template            # 多模型适配器 (OpenAI function_call / Claude / struct_parse)
└── deep_search.py.template            # DeepSearch 多轮推理循环 (搜索 → 推理 → 再搜索 → 回答)
```

### 📄 H. Document Intelligence Templates (RAG Layer)

基于 [RAGFlow](../../.github/references/ragflow/) (`infiniflow/ragflow` ⭐ 40k+) 的**深度文档解析**和 [PageIndex](../../.github/references/pageindex/) (`VectifyAI/PageIndex`) 的**推理式检索**：

```
doc_intelligence/
├── document_parser.py.template        # 多格式文档解析器 (PDF/DOCX/Excel/PPT/Markdown)
├── tree_indexer.py.template           # 层级树索引构建 (PageIndex 无向量检索)
├── hybrid_retriever.py.template       # 混合检索器 (向量召回 + 推理式树搜索 + 融合重排)
├── layout_analyzer.py.template        # 布局分析器 (视觉识别 + 排序重组)
└── citation_tracker.py.template       # 溯源引用追踪 (段落级 grounded citations)
```

> **注**: H 层是**文档智能层**，位于 A 层 (Backend) 和 C/G 层 (Agent/Orchestration) 之间。它负责将原始文档转化为可检索的知识，是 RAG 系统的核心。

### 🧪 D. Testing Templates

```
tests/
├── backend/
│   ├── conftest.py.template           # DB Session + TestClient + Auth Fixtures
│   └── test_routes.py.template        # 路由集成测试 (异步客户端)
│
└── e2e/
    ├── config.ts.template             # E2E 测试配置 (用户凭据, URL)
    └── feature.spec.ts.template       # Playwright E2E 用户流测试
```

### 🛠️ E. DevOps Templates

```
devops/
├── .env.example.template              # 环境变量文档
├── docker-compose.yml.template        # Docker 编排
├── Dockerfile.backend.template        # 后端容器
├── Dockerfile.frontend.template       # 前端容器
└── github-ci.yml.template             # GitHub Actions CI/CD
```

### ☁️ F. Azure / Cloud Templates

基于微软官方 [azure-search-openai-demo](../../.github/references/azure-search-openai-demo/) (⭐ 6k+) 提炼的平台级通用模式：

```
azure/
├── credential.py.template             # ManagedIdentity → AzureDeveloperCLI 分级认证
├── prompt_manager.py.template         # Jinja2 Prompt 管理器 (system/user/conversation)
├── openai_error.py.template           # OpenAI API 错误适配层 (content_filter, context_length)
├── auth_decorator.py.template         # @authenticated 装饰器 (Entra ID / JWT)
├── observability.py.template          # Azure Monitor + OpenTelemetry 一站式集成
└── streaming.py.template              # NDJSON 流式响应模式 (AsyncGenerator)
```

---

## 📊 4. 参考来源索引

每个模板的来源追溯：

| 模板                                          | 主要参考                                                         | 补充参考                                              |
| :-------------------------------------------- | :--------------------------------------------------------------- | :---------------------------------------------------- |
| **Backend core/config.py**              | [full-stack-fastapi-template](../../.github/references/full-stack-fastapi-template/) | [fastapi-best-practices](../../.github/references/fastapi-best-practices/) (§ Decouple BaseSettings) |
| **Backend core/base_schema.py**         | [fastapi-best-practices](../../.github/references/fastapi-best-practices/) (§ Custom Base Model) | —                                                    |
| **Backend core/exceptions.py**          | [fastapi-best-practices](../../.github/references/fastapi-best-practices/) (§ Project Structure) | —                                                    |
| **Backend core/security.py**            | [full-stack-fastapi-template](../../.github/references/full-stack-fastapi-template/) | —                                                    |
| **Backend core/database.py**            | [full-stack-fastapi-template](../../.github/references/full-stack-fastapi-template/) | —                                                    |
| **Backend domain/router.py**            | [full-stack-fastapi-template](../../.github/references/full-stack-fastapi-template/) (items.py) | [fastapi-best-practices](../../.github/references/fastapi-best-practices/) (§ Follow REST) |
| **Backend domain/schemas.py**           | [full-stack-fastapi-template](../../.github/references/full-stack-fastapi-template/) (models.py) | [fastapi-best-practices](../../.github/references/fastapi-best-practices/) (§ Pydantic) |
| **Backend domain/models.py**            | [full-stack-fastapi-template](../../.github/references/full-stack-fastapi-template/) (models.py) | —                                                    |
| **Backend domain/service.py**           | [fastapi-best-practices](../../.github/references/fastapi-best-practices/) (Netflix/Dispatch) | —                                                    |
| **Backend domain/dependencies.py**      | [full-stack-fastapi-template](../../.github/references/full-stack-fastapi-template/) (deps.py) | [fastapi-best-practices](../../.github/references/fastapi-best-practices/) (§ Chain Dependencies) |
| **Backend domain/constants.py**         | [fastapi-best-practices](../../.github/references/fastapi-best-practices/) (§ Project Structure) | —                                                    |
| **Backend domain/exceptions.py**        | [fastapi-best-practices](../../.github/references/fastapi-best-practices/) (§ Project Structure) | —                                                    |
| **Backend domain/utils.py**             | [full-stack-fastapi-template](../../.github/references/full-stack-fastapi-template/) (utils.py) | [fastapi-best-practices](../../.github/references/fastapi-best-practices/) |
| **Backend crud.py**                     | [full-stack-fastapi-template](../../.github/references/full-stack-fastapi-template/) (crud.py) | —                                                    |
| **Backend middleware.py**               | [fastapi-best-practices](../../.github/references/fastapi-best-practices/) | [full-stack-fastapi-template](../../.github/references/full-stack-fastapi-template/) (main.py CORS) |
| **Backend main.py**                     | [full-stack-fastapi-template](../../.github/references/full-stack-fastapi-template/) (main.py) | —                                                    |
| **Frontend B1 lib/api-client.ts**          | [bulletproof-react](../../.github/references/bulletproof-react/) | —                                                    |
| **Frontend B2 lib/react-query.ts**         | [bulletproof-react](../../.github/references/bulletproof-react/) | —                                                    |
| **Frontend B3 lib/authorization.tsx**      | [bulletproof-react](../../.github/references/bulletproof-react/) | —                                                    |
| **Frontend B4 feature/get-items.ts**       | [bulletproof-react](../../.github/references/bulletproof-react/) (get-discussions.ts) | —                                                    |
| **Frontend B5 feature/create-item.ts**     | [bulletproof-react](../../.github/references/bulletproof-react/) (create-discussion.ts) | —                                                    |
| **Frontend B6 lib/handle-server-error.ts** | [shadcn-admin](../../.github/references/shadcn-admin/)             | —                                                    |
| **Frontend B7 layouts/dashboard-layout**   | [bulletproof-react](../../.github/references/bulletproof-react/) (dashboard-layout.tsx) | —                                          |
| **Frontend B8 layouts/auth-layout**        | [bulletproof-react](../../.github/references/bulletproof-react/) (auth-layout.tsx) | —                                               |
| **Frontend B9 layout/sidebar-nav**         | [shadcn-admin](../../.github/references/shadcn-admin/) (components/layout/) | —                                              |
| **Frontend B10 data-table/**               | [shadcn-admin](../../.github/references/shadcn-admin/) (components/data-table/) | —                                            |
| **Frontend B11 use-table-url-state**       | [shadcn-admin](../../.github/references/shadcn-admin/) (hooks/use-table-url-state.ts) | —                                      |
| **Frontend B12 theme-provider**            | [shadcn-admin](../../.github/references/shadcn-admin/) (context/theme-provider.tsx) | —                                        |
| **Frontend B13 search-provider**           | [shadcn-admin](../../.github/references/shadcn-admin/) (context/search-provider.tsx) | —                                       |
| **Frontend B14 error-pages**               | [shadcn-admin](../../.github/references/shadcn-admin/) (features/errors/) | [bulletproof-react](../../.github/references/bulletproof-react/) (components/errors/) |
| **Frontend B15 auth-store**                | [shadcn-admin](../../.github/references/shadcn-admin/) (stores/auth-store.ts) | —                                            |
| **Frontend B16 use-dialog-state**          | [shadcn-admin](../../.github/references/shadcn-admin/) (hooks/use-dialog-state.tsx) | —                                        |
| **Frontend B17 seo/head**                  | [bulletproof-react](../../.github/references/bulletproof-react/) (components/seo/head.tsx) | —                                  |
| **Frontend B18 use-typewriter**            | [joyagent-jdgenie](../../.github/references/joyagent-jdgenie/) (ui/src/hooks/TypeWriterCore.ts) | —                           |
| **Agent role.py**                       | [MetaGPT](../../.github/references/MetaGPT/) (base_role.py)    | —                                                    |
| **Agent action.py**                     | [MetaGPT](../../.github/references/MetaGPT/) (action.py)       | —                                                    |
| **Tests conftest.py**                   | [full-stack-fastapi-template](../../.github/references/full-stack-fastapi-template/) | —                                                    |
| **Tests feature.spec.ts**               | [full-stack-fastapi-template](../../.github/references/full-stack-fastapi-template/) (login.spec.ts) | `playwright-template`                               |
| **Azure credential.py**                 | [azure-search-openai-demo](../../.github/references/azure-search-openai-demo/) (app.py §setup_clients) | —                                                    |
| **Azure prompt_manager.py**             | [azure-search-openai-demo](../../.github/references/azure-search-openai-demo/) (promptmanager.py) | [MetaGPT](../../.github/references/MetaGPT/) (prompt_registry) |
| **Azure openai_error.py**               | [azure-search-openai-demo](../../.github/references/azure-search-openai-demo/) (error.py) | —                                                    |
| **Azure auth_decorator.py**             | [azure-search-openai-demo](../../.github/references/azure-search-openai-demo/) (decorators.py + authentication.py) | —                                                    |
| **Azure observability.py**              | [azure-search-openai-demo](../../.github/references/azure-search-openai-demo/) (app.py §create_app) | —                                                    |
| **Azure streaming.py**                  | [azure-search-openai-demo](../../.github/references/azure-search-openai-demo/) (app.py §format_as_ndjson) | —                                                    |
| **Orchestration base_agent.py**         | [joyagent-jdgenie](../../.github/references/joyagent-jdgenie/) (BaseAgent.java + ReActAgent.java) | [MetaGPT](../../.github/references/MetaGPT/) (base_role.py) |
| **Orchestration tool_collection.py**    | [joyagent-jdgenie](../../.github/references/joyagent-jdgenie/) (BaseTool.java + ToolCollection.java) | —                                                    |
| **Orchestration agent_context.py**      | [joyagent-jdgenie](../../.github/references/joyagent-jdgenie/) (AgentContext.java) | —                                                    |
| **Orchestration printer.py**            | [joyagent-jdgenie](../../.github/references/joyagent-jdgenie/) (Printer.java + SSEPrinter.java) | —                                                    |
| **Orchestration llm_adapter.py**        | [joyagent-jdgenie](../../.github/references/joyagent-jdgenie/) (LLM.java) | [azure-search-openai-demo](../../.github/references/azure-search-openai-demo/) (OpenAI 错误处理) |
| **Orchestration deep_search.py**        | [joyagent-jdgenie](../../.github/references/joyagent-jdgenie/) (deepsearch.py) | —                                                    |
| **DocIntel document_parser.py**         | [ragflow](../../.github/references/ragflow/) (deepdoc/ + rag/app/naive.py) | —                                                    |
| **DocIntel tree_indexer.py**            | [pageindex](../../.github/references/pageindex/) (page_index.py + utils.py)  | —                                                    |
| **DocIntel hybrid_retriever.py**        | [ragflow](../../.github/references/ragflow/) (rag/ 多路召回)                 | [pageindex](../../.github/references/pageindex/) (树搜索) |
| **DocIntel layout_analyzer.py**         | [ragflow](../../.github/references/ragflow/) (deepdoc/vision/)              | —                                                    |
| **DocIntel citation_tracker.py**        | [ragflow](../../.github/references/ragflow/) (grounded citations)            | [pageindex](../../.github/references/pageindex/) (页码级索引) |

---

## 📊 5. Status Summary

| Layer                        |    模板数    |    已实现    |    待创建    |
| :--------------------------- | :----------: | :----------: | :----------: |
| ⚡ Backend Core (全局)       |      6      |      6      |      0      |
| ⚡ Backend Domain (每域)     |      9      |      9      |      0      |
| ⚡ Backend Shared            |      3      |      3      |      0      |
| 🌐 Frontend Lib              |      4      |      4      |      0      |
| 🌐 Frontend Feature          |      2      |      2      |      0      |
| 🌐 Frontend Layout           |      3      |      3      |      0      |
| 🌐 Frontend DataTable        |      2      |      2      |      0      |
| 🌐 Frontend Context          |      2      |      2      |      0      |
| 🌐 Frontend Error/Store/Hook |      5      |      5      |      0      |
| 🤖 AI Agent (C)              |      4      |      4      |      0      |
| 🚀 Orchestration (G)         |      6      |      6      |      0      |
| 📄 Document Intelligence (H) |      5      |      5      |      0      |
| ☁️ Azure / Cloud           |      6      |      6      |      0      |
| 🧪 Tests                     |      5      |      5      |      0      |
| 🛠️ DevOps                  |      5      |      5      |      0      |
| **Total**              | **67** | **67** | **0** |

---

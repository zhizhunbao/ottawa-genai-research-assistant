# 📚 Project Reference Library

Detailed documentation and local copies of best-in-class templates and frameworks used for the **Ottawa GenAI Research Assistant** project. These repositories serve as high-quality benchmarks for architecture, UI/UX, testing, and agentic workflows.

---

## 📂 Directory Structure

### 🎨 UI/UX & Design Systems
Focused on visual excellence, component libraries, and interactive design patterns.

- **[ui-horizon-chakra](ui-horizon-chakra)**: Professional admin dashboard (Chakra UI + Next.js). Best-in-class for data density and layout.
- **[ui-tabler](ui-tabler)**: Comprehensive UI kit with 100+ components and pre-built pages.
- **[ui-flowbite-lib](ui-flowbite-lib)**: Robust component system built on Tailwind CSS.
- **[ui-tailwind-starter](ui-tailwind-starter)**: Clean, accessible starter kit for Tailwind CSS projects.

### 🌐 Frontend & UI (Architectural)
Focuses on modern React/Next.js code structure, state management, and component patterns.

- **[shadcn-admin](shadcn-admin)**: Admin dashboard implementation using Shadcn UI & Vite.
- **[shadcn-taxonomy](shadcn-taxonomy)**: Official Shadcn UI full-stack application (Next.js App Router).
- **[shadcn-ui-lib](shadcn-ui-lib)**: Source code for the core Shadcn UI component library.
- **[bulletproof-react](bulletproof-react)**: The ultimate reference for production-ready React architecture.

### ⚡ Backend & Full-Stack (FastAPI / Python)
Foundational templates for scalable Python backends and integrated stacks.

- **[full-stack-fastapi-template](full-stack-fastapi-template)**: Official FastAPI full-stack template (Docker, PostgreSQL, Auth).
- **[fastapi-best-practices](fastapi-best-practices)**: Highly-curated best practices for professional FastAPI development.
- **[full-stack-fastapi-postgresql](full-stack-fastapi-postgresql)**: Alternative reference for FastAPI and relational DB integration.

### ☁️ Azure & Cloud (RAG / OpenAI / AI Search)
Official Microsoft reference architectures for Azure AI services integration.

- **[azure-search-openai-demo](azure-search-openai-demo)**: ⭐ 6k+ stars — Microsoft's official **RAG chat application** using Azure OpenAI + Azure AI Search. Key patterns:
  - ManagedIdentity → AzureDeveloperCLI credential fallback chain
  - Strategy pattern for RAG approaches (`Approach` ABC → `ChatReadRetrieveReadApproach`)
  - Jinja2 `PromptManager` for externalized prompt templates
  - `@authenticated` decorator for Entra ID (AAD) token validation
  - OpenAI-specific error adaptation (content_filter, context_length_exceeded)
  - `tenacity` async retry with exponential backoff for `RateLimitError`
  - Azure Monitor + OpenTelemetry observability stack
  - NDJSON streaming response pattern
  - Document ingestion pipeline (`prepdocslib/` — PDF/HTML/CSV parsing, text splitting, embeddings)

### 📄 Document Intelligence & RAG
Advanced document parsing, intelligent retrieval, and RAG frameworks.

- **[ragflow](ragflow)**: ⭐ 40k+ stars — Leading open-source **RAG engine** by InfiniFlow. Key patterns:
  - `deepdoc/` — Deep document understanding (OCR, layout recognition, table structure recognition, auto-rotation)
  - Multi-parser support: DeepDoc, MinerU, Docling, PaddleOCR, plaintext
  - Template-based chunking (Q&A, Table, Resume, Book, Paper, Laws, Manual, etc.)
  - Multi-recall + fused re-ranking retrieval strategy
  - Grounded citations with traceable source references
  - GraphRAG + RAPTOR for knowledge graph integration
  - Agent canvas with no-code workflow editor
  - Agentic Memory for long-term context
  - Multi-source data sync (Confluence, S3, Notion, Google Drive, Discord)
  - MCP integration + Python/JavaScript code executor
- **[pageindex](pageindex)**: Vectorless, reasoning-based RAG by VectifyAI. Key patterns:
  - Hierarchical tree index generation from PDF documents (like enhanced table-of-contents)
  - LLM reasoning-based tree search for context-aware retrieval (inspired by AlphaGo)
  - No vector DB, no chunking — documents organized into natural sections
  - TOC detection → extraction → transformation → page number mapping pipeline
  - Concurrent section verification with `ThreadPoolExecutor`
  - Vision-based RAG (direct page image analysis, no OCR needed)
  - 98.7% accuracy on FinanceBench benchmark (state-of-the-art)
  - `page_index_main()` → `tree_parser()` → `meta_processor()` processing pipeline
- **[zoekt](zoekt)**: ⭐ 1.4k stars — Sourcegraph/Google 的**代码搜索引擎**。Key patterns:
  - Trigram 索引实现快速子串和正则匹配 — 代码搜索的工业标准
  - BM25 评分可选 (`UseBM25Scoring` option)，代码信号加权排序
  - Universal ctags 符号信息作为排序关键信号
  - 支持 Git 仓库索引、GitHub 组织批量索引
  - JSON API + gRPC API + Web UI 三种搜索接口
  - 流式搜索结果 (`FlushWallTime`)，上下文行数可配置
  - "精确匹配 > 语义搜索" 理念 — 代码搜索不需要向量
- **[sqlite-rag](sqlite-rag)**: SQLite 全家桶做**轻量级混合 RAG**。Key patterns:
  - FTS5 全文搜索 + sqlite-vec 向量搜索，全在一个 .db 文件
  - Reciprocal Rank Fusion (RRF) 融合重排
  - `engine.py` — 核心搜索引擎 (hybrid search 实现)
  - `chunker.py` — 递归字符文本分割器
  - `repository.py` — 数据存储层 (FTS5 + 向量双索引)
  - 支持 PDF/DOCX/Markdown 文档处理
  - "不需要外部服务" 理念 — 单文件 SQLite 搞定一切

### 🤖 Agentic Workflows & AI
Frameworks and patterns for building autonomous AI agents and orchestration logic.

- **[joyagent-jdgenie](joyagent-jdgenie)**: ⭐ 京东开源 — **最全的端到端多智能体产品级项目**。四层架构 (Java Backend + Python Tool + MCP Client + React UI)。Key patterns:
  - **双层 Agent 架构**: `BaseAgent → ReActAgent → PlanningAgent/ExecutorAgent` (Plan-and-Execute)
  - **ReAct 循环**: `think()` → `act()` → `step()` 抽象，可扩展的状态机 (IDLE/RUNNING/FINISHED/ERROR)
  - **工具热插拔**: `BaseTool` 接口 + `ToolCollection` 注册中心 + MCP 远程工具
  - **SSE Printer 抽象**: `Printer` 接口 → `SSEPrinter`/`LogPrinter`，类型化消息推送 (plan/task/tool_result/report)
  - **AgentContext 上下文**: requestId, sessionId, printer, toolCollection, files — 集中管理
  - **多模型适配**: LLM 层统一处理 OpenAI function_call / Claude / struct_parse 三种模式
  - **并发工具执行**: `CountDownLatch` + `ThreadPoolExecutor` 并行调用多工具
  - **DeepSearch 多轮推理**: query_decompose → parallel_search → reasoning → answer
  - **SSE 心跳 + 连接管理**: 10s 心跳保活，SseEmitter 的完整生命周期管理
  - **Jinja2 Prompt 工厂**: `get_prompt()` + `Template.render()` + 配置化 Prompt Map
- **[MetaGPT](MetaGPT)**: Multi-agent framework for collaborative task execution.
- **[gh-aw (GitHub Agentic Workflows)](gh-aw)**: Research by GitHub Next on AI-driven repository agents.
- **[gpt-engineer](gpt-engineer)**: Reference for autonomous code generation patterns.
- **[open-llms](open-llms)**: Wealth of LLM resources, including the `AGENTS.md` guide.
- **[ai-dev-config](ai-dev-config)**: Specialized configurations for AI-driven development.
- **[everything-claude-code](everything-claude-code)**: Comprehensive reference for integrating Claude-based coding workflows.

### 🧪 Testing & Quality Assurance (QA)
Industry-standard patterns for TDD, E2E automation, and performance testing.

- **[fastapi-tdd-docker](fastapi-tdd-docker)**: TDD workflow reference for FastAPI applications.
- **[cypress-realworld-app](cypress-realworld-app)**: Excellence in E2E testing and CI/CD integration.
- **[playwright-template](playwright-template)**: Structured automation for UI and API testing with Playwright.
- **[pytest-samples](pytest-samples)**: Advanced Pytest patterns, fixtures, and configurations.
- **[robot-framework-playwright](robot-framework-playwright)**: Keyword-driven automation using Robot Framework and Playwright.

### 🛠️ Scaffolding & Utility
- **[cookiecutter](cookiecutter)** / **[cookiecutter-django](cookiecutter-django)** / **[cookiecutter-pypackage](cookiecutter-pypackage)**: Python project scaffolding standards.

---

## 🛠️ Usage Notes
- **Git Ignored**: This directory is excluded from the main repository to avoid bloat. Do not remove the entry from `.gitignore`.
- **Reference Only**: These are for study and inspiration. Copy and adapt code to the main project as needed.
- **Syncing**: To update all references, you can run:
  `Get-ChildItem -Directory | ForEach-Object { Set-Location $_.FullName; git pull; Set-Location .. }` (PowerShell)

# 实现计划: Ottawa GenAI Research Assistant — 基于模板的项目完成

**日期**: 2026-02-13  
**版本**: 1.0  
**估算复杂度**: HIGH  
**基础**: 188 个已有 `.template` 文件 + 3-Phase PRD (master_prd.md)

---

## 概述

本项目已具备完整的后端骨架 (FastAPI + Azure 服务封装) 和前端框架 (React + Vite + TailwindCSS)，
以及 **188 个高质量模板文件**。但 PRD 中定义的核心用户故事大部分尚未完成。

本计划分析每个 PRD User Story 的 **当前状态 vs 目标状态**，
并映射到可直接复用的模板，按依赖关系组织为 6 个可增量交付的 Phase。

---

## 📊 当前状态审计

### 后端 (backend/) — 已有能力

| 模块 | 文件 | 状态 | 说明 |
|:---|:---|:---|:---|
| `core/` | config, database, exceptions, models, schemas, security | ✅ 完成 | 基础设施齐全 |
| `azure/openai` | openai.py (248行) | ✅ 完成 | Chat + Embedding + Stream + RAG |
| `azure/search` | search.py (379行) | ✅ 完成 | 混合搜索 + 批量索引 |
| `azure/storage` | storage.py (8KB) | ✅ 完成 | Blob 上传/下载/SAS URL |
| `azure/auth` | auth.py (7.4KB) | ✅ 完成 | Entra ID JWT 验证 |
| `azure/prompts` | prompts.py (9.3KB) | ✅ 完成 | RAG 提示词工程 |
| `doc_intel/` | pipeline, pdf_extractor, text_chunker | ✅ 完成 | PDF→Chunk→Embed 管道 |
| `documents/` | routes, service, schemas | ✅ 完成 | 文件上传 + 管道触发 |
| `chat/` | routes, service, schemas | ✅ 完成 | 会话 CRUD (SQLite) |
| `research/` | routes, service, schemas | ⚠️ 部分 | 搜索+RAG Chat 可用，但**缺少流式端点** |
| `analysis/` | routes, service, schemas | ⚠️ 部分 | 图表提取基础有，**数据来源未对接 Azure** |
| `evaluation/` | routes, service, schemas | ⚠️ 部分 | 6维评估框架基础有，**缺少自动化批跑** |
| `users/` | routes, schemas | ✅ 完成 | 用户管理 |
| `health/` | routes | ✅ 完成 | 健康检查 |

### 前端 (frontend/src/) — 已有能力

| 模块 | 文件数 | 状态 | 说明 |
|:---|:---|:---|:---|
| `features/auth/` | 10 | ✅ 完成 | MSAL 登录流 + ProtectedRoute |
| `features/chat/` | 14 | ⚠️ 部分 | UI 组件有, 但**缺少流式渲染**, **引用展示不完整** |
| `features/documents/` | 3 | 🔴 不足 | 仅有类型定义，**缺少上传 UI** |
| `features/research/` | 4 | ⚠️ 部分 | 有类型和 hooks, **缺少搜索结果页** |
| `features/analysis/` | 1 | 🔴 不足 | 仅 types.ts，**缺少图表组件** |
| `features/evaluation/` | 5 | ⚠️ 部分 | 有基础视图，**缺少仪表盘** |
| `features/landing/` | 8 | ✅ 完成 | 着陆页 |
| `stores/` | 4 | ⚠️ 部分 | chat-store 用 localStorage, **需迁移到 API** |
| `shared/components/` | 38 | ✅ 完成 | UI 组件库完善 (Radix + shadcn) |
| `i18n` | 14 | ⚠️ 部分 | 框架就绪，**翻译覆盖不完整** |

---

## 📋 PRD User Story → Template 映射

### Phase 1 — 基础架构 (PRD Phase 1)

| US | 用户故事 | 状态 | 差距 | 对应模板 |
|:---|:---|:---|:---|:---|
| US-101 | Vite 前端框架 | ✅ Done | — | — |
| US-102 | Azure Blob Storage | ✅ Done | — | — |
| US-103 | Azure AI Search | ✅ Done | — | — |
| US-104 | Azure OpenAI | ✅ Done | — | — |
| US-105 | Azure Entra ID | ⚠️ 90% | 前端 MSAL 已集成, 后端 JWT 已实现, **缺少认证中间件串联到所有路由** | `azure/auth_decorator.py.template` |

### Phase 2 — 核心 RAG (PRD Phase 2)

| US | 用户故事 | 状态 | 差距 | 对应模板 |
|:---|:---|:---|:---|:---|
| US-201 | 文档处理管道 | ⚠️ 80% | Pipeline 代码完成, **缺少自动触发机制 (Azure Functions)** | `rag-pipeline.py.template`, `doc_intelligence/*.template` |
| US-202 | 自然语言查询 | ⚠️ 70% | 搜索可用, **缺少 SSE 流式端点**, **前端流式渲染** | `chat/hooks/use-stream-chat.ts.template`, `chat/api/chat-api.ts.template`, `azure/streaming.py.template` |
| US-203 | 引用生成 | ⚠️ 50% | 后端 prompts.py 支持, **前端引用展示不完整** | `citation-*.template` (5个), `message-primitives.tsx.template` |
| US-204 | 聊天历史 | ⚠️ 60% | SQLite 实现完成, **需迁移到 Cosmos DB**, **前端 store 需对接 API** | `stores/chat/chat-store.ts.template` |
| US-205 | 双语支持 | ⚠️ 40% | i18next 框架就绪, **翻译文件不完整**, **查询双语处理缺失** | — (手工翻译) |

### Phase 3 — 高级功能 (PRD Phase 3)

| US | 用户故事 | 状态 | 差距 | 对应模板 |
|:---|:---|:---|:---|:---|
| US-301 | 图表可视化 | ⚠️ 40% | ChartDataExtractor 基础有, **前端 Recharts 图表组件缺失** | `chart-page.tsx.template` |
| US-302 | 报告仪表盘 | 🔴 10% | **几乎全缺** | `dashboard/stats-cards.tsx.template`, `dashboard/mini-chart.tsx.template` ⚠️ 缺 stats-api 模板 |
| US-303 | LLM 评估框架 | ⚠️ 50% | evaluation service 有, **批跑 + 报告缺失** | `tests/backend/test-async-endpoint.py.template` |
| US-304 | 生产部署 | 🔴 10% | render.yaml 存在, **Azure 部署配置全缺** | `devops/Dockerfile.*.template`, `devops/docker-compose.yml.template`, `devops/github-ci.yml.template` |
| US-305 | 演示文档 | 🔴 0% | **全部待完成** | — |

---

## 🏗️ 实现阶段

### ⏱️ Phase A: 流式 RAG Chat (核心体验) — 预估 8-10h

**目标**: 用户可以在聊天界面与 AI 对话, 看到流式输出和引用来源。
**对应 PRD**: US-202 + US-203 + US-204 (部分)

#### A1. 后端 SSE 流式端点
**文件**: `backend/app/research/routes.py`
- **操作**: 新增 `POST /api/v1/research/chat/stream` SSE 端点
- **模板**: 参考 `azure/streaming.py.template` + `chat/api/chat-api.ts.template` 中的 SSE 协议设计
- **逻辑**: 接收 messages → Azure Search 检索 → Azure OpenAI 流式生成 → 附加 citations → SSE 推送
- **依赖**: azure/openai.py (chat_completion_stream), azure/search.py (search)
- **风险**: Medium — SSE 在 FastAPI 中需要 `StreamingResponse`

#### A2. 前端流式 Hook
**文件**: `frontend/src/features/chat/hooks/use-chat-stream.ts` (新建)
- **操作**: 基于流式模板实现 `useChatStream()` hook
- **模板**: `frontend/features/chat/hooks/use-stream-chat.ts.template` (20KB, 完整实现)
- **功能**: EventSource 连接 → 实时 token 追加 → 错误重试 → 取消支持
- **依赖**: A1 完成

#### A3. 聊天界面流式渲染升级
**文件**: `frontend/src/features/chat/components/chat-interface.tsx` (修改)
- **操作**: 将现有硬编码响应替换为流式输出, 升级 message-item 支持 Markdown 渲染
- **模板**: `chat/primitives/message-primitives.tsx.template`, `chat/chat-input.tsx.template`
- **依赖**: A2 完成

#### A4. 引用系统前端集成
**文件**: `frontend/src/features/chat/components/citation-panel.tsx` (新建)
- **操作**: 基于 citation 模板实现引用展示
- **模板**: `chat/citation/citation-popover.tsx.template`, `chat/citation/citation-link.tsx.template`, `chat/citation/types.ts.template`, `chat/citation/use-citation.ts.template`, `chat/citation/message-markdown.tsx.template`
- **功能**: 内联引用标记 [1][2] → 悬浮预览 → 点击跳转原文
- **依赖**: A3 完成

#### A5. Chat Store 对接后端 API
**文件**: `frontend/src/stores/chat-store.ts` (修改)
- **操作**: 将 localStorage 持久化替换为后端 API 调用
- **模板**: `stores/chat/chat-store.ts.template` (会话 slice 和消息 slice 分离)
- **功能**: createSession → POST /api/v1/chat/sessions, loadHistory → GET, appendMessage → POST
- **依赖**: 后端 chat API 已就绪

**阶段 A 验收标准**:
- [ ] 用户输入问题后看到 AI 逐字流式回复
- [ ] 回复底部显示引用来源 (带文档名 + 页码)
- [ ] 点击引用可预览原文
- [ ] 聊天历史保存到后端, 刷新页面后保留
- [ ] 支持取消正在进行的回复

---

### ⏱️ Phase B: 文档管理 & 上传 (数据入口) — 预估 6-8h

**目标**: 管理员可以上传 PDF, 查看处理进度, 管理知识库。
**对应 PRD**: US-201 + US-102 (强化)

#### B1. 文档上传 UI
**文件**: `frontend/src/features/documents/components/upload-panel.tsx` (新建)
- **操作**: 基于 upload 模板构建拖拽上传界面
- **模板**: `documents/upload/document-upload-steps.tsx.template` (22KB, 含拖拽+进度+多步), `documents/upload/document-api.ts.template`, `documents/upload/document-list.tsx.template`
- **功能**: 拖拽/点击上传 → 文件类型校验 → 上传进度条 → 调用 POST /api/v1/documents/upload
- **依赖**: 后端 documents API 已就绪

#### B2. 文档列表页
**文件**: `frontend/src/features/documents/components/document-list.tsx` (新建)
- **操作**: 展示已上传文档列表, 含处理状态
- **模板**: `knowledge-base.tsx.template`
- **功能**: 文档列表 + 状态标签 (Pending/Processing/Indexed/Failed) + 搜索 + 删除

#### B3. 文档处理状态轮询
**文件**: `frontend/src/features/documents/hooks/use-document-status.ts` (新建)
- **操作**: 轮询后端获取文档处理进度
- **依赖**: 后端 GET /api/v1/documents/{id}/status 已就绪

#### B4. 文档路由 & 导航
**文件**: `frontend/src/app/routes.tsx` (修改) + 导航更新
- **操作**: 添加 /documents 路由, 导航栏加入文档管理入口
- **模板**: `use-active-nav.ts.template`

**阶段 B 验收标准**:
- [ ] 管理员可拖拽上传 PDF 文件
- [ ] 上传后自动触发 RAG 管道 (Extract → Chunk → Embed → Index)
- [ ] 文档列表实时显示处理状态
- [ ] 处理完成的文档可在聊天中被检索到
- [ ] 支持删除文档 (同步删除 Azure AI Search 索引)

---

### ⏱️ Phase C: 认证 & 安全加固 — 预估 4-6h

**目标**: 完成 Azure Entra ID 全链路认证。
**对应 PRD**: US-105

#### C1. 后端认证中间件串联
**文件**: `backend/app/core/dependencies.py` (修改)
- **操作**: 创建 `get_current_user()` 依赖, 从 JWT token 提取用户身份
- **模板**: `azure/auth_decorator.py.template`
- **功能**: 验证 Bearer Token → 解析 Azure AD claims → 返回用户上下文

#### C2. 路由级认证保护
**文件**: `backend/app/*/routes.py` (批量修改)
- **操作**: 将 `DEFAULT_OWNER_ID = "default-user"` 替换为 `Depends(get_current_user)`
- **影响**: chat/routes.py, documents/routes.py, research/routes.py
- **风险**: Low — 改动模式统一

#### C3. 前端 Token 注入
**文件**: `frontend/src/shared/services/api-client.ts` (修改)
- **操作**: Axios 拦截器中注入 MSAL acquireTokenSilent() 获取的 Bearer Token
- **依赖**: MSAL 已集成

#### C4. 权限边界
**文件**: `backend/app/core/security.py` (增强)
- **操作**: 基于角色的访问控制 (admin vs analyst)
- **风险**: Low

**阶段 C 验收标准**:
- [ ] 未登录用户访问 API 返回 401
- [ ] 每个请求携带 Azure AD JWT Token
- [ ] Chat 历史按用户隔离 (不同用户看不到彼此的会话)
- [ ] 文档管理仅 admin 角色可操作

---

### ⏱️ Phase D: 图表可视化 & 仪表盘 — 预估 6-8h

**目标**: 聊天中嵌入数据图表, 独立的统计仪表盘。
**对应 PRD**: US-301 + US-302

#### D1. 图表生成 API 增强
**文件**: `backend/app/research/service.py` (修改 ChartDataExtractor)
- **操作**: 增强 LLM 图表数据提取, 支持从 Azure Search 结果中提取结构化数据
- **功能**: 检测查询意图 → 提取数值数据 → 返回 Recharts 格式 JSON

#### D2. Chat 内图表渲染
**文件**: `frontend/src/features/chat/components/chart-message.tsx` (新建)
- **操作**: 当 AI 回复包含 chart_data 时, 渲染 Recharts 图表
- **模板**: `chart-page.tsx.template`
- **功能**: 折线图/柱状图/饼图 → 图表标题 → 数据来源标注 → 导出 PNG

#### D3. 统计仪表盘页面
**文件**: `frontend/src/features/dashboard/` (新建目录)
- **操作**: 创建仪表盘页面, 展示文档数、查询次数、索引状态
- **模板**: `dashboard/stats-cards.tsx.template`, `dashboard/mini-chart.tsx.template` ⚠️ stats-api 需自行编写
- **后端**: 新增 `GET /api/v1/stats` 端点
- **功能**: 统计卡片 + 趋势图 + 时间筛选

#### D4. 图表导出
**文件**: `frontend/src/features/chat/components/chart-export.tsx` (新建)
- **操作**: 支持图表导出为 PNG/PDF
- **依赖**: 已安装 `html-to-image` + `jspdf`

**阶段 D 验收标准**:
- [ ] 询问 "Show GDP trend" 时在聊天中渲染折线图
- [ ] 图表支持导出为 PNG 和 PDF
- [ ] 仪表盘显示实时统计数据
- [ ] 仪表盘支持时间范围筛选

---

### ⏱️ Phase E: 评估 & 质量保障 — 预估 5-7h

**目标**: 自动评估 RAG 质量, 完善测试覆盖。
**对应 PRD**: US-303

#### E1. 评估批跑服务
**文件**: `backend/app/evaluation/service.py` (增强)
- **操作**: 实现批量评估: 从测试集加载 Q&A → 调用 RAG → LLM 自评估 6 维度
- **模板**: `tests/backend/test-async-endpoint.py.template`
- **功能**: Coherence, Relevancy, Completeness, Grounding, Helpfulness, Faithfulness

#### E2. 评估结果存储 & API
**文件**: `backend/app/evaluation/routes.py` (增强)
- **操作**: 新增 GET /api/v1/evaluation/reports, POST /api/v1/evaluation/run
- **功能**: 触发评估 → 存储结果 → 查询历史报告

#### E3. 评估仪表盘前端
**文件**: `frontend/src/features/evaluation/views/evaluation-dashboard.tsx` (新建)
- **操作**: 展示 6 维度雷达图 + 历史趋势
- **功能**: 评估分数卡片 + 维度详情 + 趋势图

#### E4. 后端测试补齐
**文件**: `backend/tests/` (增强)
- **操作**: 为 A1 流式端点、B1 文档管道、C1 认证中间件补充测试
- **模板**: `test-utils.ts.template`, `handlers.ts.template` (前端)
- **目标**: 后端测试覆盖率 ≥ 80%

#### E5. 前端测试补齐
**文件**: `frontend/src/features/*/` (新增测试文件)
- **操作**: 为关键组件 (ChatInterface, DocumentList, Dashboard) 添加测试
- **模板**: `frontend/test/test-utils.ts.template`, `tests/e2e/crud-flow.spec.ts.template`, `tests/e2e/auth-flow.spec.ts.template`

**阶段 E 验收标准**:
- [ ] 可一键触发 RAG 评估, 6 维度打分
- [ ] 评估分数 ≥ 4.0/5.0
- [ ] 评估结果可视化展示
- [ ] 后端测试覆盖率 ≥ 80%

---

### ⏱️ Phase F: 部署 & 交付 — 预估 6-8h

**目标**: 部署到 Azure 生产环境, 完成演示材料。
**对应 PRD**: US-304 + US-305

#### F1. Azure Container Apps 部署 (后端)
**文件**: `.azure/` 目录 (新建)
- **操作**: 创建 Docker 配置 + Azure Container Apps 部署清单
- **模板**: `devops/Dockerfile.backend.template`, `devops/Dockerfile.frontend.template`, `devops/docker-compose.yml.template`
- **功能**: 构建镜像 → 推送 ACR → 部署到 Container Apps

#### F2. Azure Static Web Apps 部署 (前端)
**文件**: `.github/workflows/deploy-frontend.yml` (新建)
- **操作**: GitHub Actions 自动部署前端到 Azure Static Web Apps
- **模板**: `devops/github-ci.yml.template`

#### F3. Application Insights 监控
**文件**: `backend/app/core/middleware.py` (新建)
- **操作**: 集成 Application Insights SDK, 追踪请求/异常
- **模板**: `azure/observability.py.template` ⚠️ Application Insights 集成需自行补充

#### F4. i18n 翻译完善 (US-205)
**文件**: `frontend/src/locales/fr/` (补充)
- **操作**: 完善法语翻译文件
- **依赖**: 所有 UI 文案确定后

#### F5. 演示材料 (US-305)
- **操作**: 录制演示视频 (5-10 分钟)
- **内容**: 登录 → 上传文档 → 聊天问答 → 图表展示 → 仪表盘
- **交付**: 视频 + 用户手册 + API 文档 + Azure 资源截图

**阶段 F 验收标准**:
- [ ] 后端部署到 Azure Container Apps, 可公网访问
- [ ] 前端部署到 Azure Static Web Apps
- [ ] Application Insights 监控正常
- [ ] 系统可用性 ≥ 99.5%
- [ ] 演示文档完整交付

---

## 🧩 模板使用汇总 (已核对真实文件)

| Phase | 使用的模板文件 (实际路径) | ✅存在 | ⚠️缺失 |
|:---|:---|:---|:---|
| A (流式 RAG) | `use-stream-chat.ts`, `chat-api.ts`, `streaming.py`, `citation-*` (5个), `message-primitives.tsx`, `chat-store.ts`, `chat-input.tsx`, `chat-interface.tsx`, `message-item.tsx` | 13 | 0 |
| B (文档管理) | `document-upload-steps.tsx`, `document-api.ts`, `document-list.tsx`, `knowledge-base.tsx`, `use-active-nav.ts` | 5 | 0 |
| C (认证) | `auth_decorator.py`, `credential.py` | 2 | 0 |
| D (图表) | `chart-page.tsx`, `stats-cards.tsx`, `mini-chart.tsx` | 3 | 1 (`stats-api`) |
| E (评估) | `test-async-endpoint.py`, `test-utils.ts`, `handlers.ts`, `e2e/*.spec.ts` (3个) | 6 | 0 |
| F (部署) | `Dockerfile.backend`, `Dockerfile.frontend`, `docker-compose.yml`, `github-ci.yml`, `observability.py` | 5 | 1 (`app-insights 集成`) |
| **总计** | | **34 ✅** | **2 ⚠️** |

> 188 个模板中约 29 个在本项目中直接使用。其余模板是通用组件库,
> 适用于未来新项目快速启动 (如 workflow-engine, agent 系列等)。

---

## 📊 依赖关系图

```
Phase A (流式 RAG Chat) ─────────────────┐
  ├── A1 后端 SSE 端点                    │
  ├── A2 前端流式 Hook (← A1)            │
  ├── A3 聊天界面升级 (← A2)             │
  ├── A4 引用系统 (← A3)                 │
  └── A5 Store 对接 API                   │
                                          ▼
Phase B (文档管理) ──────────────►  Phase C (认证)
  ├── B1 上传 UI                    ├── C1 后端中间件
  ├── B2 文档列表                   ├── C2 路由保护 (← C1)
  ├── B3 状态轮询                   ├── C3 前端 Token 注入
  └── B4 路由导航                   └── C4 权限管理
                                          │
Phase D (图表 & 仪表盘) ◄─────────────────┘
  ├── D1 图表 API (← A1)
  ├── D2 Chat 图表渲染 (← D1)
  ├── D3 仪表盘页面
  └── D4 图表导出
                │
                ▼
Phase E (评估 & 测试) ───────► Phase F (部署 & 交付)
  ├── E1 批跑服务                ├── F1 Container Apps
  ├── E2 评估 API                ├── F2 Static Web Apps
  ├── E3 评估仪表盘              ├── F3 监控
  ├── E4 后端测试                ├── F4 i18n
  └── E5 前端测试                └── F5 演示材料
```

**关键路径**: A → B → C → D → E → F (每个 Phase 内部任务可并行)

---

## 🎯 测试策略

| 层级 | 工具 | 覆盖目标 | 关键测试 |
|:---|:---|:---|:---|
| 后端单元测试 | pytest + httpx | ≥80% | SSE 流式端点, 认证中间件, RAG 管道 |
| 后端集成测试 | pytest (SQLite) | 关键路径 | 全链路 RAG: 查询→检索→生成→引用 |
| 前端单元测试 | vitest + RTL | ≥60% | ChatInterface, DocumentList, Dashboard |
| 前端 E2E | Playwright | 关键流程 | 登录→聊天→上传→查看历史 |
| RAG 质量评估 | LLM-as-Judge | 6维度≥4.0 | Coherence, Faithfulness, Grounding |

---

## ⚠️ 风险与缓解

| 风险 | 影响 | 概率 | 缓解措施 |
|:---|:---|:---|:---|
| Azure 服务配额不足 | 搜索/嵌入限速 | Medium | 提前申请配额, 本地开发用 mock |
| SSE 在代理/CDN 后断连 | 流式体验受损 | Medium | 添加 WebSocket 降级方案 |
| Cosmos DB 迁移复杂 | 聊天历史迁移风险 | Low | 保留 SQLite 作为开发环境后端, Cosmos DB 仅用于生产 |
| 图表数据提取不稳 | LLM 输出格式不一致 | Medium | 结构化输出 (JSON mode) + 多次重试 + fallback 正则 |
| i18n 翻译量大 | 法语翻译不完整 | Low | 优先翻译关键 UI, 非关键使用英语 fallback |

---

## 📅 估算总结

| Phase | 名称 | 预估工时 | 累积 |
|:---|:---|:---|:---|
| **A** | 流式 RAG Chat | 8-10h | 8-10h |
| **B** | 文档管理 | 6-8h | 14-18h |
| **C** | 认证安全 | 4-6h | 18-24h |
| **D** | 图表 & 仪表盘 | 6-8h | 24-32h |
| **E** | 评估 & 测试 | 5-7h | 29-39h |
| **F** | 部署 & 交付 | 6-8h | 35-47h |
| **总计** | | **35-47h** | |

> 估算基于模板已就绪、Azure 服务已配置的前提。
> 如果需要从零配置 Azure 服务, 额外增加 4-6h。

---

## ✅ 成功标准 (对应 Master PRD KPIs)

- [ ] 答案准确率 ≥ 75% (SME 评估)
- [ ] 忠实度 ≥ 90% (引用验证)
- [ ] 上下文召回率 ≥ 85%
- [ ] 响应时间 P95 < 3s
- [ ] 搜索延迟 < 500ms
- [ ] 用户满意度 > 4.0/5.0
- [ ] 系统可用性 ≥ 99.5%
- [ ] LLM 评估 6 维度 ≥ 4.0/5.0
- [ ] 双语支持 (英/法)
- [ ] 演示材料完整交付

---

**等待确认**: 是否按此计划执行？(yes / no / modify)

**建议启动顺序**: Phase A 是核心体验, 建议优先完成。Phase B 和 C 可并行开发。

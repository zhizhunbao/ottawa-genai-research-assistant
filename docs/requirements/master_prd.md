# Ottawa GenAI Research Assistant - Master PRD

**项目**: 渥太华经济发展局 GenAI 研究助手  
**版本**: 6.0 (Focused Edition)  
**日期**: 2026-02-15  
**状态**: 总体规划 (Master Plan)  
**术语规范**: 参见 `dev-terminology`

---

## 1. 产品愿景 (Vision)

渥太华经济发展团队正与亚岗昆学院合作开发一款 **生成式 AI 研究助手**。该助手旨在回答自然语言问题，并根据 ottawa.ca 托管的经济发展更新 PDF（Q1 2022 – Q4 2025）生成带引用的摘要。

### 核心目标

- 为经济发展分析师 (Analyst) 构建基于 RAG 的智能助手
- 实现无需系统重新部署的自然语言问答
- 提供带有来源引用和置信度指标的可信输出
- 支持英语和法语双语交互 (i18n)
- **全栈 Azure** 云原生架构

### 产品范围 (Scope)

本版本聚焦于 **核心闭环**：上传文档 → 索引 → Chat 问答 → 引用来源。

| 模块                       | 范围内  | 说明                            |
| :------------------------- | :------ | :------------------------------ |
| **Chat (RAG 对话)**        | ✅      | 核心价值 — 流式回复 + 引用      |
| **Documents (文档管理)**   | ✅      | 数据入口 — 上传/索引/文件夹管理 |
| **Auth (认证)**            | ✅      | 用户隔离 — Azure AD / 本地登录  |
| **i18n (双语)**            | ✅      | 要求 — 英法双语 UI              |
| ~~Landing Page~~           | ❌ 砍掉 | 无面向公众需要                  |
| ~~Evaluation (评估框架)~~  | ❌ 砍掉 | 开发者工具，非用户价值          |
| ~~Analysis (图表可视化)~~  | ❌ 砍掉 | 锦上添花，后期可扩展            |
| ~~Dashboard (报告仪表盘)~~ | ❌ 砍掉 | 锦上添花                        |
| ~~Plugins/Marketplace~~    | ❌ 砍掉 | 探索性功能                      |
| ~~Demo Documentation~~     | ❌ 延后 | 功能完成后再做                  |

---

## 2. 成功指标 (KPIs)

| 指标                          | 目标     | 测量方法        |
| :---------------------------- | :------- | :-------------- |
| 答案准确率 (Accuracy)         | ≥75%     | SME 评估        |
| 忠实度 (Faithfulness)         | ≥90%     | 引用验证        |
| 上下文召回率 (Context Recall) | ≥85%     | 覆盖率分析      |
| 响应时间 (P95)                | <3s      | API 监控        |
| 搜索延迟                      | <500ms   | Azure AI Search |
| 用户满意度                    | >4.0/5.0 | 试点调查        |

---

## 3. 技术规格 (Technical Stack)

| 层级             | 技术                                          |
| ---------------- | --------------------------------------------- |
| **Frontend**     | React 18 + TypeScript (Vite)                  |
| **Backend**      | FastAPI 0.104+ (Python 3.12)                  |
| **Vector Store** | Azure AI Search（禁止本地向量存储）           |
| **Embedding**    | Azure OpenAI (text-embedding-ada-002)         |
| **LLM**          | Azure AI Foundry (GPT-4o) + Ollama (本地开发) |
| **Storage**      | Azure Blob Storage                            |
| **Database**     | SQLite (开发) / PostgreSQL (生产)             |
| **认证**         | Azure Entra ID + 本地 JWT (开发)              |

### 关键约束

| 禁止项           | 替代方案         |
| ---------------- | ---------------- |
| 本地向量存储     | Azure AI Search  |
| OpenAI 直接端点  | Azure AI Foundry |
| Create React App | Vite             |

---

## 4. 路线图 (Roadmap)

| Phase | 名称          | 状态      | PRD 文档                              |
| ----- | ------------- | --------- | ------------------------------------- |
| **1** | 基础架构      | ✅ 完成   | [phase1_prd.md](phases/phase1_prd.md) |
| **2** | 核心 RAG 功能 | 🔄 进行中 | [phase2_prd.md](phases/phase2_prd.md) |

> **注**: 原 Phase 3（高级功能）中的图表、评估、仪表盘已移至 `backlog`，不在当前范围内。

---

## 5. 当前聚焦 (Current Focus)

### Phase 2 剩余工作

| 用户故事            | 状态      | 剩余工作                     |
| :------------------ | :-------- | :--------------------------- |
| US-202 自然语言查询 | ✅ Done   | —                            |
| US-203 引用生成     | ✅ Done   | —                            |
| US-204 聊天历史     | ✅ Done   | —                            |
| US-205 双语支持     | ✅ Done   | —                            |
| **Chat UX 增强**    | 🔴 未完成 | 消息操作 + 智能滚动 + 虚拟化 |
| **文档管理 UI**     | ✅ Done   | —                            |
| **File Explorer**   | ✅ Done   | —                            |

**唯一剩余工作**: Chat UX 增强 (~3h)

---

## 6. 项目约束 (Constraints)

- **架构**: 必须使用 Azure 云服务
- **数据**: 仅处理公开文档
- **认证**: 支持 Azure Entra ID (生产) + 本地 JWT (开发)

---

## 7. Backlog (未来可扩展)

以下功能已从当前范围移除，可在核心功能稳定后按需添加：

| 功能         | 原 PRD | 优先级 | 说明                                     |
| :----------- | :----- | :----- | :--------------------------------------- |
| 图表可视化   | US-301 | P2     | Recharts 图表在聊天中渲染 (代码已有基础) |
| 报告仪表盘   | US-302 | P3     | 文档/查询统计页面                        |
| LLM 评估框架 | US-303 | P3     | 6 维度自动评估 (代码已有基础)            |
| 生产部署     | US-304 | P2     | Azure Container Apps + Static Web Apps   |
| 演示文档     | US-305 | P3     | 视频 + 文档 + API 文档                   |
| Plugin 系统  | —      | P4     | VS Code 插件模式                         |
| Landing Page | —      | P4     | 面向公众的介绍页                         |

---

## 8. 相关文档

- [Phase 1 PRD](phases/phase1_prd.md) - 基础架构 (✅ 完成)
- [Phase 2 PRD](phases/phase2_prd.md) - 核心 RAG 功能 (🔄 进行中)
- [File Explorer PRD](features/file-explorer-prd.md) - VS Code 风格文件管理

---

**Last Updated**: 2026-02-15  
**Version**: 6.0 — 聚焦核心闭环，砍掉非必要模块

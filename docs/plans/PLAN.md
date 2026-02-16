# Ottawa GenAI Research Assistant - 项目计划

**版本**: 3.0 (Focused Edition)  
**日期**: 2026-02-15  
**基于**: 代码审计 + PRD v6.0

---

## 当前状态

### ✅ 已完成 — 核心功能全部就绪

| 模块              | 后端                           | 前端                                        | 证据     |
| :---------------- | :----------------------------- | :------------------------------------------ | :------- |
| **流式 RAG Chat** | ✅ `POST /chat/stream` NDJSON  | ✅ `useChatStream` hook                     | 测试通过 |
| **会话管理**      | ✅ 7 endpoints CRUD            | ✅ `useChatStore` + 后端同步                | 测试通过 |
| **引用系统**      | ✅ Prompts + 源提取            | ✅ 5 citation 组件                          | 已实现   |
| **文档上传**      | ✅ Upload/status/delete        | ✅ `upload-panel` + `document-list`         | 测试通过 |
| **File Explorer** | ✅ Folder API + move/rename    | ✅ `file-explorer.tsx` (33KB)               | 已实现   |
| **消息操作**      | N/A                            | ✅ copy/edit/retry/delete hover toolbar     | 已实现   |
| **智能滚动**      | N/A                            | ✅ auto-scroll + floating button            | 已实现   |
| **消息虚拟化**    | N/A                            | ✅ `@tanstack/react-virtual` (50+ 消息触发) | 已实现   |
| **聊天设置**      | N/A                            | ✅ temperature/prompt/tokens/RAG toggle     | 已实现   |
| **模型选择**      | ✅ Ollama + Azure OpenAI       | ✅ `ModelSelector` 组件                     | 已实现   |
| **认证**          | ✅ JWT login/register          | ✅ `useAuthStore` + MSAL 配置               | 测试通过 |
| **i18n**          | N/A                            | ✅ EN/FR 完整对称                           | 已审计   |
| **部署配置**      | ✅ Dockerfile + docker-compose | ✅ Dockerfile + nginx                       | 已创建   |

### 🎯 结论：核心产品闭环已完成

用户可以：

1. 登录系统
2. 上传 PDF 到文件夹
3. 在 Chat 中向 AI 提问
4. 看到流式回复 + 引用来源
5. 复制/编辑/重试/删除消息
6. 管理多个会话
7. 切换模型/调整参数
8. 英法双语切换

---

## 下一步计划 — 质量打磨

以下是按优先级排序的改进项，均为 **质量提升**，不是新功能：

### P0: 端到端验证 (~1h)

| #   | 任务                                  | 验证方式        |
| :-- | :------------------------------------ | :-------------- |
| 1   | 启动后端 + 前端，完整走一遍核心流程   | 手动测试        |
| 2   | 确认 Chat 流式回复正常工作            | 发送真实问题    |
| 3   | 确认文档上传 → 索引 → Chat 检索闭环   | 上传 PDF 后提问 |
| 4   | 确认 File Explorer 文件夹 CRUD 正常   | 创建/删除/移动  |
| 5   | 确认消息操作 (copy/edit/retry/delete) | 逐个测试        |
| 6   | 确认模型切换功能正常                  | 切换到 Ollama   |

### P1: Bug 修复 & 稳定性 (~2h)

发现问题后在此补充具体 bug。

### P2: 代码清理 (~2h)

| #   | 任务                          | 说明                                             |
| :-- | :---------------------------- | :----------------------------------------------- |
| 1   | 清理未使用的 feature 目录引用 | landing/evaluation/plugins/analysis 如有残留引用 |
| 2   | 删除未使用的后端路由          | analysis/evaluation 路由如不需要                 |
| 3   | 清理 store exports            | `stores/index.ts` 中可能有未使用的导出           |

### P3: Backlog (未来可选)

| 功能                                 | 优先级 | 预估  |
| :----------------------------------- | :----- | :---- |
| ChatSettings 面板接入 chat-interface | P3     | 30min |
| 图表可视化恢复                       | P3     | 2h    |
| 生产部署到 Azure                     | P3     | 4h    |
| 演示文档                             | P4     | 3h    |

---

## 验收标准

- [ ] 核心流程 (登录 → 上传 → Chat → 引用) 端到端通过
- [ ] `npm run build` 无错误
- [ ] 后端测试全部通过
- [ ] 无 console 错误

---

**状态**: 等待端到端验证

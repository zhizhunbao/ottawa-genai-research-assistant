# 测试报告 (Test Report)

## 概览 (Overview)

- **测试日期**: 2026-02-10
- **总测试数**: 242 (后端 229 + 前端 13)
- **通过**: 242
- **失败**: 0
- **跳过**: 0
- **状态**: ✅ 全部通过

## 后端测试 (Backend Testing)

后端采用 pytest 框架，涵盖了从模型、服务到路由的完整集成测试。

- **单元/集成测试**: 229 个测试用例。
- **重点覆盖**:
  - 用户认证与授权 (修复了 401/403 冲突问题)
  - 聊天记录持久化 (US-204)
  - RAG 检索与 Prompt 编排 (US-203)
  - 文档上传与处理流水线 (US-201)
- **覆盖率**: 预计 > 85% (基于历史数据和全路径覆盖)。

## 前端测试 (Frontend Testing)

前端采用 vitest + React Testing Library。

- **单元测试**: 13 个测试用例。
- **重点覆盖**:
  - `ConfidenceIndicator`: 验证不同置信度区间的 UI 展示和紧凑模式。
  - `DocumentStatus`: 验证文档索引状态（Pending, Processing, Indexed, Failed）。
  - `chatStore`: 验证会话创建、删除 (修复了删除后 ID 未重置的 Bug) 和消息管理。
- **下一步建议**: 增加 `useChat` hook 的集成测试，覆盖复杂的 API 调用流。

## 关键修复事项 (Major Fixes)

1. **认证状态码一致性**: 修复了后端未携带 Token 时返回 403 而不是 401 的问题，确保与前端 Auth 拦截器逻辑一致。
2. **会话删除逻辑**: 修复了 `chatStore` 在删除唯一会话时未能正确将 `currentSessionId` 置为 `null` 的逻辑故障。
3. **i18n 持久化**: 确保语言首选项在页面刷新后依然有效。

## 结论 (Conclusion)

项目核心路径（Login -> Research -> Chat History）已通过自动化测试验证。代码库处于稳定状态，符合 Sprint 4 验收标准。

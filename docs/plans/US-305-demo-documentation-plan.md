# US-305: Demo Documentation - Implementation Plan

## Overview

创建完整的演示材料，用于向利益相关者展示项目成果。

**User Story**: US-305
**Sprint**: 6
**Story Points**: 5
**Status**: ⬜ To Do

---

## 需求重述

- 演示视频 (5-10 分钟)
- 用户指南
- API 文档
- Azure 资源配置截图
- 实时 API 调用演示

---

## 实现阶段

### 阶段 1: 演示脚本和故事板 (Hye Ran Yoo - 2h)

#### 1.1 演示脚本

**文件**: `docs/demo/demo-script.md`

```markdown
# Ottawa GenAI Research Assistant - 演示脚本

## 时长: 8 分钟

### 第一部分: 介绍 (1 分钟)
- 项目背景和目标
- 技术栈概述
- 团队介绍

### 第二部分: 登录流程 (1 分钟)
- 演示 Azure AD 单点登录
- 展示用户权限控制

### 第三部分: 核心功能演示 (4 分钟)

#### 3.1 自然语言查询 (2 分钟)
- 输入: "What was Ottawa's GDP growth rate in Q3 2025?"
- 展示响应和引用
- 展示置信度指示器
- 点击查看原文预览

#### 3.2 双语支持 (0.5 分钟)
- 切换到法语界面
- 用法语提问

#### 3.3 聊天历史 (0.5 分钟)
- 展示历史会话列表
- 继续之前的对话
- 删除历史记录

#### 3.4 图表可视化 (1 分钟)
- 查询包含数据的问题
- 展示自动生成的图表
- 导出图表为 PNG

### 第四部分: 技术架构 (1 分钟)
- Azure 服务架构图
- RAG 处理流程
- 性能指标

### 第五部分: 总结 (1 分钟)
- 项目成就
- 未来展望
- Q&A
```

#### 1.2 故事板

| 场景 | 画面内容 | 旁白要点 | 时长 |
|------|----------|----------|------|
| 1 | 项目 Logo + 标题 | 项目介绍 | 30s |
| 2 | 登录页面 | Azure AD 认证 | 30s |
| 3 | 聊天界面 - 空白 | 界面介绍 | 15s |
| 4 | 输入查询 | 自然语言查询 | 15s |
| 5 | 响应展示 | 引用和置信度 | 45s |
| ... | ... | ... | ... |

---

### 阶段 2: 录制演示视频 (Hye Ran Yoo - 4h)

#### 2.1 录制准备

- 清理浏览器缓存和历史
- 准备测试数据
- 设置屏幕录制工具 (OBS/Loom)
- 准备旁白脚本

#### 2.2 录制清单

- [ ] 录制登录流程
- [ ] 录制自然语言查询
- [ ] 录制引用和预览
- [ ] 录制双语切换
- [ ] 录制聊天历史
- [ ] 录制图表功能
- [ ] 录制 API 调用演示

#### 2.3 后期制作

- 视频剪辑
- 添加字幕
- 添加转场效果
- 导出最终版本 (MP4, 1080p)

**输出**: `docs/demo/ottawa-genai-demo.mp4`

---

### 阶段 3: 用户指南 (Hye Ran Yoo - 6h)

#### 3.1 用户指南结构

**文件**: `docs/guides/user-guide.md`

```markdown
# Ottawa GenAI Research Assistant - 用户指南

## 目录
1. 快速开始
2. 登录和认证
3. 聊天界面
4. 提问技巧
5. 理解响应
6. 聊天历史
7. 语言切换
8. 常见问题

## 1. 快速开始

### 1.1 访问系统
访问 https://ottawa-genai.azurewebsites.net

### 1.2 登录
点击「Sign in with Microsoft」使用组织账户登录。

### 1.3 首次使用
登录后，您将看到聊天界面。在输入框中输入您的问题即可开始。

## 2. 登录和认证
...

## 3. 聊天界面

### 3.1 界面布局
[截图: 聊天界面布局]

- **左侧边栏**: 聊天历史列表
- **中央区域**: 对话内容
- **底部输入框**: 输入问题

### 3.2 开始新对话
点击左上角「+ New Chat」按钮。

## 4. 提问技巧

### 4.1 有效问题示例
✅ "What was Ottawa's unemployment rate in Q2 2025?"
✅ "Compare GDP growth between Q1 and Q3 2025"
✅ "What are the main factors driving economic growth?"

### 4.2 避免的问题类型
❌ 过于模糊: "Tell me about Ottawa"
❌ 超出范围: "What's the weather today?"

## 5. 理解响应

### 5.1 响应结构
[截图: 响应示例]

- **答案**: AI 生成的回答
- **来源引用**: 信息来源列表
- **置信度**: 答案可信度指示

### 5.2 置信度等级
| 等级 | 含义 |
|------|------|
| 🟢 高 | 多个来源支持，高度可信 |
| 🟡 中 | 部分来源支持，需验证 |
| 🔴 低 | 来源有限，请谨慎参考 |

### 5.3 查看原文
点击引用卡片可查看原始文档内容。

## 6. 聊天历史
...

## 7. 语言切换
点击右上角地球图标，选择 English 或 Français。

## 8. 常见问题

### Q: 为什么我的问题没有得到回答？
A: 可能是因为相关信息不在我们的文档库中。请尝试更具体的问题。

### Q: 如何报告问题？
A: 请联系 support@ottawa-genai.ca
```

---

### 阶段 4: API 文档 (Peng Wang - 4h)

#### 4.1 自动生成 OpenAPI 文档

FastAPI 自动生成，访问 `/docs` 或 `/redoc`

#### 4.2 API 文档补充

**文件**: `docs/guides/api.md`

```markdown
# Ottawa GenAI Research Assistant - API 文档

## 基础信息

- **Base URL**: `https://api.ottawa-genai.ca/api/v1`
- **认证**: Azure AD Bearer Token
- **格式**: JSON

## 认证

所有 API 请求需要在 Header 中包含 Bearer Token:

```
Authorization: Bearer <access_token>
```

## 端点

### 聊天

#### POST /chat/query
发送自然语言查询。

**请求体**:
```json
{
  "query": "What was Ottawa's GDP growth rate in Q3 2025?",
  "session_id": "optional-session-id",
  "language": "en"
}
```

**响应**:
```json
{
  "answer": "Ottawa's GDP growth rate in Q3 2025 was 2.3%...",
  "sources": [
    {
      "document_id": "doc-123",
      "document_name": "Q3 2025 Economic Report",
      "page_number": 15,
      "excerpt": "The GDP growth rate reached 2.3% in the third quarter..."
    }
  ],
  "confidence": "high",
  "processing_time_ms": 1234
}
```

### 文档

#### GET /documents
获取文档列表。

#### GET /documents/{id}/status
获取文档处理状态。

### 会话历史

#### GET /chat/sessions
获取用户的会话列表。

#### DELETE /chat/sessions/{id}
删除指定会话。

## 错误码

| 代码 | 含义 |
|------|------|
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器错误 |

## 限流

- 每用户每分钟最多 60 次请求
- 超出限制返回 429 状态码
```

---

### 阶段 5: Azure 资源截图 (Travis Yi - 2h)

#### 5.1 截图清单

**目录**: `docs/demo/screenshots/`

- [ ] Azure 资源组概览
- [ ] Azure Blob Storage 容器
- [ ] Azure AI Search 索引
- [ ] Azure OpenAI 部署模型
- [ ] Azure Entra ID 应用注册
- [ ] Azure Container Apps 概览
- [ ] Azure Static Web Apps 概览
- [ ] Application Insights 仪表板
- [ ] Azure Cosmos DB 数据浏览器

#### 5.2 架构图

**文件**: `docs/demo/architecture-diagram.png`

使用 draw.io 或 Excalidraw 创建:

```
┌─────────────────────────────────────────────────────────┐
│                      Azure Cloud                         │
│  ┌─────────────┐     ┌─────────────┐                    │
│  │ Static Web  │     │ Container   │                    │
│  │ Apps        │────▶│ Apps        │                    │
│  │ (Frontend)  │     │ (Backend)   │                    │
│  └─────────────┘     └──────┬──────┘                    │
│                             │                            │
│         ┌───────────────────┼───────────────────┐       │
│         ▼                   ▼                   ▼       │
│  ┌─────────────┐     ┌─────────────┐     ┌───────────┐  │
│  │ Azure AI    │     │ Azure OpenAI│     │ Cosmos DB │  │
│  │ Search      │     │ (GPT-4o)    │     │           │  │
│  └─────────────┘     └─────────────┘     └───────────┘  │
│         ▲                                               │
│         │                                               │
│  ┌─────────────┐     ┌─────────────┐                    │
│  │ Blob        │     │ Entra ID    │                    │
│  │ Storage     │     │ (Auth)      │                    │
│  └─────────────┘     └─────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

---

### 阶段 6: 实时 API 演示环境 (Travis Yi - 2h)

#### 6.1 准备演示数据

- 上传示例 PDF 文档
- 确保文档已索引
- 准备常见查询列表

#### 6.2 Postman 集合

**文件**: `docs/demo/Ottawa-GenAI.postman_collection.json`

包含以下请求:
- 获取 Token
- 发送查询
- 获取会话列表
- 获取文档状态

#### 6.3 演示检查清单

- [ ] API 端点可访问
- [ ] 测试数据已准备
- [ ] 响应时间符合预期
- [ ] 错误处理正常

---

## 交付物清单

| 交付物 | 文件路径 | 负责人 |
|--------|----------|--------|
| 演示脚本 | `docs/demo/demo-script.md` | Hye Ran Yoo |
| 演示视频 | `docs/demo/ottawa-genai-demo.mp4` | Hye Ran Yoo |
| 用户指南 | `docs/guides/user-guide.md` | Hye Ran Yoo |
| API 文档 | `docs/guides/api.md` | Peng Wang |
| 架构图 | `docs/demo/architecture-diagram.png` | Travis Yi |
| 资源截图 | `docs/demo/screenshots/` | Travis Yi |
| Postman 集合 | `docs/demo/Ottawa-GenAI.postman_collection.json` | Travis Yi |

---

## 成功标准

- [ ] 演示视频 5-10 分钟，清晰展示所有功能
- [ ] 用户指南覆盖所有功能
- [ ] API 文档完整准确
- [ ] Azure 资源截图齐全
- [ ] 实时演示环境可用

---

## 估算复杂度: MEDIUM

| 部分 | 时间估算 | 状态 |
|------|----------|------|
| 演示脚本 | 2h | ⬜ 待开始 |
| 演示视频 | 4h | ⬜ 待开始 |
| 用户指南 | 6h | ⬜ 待开始 |
| API 文档 | 4h | ⬜ 待开始 |
| 资源截图 | 2h | ⬜ 待开始 |
| 演示环境 | 2h | ⬜ 待开始 |
| **总计** | **20h** | **0%** |

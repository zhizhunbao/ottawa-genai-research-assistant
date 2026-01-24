# Phase 1 PRD: 基础架构迁移

**Phase**: 1 of 3  
**时间**: 4 周  
**状态**: 🔄 进行中  
**前置**: 无  
**术语规范**: 参见 `dev-terminology`

---

## 目标

将项目从本地/混合架构迁移到 **全栈 Azure** 云原生架构。

---

## 用户故事

### US-101: 前端框架迁移

**作为** 开发者，  
**我想要** 将前端从 Create React App 迁移到 Vite，  
**以便** 消除依赖漏洞风险并提升开发体验。

**验收标准**:

- [ ] 使用 Vite 初始化新项目结构
- [ ] 迁移所有现有组件和路由
- [ ] 保持相同的功能和 UI
- [ ] 构建产物大小 ≤ CRA 版本
- [ ] 开发服务器热重载正常工作
- [ ] 无 npm audit 高危漏洞

### US-102: Azure 存储配置

**作为** 系统管理员，  
**我想要** 配置 Azure Blob Storage 作为文档存储，  
**以便** 文档可以安全持久化存储。

**验收标准**:

- [ ] 创建 Azure Blob Storage 账户（Standard LRS）
- [ ] 配置容器访问策略
- [ ] 连接字符串存储到 Azure Key Vault
- [ ] 后端可通过 SDK 访问 Blob Storage
- [ ] 支持 PDF 文件上传和下载

### US-103: Azure AI Search 配置

**作为** 系统管理员，  
**我想要** 配置 Azure AI Search 作为向量存储，  
**以便** 替换本地向量存储（FAISS/Chroma）。

**验收标准**:

- [ ] 创建 Azure AI Search 服务（Standard S1）
- [ ] 创建文档索引（含 text 和 vector 字段）
- [ ] 配置混合搜索（Vector + Keyword）
- [ ] API Key 存储到 Azure Key Vault
- [ ] 后端可执行搜索查询
- [ ] **删除**所有本地向量存储代码

### US-104: Azure OpenAI 配置

**作为** 系统管理员，  
**我想要** 配置 Azure OpenAI / AI Foundry 服务，  
**以便** 使用企业级 LLM 端点。

**验收标准**:

- [ ] 部署 GPT-4o 模型
- [ ] 部署 text-embedding-ada-002 模型
- [ ] 端点和 Key 存储到 Azure Key Vault
- [ ] 后端通过 Azure OpenAI SDK 调用
- [ ] **删除**所有 OpenAI 直接端点代码

### US-105: Azure Entra ID 认证

**作为** 用户，  
**我想要** 通过 Azure Entra ID 登录系统，  
**以便** 使用企业单点登录。

**验收标准**:

- [ ] 创建 Azure AD App Registration
- [ ] 配置 Redirect URI
- [ ] 前端集成 MSAL.js
- [ ] 后端验证 JWT Token
- [ ] 未认证用户重定向到登录
- [ ] **删除**所有 Google OAuth 代码

---

## 技术任务

| 任务                    | 优先级 | 依赖           |
| ----------------------- | ------ | -------------- |
| Vite 项目初始化         | P0     | 无             |
| 组件迁移                | P0     | Vite 初始化    |
| Azure Blob Storage 部署 | P0     | 无             |
| Azure AI Search 部署    | P0     | 无             |
| Azure OpenAI 部署       | P0     | 无             |
| Azure Key Vault 配置    | P0     | 各服务部署     |
| Azure Entra ID 配置     | P0     | 无             |
| 后端 Azure SDK 集成     | P1     | 各服务部署     |
| 前端 MSAL 集成          | P1     | Entra ID 配置  |
| 删除本地存储代码        | P1     | Azure 服务就绪 |

---

## 成功标准

- [ ] 前端使用 Vite 构建，无漏洞
- [ ] 所有存储使用 Azure 服务
- [ ] 所有密钥存储在 Key Vault
- [ ] 用户可通过 Entra ID 登录
- [ ] 无本地向量存储代码

---

## 风险与缓解

| 风险                | 缓解措施                |
| ------------------- | ----------------------- |
| Vite 迁移兼容性问题 | 逐步迁移，保留 CRA 备份 |
| Azure 服务配额限制  | 提前申请配额提升        |
| 认证集成复杂        | 使用 MSAL 官方示例      |

---

_Phase 1 of Ottawa GenAI Research Assistant. See [master_prd.md](master_prd.md) for overview._

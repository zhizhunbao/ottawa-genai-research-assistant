# 外部集成

**最后更新:** 2026-01-23  
**状态:** ⏳ 待实现

---

## Azure 服务集成

### Azure OpenAI

| 模型                   | 用途            | 端点                                                |
| ---------------------- | --------------- | --------------------------------------------------- |
| GPT-4o                 | 答案生成        | `/openai/deployments/{deployment}/chat/completions` |
| text-embedding-ada-002 | 文档/查询向量化 | `/openai/deployments/{deployment}/embeddings`       |

**配置项：**

- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_DEPLOYMENT_NAME`

### Azure AI Search

| 功能       | 说明              |
| ---------- | ----------------- |
| 向量搜索   | 语义相似度检索    |
| 关键词搜索 | BM25 全文检索     |
| 混合搜索   | 向量 + 关键词组合 |

**配置项：**

- `AZURE_SEARCH_ENDPOINT`
- `AZURE_SEARCH_API_KEY`
- `AZURE_SEARCH_INDEX_NAME`

### Azure Blob Storage

| 容器        | 用途           |
| ----------- | -------------- |
| `documents` | PDF 原文件存储 |
| `processed` | 处理后的元数据 |

**配置项：**

- `AZURE_STORAGE_CONNECTION_STRING`
- `AZURE_STORAGE_CONTAINER_NAME`

### Azure Key Vault

| 密钥类型   | 说明              |
| ---------- | ----------------- |
| API Keys   | 各服务的 API 密钥 |
| 连接字符串 | 数据库和存储连接  |

**配置项：**

- `AZURE_KEY_VAULT_URL`

## 认证集成

### Azure Entra ID

用于用户认证和单点登录 (SSO)。

| 功能      | 说明         |
| --------- | ------------ |
| OAuth 2.0 | 用户登录     |
| JWT Token | 会话管理     |
| RBAC      | 角色权限控制 |

## 环境变量模板

```bash
# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://xxx.openai.azure.com/
AZURE_OPENAI_API_KEY=xxx
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o

# Azure AI Search
AZURE_SEARCH_ENDPOINT=https://xxx.search.windows.net
AZURE_SEARCH_API_KEY=xxx
AZURE_SEARCH_INDEX_NAME=documents-index

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=xxx
AZURE_STORAGE_CONTAINER_NAME=documents

# Azure Key Vault
AZURE_KEY_VAULT_URL=https://xxx.vault.azure.net/
```

## 相关文档

- [后端架构](backend.md)
- [数据库设计](database.md)

---

_代码生成后此文档将自动更新_

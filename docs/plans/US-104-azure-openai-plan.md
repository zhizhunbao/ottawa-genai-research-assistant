# US-104: Azure OpenAI Configuration - Implementation Plan

## Overview

配置 Azure OpenAI / AI Foundry 服务，提供企业级 LLM 端点。

## Todos

- [x] 阶段1: 创建 Azure AI Foundry 资源 (Azure Portal) ✅
- [x] 阶段2: 部署 GPT-4o-mini 模型 ✅
- [x] 阶段3: 部署 text-embedding-ada-002 模型 ✅
- [x] 阶段4: 实现 AzureOpenAIService 类 ✅
- [x] 阶段5: 集成到 ResearchService ✅
- [x] 阶段6: 编写单元测试 ✅

## 实现阶段

### 阶段 1: Azure AI Foundry 资源创建 (Azure Portal)

- 创建 Azure OpenAI 资源
- 选择区域: Canada East (或支持 GPT-4o-mini 的区域)
- 记录 Endpoint 和 API Key
- 更新 `.env` 配置

### 阶段 2: 部署 GPT-4o-mini 模型

- 在 Azure AI Foundry 中部署 GPT-4o-mini
- 配置部署名称: `gpt-4o-mini`
- 设置 TPM (Tokens Per Minute) 配额

### 阶段 3: 部署 text-embedding-ada-002 模型

- 部署 embedding 模型
- 配置部署名称: `text-embedding-ada-002`
- 用于向量搜索的查询嵌入

### 阶段 4: AzureOpenAIService 实现

创建 `backend/app/core/azure_openai.py`:

- 初始化 AzureOpenAI 客户端
- 实现 embedding 生成方法
- 实现 chat completion 方法
- 实现流式响应方法

### 阶段 5: ResearchService 集成

更新 `backend/app/research/service.py`:

- 注入 AzureOpenAIService
- 替换 mock chat 为真实 LLM 调用
- 在搜索时生成查询向量

### 阶段 6: 单元测试

创建 `backend/tests/core/test_azure_openai.py`:

- 测试初始化
- 测试 embedding 生成
- 测试 chat completion
- 测试错误处理

## 技术规格

| 参数           | 规格                         |
| -------------- | ---------------------------- |
| LLM 模型       | GPT-4o-mini                  |
| Embedding 模型 | text-embedding-ada-002       |
| Embedding 维度 | 1536                         |
| API 版本       | 2024-02-15-preview           |
| SDK            | openai>=1.0.0 (Azure OpenAI) |

## 环境变量配置

```env
# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://<resource-name>.openai.azure.com/
AZURE_OPENAI_API_KEY=<api-key>
AZURE_OPENAI_API_VERSION=2024-02-15-preview
AZURE_OPENAI_CHAT_DEPLOYMENT=gpt-4o-mini
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-ada-002
```

## 依赖

- US-102: Azure Storage Configuration ✅
- US-103: Azure AI Search Configuration ✅
- openai>=1.0.0 (已安装)

## 文件变更

| 文件                              | 操作                    |
| --------------------------------- | ----------------------- |
| `app/core/azure_openai.py`        | 新建                    |
| `app/core/config.py`              | 添加 OpenAI 配置        |
| `app/core/dependencies.py`        | 添加 get_openai_service |
| `app/research/service.py`         | 更新集成                |
| `tests/core/test_azure_openai.py` | 新建                    |
| `.env.example`                    | 更新配置                |

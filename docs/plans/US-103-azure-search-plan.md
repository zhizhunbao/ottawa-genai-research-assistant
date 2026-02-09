# US-103: Azure AI Search Configuration - Implementation Plan

## Overview
配置 Azure AI Search 作为向量存储，实现混合搜索 (Vector + Keyword)。

## 实现阶段

### 阶段 1: Azure 资源创建 (Azure Portal)
- 创建 Azure AI Search 服务 (Standard S1)
- 记录 Endpoint 和 Admin Key
- 更新 `.env` 配置

### 阶段 2: AzureSearchService 实现
创建 `backend/app/core/azure_search.py`：
- 初始化 SearchClient
- 实现文档索引方法
- 实现混合搜索方法 (Vector + Keyword)
- 实现删除文档方法

### 阶段 3: 索引 Schema 定义
创建文档索引结构：
```json
{
  "name": "research-documents",
  "fields": [
    { "name": "id", "type": "Edm.String", "key": true },
    { "name": "title", "type": "Edm.String", "searchable": true },
    { "name": "content", "type": "Edm.String", "searchable": true },
    { "name": "content_vector", "type": "Collection(Edm.Single)", "dimensions": 1536 },
    { "name": "source", "type": "Edm.String", "filterable": true },
    { "name": "page_number", "type": "Edm.Int32" },
    { "name": "document_id", "type": "Edm.String", "filterable": true },
    { "name": "created_at", "type": "Edm.DateTimeOffset" }
  ]
}
```

### 阶段 4: ResearchService 集成
更新 `backend/app/research/service.py`：
- 注入 AzureSearchService
- 替换 mock 搜索为真实 Azure AI Search 调用
- 实现 Top-K 检索 (默认 5)

### 阶段 5: 单元测试
创建 `backend/tests/core/test_azure_search.py`：
- 测试初始化
- 测试文档索引
- 测试混合搜索
- 测试删除文档

## 技术规格

| 参数 | 规格 |
|------|------|
| 服务层级 | Standard S1 |
| 向量维度 | 1536 (text-embedding-ada-002) |
| 检索策略 | Hybrid (Vector + BM25) |
| Top-K | 5 chunks |
| 相似度算法 | Cosine |

## 依赖
- US-102: Azure Storage Configuration ✅
- azure-search-documents>=11.4.0 (已安装)

## 文件变更

| 文件 | 操作 |
|------|------|
| `app/core/azure_search.py` | 新建 |
| `app/core/dependencies.py` | 添加 get_search_service |
| `app/research/service.py` | 更新集成 |
| `tests/core/test_azure_search.py` | 新建 |
| `.env.example` | 已配置 |

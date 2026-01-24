# API 指南

**最后更新:** 2026-01-23  
**API 版本:** v1  
**基础 URL:** `http://localhost:8000/api/v1`

---

## 概述

Ottawa GenAI Research Assistant API 提供 RESTful 接口，支持：

- 自然语言查询和问答
- PDF 文档上传和管理
- 可视化生成
- 用户认证和授权

## 认证

API 使用 Bearer Token 认证：

```bash
Authorization: Bearer <your_token>
```

### 获取 Token

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

**响应：**

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "expires_in": 86400
  }
}
```

---

## 端点列表

### 查询接口

| 方法 | 端点          | 说明             |
| ---- | ------------- | ---------------- |
| POST | `/query`      | 提交自然语言查询 |
| GET  | `/query/{id}` | 获取查询结果     |
| GET  | `/history`    | 查询历史记录     |

### 文档接口

| 方法   | 端点                | 说明          |
| ------ | ------------------- | ------------- |
| GET    | `/documents`        | 获取文档列表  |
| POST   | `/documents/upload` | 上传 PDF 文档 |
| GET    | `/documents/{id}`   | 获取文档详情  |
| DELETE | `/documents/{id}`   | 删除文档      |

### 可视化接口

| 方法 | 端点              | 说明         |
| ---- | ----------------- | ------------ |
| POST | `/visualize`      | 生成图表     |
| POST | `/speaking-notes` | 生成演讲笔记 |

### 系统接口

| 方法 | 端点       | 说明     |
| ---- | ---------- | -------- |
| GET  | `/health`  | 健康检查 |
| GET  | `/metrics` | 系统指标 |

---

## 核心接口详情

### 提交查询

**POST** `/api/v1/query`

提交自然语言查询，获取基于文档库的回答。

**请求体：**

```json
{
  "query": "What were the employment trends in Q3 2024?",
  "options": {
    "max_sources": 5,
    "include_charts": true,
    "language": "en"
  }
}
```

**响应：**

```json
{
  "success": true,
  "data": {
    "id": "query_123",
    "answer": "According to the Q3 2024 Economic Development Update...",
    "sources": [
      {
        "document_id": "doc_456",
        "title": "Economic Development Update Q3 2024",
        "page": 12,
        "excerpt": "Employment in the technology sector increased by 3.2%...",
        "relevance_score": 0.92
      }
    ],
    "confidence": 0.87,
    "metrics": {
      "accuracy": 0.82,
      "faithfulness": 0.93,
      "context_recall": 0.88
    },
    "chart": {
      "type": "line",
      "data_url": "/api/v1/charts/chart_789"
    }
  },
  "timestamp": "2026-01-23T10:30:00Z"
}
```

### 上传文档

**POST** `/api/v1/documents/upload`

上传 PDF 文档进行处理和索引。

**请求：**

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "file=@economic_update_q4_2024.pdf" \
  -F "metadata={\"quarter\":\"Q4\",\"year\":2024}" \
  http://localhost:8000/api/v1/documents/upload
```

**响应：**

```json
{
  "success": true,
  "data": {
    "id": "doc_789",
    "filename": "economic_update_q4_2024.pdf",
    "status": "processing",
    "estimated_time": "5 minutes"
  }
}
```

### 获取文档列表

**GET** `/api/v1/documents`

获取所有已索引的文档列表。

**查询参数：**

| 参数      | 类型   | 说明                                  |
| --------- | ------ | ------------------------------------- |
| `page`    | int    | 页码 (默认: 1)                        |
| `limit`   | int    | 每页数量 (默认: 20, 最大: 100)        |
| `year`    | int    | 按年份筛选                            |
| `quarter` | string | 按季度筛选 (Q1, Q2, Q3, Q4)           |
| `status`  | string | 按状态筛选 (pending, indexed, failed) |

**响应：**

```json
{
  "success": true,
  "data": [
    {
      "id": "doc_123",
      "title": "Economic Development Update Q4 2024",
      "filename": "economic_update_q4_2024.pdf",
      "upload_date": "2026-01-15T10:00:00Z",
      "quarter": "Q4",
      "year": 2024,
      "status": "indexed",
      "page_count": 45
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 16,
    "pages": 1
  }
}
```

---

## 响应格式

所有 API 响应使用统一的 JSON 格式：

### 成功响应

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-01-23T10:30:00Z"
}
```

### 错误响应

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid query format",
    "details": [{ "field": "query", "message": "Query cannot be empty" }]
  },
  "timestamp": "2026-01-23T10:30:00Z"
}
```

## HTTP 状态码

| 状态码 | 说明       |
| ------ | ---------- |
| 200    | 成功       |
| 201    | 创建成功   |
| 400    | 请求错误   |
| 401    | 未认证     |
| 403    | 无权限     |
| 404    | 资源不存在 |
| 429    | 请求过多   |
| 500    | 服务器错误 |

## 速率限制

- 每用户每分钟 100 次请求
- 超出限制返回 429 状态码

---

## SDK 示例

### Python

```python
import requests

BASE_URL = "http://localhost:8000/api/v1"
TOKEN = "your_access_token"

headers = {"Authorization": f"Bearer {TOKEN}"}

# 提交查询
response = requests.post(
    f"{BASE_URL}/query",
    headers=headers,
    json={"query": "What were employment trends in Q3 2024?"}
)
result = response.json()
print(result["data"]["answer"])
```

### JavaScript

```javascript
const API_URL = "http://localhost:8000/api/v1";
const token = "your_access_token";

async function query(text) {
  const response = await fetch(`${API_URL}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: text }),
  });
  return response.json();
}

const result = await query("What were employment trends in Q3 2024?");
console.log(result.data.answer);
```

---

_更多详情请参考 OpenAPI 规范文档_

# 数据库设计

**最后更新:** 2026-01-23  
**状态:** ⏳ 待实现

---

## 存储架构

本项目使用 Azure 云服务作为主要存储：

| 服务               | 用途     | 数据类型     |
| ------------------ | -------- | ------------ |
| Azure Blob Storage | 文档存储 | PDF 原文件   |
| Azure AI Search    | 向量索引 | 文档嵌入向量 |
| 本地/内存          | 会话缓存 | 查询历史     |

## 数据模型（规划）

### Document（文档）

```python
{
    "id": "uuid",
    "title": "string",
    "filename": "string",
    "upload_date": "datetime",
    "quarter": "Q1|Q2|Q3|Q4",
    "year": "int",
    "status": "pending|indexed|failed",
    "page_count": "int",
    "chunk_count": "int",
    "blob_url": "string",
    "metadata": {
        "language": "en|fr",
        "topics": ["string"]
    }
}
```

### DocumentChunk（文档块）

```python
{
    "id": "uuid",
    "document_id": "uuid",
    "content": "string",
    "page_number": "int",
    "chunk_index": "int",
    "embedding": "[float]",  # 1536 维向量
    "metadata": {
        "section": "string",
        "has_table": "bool"
    }
}
```

### Query（查询记录）

```python
{
    "id": "uuid",
    "user_id": "uuid",
    "query_text": "string",
    "timestamp": "datetime",
    "response": {
        "answer": "string",
        "sources": ["..."],
        "confidence": "float"
    },
    "response_time_ms": "int"
}
```

## 索引结构

### Azure AI Search 索引

```json
{
  "name": "documents-index",
  "fields": [
    { "name": "id", "type": "Edm.String", "key": true },
    { "name": "content", "type": "Edm.String", "searchable": true },
    {
      "name": "embedding",
      "type": "Collection(Edm.Single)",
      "dimensions": 1536
    },
    { "name": "document_id", "type": "Edm.String", "filterable": true },
    { "name": "page_number", "type": "Edm.Int32", "filterable": true }
  ],
  "vectorSearch": {
    "algorithms": [{ "name": "hnsw", "kind": "hnsw" }]
  }
}
```

## 相关文档

- [后端架构](backend.md)
- [外部集成](integrations.md)

---

_代码生成后此文档将自动更新_

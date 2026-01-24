# 后端架构

**最后更新:** 2026-01-23  
**状态:** ⏳ 待实现

---

## 规划结构

```
backend/
├── app/
│   ├── main.py              # FastAPI 入口
│   ├── api/                 # API 路由
│   │   ├── v1/
│   │   │   ├── query.py     # 查询接口
│   │   │   ├── documents.py # 文档接口
│   │   │   └── auth.py      # 认证接口
│   │   └── deps.py          # 依赖注入
│   ├── core/                # 核心配置
│   │   ├── config.py        # 应用配置
│   │   └── security.py      # 安全配置
│   ├── models/              # 数据模型
│   │   ├── document.py
│   │   └── query.py
│   ├── services/            # 业务逻辑
│   │   ├── rag_service.py   # RAG 流水线
│   │   ├── document_service.py
│   │   └── embedding_service.py
│   └── utils/               # 工具函数
├── tests/                   # 测试
└── requirements.txt         # 依赖
```

## 技术栈

| 技术            | 版本   | 用途        |
| --------------- | ------ | ----------- |
| Python          | 3.12   | 运行时      |
| FastAPI         | 0.104+ | Web 框架    |
| Pydantic        | 2.x    | 数据验证    |
| Semantic Kernel | 1.x    | AI 编排     |
| uvicorn         | 0.24+  | ASGI 服务器 |

## 核心服务（规划）

| 服务              | 职责                 |
| ----------------- | -------------------- |
| RAG Service       | 检索增强生成流水线   |
| Document Service  | PDF 处理和分块       |
| Embedding Service | 向量化服务           |
| Vector Store      | Azure AI Search 集成 |

## 数据流

```
HTTP 请求 → FastAPI 路由 → 业务服务 → Azure 服务 → 响应返回
```

## 相关文档

- [前端架构](frontend.md)
- [数据库设计](database.md)
- [外部集成](integrations.md)

---

_代码生成后此文档将自动更新_

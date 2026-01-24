# Backend Application

Ottawa GenAI Research Assistant 后端服务。

## 技术栈

- **框架**: FastAPI
- **Python**: 3.11+
- **ORM**: SQLAlchemy (async)
- **验证**: Pydantic v2
- **AI**: Azure OpenAI, Azure AI Search

## 项目结构

```
backend/
├── app/
│   ├── main.py                # FastAPI 入口
│   ├── core/                  # 核心配置
│   │   ├── config.py          # 应用配置
│   │   ├── database.py        # 数据库连接
│   │   └── security.py        # 认证/授权
│   ├── shared/                # 共享工具
│   │   ├── exceptions.py      # 自定义异常
│   │   ├── schemas.py         # 通用 schemas
│   │   └── dependencies.py    # 依赖注入
│   ├── users/                 # 用户功能模块
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── service.py
│   │   └── routes.py
│   └── research/              # 研究/RAG 功能模块
│       ├── schemas.py
│       ├── service.py
│       └── routes.py
└── tests/                     # 测试
    └── conftest.py
```

## 快速开始

```bash
# 安装依赖
cd backend
uv sync

# 运行开发服务器
uv run uvicorn app.main:app --reload --port 8000

# 运行测试
uv run pytest tests/ -v
```

## API 文档

启动服务后访问:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

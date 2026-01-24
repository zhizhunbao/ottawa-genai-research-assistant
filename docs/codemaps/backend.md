# 后端架构

**最后更新:** 2026-01-24
**框架:** Python
**入口点:** backend\app\main.py

## 项目结构

```
backend/
  app/
    __init__.py
    analysis/
      routes.py
      schemas.py
      service.py
    core/
      __init__.py
      config.py
      database.py
      dependencies.py
      document_store.py
      enums.py
      exceptions.py
      models.py
      schemas.py
      security.py
      utils.py
    documents/
      __init__.py
      routes.py
      schemas.py
      service.py
    main.py
    research/
      __init__.py
      routes.py
      schemas.py
      service.py
    users/
      __init__.py
      models.py
      routes.py
      schemas.py
      service.py
  tests/
    __init__.py
    analysis/
      __init__.py
      test_routes.py
      test_service.py
    conftest.py
    core/
      __init__.py
      test_document_store.py
    documents/
      __init__.py
      test_routes.py
      test_service.py
    research/
      __init__.py
      test_routes.py
      test_service.py
    users/
      __init__.py
      test_routes.py
      test_service.py

```

## API 路由

| 文件 | 路径 | 用途 |
|------|------|------|
| routes.py | backend\app\analysis\routes.py | 路由定义 |
| routes.py | backend\app\documents\routes.py | 路由定义 |
| routes.py | backend\app\research\routes.py | 路由定义 |
| routes.py | backend\app\users\routes.py | 路由定义 |
| test_routes.py | backend\tests\analysis\test_routes.py | 路由定义 |
| test_routes.py | backend\tests\documents\test_routes.py | 路由定义 |
| test_routes.py | backend\tests\research\test_routes.py | 路由定义 |
| test_routes.py | backend\tests\users\test_routes.py | 路由定义 |


## 数据流

HTTP 请求 → 路由处理 → 业务逻辑 → 数据库操作 → 响应返回

## 外部依赖

暂无相关依赖

## 相关领域

- [前端架构](frontend.md) - 用户界面
- [数据库结构](database.md) - 数据持久化
- [外部集成](integrations.md) - 第三方 API

---
*由 generate-codemaps.js 自动生成 - 2026-01-24T21:48:20.750Z*

# Azure 服务模板

骨架模板，用于快速搭建 Azure 服务集成。

## 结构

```
azure/
├── base.py       # 协议定义 + 基类 + 重试装饰器
├── config.py     # Pydantic Settings 配置
├── exceptions.py # 异常层次结构
├── openai.py     # LLMService 实现
├── search.py     # SearchService 实现
├── storage.py    # StorageService 实现
└── factory.py    # 服务工厂
```

## 使用

```python
from app.core.azure import get_service_factory

factory = get_service_factory()

# 使用服务
result = await factory.openai.complete(messages=[...])
docs = await factory.search.hybrid_search("query")
url = await factory.storage.upload("file.pdf", content)
```

## 设计原则

1. **Protocol 接口** - 便于测试和替换实现
2. **懒加载** - 服务按需创建
3. **配置分离** - Pydantic Settings 管理环境变量
4. **统一异常** - 层次化异常便于错误处理

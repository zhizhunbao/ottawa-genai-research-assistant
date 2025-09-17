# Python 环境测试项目

这是一个用于测试Python开发环境的示例项目，包含了常见的Python开发模式和最佳实践。

## 功能特性

- ✅ 基础Python类和模块系统
- ✅ Pydantic数据模型和验证
- ✅ FastAPI Web API
- ✅ 数据处理示例
- ✅ 单元测试
- ✅ 代码格式化和检查

## 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 运行测试

```bash
python test_environment.py
```

### 3. 启动Web服务

```bash
python -m uvicorn main:app --reload
```

访问 http://localhost:8000 查看API文档

### 4. 运行单元测试

```bash
pytest tests/
```

## 项目结构

```
python-env-test/
├── README.md              # 项目说明
├── requirements.txt       # 依赖包
├── main.py               # FastAPI应用入口
├── test_environment.py   # 环境测试脚本
├── models/               # 数据模型
├── services/             # 业务逻辑
├── utils/                # 工具函数
└── tests/                # 测试文件
```

## 测试内容

1. **导入测试** - 验证所有模块可以正确导入
2. **类型检查** - 测试Pydantic模型和类型注解
3. **API测试** - 验证FastAPI功能
4. **数据处理** - 测试pandas和numpy
5. **代码跳转** - 验证IDE代码导航功能 
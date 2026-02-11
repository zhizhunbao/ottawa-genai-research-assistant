---
description: Clean up dead code, unused imports, and technical debt
---

# Refactor Clean

清理死代码、未使用的导入和技术债务。

## 清理范围

### 1. 未使用的代码

- **未使用的导入** - import 了但没使用
- **未使用的变量** - 声明了但没引用
- **未使用的函数** - 定义了但没调用
- **未使用的类** - 定义了但没实例化
- **未使用的参数** - 函数参数没使用

### 2. 死代码

- **永远不会执行的代码** - if False / return 后的代码
- **注释掉的代码** - 大段被注释的代码
- **过时的特性开关** - 永远开启或关闭的 feature flags

### 3. 技术债务

- **TODO/FIXME** - 没有对应 issue 的注释
- **废弃的 API** - 使用了已废弃的方法
- **重复代码** - 可以提取的公共逻辑

## 清理流程

### 步骤 1: 扫描

```bash
# Python - 使用 ruff
uv run ruff check . --select=F401,F841

# TypeScript - 使用 ESLint
npx eslint . --rule 'no-unused-vars: error'

# 或使用 ts-prune
npx ts-prune
```

### 步骤 2: 分类

按影响程度分类：

| 类别     | 风险 | 示例         |
| -------- | ---- | ------------ |
| 安全删除 | 低   | 未使用的导入 |
| 需要验证 | 中   | 未使用的函数 |
| 谨慎处理 | 高   | 公共 API     |

### 步骤 3: 清理

对于每个发现的问题：

1. **确认未使用** - 搜索整个代码库
2. **检查测试** - 确保测试覆盖
3. **删除代码** - 移除未使用的代码
4. **运行测试** - 验证不破坏功能
5. **提交变更** - 单独提交便于追溯

### 步骤 4: 验证

```bash
# 运行所有测试
uv run pytest tests/
npm test

# 运行类型检查
uv run mypy app/
npm run type-check

# 运行构建
npm run build
```

## 代码示例

### Python 清理

```python
# Before
import os  # 未使用
import json
from typing import List, Dict, Optional  # Optional 未使用

def unused_function():  # 未使用
    pass

def get_data():
    result = []
    temp = "unused"  # 未使用的变量
    return result

# After
import json
from typing import List, Dict

def get_data():
    result = []
    return result
```

### TypeScript 清理

```typescript
// Before
import { useState, useEffect, useCallback } from 'react'  // useCallback 未使用
import { Button, Input, Modal } from './components'  // Modal 未使用

const UNUSED_CONSTANT = 'not used'

function unusedHelper() {  // 未使用
  return null
}

export function Component() {
  const [data, setData] = useState([])
  const unusedVar = 'hello'  // 未使用

  return <div>{data}</div>
}

// After
import { useState, useEffect } from 'react'
import { Button, Input } from './components'

export function Component() {
  const [data, setData] = useState([])
  return <div>{data}</div>
}
```

## 自动化工具

### Python

```bash
# 自动删除未使用的导入
uv run autoflake --in-place --remove-all-unused-imports app/

# 检查未使用的代码
uv run vulture app/
```

### TypeScript

```bash
# 使用 knip 检测未使用的文件和依赖
npx knip

# 自动修复 ESLint 问题
npx eslint . --fix
```

## 最佳实践

1. **小批量清理** - 每次只清理一小部分
2. **运行测试** - 每次删除后都运行测试
3. **单独提交** - 清理代码应该单独提交
4. **保留历史** - Git 历史会保留删除的代码
5. **谨慎公共 API** - 可能有外部依赖

---

**保持代码库整洁，减少维护成本！**

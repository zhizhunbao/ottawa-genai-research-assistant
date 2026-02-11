---
description: Incrementally fix TypeScript and build errors one at a time
---

# Build Fix

逐步修复 TypeScript 和构建错误。

## 工作流程

### 1. 运行构建

```bash
# Python
uv run python -m py_compile app/main.py
uv run mypy app/

# TypeScript
npm run build
# 或
npx tsc --noEmit
```

### 2. 解析错误输出

- 按文件分组
- 按严重程度排序
- 确定修复顺序（考虑依赖关系）

### 3. 逐个修复

对于每个错误：

1. **显示错误上下文** - 错误前后 5 行代码
2. **解释问题** - 为什么会出现这个错误
3. **提出修复方案** - 具体的代码修改
4. **应用修复** - 执行修改
5. **重新构建** - 验证错误已解决
6. **确认** - 没有引入新错误

### 4. 停止条件

如果遇到以下情况，停止修复：

- 修复引入了新错误
- 同一个错误尝试 3 次后仍存在
- 用户请求暂停

### 5. 生成摘要

```markdown
## 构建修复摘要

### 已修复 ✅

- [错误 1]: 文件:行号 - 描述

### 仍存在 ⚠️

- [错误 2]: 文件:行号 - 描述

### 新引入 ❌

- [错误 3]: 文件:行号 - 描述
```

## 常见错误类型

### TypeScript

| 错误代码 | 描述                | 常见修复           |
| -------- | ------------------- | ------------------ |
| TS2304   | Cannot find name    | 添加 import 或声明 |
| TS2322   | Type mismatch       | 类型转换或修正类型 |
| TS2345   | Argument type error | 检查函数签名       |
| TS2551   | Property typo       | 修正属性名         |
| TS7006   | Implicit any        | 添加类型注解       |

### Python

| 错误类型       | 描述       | 常见修复           |
| -------------- | ---------- | ------------------ |
| ImportError    | 模块未找到 | 安装依赖或修正路径 |
| TypeError      | 类型错误   | 检查参数类型       |
| AttributeError | 属性不存在 | 检查对象类型       |
| SyntaxError    | 语法错误   | 检查括号、缩进     |

## 最佳实践

1. **一次只修复一个错误** - 避免连锁问题
2. **从根本原因开始** - 有些错误是其他错误的结果
3. **保留类型安全** - 避免使用 `any` 或 `# type: ignore`
4. **验证每次修复** - 确保没有引入新问题
5. **记录复杂修复** - 方便未来参考

## 紧急修复（谨慎使用）

如果需要快速通过构建：

```typescript
// TypeScript: 临时忽略（尽快修复）
// @ts-ignore - TODO: Fix type issue #123

// 或使用 any（不推荐）
const data = response as any;
```

```python
# Python: 临时忽略（尽快修复）
# type: ignore  # TODO: Fix type issue #123
```

**警告**: 这些只是临时解决方案，必须尽快正确修复！

---

**安全第一：一次修复一个错误！**

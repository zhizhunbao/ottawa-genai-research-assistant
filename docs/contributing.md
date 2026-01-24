# 贡献指南

感谢您对 Ottawa GenAI Research Assistant 项目的关注！本文档提供贡献代码、报告问题和参与项目开发的指南。

---

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发流程](#开发流程)
- [提交规范](#提交规范)
- [代码审查](#代码审查)
- [问题报告](#问题报告)

---

## 行为准则

请保持友善和尊重。我们致力于为所有人提供一个无骚扰的体验。

---

## 如何贡献

### 1. 报告 Bug

- 搜索现有 Issues 确认问题未被报告
- 使用 Bug 报告模板提交新 Issue
- 提供详细的复现步骤和环境信息

### 2. 功能建议

- 提交 Feature Request Issue
- 详细描述需求背景和预期行为
- 讨论后再开始实现

### 3. 代码贡献

1. Fork 仓库
2. 创建功能分支
3. 编写代码和测试
4. 提交 Pull Request
5. 等待代码审查

---

## 开发流程

### 环境搭建

参考 [开发环境配置](GUIDES/setup.md)

### 分支命名

```
feature/<功能描述>    # 新功能
fix/<bug描述>         # Bug 修复
docs/<文档描述>       # 文档更新
refactor/<重构描述>   # 代码重构
```

**示例：**

- `feature/add-chart-export`
- `fix/query-timeout-issue`
- `docs/update-api-guide`

### 开发步骤

```bash
# 1. 同步主分支
git checkout main
git pull origin main

# 2. 创建功能分支
git checkout -b feature/your-feature

# 3. 开发和测试
# ... 编写代码 ...

# 4. 提交变更
git add .
git commit -m "feat: add new feature"

# 5. 推送并创建 PR
git push origin feature/your-feature
```

---

## 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### 类型 (Type)

| 类型       | 说明                         |
| ---------- | ---------------------------- |
| `feat`     | 新功能                       |
| `fix`      | Bug 修复                     |
| `docs`     | 文档更新                     |
| `style`    | 代码格式（不影响功能）       |
| `refactor` | 重构（不新增功能或修复 Bug） |
| `test`     | 测试相关                     |
| `chore`    | 构建/工具相关                |

### 范围 (Scope)

- `frontend` - 前端代码
- `backend` - 后端代码
- `api` - API 接口
- `docs` - 文档
- `config` - 配置文件

### 示例

```bash
# 新功能
feat(backend): add PDF chunking service

# Bug 修复
fix(frontend): resolve query timeout issue

# 文档更新
docs(api): update authentication guide

# 重构
refactor(backend): extract common validation logic
```

---

## 代码审查

### PR 要求

- [ ] 代码遵循项目编码规范
- [ ] 所有测试通过
- [ ] 添加必要的测试用例
- [ ] 更新相关文档
- [ ] 提供清晰的 PR 描述

### 审查要点

- 代码质量和可读性
- 测试覆盖率
- 性能影响
- 安全考虑
- 文档完整性

---

## 问题报告

### Bug 报告模板

```markdown
## Bug 描述

简要描述问题

## 复现步骤

1. 执行操作 A
2. 执行操作 B
3. 观察到错误

## 预期行为

描述预期的正确行为

## 实际行为

描述实际观察到的行为

## 环境信息

- 操作系统: Windows 11
- 浏览器: Chrome 120
- 项目版本: 0.1.0

## 截图/日志

附上相关截图或错误日志
```

### Feature Request 模板

```markdown
## 功能描述

描述需要的功能

## 使用场景

说明什么情况下需要这个功能

## 预期行为

描述功能的预期表现

## 替代方案

是否考虑过其他方案

## 其他信息

任何有助于理解需求的信息
```

---

## 联系方式

如有问题，请通过以下方式联系：

- 提交 GitHub Issue
- 项目 Discussion 区

---

_感谢您的贡献！_

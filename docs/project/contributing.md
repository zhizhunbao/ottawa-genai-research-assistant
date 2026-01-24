# 贡献指南

感谢您对 Unknown Project 项目的关注！我们欢迎所有形式的贡献。

## 开发流程

### 1. 准备工作

1. Fork 本仓库
2. 克隆您的 Fork 到本地
3. 安装依赖：`npm install`
4. 阅读 [设置指南](../guides/setup.md)

### 2. 开发规范

#### 代码风格

- 遵循项目的 ESLint 和 Prettier 配置
- 使用有意义的变量和函数名
- 添加必要的注释和文档

#### 提交规范

使用 [Conventional Commits](https://conventionalcommits.org/) 格式：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**类型说明：**
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

**示例：**
```
feat: add user authentication
fix: resolve login redirect issue
docs: update API documentation
```

### 3. 测试要求

- 为新功能添加测试用例
- 确保所有测试通过：`npm test`
- 保持测试覆盖率不低于 80%

### 4. 文档更新

- 更新相关的 README 和文档
- 添加必要的代码注释
- 更新 API 文档（如适用）

## Pull Request 流程

### 1. 创建分支

```bash
git checkout -b feature/your-feature-name
```

### 2. 开发和测试

```bash
# 开发您的功能
# ...

# 运行测试
npm test

# 代码检查
npm run lint
```

### 3. 提交代码

```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

### 4. 创建 Pull Request

在 GitHub 上创建 Pull Request，包含：

- **标题**: 简洁描述变更内容
- **描述**: 详细说明变更的原因和内容
- **测试**: 说明如何测试您的变更
- **截图**: 如果是 UI 变更，请提供截图

### PR 模板

```markdown
## 变更描述
简要描述此 PR 的变更内容。

## 变更类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 文档更新
- [ ] 代码重构
- [ ] 性能优化

## 测试
- [ ] 添加了新的测试用例
- [ ] 所有现有测试通过
- [ ] 手动测试通过

## 检查清单
- [ ] 代码符合项目规范
- [ ] 提交信息符合规范
- [ ] 文档已更新
- [ ] 变更日志已更新（如需要）

## 关联 Issue
Closes #123
```

## 代码审查

### 审查标准

- **功能性**: 代码是否实现了预期功能
- **可读性**: 代码是否清晰易懂
- **性能**: 是否有性能问题
- **安全性**: 是否存在安全隐患
- **测试**: 测试是否充分

### 审查流程

1. 自动化检查（CI/CD）
2. 代码审查（至少一位维护者）
3. 测试验证
4. 合并到主分支

## 问题报告

### Bug 报告

使用 Issue 模板报告 Bug，包含：

- **Bug 描述**: 清晰简洁的描述
- **重现步骤**: 详细的重现步骤
- **预期行为**: 描述您期望发生的情况
- **实际行为**: 描述实际发生的情况
- **环境信息**: 操作系统、浏览器版本等
- **截图**: 如果适用

### 功能请求

- **功能描述**: 清晰描述建议的功能
- **使用场景**: 说明为什么需要这个功能
- **实现思路**: 如果有想法，可以简单描述

## 开发环境

### 推荐工具

- **编辑器**: VS Code
- **浏览器**: Chrome DevTools
- **Git 客户端**: 命令行或 GUI 工具
- **API 测试**: Postman 或 Insomnia

### 有用的命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 运行测试
npm test

# 代码检查
npm run lint

# 构建项目
npm run build
```

## 社区准则

### 行为准则

- 尊重所有参与者
- 欢迎新手和不同观点
- 专注于对项目最有利的事情
- 展现同理心和友善

### 沟通方式

- 使用清晰、简洁的语言
- 提供建设性的反馈
- 及时响应问题和 PR
- 保持专业和友好的态度

## 获得帮助

如果您在贡献过程中遇到问题：

- 查看现有的 Issues 和 Discussions
- 阅读项目文档
- 联系项目维护者

## 致谢

感谢所有贡献者的努力！您的贡献让这个项目变得更好。

---

*由 update-docs.js 自动生成 - 最后更新: 2026-01-24*

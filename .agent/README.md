# Antigravity 配置

本目录包含 Antigravity AI 助手的配置文件。

> 基于 [everything-claude-code](https://github.com/affaan-m/everything-claude-code) 最佳实践

## 快速导航

- **[AGENTS.md](../AGENTS.md)** - 项目主配置（AI 助手自动读取）
- **[workflows/](./workflows/)** - 工作流指南（斜杠命令）
- **[skills/](./skills/)** - 技能库

---

## 目录结构

```
.agent/
├── README.md                     # 本文件
├── workflows/                    # 工作流指南（/command 调用）
│   ├── plan.md                   # ⭐ /plan - 实现前规划
│   ├── code-review.md            # /code-review - 代码审查
│   ├── build-fix.md              # /build-fix - 修复构建错误
│   ├── code-quality.md           # /code-quality - 代码质量
│   ├── security-guidelines.md    # /security-guidelines - 安全检查
│   ├── testing-requirements.md   # /testing-requirements - 测试要求
│   ├── e2e.md                    # /e2e - E2E 测试生成
│   ├── refactor-clean.md         # /refactor-clean - 清理死代码
│   ├── performance.md            # /performance - 性能优化
│   ├── patterns.md               # /patterns - 设计模式
│   ├── git-workflow.md           # /git-workflow - Git 规范
│   └── windows-commands.md       # /windows-commands - Windows 命令
└── skills/ → ../.skills/         # 技能库（链接）
```

---

## 核心技能

| Skill                   | 描述         | 技术栈               |
| ----------------------- | ------------ | -------------------- |
| `dev-backend_patterns`  | 后端架构模式 | TypeScript + Python  |
| `dev-frontend_patterns` | 前端开发模式 | React/TypeScript     |
| `dev-coding_standards`  | 编码标准     | TypeScript + Python  |
| `dev-tdd_workflow`      | TDD 工作流   | Jest/Vitest + pytest |

---

## 使用方式

### 1. 项目配置自动加载

`AGENTS.md` 位于项目根目录，Antigravity 自动读取：

- 项目概述和技术栈
- 核心规则和安全要求
- 可用工作流列表

### 2. 斜杠命令

```
/plan              # 创建实现计划，等待确认
/code-review       # 执行代码审查
/build-fix         # 修复构建错误
/e2e               # 生成 E2E 测试
```

### 3. 技能触发

在对话中提到关键词，技能自动加载：

| 关键词             | 技能                    |
| ------------------ | ----------------------- |
| "TDD" / "测试优先" | `dev-tdd_workflow`      |
| "Repository 模式"  | `dev-backend_patterns`  |
| "React 组件"       | `dev-frontend_patterns` |
| "代码规范"         | `dev-coding_standards`  |

---

## 与 Claude Code 对比

| 功能     | Claude Code | Antigravity         |
| -------- | ----------- | ------------------- |
| 项目配置 | `CLAUDE.md` | `AGENTS.md`         |
| 斜杠命令 | `commands/` | `.agent/workflows/` |
| 技能     | `skills/`   | `.agent/skills/`    |
| 规则     | `rules/`    | 在 `AGENTS.md` 中   |
| 钩子     | `hooks/`    | ❌ 不支持           |
| 子代理   | `agents/`   | ❌ 不支持           |

---

**来源**: 基于 [everything-claude-code](https://github.com/affaan-m/everything-claude-code) 合并优化

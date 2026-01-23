# Kiro 配置

本目录包含 Kiro IDE 的配置文件和开发规范。

## 目录结构

```
.kiro/
├── steering/              # 强制规范（自动加载）
│   ├── security-guidelines.md      # 安全检查清单
│   ├── code-quality.md             # 代码质量标准
│   ├── git-workflow.md             # Git 工作流
│   ├── testing-requirements.md     # 测试要求（80% 覆盖率）
│   ├── windows-commands.md         # Windows 命令规范
│   └── skills-manager.md           # Skills 自动加载配置
└── hooks/                 # 自动化工作流（事件触发）
    ├── code-quality-check.json     # 保存时检查代码质量
    ├── security-check.json         # 保存时检查安全
    ├── tdd-reminder.json           # 创建文件时提醒写测试
    ├── test-coverage-reminder.json # 完成时提醒检查覆盖率
    └── commit-checklist.json       # 提交前检查清单
```

## Skills (工作流指导)

位于 `../.skills/` 目录，关键词自动触发：

- `dev-tdd_workflow` - TDD 工作流
- `dev-backend_patterns` - 后端架构模式
- `dev-frontend-patterns` - 前端开发模式
- `dev-coding_standards` - 通用编码标准
- `dev-security_review` - 安全审查
- `dev-github_review` - GitHub 项目审查
- `dev-code_quality_check` - 代码质量检查工具
- `dev-security_scan` - 安全扫描工具

## 工具脚本

位于各 skill 的 `scripts/` 目录：

```powershell
# 检查代码质量
uv run python .skills/dev-code_quality_check/scripts/code_quality_checker.py <file>

# 扫描安全问题
uv run python .skills/dev-security_scan/scripts/security_scanner.py <file>
```

## 使用方式

### Rules - 自动生效
所有 `steering/` 下的规范会自动加载，始终遵循。

### Skills - 关键词触发
在对话中提到关键词，相关 skill 自动加载：
- "用 TDD 开发" → 加载 `dev-tdd_workflow`
- "Repository 模式" → 加载 `dev-backend_patterns`
- "React 优化" → 加载 `dev-frontend-patterns`

### Hooks - 事件触发
- 保存 Python 文件 → 自动检查质量和安全
- 创建新文件 → 提醒先写测试
- Agent 完成 → 提醒检查覆盖率

---

**来源**: 改编自 [everything-claude-code](https://github.com/affaan-m/everything-claude-code)

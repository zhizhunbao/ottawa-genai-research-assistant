---
description: 使用 dev-scrum skill 从 PRD 生成完整的 Sprint 计划
---

# 生成 Sprint 计划

使用 `dev-scrum` skill 从 PRD 需求文档自动生成 Sprint 计划。

## 前置条件

1. PRD 文档已准备好 (通常在 `docs/requirements/` 目录)
2. 确定项目开始日期
3. 了解团队规模

## 执行步骤

### 1. 阅读 SKILL 文档

// turbo
首先阅读 dev-scrum skill 的完整文档了解规范：

```
查看文件: .github/ai-dev-config/core/skills/dev-scrum/SKILL.md
```

### 2. 分析 PRD 文档

识别 PRD 中的：

- 用户故事 (User Stories)
- Phase 划分
- 验收标准
- 技术需求

### 3. 故事点估算

根据 `references/estimation-guide.md` 进行估算：

| 复杂度 | 故事点 | 参考时间 |
| ------ | ------ | -------- |
| 极简   | 1      | ≤1天     |
| 简单   | 2      | 1-2天    |
| 中等   | 3      | 2-3天    |
| 较复杂 | 5      | 3-5天    |
| 复杂   | 8      | 5-8天    |
| 极复杂 | 13     | 需拆分   |

### 4. 创建 Sprint 目录

// turbo

```bash
mkdir -p docs/sprints
```

### 5. 生成 Sprint 总览

使用 `templates/sprint-overview-template.md` 模板创建 `docs/sprints/README.md`

### 6. 生成各 Sprint 详情

对每个 Sprint 使用 `templates/sprint-template.md` 模板：

- `docs/sprints/sprint-1.md`
- `docs/sprints/sprint-2.md`
- ...

### 7. 验证检查

确保：

- [ ] 所有 PRD 用户故事已分配
- [ ] 每个 Sprint 容量未超载 (建议 15-20 点/Sprint)
- [ ] 依赖关系正确
- [ ] 日期计算准确

## 输出

```
docs/sprints/
├── README.md      # Sprint 总览
├── sprint-1.md    # Sprint 1 详情
├── sprint-2.md    # Sprint 2 详情
└── ...
```

## 相关资源

- SKILL 文档: `.github/ai-dev-config/core/skills/dev-scrum/SKILL.md`
- 估算指南: `.github/ai-dev-config/core/skills/dev-scrum/references/estimation-guide.md`
- 术语表: `.github/ai-dev-config/core/skills/dev-scrum/references/glossary.md`

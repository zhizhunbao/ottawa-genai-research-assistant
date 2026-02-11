---
description: 完整软件开发流程 - 从需求到上线的一站式工作流（MetaGPT-Enhanced）。启动/继续完整流程。
---

# Full Development Workflow (MetaGPT-Enhanced)

一个命令，完成从需求分析到部署的完整开发流程。自动跳过已完成的阶段。
借鉴 MetaGPT 的多角色协作模式。

## 使用方法

```
/full-dev                    # 启动/继续完整流程
/full-dev auto               # 自动模式（通过检查后自动继续）
/full-dev status             # 查看当前进度和角色信息
/full-dev context            # 显示当前上下文
/full-dev messages           # 显示消息历史
/full-dev checkpoint         # 运行当前阶段验收检查
/full-dev skip               # 跳过当前阶段
/full-dev goto <phase_key>   # 跳转到指定阶段 (使用 phase key)
/full-dev reset              # 重置状态，从头开始
```

## 执行流程

### 1. 加载状态

读取以下配置文件：

- `.dev-state.yaml` - 当前状态（使用 phase key，不用编号）
- `.agent/workflows/metagpt-enhanced/roles.yaml` - 角色定义
- `.agent/workflows/metagpt-enhanced/checkpoints.yaml` - 验收标准
- `docs/sprints/Sprint_Plan_Ottawa_GenAI_Research_Assistant.md` - Sprint 计划

如果状态文件不存在，从 `requirements` 阶段开始。
如果某阶段已标记 `completed`，跳过该阶段。
如果某阶段标记 `in_progress`，继续该阶段。

### 2. 阶段定义

**所有阶段使用字符串 key，不使用数字编号。**

| Order | Phase Key      | 名称         | 角色             | Step 文件                 | 产出物                                                        |
| ----- | -------------- | ------------ | ---------------- | ------------------------- | ------------------------------------------------------------- |
| 1     | `requirements` | 需求分析     | Alice (PM)       | `step-01-requirements.md` | `docs/requirements/`                                          |
| 2     | `prd`          | 产品需求文档 | Alice (PM)       | `step-02-prd.md`          | `docs/requirements/master_prd.md`                             |
| 3     | `ux_design`    | UX 设计      | -                | (可跳过)                  | -                                                             |
| 4     | `architecture` | 系统架构     | Bob (Architect)  | `step-03-architecture.md` | `docs/architecture/system-architecture.md`                    |
| 5     | `stories`      | 任务分解     | Charlie (Lead)   | `step-04-stories.md`      | `docs/sprints/Sprint_Plan_Ottawa_GenAI_Research_Assistant.md` |
| 6     | `database`     | 数据库设计   | Bob (Architect)  | `step-05-database.md`     | `docs/codemaps/database.md`                                   |
| 7     | `backend`      | 后端开发     | David (Backend)  | `step-06-backend.md`      | `backend/app/`                                                |
| 8     | `frontend`     | 前端开发     | Eve (Frontend)   | `step-07-frontend.md`     | `frontend/src/`                                               |
| 9     | `testing`      | 测试         | Frank (QA)       | `step-08-testing.md`      | `backend/tests/`, test reports                                |
| 10    | `review`       | 代码审查     | Grace (Reviewer) | `step-09-review.md`       | `docs/review-report.md`                                       |
| 11    | `deployment`   | 部署         | Henry (DevOps)   | `step-10-deployment.md`   | Deploy config                                                 |

**Phase key 顺序**: `requirements` → `prd` → `ux_design` → `architecture` → `stories` → `database` → `backend` → `frontend` → `testing` → `review` → `deployment`

### 3. 🎯 Template-First Principle (核心原则)

**在写任何代码之前，必须先查找并使用现有的模板和脚本。**

```
1. 查找模板 → 在 .agent/templates/ 中查找匹配的模板文件
2. 查找脚本 → 在 .agent/scripts/ 中查找可用的自动化脚本
3. 使用脚手架 → 对于新功能模块，优先运行 scaffold.py 生成骨架代码
4. 如果不存在 → 先创建模板/脚本，再生成实际代码
5. 按模板生成 → 基于模板生成代码，然后填充业务逻辑
```

各阶段对应资源:

| Phase Key    | 模板 (`.agent/templates/`) | 脚本 (`.agent/scripts/`)                            |
| ------------ | -------------------------- | --------------------------------------------------- |
| `stories`    | `docs/plan.md.template`    | -                                                   |
| `backend`    | `backend/*.template`       | `scaffold.py feature --name <name> --type backend`  |
| `frontend`   | `frontend/*.template`      | `scaffold.py feature --name <name> --type frontend` |
| `testing`    | `tests/*.template`         | `coverage_report.py`, `extract_i18n.py --check`     |
| `review`     | -                          | `env_check.py --files`                              |
| `deployment` | `devops/*.template`        | `env_check.py --env production`                     |

### 4. 执行当前阶段

// turbo-all

1. 读取 `.dev-state.yaml` 获取 `current_phase`（字符串 key）
2. 找到对应的 step 文件:
   - Step 文件位于 `.agent/workflows/full-development-steps/` 目录
   - 根据上面的阶段表查找对应的 step 文件
3. 读取该 step 文件的详细指令
4. **🔍 模板/脚本查找** (Template-First):
   - 检查 `.agent/templates/` 中是否有匹配的模板
   - 检查 `.agent/scripts/` 中是否有可用脚本
   - 新功能模块: 运行 `python .agent/scripts/scaffold.py feature --name <name>`
   - 如果缺少模板: 先在 `.agent/templates/` 中创建，再使用
5. 参考 Sprint Plan 和 US Plans 获取具体任务
6. 基于模板和 step file 指令执行任务
7. 执行完成后，更新 `.dev-state.yaml`：
   - 将当前阶段标记为 `completed`
   - 将 `current_phase` 设为下一个 phase key
8. 询问用户是否继续下一阶段

### 5. Frontend & Backend 并行开发

如果 `.dev-state.yaml` 中 `config.parallel_frontend_backend: true`，
则 `backend` 和 `frontend` 阶段可以并行执行。
这种情况下两个阶段都标记为 `in_progress`。

### 5. 验收检查

| Phase    | Checkpoints                                                                      |
| -------- | -------------------------------------------------------------------------------- |
| Backend  | `cd backend && uv run ruff check app/`, `cd backend && uv run pytest --tb=short` |
| Frontend | `cd frontend && npm run lint`, `cd frontend && npx tsc --noEmit`                 |
| Testing  | All tests pass                                                                   |
| Review   | No CRITICAL issues                                                               |

### 6. 状态管理命令

**status**: 读取 `.dev-state.yaml`，显示每个阶段的状态
**reset**: 删除 `.dev-state.yaml`，提示用户确认
**skip**: 将当前阶段标记为 `skipped`，进入下一阶段
**goto <phase_key>**: 将 `current_phase` 设为指定 phase key

## 项目路径参考

| 资源           | 路径                                                          |
| -------------- | ------------------------------------------------------------- |
| 需求文档       | `docs/requirements/master_prd.md`                             |
| 架构文档       | `docs/architecture/system-architecture.md`                    |
| Sprint 计划    | `docs/sprints/Sprint_Plan_Ottawa_GenAI_Research_Assistant.md` |
| US 计划        | `docs/plans/US-xxx-plan.md`                                   |
| 后端代码       | `backend/app/`                                                |
| 后端测试       | `backend/tests/`                                              |
| 前端代码       | `frontend/src/`                                               |
| 数据库 CodeMap | `docs/codemaps/database.md`                                   |
| 测试报告       | `docs/test-report.md`                                         |

## 配置选项

`.dev-state.yaml` 配置：

```yaml
config:
  parallel_frontend_backend: true # 前后端并行开发
  auto_check: true # 自动运行检查
  docs_dir: docs # 文档目录
```

# Full Development Workflow (MetaGPT-Enhanced)

借鉴 MetaGPT 的多角色协作模式，实现完整的软件开发流程。

## Usage

```
/full-dev                 # 启动/继续工作流
/full-dev auto            # 自动模式（通过检查后自动继续）
/full-dev status          # 显示详细状态和角色信息
/full-dev context         # 显示当前上下文
/full-dev messages        # 显示消息历史
/full-dev checkpoint      # 运行当前阶段验收检查
/full-dev skip            # 跳过当前阶段
/full-dev goto <phase>    # 跳转到指定阶段 (phase key)
/full-dev reset           # 重置状态
```

## 🎯 Template-First Principle (核心原则)

**在写任何代码之前，必须先查找并使用现有的模板和脚本。**

### 执行顺序（每个任务都必须遵循）

```
1. 查找模板 → 在 .agent/templates/ 中查找匹配的模板文件
2. 查找脚本 → 在 .agent/scripts/ 中查找可用的自动化脚本
3. 使用脚手架 → 对于新功能模块，优先运行 scaffold.py 生成骨架代码
4. 如果不存在 → 先创建模板/脚本，再生成实际代码
5. 按模板生成 → 基于模板生成代码，然后填充业务逻辑
```

### 模板目录 (`.agent/templates/`)

| 类别         | 模板文件                                         | 用途                                     |
| ------------ | ------------------------------------------------ | ---------------------------------------- |
| **Backend**  | `routes.py.template`                             | FastAPI 路由 CRUD                        |
|              | `service.py.template`                            | 服务层业务逻辑                           |
|              | `schemas.py.template`                            | Pydantic 请求/响应模型                   |
|              | `models.py.template`                             | SQLAlchemy 数据库模型                    |
|              | `middleware.py.template`                         | FastAPI 中间件                           |
|              | `streaming.py.template`                          | SSE 流式响应                             |
|              | `prompts.py.template`                            | LLM Prompt 管理                          |
|              | `cache.py.template`                              | 缓存封装                                 |
|              | `azure/*.template`                               | Azure 服务集成 (OpenAI, Search, Storage) |
| **Frontend** | `component.tsx.template`                         | React 组件 (含 i18n)                     |
|              | `hook.ts.template`                               | 自定义 Hook                              |
|              | `service.ts.template`                            | API 服务调用                             |
|              | `store.ts.template`                              | Zustand 状态管理                         |
|              | `types.ts.template`                              | TypeScript 类型定义                      |
|              | `Page.tsx.template`                              | 页面组件                                 |
|              | `Modal.tsx.template`, `List.tsx.template`, etc.  | UI 组件                                  |
|              | `i18n-en.json.template`, `i18n-fr.json.template` | 翻译文件                                 |
| **Tests**    | `conftest.py.template`                           | Pytest fixtures                          |
|              | `test_routes.py.template`                        | FastAPI 路由测试                         |
|              | `test_service.py.template`                       | 服务层测试                               |
|              | `component.test.tsx.template`                    | React 组件测试                           |
| **Docs**     | `plan.md.template`                               | US 实施计划                              |
| **DevOps**   | `Dockerfile.backend.template`                    | 后端 Docker 镜像                         |
|              | `Dockerfile.frontend.template`                   | 前端 Docker 镜像                         |
|              | `docker-compose.yml.template`                    | 编排配置                                 |
|              | `github-ci.yml.template`                         | CI/CD 配置                               |

### 脚本目录 (`.agent/scripts/`)

| 脚本                 | 命令                                                                  | 用途             |
| -------------------- | --------------------------------------------------------------------- | ---------------- |
| `scaffold.py`        | `python .agent/scripts/scaffold.py feature --name <name> --type full` | 脚手架生成新功能 |
| `env_check.py`       | `python .agent/scripts/env_check.py --files`                          | 环境变量检查     |
| `coverage_report.py` | `python .agent/scripts/coverage_report.py --threshold 80`             | 测试覆盖率报告   |
| `extract_i18n.py`    | `python .agent/scripts/extract_i18n.py --check`                       | i18n 翻译键检查  |

### 模板使用示例

**创建新的后端功能模块**:

```bash
# 方式 1: 使用脚手架脚本（推荐）
python .agent/scripts/scaffold.py feature --name evaluation --type backend

# 方式 2: 手动读取模板
# 读取 .agent/templates/backend/routes.py.template
# 替换变量: {{feature_name}} → evaluation, {{FeatureName}} → Evaluation
# 生成到 backend/app/evaluation/routes.py
```

**创建缺失的模板**:
如果需要的模板类型不存在（例如 WebSocket handler），先创建模板文件到 `.agent/templates/` 对应目录，再基于该模板生成代码。

---

## Execution Instructions

### 1. Load Configuration

Read the following files:

- `.dev-state.yaml` - Current state (phase keys, not numbers)
- `.agent/workflows/metagpt-enhanced/roles.yaml` - Role definitions
- `.agent/workflows/metagpt-enhanced/checkpoints.yaml` - Acceptance criteria
- `docs/sprints/Sprint_Plan_Ottawa_GenAI_Research_Assistant.md` - Sprint Plan (US-xxx tasks)

### 2. Phase Definitions

Phases use **string keys** (not numbers). The execution order is:

| Order | Phase Key      | Name         | Role             | Step File                 | Output                                                        |
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

**Phase key order**: `requirements` → `prd` → `ux_design` → `architecture` → `stories` → `database` → `backend` → `frontend` → `testing` → `review` → `deployment`

### 3. Activate Role

For the current phase, activate the corresponding role from `roles.yaml`:

**Role Activation**: When starting a phase, adopt the role's persona:

```
You are {name}, a {profile}.

**Goal**: {goal}
**Constraints**: {constraints}

## Context from Previous Phases
{gathered_context}

## Sprint Plan Reference
Read docs/sprints/Sprint_Plan_Ottawa_GenAI_Research_Assistant.md for US-xxx task status.
Read docs/plans/US-xxx-plan.md for detailed implementation plans.

## Your Current Task
Execute phase: {phase_key} - {phase_name}
```

### 4. Gather Context

Before executing a phase, collect outputs from completed phases:

```markdown
## Previous Phase Outputs

### From Alice (Product Manager):

- PRD: docs/requirements/master_prd.md
- Key Requirements: [summary]

### From Bob (Architect):

- Architecture: docs/architecture/system-architecture.md
- Tech Stack: FastAPI + React + Azure

### From Charlie (Tech Lead):

- Sprint Plan: docs/sprints/Sprint_Plan_Ottawa_GenAI_Research_Assistant.md
- User Story Plans: docs/plans/US-xxx-plan.md
```

### 5. Execute Phase

// turbo-all

1. Read `.dev-state.yaml` to get `current_phase` key
2. Find the corresponding step file in `.agent/workflows/full-development-steps/`
3. Read the step file for detailed instructions
4. **🔍 Template/Script Lookup** (Template-First Principle 优先):
   - 检查 `.agent/templates/` 中是否有当前任务需要的模板
   - 检查 `.agent/scripts/` 中是否有可复用的自动化脚本
   - 对于新功能模块，运行: `python .agent/scripts/scaffold.py feature --name <name>`
   - 如果缺少所需模板，先在 `.agent/templates/` 中创建，再使用
5. 基于模板和 step file 指令执行任务
6. After completion, update `.dev-state.yaml`:
   - Mark current phase as `completed`
   - Set `current_phase` to next phase key
7. Ask user whether to continue to next phase

**各阶段对应的模板/脚本**:

| Phase Key    | 模板                    | 脚本                                                |
| ------------ | ----------------------- | --------------------------------------------------- |
| `stories`    | `docs/plan.md.template` | -                                                   |
| `backend`    | `backend/*.template`    | `scaffold.py feature --name <name> --type backend`  |
| `frontend`   | `frontend/*.template`   | `scaffold.py feature --name <name> --type frontend` |
| `testing`    | `tests/*.template`      | `coverage_report.py`, `extract_i18n.py --check`     |
| `review`     | -                       | `env_check.py --files`                              |
| `deployment` | `devops/*.template`     | `env_check.py --env production`                     |

### 6. Run Checkpoints

| Phase    | Checkpoints                                                                      |
| -------- | -------------------------------------------------------------------------------- |
| Backend  | `cd backend && uv run ruff check app/`, `cd backend && uv run pytest --tb=short` |
| Frontend | `cd frontend && npm run lint`, `cd frontend && npx tsc --noEmit`                 |
| Testing  | All tests pass                                                                   |
| Review   | No CRITICAL issues                                                               |

**Display checkpoint results**:

```
## Acceptance Checkpoints

| Check | Status | Details |
|-------|--------|---------|
| Lint check | ✅ Pass | No issues |
| Type check | ✅ Pass | No errors |
| Unit tests | ✅ Pass | 45/45 passed |

Overall: ✅ PASSED
```

### 7. Generate Handoff Message

After completing a phase, generate a message for the next role:

```markdown
## {Phase} Complete

**From**: {current_role} → **To**: {next_role}

### Summary

{what_was_done}

### Outputs

- {artifact_1}
- {artifact_2}

### Notes for Next Phase

{relevant_notes}
```

### 8. Update State

Update `.dev-state.yaml`:

```yaml
phases:
  { current_phase_key }:
    status: completed
    completed_at: "{timestamp}"
    output: "{output_path}"

current_phase: { next_phase_key }
```

**Note**: `current_phase` uses **string keys** (e.g., `backend`, `frontend`), NOT numbers.

### 9. Continue or Pause

**Auto Mode** (`/full-dev auto`):

- All checkpoints pass → auto-continue
- Any fails → pause and show errors

**Standard Mode**:

- Show results, ask: "Continue to {next_phase}? (yes/no/skip)"

### 10. Parallel Frontend & Backend

If `.dev-state.yaml` has `config.parallel_frontend_backend: true`,
then `backend` and `frontend` phases can be executed in parallel.
Both phases are marked as `in_progress` simultaneously.

## Status Display Format

```
╔══════════════════════════════════════════════════════════════════╗
║                    Development Progress                         ║
╠══════════════════════════════════════════════════════════════════╣
║  Phase Key     │ Name         │ Status    │ Role              ║
╠════════════════╪══════════════╪═══════════╪═══════════════════╣
║  requirements  │ 需求分析     │ ✅ Done   │ Alice (PM)        ║
║  prd           │ 产品需求文档 │ ✅ Done   │ Alice (PM)        ║
║  ux_design     │ UX 设计      │ ⏭ Skip   │ -                 ║
║  architecture  │ 系统架构     │ ✅ Done   │ Bob (Architect)   ║
║  stories       │ 任务分解     │ ✅ Done   │ Charlie (Lead)    ║
║  database      │ 数据库设计   │ ✅ Done   │ Bob (Architect)   ║
║  backend       │ 后端开发     │ 🔄 Active │ David (Backend)   ║
║  frontend      │ 前端开发     │ 🔄 Active │ Eve (Frontend)    ║
║  testing       │ 测试         │ ⏳ Pending│ Frank (QA)        ║
║  review        │ 代码审查     │ ⏳ Pending│ Grace (Reviewer)  ║
║  deployment    │ 部署         │ ⏳ Pending│ Henry (DevOps)    ║
╚══════════════════════════════════════════════════════════════════╝

🎭 Current Role: David (Backend Engineer)
🎯 Goal: Implement robust backend services

📨 Latest Message:
  From: Charlie (Tech Lead) → David (Backend)
  "Sprint Plan complete. Begin implementation with Sprint 5 tasks."
```

## Error Handling

If a checkpoint fails:

```
## ❌ Checkpoint Failed

**Failed Check**: Unit tests
**Error**: AssertionError in test_query_empty

### Suggested Actions
1. Read failing test
2. Fix implementation
3. Re-run `/full-dev checkpoint`

Help fix this? (yes/no)
```

## Project-Specific Paths

| Resource         | Path                                                          |
| ---------------- | ------------------------------------------------------------- |
| Requirements     | `docs/requirements/master_prd.md`                             |
| Architecture     | `docs/architecture/system-architecture.md`                    |
| Sprint Plan      | `docs/sprints/Sprint_Plan_Ottawa_GenAI_Research_Assistant.md` |
| US Plans         | `docs/plans/US-xxx-plan.md`                                   |
| Backend Code     | `backend/app/`                                                |
| Backend Tests    | `backend/tests/`                                              |
| Frontend Code    | `frontend/src/`                                               |
| Database CodeMap | `docs/codemaps/database.md`                                   |
| Test Report      | `docs/test-report.md`                                         |

# Admin Console 数据持久化实施计划

## 📋 背景分析

当前 Admin Console 共有 **11 个模块**，大多数模块的前端 UI + API client 已搭建好，但后端数据要么：

- 来自外部服务实时查询（Ollama API、Azure API），不需要本地持久化
- 使用硬编码常量，没有数据库支持
- 后端 API 已存在但数据不完整

### 现状总结

| #   | 模块                 | 前端    | 后端 API                          | 数据库表                                          | 状态        |
| --- | -------------------- | ------- | --------------------------------- | ------------------------------------------------- | ----------- |
| 1   | **LLM Models**       | ✅ 完整 | ✅ `/api/v1/admin/llm-models`     | ❌ 不需要 (实时查询 Ollama/Azure)                 | ⚡ 已可用   |
| 2   | **Embedding Models** | ✅ 完整 | ✅ 复用 LLM Models API            | ❌ 不需要 (实时查询)                              | ⚡ 已可用   |
| 3   | **Data Sources**     | ✅ 完整 | ✅ `/api/v1/sync`                 | ✅ `universal_documents`                          | ⚡ 已可用   |
| 4   | **Search Engines**   | ✅ 完整 | ✅ `/api/v1/admin/search-engines` | ❌ 不需要 (运行时注册)                            | ⚡ 已可用   |
| 5   | **Prompt Studio**    | ✅ 完整 | ✅ `/api/v1/admin/prompts`        | ✅ `universal_documents` (type=prompt_template)   | ⚡ 已可用   |
| 6   | **Evaluation**       | ✅ 完整 | ✅ `/api/v1/evaluation`           | ✅ `universal_documents` (type=evaluation_result) | ⚡ 已可用   |
| 7   | **Feedback**         | ✅ 完整 | ✅ `/api/v1/feedback`             | ✅ 独立 `feedback` 表                             | ⚡ 已可用   |
| 8   | **Analytics**        | ✅ 完整 | ✅ `/api/v1/analytics`            | 🔶 聚合查询，无独立表                             | 🔧 需确认   |
| 9   | **Citations**        | ✅ 完整 | ❌ 无 API                         | ❌ 无                                             | 🔴 需要实现 |
| 10  | **Chart Templates**  | ✅ 完整 | ❌ 无 API                         | ❌ 无                                             | 🔴 需要实现 |
| 11  | **Settings**         | ✅ 部分 | 🔶 仅 health 端点                 | ❌ 无                                             | 🔴 需要实现 |

### Dashboard 面板

| 组件          | 描述                                 | 状态            |
| ------------- | ------------------------------------ | --------------- |
| Stats Cards   | 6 个统计卡（都显示 `—`）             | 🔴 需要连接后端 |
| System Health | 4 个健康检查行（显示 "Not checked"） | 🔴 需要连接后端 |
| Quick Actions | 6 个快捷操作按钮                     | ✅ 链接已正确   |

---

## 🏗️ 实施计划

### 阶段 0️⃣：Dashboard 数据连接（优先级最高）

> **目标**: 让 Dashboard 显示真实数据，而不是 `—` 和 "Not checked"

#### Task 0.1: Dashboard Stats API

- **后端**: 创建 `GET /api/v1/admin/dashboard/stats` 端点
  - 聚合各模块数据返回 6 个统计卡数值：
    - Data Sources count → 查询 Sync catalog
    - LLM Models count → 查询 ModelService
    - Embedding Models count → 查询 ModelService
    - Search Engines count → 查询 SearchRouter
    - Prompts count → 查询 PromptService
    - Benchmark best strategy → 查询 BenchmarkService
- **新文件**: `backend/app/admin/__init__.py`, `backend/app/admin/routes.py`, `backend/app/admin/service.py`
- **前端**: 修改 `admin-dashboard.tsx` 调用新 API
- **工作量**: 🟡 中 (2-3小时)

#### Task 0.2: System Health 实时检查

- **后端**: 创建 `GET /api/v1/admin/dashboard/health` 端点
  - 检查 Ollama Server → ping Ollama
  - 检查 Azure OpenAI → 调用 ModelService.check_health()
  - 检查 Azure AI Search → ping search endpoint
  - 检查 SQLite Database → 执行简单查询
- **前端**: 修改 `HealthRow` 组件调用新端点，显示实时状态 (🟢/🔴)
- **工作量**: 🟡 中 (1-2小时)

---

### 阶段 1️⃣：Citations 配置持久化

> **目标**: 让 Citation 配置可编辑并存入数据库

#### Task 1.1: 后端 - 系统配置表

在 `universal_documents` 中添加新 DocumentType:

```python
# enums.py
SYSTEM_CONFIG = "system_config"
```

#### Task 1.2: 后端 - Citation Config API

- **新文件**: `backend/app/admin/citation_routes.py`
- **端点**:
  - `GET /api/v1/admin/citations/config` — 获取当前配置
  - `PUT /api/v1/admin/citations/config` — 更新配置
- **数据结构** (存入 `universal_documents.data` JSON):

```json
{
  "format": "inline",
  "display_fields": ["title", "page", "source"],
  "min_relevance_score": 0.5,
  "max_citations": 5
}
```

- **种子数据**: 启动时检查是否存在，不存在则插入默认配置

#### Task 1.3: 前端 - Citation Config 改为动态

- 修改 `citation-config.tsx`:
  - 加载 API 数据替代硬编码 `CITATION_FORMATS` / `DISPLAY_FIELDS`
  - 添加保存按钮
  - 添加 `services/citation-api.ts` 和 `types.ts`
- **工作量**: 🟡 中 (2-3小时)

---

### 阶段 2️⃣：Chart Templates 配置持久化

> **目标**: 让图表模板可编辑并存入数据库

#### Task 2.1: 后端 - Chart Template API

- **新文件**: `backend/app/admin/chart_routes.py`
- **端点**:
  - `GET /api/v1/admin/chart-templates` — 获取所有图表模板
  - `PUT /api/v1/admin/chart-templates/{type}` — 更新特定类型模板
  - `POST /api/v1/admin/chart-templates` — 添加自定义模板
- **数据存储**: `universal_documents` (type = `system_config`, tags = `["chart_template"]`)
- **种子数据**: 默认 3 种图表类型配置 (line, bar, pie)

#### Task 2.2: 前端 - Chart Template Manager 改为动态

- 修改 `chart-template-manager.tsx`:
  - 从 API 加载数据替代硬编码 `CHART_TYPES`
  - 添加编辑关键词、启用/禁用功能
  - 添加 `services/chart-template-api.ts` 和 `types.ts`
- **工作量**: 🟡 中 (2-3小时)

---

### 阶段 3️⃣：System Settings 持久化

> **目标**: 让部分系统设置可动态配置并存入数据库

#### Task 3.1: 后端 - System Settings API

- **新文件**: `backend/app/admin/settings_routes.py`
- **端点**:
  - `GET /api/v1/admin/settings` — 获取所有系统设置
  - `PUT /api/v1/admin/settings` — 更新设置
  - `GET /api/v1/admin/settings/env` — 获取环境变量信息（只读）
- **数据存储**: `universal_documents` (type = `system_config`, tags = `["system_settings"]`)
- **可编辑项**:
  - Default language
  - Max upload size
  - Session timeout
  - API Rate limiting toggle
- **只读项** (从 env 读取):
  - Application name, version
  - Azure credentials status
  - CORS configuration

#### Task 3.2: 前端 - Settings 改为可编辑

- 修改 `system-settings.tsx`:
  - 从 API 加载设置
  - 可编辑项添加 Edit/Save 功能
  - 只读项保持展示
- **工作量**: 🟡 中 (2-3小时)

---

### 阶段 4️⃣：Analytics 数据完善

> **目标**: 确保 Analytics 聚合查询能返回真实数据

#### Task 4.1: 验证 Analytics Service 数据源

- 检查 `backend/app/analytics/service.py` 的聚合查询是否正确关联了：
  - Chat 记录 → 用于 total_queries, queries_over_time
  - Document 记录 → 用于 total_documents, document_stats
  - User 记录 → 用于 total_users
  - Feedback 记录 → 用于 quality_metrics
  - Evaluation 记录 → 用于 avg_evaluation_score
- **修复**: 如有缺失，补全查询逻辑

#### Task 4.2: 确保 Chat 模块记录查询日志

- 每次用户 chat query 时记录到 `universal_documents` (type = `research_history`)
- 确保有 latency、confidence、search_method 等元数据
- **工作量**: 🟢 小 (1小时)

---

### 阶段 5️⃣：统一种子数据管理 (Unified Seed Registry)

> **目标**: 所有模块的默认数据通过一个注册中心统一管理，首次启动自动填充

#### 现有问题

当前种子数据分散在各处，难以维护：

- `prompts/defaults.py` — 8 条默认提示词（仅内存合并，未写入 DB）
- `citation-config.tsx` — 前端硬编码 3 种格式 + 5 个字段
- `chart-template-manager.tsx` — 前端硬编码 3 种图表类型
- `system-settings.tsx` — 前端硬编码设置项
- `benchmark/service.py` — 硬编码 4 条测试查询

#### Task 5.1: 创建 Seed Registry 框架

- **新文件**: `backend/app/core/seed.py`

```python
"""
Unified Seed Data Registry

All modules register their default data here.
On startup, seed_defaults() upserts everything into
universal_documents using "INSERT IF NOT EXISTS" semantics.

Each seed entry is identified by (type, seed_key) pair.
If the key already exists in DB, it is NOT overwritten
(preserving user modifications).
"""

from dataclasses import dataclass, field
from typing import Any

from app.core.enums import DocumentStatus, DocumentType


@dataclass
class SeedEntry:
    """A single piece of seed data."""
    type: DocumentType          # universal_documents.type
    seed_key: str               # unique key within type (stored in data.seed_key)
    data: dict[str, Any]        # JSON payload for universal_documents.data
    tags: list[str] = field(default_factory=list)
    owner_id: str | None = None
    status: DocumentStatus = DocumentStatus.ACTIVE


class SeedRegistry:
    """Central registry for all module seed data."""
    _entries: list[SeedEntry] = []

    @classmethod
    def register(cls, entry: SeedEntry) -> None:
        cls._entries.append(entry)

    @classmethod
    def register_many(cls, entries: list[SeedEntry]) -> None:
        cls._entries.extend(entries)

    @classmethod
    def all_entries(cls) -> list[SeedEntry]:
        return list(cls._entries)

    @classmethod
    def clear(cls) -> None:
        """For testing only."""
        cls._entries.clear()


async def seed_defaults(db_session) -> dict[str, int]:
    """
    Upsert all registered seed entries into universal_documents.

    Returns: {"inserted": N, "skipped": M}
    """
    from sqlalchemy import select
    from app.core.models import UniversalDocument

    inserted = 0
    skipped = 0

    for entry in SeedRegistry.all_entries():
        # Check if this seed already exists by (type, seed_key)
        stmt = select(UniversalDocument).where(
            UniversalDocument.type == entry.type,
            UniversalDocument.data["seed_key"].as_string() == entry.seed_key,
        )
        result = await db_session.execute(stmt)
        existing = result.scalar_one_or_none()

        if existing:
            skipped += 1
            continue

        # Inject seed_key into data for future lookups
        data_with_key = {**entry.data, "seed_key": entry.seed_key}

        doc = UniversalDocument(
            type=entry.type,
            data=data_with_key,
            owner_id=entry.owner_id,
            status=entry.status,
            tags=entry.tags,
        )
        db_session.add(doc)
        inserted += 1

    if inserted > 0:
        await db_session.commit()

    return {"inserted": inserted, "skipped": skipped}
```

#### Task 5.2: 各模块注册数据定义文件

将所有模块的默认数据集中到一个目录下，文件命名规则统一：

```
backend/app/core/seeds/
├── __init__.py              # 自动加载所有 seed 模块
├── prompts.py               # 从 prompts/defaults.py 迁移，8 条提示词
├── citations.py             # Citation 默认配置
├── chart_templates.py       # Chart Template 默认配置
├── system_settings.py       # System Settings 默认值
└── benchmark_queries.py     # Benchmark 默认测试查询
```

每个文件的结构统一:

```python
# backend/app/core/seeds/prompts.py
"""Seed data: Default prompt templates."""

from app.core.enums import DocumentType
from app.core.seed import SeedEntry, SeedRegistry

_SEEDS = [
    SeedEntry(
        type=DocumentType.PROMPT_TEMPLATE,
        seed_key="prompt:system_prompt",
        tags=["seed", "prompt", "system"],
        data={
            "name": "system_prompt",
            "category": "system",
            "description": "Main system prompt...",
            "template": "You are an AI research assistant...",
            "variables": [],
            "version": 1,
        },
    ),
    # ... more prompts
]

SeedRegistry.register_many(_SEEDS)
```

```python
# backend/app/core/seeds/citations.py
"""Seed data: Default citation configuration."""

from app.core.enums import DocumentType
from app.core.seed import SeedEntry, SeedRegistry

_SEEDS = [
    SeedEntry(
        type=DocumentType.SYSTEM_CONFIG,
        seed_key="config:citation",
        tags=["seed", "system_config", "citation"],
        data={
            "name": "citation_config",
            "active_format": "inline",
            "formats": [
                {"id": "inline",    "name": "Inline Numbers",    "active": True},
                {"id": "footnote",  "name": "Footnotes",         "active": False},
                {"id": "endnotes",  "name": "End Sources List",  "active": False},
            ],
            "display_fields": [
                {"id": "title",  "name": "Document Title",   "enabled": True},
                {"id": "page",   "name": "Page Number",      "enabled": True},
                {"id": "source", "name": "Source Name",       "enabled": True},
                {"id": "score",  "name": "Relevance Score",   "enabled": False},
                {"id": "date",   "name": "Document Date",     "enabled": False},
            ],
            "min_relevance_score": 0.5,
            "max_citations": 5,
        },
    ),
]

SeedRegistry.register_many(_SEEDS)
```

```python
# backend/app/core/seeds/chart_templates.py
"""Seed data: Default chart template configuration."""

from app.core.enums import DocumentType
from app.core.seed import SeedEntry, SeedRegistry

_SEEDS = [
    SeedEntry(
        type=DocumentType.SYSTEM_CONFIG,
        seed_key="config:chart_templates",
        tags=["seed", "system_config", "chart_template"],
        data={
            "name": "chart_templates",
            "types": [
                {
                    "type": "line", "name": "Line Chart",
                    "description": "Trends over time",
                    "keywords": ["trend", "growth", "over time", "quarterly"],
                    "enabled": True,
                },
                {
                    "type": "bar", "name": "Bar Chart",
                    "description": "Comparisons between categories",
                    "keywords": ["compare", "comparison", "versus", "breakdown"],
                    "enabled": True,
                },
                {
                    "type": "pie", "name": "Pie Chart",
                    "description": "Parts of a whole",
                    "keywords": ["percentage", "share", "distribution"],
                    "enabled": True,
                },
            ],
        },
    ),
]

SeedRegistry.register_many(_SEEDS)
```

```python
# backend/app/core/seeds/system_settings.py
"""Seed data: Default system settings."""

from app.core.enums import DocumentType
from app.core.seed import SeedEntry, SeedRegistry

_SEEDS = [
    SeedEntry(
        type=DocumentType.SYSTEM_CONFIG,
        seed_key="config:system_settings",
        tags=["seed", "system_config", "settings"],
        data={
            "name": "system_settings",
            "default_language": "en",
            "max_upload_size_mb": 50,
            "session_timeout_hours": 24,
            "rate_limiting_enabled": False,
            "citation_format": "inline",
            "max_search_results": 10,
        },
    ),
]

SeedRegistry.register_many(_SEEDS)
```

#### Task 5.3: `__init__.py` 自动注册

```python
# backend/app/core/seeds/__init__.py
"""
Auto-import all seed modules so they register with SeedRegistry.
Simply importing this package triggers all registrations.
"""

from app.core.seeds import (   # noqa: F401
    prompts,
    citations,
    chart_templates,
    system_settings,
    benchmark_queries,
)
```

#### Task 5.4: 在 lifespan 中集成 + 添加新 DocumentType

```python
# enums.py — 新增
class DocumentType(StrEnum):
    ...
    SYSTEM_CONFIG = "system_config"   # 新增：系统配置类

# main.py — lifespan 修改
async def lifespan(app: FastAPI):
    await init_db()

    # Seed defaults (统一初始化)
    import app.core.seeds  # noqa: F401 — trigger registration
    from app.core.seed import seed_defaults
    from app.core.database import async_session_maker
    async with async_session_maker() as session:
        result = await seed_defaults(session)
        print(f"  Seed data: {result['inserted']} inserted, {result['skipped']} skipped")

    _init_search_engines()
    _init_embedding_providers()
    yield
```

#### Task 5.5: 迁移现有 `prompts/defaults.py`

- 将 `DEFAULT_PROMPTS` 列表转换为 `SeedEntry` 格式
- 修改 `PromptService.list_prompts()`: 改为从 DB 读取所有 prompt（因为种子已入库），移除内存合并逻辑
- 删除或保留 `prompts/defaults.py` 作为参考（推荐删除以防止混淆）
- **工作量**: � 小 (1小时)

---

## 📊 整体工作量估算

| 阶段                           | 任务数 | 预计耗时      | 优先级 |
| ------------------------------ | ------ | ------------- | ------ |
| 阶段 5: 统一种子数据管理       | 5      | 3-4小时       | P0 🔴  |
| 阶段 0: Dashboard 数据连接     | 2      | 3-5小时       | P0 🔴  |
| 阶段 1: Citations 持久化       | 3      | 2-3小时       | P1 🟠  |
| 阶段 2: Chart Templates 持久化 | 2      | 2-3小时       | P1 🟠  |
| 阶段 3: Settings 持久化        | 2      | 2-3小时       | P2 🟡  |
| 阶段 4: Analytics 完善         | 2      | 1-2小时       | P2 🟡  |
| **合计**                       | **16** | **14-20小时** | P0 🔴  |

---

## 🔧 技术要点

### 1. 统一使用 `universal_documents` EAV 模式

所有管理配置都存入 `universal_documents` 表，使用不同 `type` 和 `tags` 区分：

```
type = "system_config" + tags = ["citation_config"] → Citation 配置
type = "system_config" + tags = ["chart_template"]  → Chart 模板
type = "system_config" + tags = ["system_settings"] → 系统设置
type = "prompt_template"                            → 已有，提示词模板
type = "evaluation_result"                          → 已有，评估结果
```

### 2. 后端新增 `admin` 模块

```
backend/app/admin/
├── __init__.py
├── routes.py           # Dashboard stats + health
├── citation_routes.py  # Citation config CRUD
├── chart_routes.py     # Chart template CRUD
├── settings_routes.py  # System settings CRUD
└── service.py          # 聚合各模块数据的服务层
```

### 3. 前端修改范围

- `admin-dashboard.tsx` — 接入实时数据
- `citation-config.tsx` — 动态数据 + 编辑
- `chart-template-manager.tsx` — 动态数据 + 编辑
- `system-settings.tsx` — 动态数据 + 部分可编辑
- 新增 `citations/services/` 和 `citations/types.ts`
- 新增 `chart-templates/services/` 和 `chart-templates/types.ts`

### 4. 不需要修改的模块 ✅

以下模块已经完整可用（数据来源为实时查询或已有数据库）：

- **LLM Models** — 实时查询 Ollama/Azure API
- **Embedding Models** — 复用 LLM Models API
- **Data Sources** — 已有 Sync 系统
- **Search Engines** — 运行时注册查询
- **Prompt Studio** — 已有 CRUD API + DB 存储
- **Evaluation** — 已有 API + DB 存储
- **Feedback** — 已有独立表 + API

---

## 🚀 建议执行顺序

```
阶段 5 (种子数据) → 阶段 0 (Dashboard) → 阶段 1 (Citations) → 阶段 2 (Chart) → 阶段 3 (Settings) → 阶段 4 (Analytics)
```

> 💡 **理由**: 先准备种子数据，这样 Dashboard 一启动就有数据显示。然后优先做 Dashboard 因为它是用户进入管理控制台看到的第一个页面。

---

## ✅ 完成标准

1. 管理后台每个模块页面都显示 **真实数据**（不再有 `—` 或空白）
2. Dashboard 6 个统计卡显示实际数量
3. System Health 显示实时 🟢/🔴 状态
4. Citation / Chart Template / Settings 配置 **可编辑并保存到数据库**
5. 首次启动自动填充默认种子数据
6. 所有新增 API 端点都有 Swagger 文档

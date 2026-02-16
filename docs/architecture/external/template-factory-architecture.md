# Template Factory — System Architecture (v2.0 元项目版)

**Version**: 2.0  
**Date**: 2026-02-12  
**Status**: Design  
**修订说明**: v2.0 元项目独立架构 + Buy > Build + 组合现有工具  
**Related**: [PRD](../requirements/template-factory-prd.md) | [Plan](../plans/template-factory-plan.md)

---

## 1. Architecture Overview

Template Factory 是一个**独立的元项目**，由 3 层组成：
- **资产层**: 模板、技能、预置套餐 (已有，搬迁即可)
- **工具层**: 现有开源工具的组合 (Buy, 不自己写)
- **胶水层**: ~700 行 CLI 代码 + ~10 个 AI Prompt (唯一需要写的代码)

```
┌──────────────────────────────────────────────────────────────────┐
│                   Template Factory (元项目)                      │
│                   独立 Git 仓库                                  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │             Layer 1: 资产层 (Assets)                       │  │
│  │             ✅ 已有, 搬迁即可                              │  │
│  │                                                            │  │
│  │  ┌──────────────┐  ┌────────────┐  ┌──────────────────┐  │  │
│  │  │  catalog/     │  │  presets/   │  │  skills/          │  │  │
│  │  │  128 模块     │  │  4 套餐    │  │  11 个 skill      │  │  │
│  │  │  Jinja2 模板  │  │  YAML 配方 │  │  方法论 + 审核    │  │  │
│  │  └──────────────┘  └────────────┘  └──────────────────┘  │  │
│  │                                                            │  │
│  │  ┌──────────────┐  ┌────────────────────────────────────┐ │  │
│  │  │  prompts/     │  │  references/                       │ │  │
│  │  │  10 Agent     │  │  38 项目注册表 + 分析报告          │ │  │
│  │  │  System Prompt│  │  registry.yaml                     │ │  │
│  │  └──────────────┘  └────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                    │
│                              ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │             Layer 2: 工具层 (Tools)                        │  │
│  │             📦 Buy — 全部使用现有开源工具                  │  │
│  │                                                            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌─────────┐│  │
│  │  │  Ollama  │  │  copier  │  │tree-sitter │  │ gh CLI  ││  │
│  │  │          │  │          │  │            │  │         ││  │
│  │  │ 本地LLM  │  │ 模板渲染 │  │ 代码解析   │  │ GitHub  ││  │
│  │  │ 推理引擎 │  │ + 实例化 │  │ AST 分析   │  │ 搜索    ││  │
│  │  └──────────┘  └──────────┘  └────────────┘  └─────────┘│  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                    │
│                              ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │             Layer 3: 胶水层 (Glue)                         │  │
│  │             ✍️ Write — 唯一需要写的代码 (~700 行)          │  │
│  │                                                            │  │
│  │  ┌────────────────────────────────────────────────────┐   │  │
│  │  │  tf CLI (Typer)                                     │   │  │
│  │  │                                                     │   │  │
│  │  │  tf create  ──────▶ 调用 copier + 读 presets/       │   │  │
│  │  │  tf list    ──────▶ 读 catalog/index.yaml           │   │  │
│  │  │  tf scan    ──────▶ 调用 gh CLI + Ollama 评估       │   │  │
│  │  │  tf analyze ──────▶ 调用 tree-sitter + Ollama 分析  │   │  │
│  │  │  tf extract ──────▶ 调用 Ollama + 方法论规则        │   │  │
│  │  │  tf status  ──────▶ 读 catalog/index.yaml 统计      │   │  │
│  │  └────────────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │  tf create --preset rag-chat
                              ▼
                ┌────────────────────────┐
                │   具体项目 (Instance)   │
                │   my-rag-app/          │
                │   my-admin-dashboard/  │
                │   my-api-service/      │
                └────────────────────────┘
```

---

## 2. 元项目文件结构

```
template-factory/                          ← 独立 Git 仓库
│
├── README.md                              ← 元项目说明
├── pyproject.toml                         ← pip install template-factory
├── LICENSE                                ← MIT
│
├── catalog/                               ← 📦 模板目录 (核心资产)
│   ├── index.yaml                         ← 全局模块索引 + 依赖图
│   │
│   ├── backend/                           ← 后端模板
│   │   ├── fastapi-route/                 ← 每个模块 = 一个目录
│   │   │   ├── module-card.yaml           ← 模块元数据 (机器可读)
│   │   │   ├── copier.yaml                ← copier 配置 (变量定义)
│   │   │   ├── routes.py.jinja            ← Jinja2 模板
│   │   │   ├── service.py.jinja
│   │   │   └── schemas.py.jinja
│   │   ├── rag-pipeline/
│   │   ├── chat-service/
│   │   ├── azure-openai/
│   │   ├── azure-search/
│   │   └── ...
│   │
│   ├── frontend/                          ← 前端模板
│   │   ├── chat-ui/
│   │   ├── chat-citation/
│   │   ├── zustand-store/
│   │   ├── document-upload/
│   │   ├── auth-flow/
│   │   └── ...
│   │
│   ├── agent/                             ← AI Agent 模板
│   │   ├── role/
│   │   ├── action/
│   │   ├── memory/
│   │   └── environment/
│   │
│   ├── devops/                            ← DevOps 模板
│   │   ├── docker-compose/
│   │   ├── github-ci/
│   │   └── dockerfile/
│   │
│   └── tests/                             ← 测试模板
│       ├── conftest/
│       ├── test-routes/
│       └── e2e/
│
├── presets/                               ← 🎁 预置套餐
│   ├── rag-chat.yaml                      ← RAG 聊天应用
│   ├── admin-dashboard.yaml               ← 管理后台
│   ├── api-service.yaml                   ← 纯后端 API
│   └── ai-agent.yaml                      ← 多智能体系统
│
├── skills/                                ← 🧠 AI Skills (迁移自 .agent/skills/)
│   ├── architect/SKILL.md
│   ├── code-reviewer/SKILL.md
│   ├── template-extraction/SKILL.md       ← 核心方法论
│   └── ...
│
├── prompts/                               ← 💬 AI Agent Prompts
│   ├── scout.md                           ← 项目发现 + 评估
│   ├── architect.md                       ← 架构分析 + 模块识别
│   ├── extractor.md                       ← 模板提取 + placeholder
│   └── reviewer.md                        ← 质量审核
│
├── references/                            ← 📚 参考项目注册表
│   ├── registry.yaml                      ← 38 个项目元信息
│   └── analysis/                          ← 架构分析报告
│       ├── rag-web-ui.md
│       ├── lobe-chat.md
│       └── ...
│
├── tf/                                    ← 🔧 CLI 工具 (胶水层)
│   ├── __init__.py
│   ├── cli.py                             ← Typer 入口 (~100 行)
│   ├── create.py                          ← tf create (~150 行)
│   ├── catalog.py                         ← tf list/search/status (~100 行)
│   ├── scan.py                            ← tf scan (~150 行)
│   ├── analyze.py                         ← tf analyze (~100 行)
│   ├── extract.py                         ← tf extract (~100 行)
│   └── llm.py                             ← Ollama 调用封装 (~50 行)
│
└── tests/
    ├── test_create.py
    ├── test_catalog.py
    └── test_scan.py
```

---

## 3. 核心组件详解

### 3.1 模板目录 (catalog/)

#### module-card.yaml — 模块元数据

```yaml
# catalog/backend/rag-pipeline/module-card.yaml
name: rag-pipeline
display_name: "RAG Pipeline (检索增强生成)"
layer: backend
priority: critical
version: "1.0"

source:
  project: azure-search-openai-demo
  path: app/backend/approaches/
  url: https://github.com/Azure-Samples/azure-search-openai-demo
  license: MIT

description: |
  微软官方的 RAG 策略模式 —— 抽象基类定义 run() + run_stream() 接口，
  具体策略实现 Chat-Read-Retrieve-Read 流程。

files:
  - source: approaches/approach.py
    output: "{{ feature_name }}/rag_approach.py"
    role: RAG strategy abstract base class
  - source: approaches/chatreadretrieveread.py
    output: "{{ feature_name }}/chat_retrieve_read.py"
    role: Concrete RAG implementation
  - source: prepdocslib/textsplitter.py
    output: "{{ feature_name }}/text_splitter.py"
    role: Token-aware text splitter

dependencies:
  pip: [openai, tiktoken, tenacity]
  
requires: [azure-openai, azure-search]    # 依赖其他模块

tags: [rag, retrieval, azure, llm]
```

#### copier.yaml — 变量定义 (copier 直接消费)

```yaml
# catalog/backend/rag-pipeline/copier.yaml
_subdirectory: .
_templates_suffix: .jinja

feature_name:
  type: str
  help: "Feature name in snake_case"
  default: research

search_service:
  type: str
  help: "Azure AI Search service name"

openai_model:
  type: str
  help: "OpenAI deployment name"
  default: gpt-4o

route_prefix:
  type: str
  help: "API route prefix"
  default: /api/v1
```

#### index.yaml — 全局索引

```yaml
# catalog/index.yaml
version: "1.0"
total_modules: 45
last_updated: "2026-02-12"

modules:
  # ─── Backend ────────────────────────
  backend/fastapi-route:
    layer: backend
    priority: critical
    requires: []
    tags: [api, fastapi, crud]
    
  backend/rag-pipeline:
    layer: backend
    priority: critical
    requires: [backend/azure-openai, backend/azure-search]
    tags: [rag, retrieval, azure]

  backend/chat-service:
    layer: backend
    priority: critical
    requires: [backend/fastapi-route]
    tags: [chat, langchain, streaming]

  # ─── Frontend ───────────────────────
  frontend/chat-ui:
    layer: frontend
    priority: high
    requires: [frontend/zustand-store]
    tags: [chat, components, react]

  frontend/chat-citation:
    layer: frontend
    priority: critical
    requires: []
    tags: [citation, markdown, popover]

  frontend/zustand-store:
    layer: frontend
    priority: critical
    requires: []
    tags: [state, zustand, immer]

  # ... (其他模块)

# 依赖图 (用于拓扑排序)
dependency_graph:
  backend/rag-pipeline: [backend/azure-openai, backend/azure-search]
  backend/chat-service: [backend/fastapi-route]
  frontend/chat-ui: [frontend/zustand-store]
  frontend/document-upload: [frontend/chat-api]
```

---

### 3.2 预置套餐 (presets/)

```yaml
# presets/rag-chat.yaml
name: rag-chat
display_name: "RAG 聊天应用"
description: "FastAPI + React + Chat UI + 文档上传 + RAG 检索"

modules:
  # Backend
  - backend/fastapi-route
  - backend/rag-pipeline
  - backend/chat-service
  - backend/azure-openai
  - backend/azure-search
  # Frontend
  - frontend/chat-ui
  - frontend/chat-citation
  - frontend/zustand-store
  - frontend/document-upload
  - frontend/auth-flow
  # DevOps
  - devops/docker-compose
  - devops/github-ci

# 套餐级别的默认变量
defaults:
  app_name: "My RAG App"
  api_base_url: "/api/v1"
  alias: "@"
  python_version: "3.12"
  node_version: "20"

# 项目生成后的目录结构
structure:
  backend/:
    - "{{ feature_name }}/"
    - core/
    - main.py
  frontend/:
    - src/features/
    - src/stores/
    - src/shared/
  docker-compose.yml:
  .github/workflows/:
```

---

### 3.3 CLI 胶水层 (tf/)

#### 核心设计：每个命令 = 调用现有工具

```python
# tf/cli.py — 入口 (~100 行)
"""
Template Factory CLI — 元项目命令行工具

不自己实现任何底层功能，只编排现有工具:
  copier      → 模板渲染 + 项目生成
  tree-sitter → 代码解析
  gh CLI      → GitHub 搜索
  Ollama      → AI 推理
"""
import typer

app = typer.Typer(
    name="tf",
    help="Template Factory — 模板驱动的项目生成器",
)

# 注册子命令
app.command()(create)    # tf create
app.command()(list_)     # tf list
app.command()(search)    # tf search
app.command()(scan)      # tf scan
app.command()(analyze)   # tf analyze
app.command()(extract)   # tf extract
app.command()(status)    # tf status
```

```python
# tf/create.py — 项目生成 (~150 行)
"""调用 copier 生成项目。不自己实现模板渲染。"""
import subprocess
from pathlib import Path
import yaml


def create(
    name: str = typer.Argument(..., help="项目名称"),
    preset: str = typer.Option("rag-chat", help="预置套餐"),
    output: Path = typer.Option("./", help="输出目录"),
):
    """从预置套餐创建新项目。"""
    # 1. 读取预置套餐配置
    preset_config = _load_preset(preset)

    # 2. 解析依赖,确定模块安装顺序
    modules = _resolve_dependencies(preset_config["modules"])

    # 3. 逐个模块调用 copier 渲染
    for module in modules:
        module_path = CATALOG_DIR / module
        target = output / name
        subprocess.run([
            "copier", "copy",
            str(module_path), str(target),
            "--defaults",              # 使用默认值
            "--overwrite",             # 覆盖已有文件
        ], check=True)

    # 4. 安装依赖
    _merge_dependencies(target)

    typer.echo(f"✅ 项目 {name} 创建成功: {target}")
    typer.echo(f"   下一步: cd {target} && npm install && pip install -r requirements.txt")
```

```python
# tf/llm.py — Ollama 调用封装 (~50 行)
"""最薄的 Ollama 封装。不做任何多余的抽象。"""
import httpx

OLLAMA_URL = "http://localhost:11434"

async def ask(prompt: str, model: str = "qwen2.5-coder:32b") -> str:
    """向本地 Ollama 发送 prompt, 返回回答。"""
    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(f"{OLLAMA_URL}/v1/chat/completions", json={
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2,
        })
        return resp.json()["choices"][0]["message"]["content"]

def is_available() -> bool:
    """检查 Ollama 是否在运行。"""
    try:
        httpx.get(f"{OLLAMA_URL}/api/tags", timeout=2.0)
        return True
    except httpx.ConnectError:
        return False
```

---

### 3.4 AI Prompts (prompts/)

```markdown
# prompts/scout.md — 项目评估 Prompt

你是一个开源项目评估专家。根据以下信息评估该项目的模板提取价值。

## 评估维度 (每项 1-10 分):
1. **代码质量**: 类型标注、文档、测试覆盖
2. **架构清晰度**: 模块化程度、关注点分离
3. **可提取性**: 有多少自包含的、可复用的模块
4. **技术栈匹配**: 与我们的技术栈 (FastAPI + React + Azure) 的匹配度
5. **社区活跃度**: Stars、最近提交、Issue 响应

## 输入:
- 项目名称: {repo_name}
- Stars: {stars}
- 语言: {language}
- README 内容: {readme}
- 目录结构: {tree}

## 输出格式 (严格 JSON):
{
  "scores": { "quality": 8, "architecture": 7, ... },
  "total": 76,
  "extractable_modules": ["auth", "chat-ui", "rag-pipeline"],
  "recommendation": "extract",  // "extract" | "reference" | "skip"
  "reason": "..."
}
```

```markdown
# prompts/architect.md — 架构分析 Prompt

你是一个软件架构分析专家。分析给定项目的代码结构，识别可提取为独立模板的模块。

## 模块识别标准:
- 自包含: 内部文件紧密耦合，与外部松散耦合
- 有边界: 有明确的入口文件 (index.ts, __init__.py)
- 可复用: 不含项目特有的业务逻辑
- 有价值: 写出来需要 >2 小时

## 输入:
- 目录结构: {tree}
- 文件签名: {signatures}  (函数名/类名/导出)
- 导入关系: {import_graph}

## 输出格式 (严格 YAML):
modules:
  - name: "chat-citation"
    files: ["citation-link.tsx", "citation-popover.tsx", "types.ts"]
    layer: frontend
    priority: critical
    description: "..."
    dependencies: { npm: ["react-markdown"], internal: [] }
```

---

### 3.5 具体项目的连接方式

每个由元项目生成的具体项目，只保留一个配置文件：

```yaml
# my-rag-app/.tf.yaml — 具体项目的元项目配置
_src: "https://github.com/yourname/template-factory"
_version: "1.0.0"
_preset: rag-chat
_created_at: "2026-02-12T17:30:00Z"

# 该项目使用的变量值 (生成时确定)
variables:
  app_name: "Ottawa GenAI Research Assistant"
  feature_name: research
  api_base_url: "/api/v1"
  alias: "@"
  route_prefix: "/research"
  search_service: "ottawa-ai-search"
  openai_model: "gpt-4o"

# 该项目使用的模块列表
modules:
  - backend/fastapi-route
  - backend/rag-pipeline
  - backend/chat-service
  - frontend/chat-ui
  - frontend/chat-citation
  - frontend/zustand-store
  - devops/docker-compose
```

**用途**:
- `tf update` — 检查元项目是否有模板更新
- 记录项目血统 (哪些模板生成的)
- Debug 时追溯模板来源

---

## 4. 技术栈 (全部 Buy)

| 组件 | 工具 | 版本 | 用途 | 我们写多少代码 |
|:---|:---|:---|:---|:---|
| LLM Runtime | **Ollama** | latest | 本地模型推理 | 0 (直接用) |
| Template Engine | **copier** | ≥9.0 | Jinja2 模板渲染 + 项目生成 | copier.yaml 配置 |
| Code Parser | **tree-sitter** | latest | AST 分析 (tf analyze) | ~50 行调用代码 |
| GitHub API | **gh CLI** + **PyGithub** | latest | 项目搜索 + 元数据获取 | ~50 行调用代码 |
| CLI Framework | **Typer** | ≥0.9 | 命令行界面 | ~100 行入口 |
| HTTP Client | **httpx** | ≥0.27 | Ollama API 调用 | ~50 行封装 |
| Data Format | **PyYAML** | latest | 读写 YAML 配置 | 0 (stdlib 级) |
| Code Model | **Qwen2.5-Coder-32B** | via Ollama | 代码分析 + 模板提取 | 0 (直接用) |
| Reasoning Model | **DeepSeek-R1-32B** | via Ollama | 架构分析 + 规划 | 0 (直接用) |

**总代码量: ~700 行 Python + ~10 个 Markdown Prompt**

---

## 5. Data Flow

### 5.1 tf create — 项目生成流

```
用户输入                    元项目                         输出
─────────         ──────────────────────         ────────────
tf create         presets/rag-chat.yaml          my-rag-app/
  --preset          │                              ├── backend/
    rag-chat        ├─▶ catalog/backend/           │   ├── research/
  --name              │   fastapi-route/           │   │   ├── routes.py
    my-rag-app        │     copier.yaml            │   │   ├── service.py
                      │     routes.py.jinja ──▶    │   │   └── schemas.py
                      │     service.py.jinja ──▶   │   └── main.py
                      │                            │
                      ├─▶ catalog/frontend/        ├── frontend/
                      │   chat-ui/                 │   ├── src/features/
                      │     copier.yaml            │   │   └── chat/
                      │     chat-bubble.tsx.jinja   │   └── package.json
                      │                            │
                      └─▶ catalog/devops/          ├── docker-compose.yml
                          docker-compose/          ├── .github/workflows/
                            copier.yaml            └── .tf.yaml (血统记录)
```

### 5.2 tf scan → tf analyze → tf extract — 模板提取流

```
tf scan                     tf analyze                    tf extract
(发现项目)                  (分析架构)                    (提取模板)

gh CLI                      tree-sitter                   Ollama
  │                            │                             │
  ▼                            ▼                             ▼
GitHub 搜索               解析 AST +                   读源码 +
  │                       导入关系图                    识别 placeholder
  ▼                            │                             │
Ollama 评估                    ▼                             ▼
  │                       Ollama 识别                  生成 .jinja 模板
  ▼                       模块边界                         │
ProjectScore                   │                             ▼
  │                            ▼                       写入 catalog/
  ▼                       ModuleCard                   更新 index.yaml
候选项目列表               (YAML 输出)
  │                            │                        ┌─────────┐
  ▼                            ▼                        │ 人工     │
┌─────────┐              ┌─────────┐                    │ Review   │
│ 人工     │              │ 人工     │                    │ 最终     │
│ 决定是否 │              │ 审核     │                    │ 确认     │
│ clone   │              │ ModuleCard│                    └─────────┘
└─────────┘              └─────────┘
```

**注意每个阶段都有人工审核节点** —— AI 做建议，人做决策。

---

## 6. 与现有项目的关系

```
迁移路径:

ottawa-genai-research-assistant/
├── .agent/templates/  ───────搬迁───────▶  template-factory/catalog/
├── .agent/skills/     ───────搬迁───────▶  template-factory/skills/
├── .agent/workflows/  ───────保留───────▶  (工作流是项目级的，不搬)
├── .github/references/───────搬迁───────▶  template-factory/references/
└── backend/ frontend/ ───────保留───────▶  (业务代码不动)

搬迁后:
ottawa-genai-research-assistant/
├── .tf.yaml           ───────新增───────▶  记录项目血统
├── .agent/workflows/  ───────保留───────▶  项目级工作流
└── backend/ frontend/ ───────保留───────▶  业务代码
```

---

## 7. Architecture Principles

| 原则 | 体现 |
|:---|:---|
| **Buy > Build** | 全部使用现有工具，只写胶水代码 |
| **AI 辅助，人决策** | 每个关键节点都有人工审核 |
| **元项目独立** | 独立仓库，不依赖任何具体项目 |
| **标准格式** | Jinja2 模板 + YAML 元数据 (不发明新语法) |
| **组合优于创造** | 6 个现有工具的编排，而非一个新框架 |
| **渐进式** | 先搬迁资产，再加 AI 增强 |
| **可追溯** | 每个模板标注来源, 每个项目记录血统 |

---

**Document Maintained By**: Development Team  
**Last Updated**: 2026-02-12  
**Next Review**: 2026-02-26

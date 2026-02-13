# Template Factory — Implementation Plan (v2.0 元项目版)

**Version**: 2.0  
**Date**: 2026-02-12  
**Status**: Ready for Execution  
**修订说明**: v2.0 基于元项目架构，Buy > Build，总代码量 ~700 行  
**Related**: [PRD](../requirements/template-factory-prd.md) | [Architecture](../architecture/template-factory-architecture.md)

---

## Plan Overview

| Phase | 名称 | 时间 | 核心动作 | 写代码量 |
|:---|:---|:---|:---|:---|
| **P1** | 创建元项目 + 搬迁资产 | 1-2 天 | 建仓库 + cp | 0 行 |
| **P2** | 模板格式标准化 | 2-3 天 | .template → .jinja | ~200 行脚本 |
| **P3** | CLI 工具 (tf create/list) | 2-3 天 | Typer + copier | ~400 行 |
| **P4** | AI 增强 (tf scan/analyze/extract) | 3-5 天 | Ollama + Prompts | ~300 行 + 10 Prompts |
| **P5** | 验证 (Dog-fooding) | 1 天 | 用元项目重新生成项目 | 0 行 |

**总计: ~2 周, ~900 行代码 + ~10 个 Prompt**

```
Timeline:

Week 1:  [===P1===][==========P2==========][==========P3==========]
Week 2:  [================P4================][===P5===]
```

---

# Phase 1: 创建元项目 + 搬迁资产 (1-2 天)

> **目标**: 独立 Git 仓库 + 现有资产搬迁
> **写代码量**: 0 行 (纯文件操作)

## Task P1-T1: 创建元项目仓库

**预计时间**: 30 分钟

```powershell
# 1. 创建仓库目录 (与 ottawa 项目同级)
mkdir d:\BaiduSyncdisk\workspace\python_workspace\template-factory
cd d:\BaiduSyncdisk\workspace\python_workspace\template-factory

# 2. 初始化 Git
git init

# 3. 创建目录结构
mkdir catalog
mkdir catalog\backend
mkdir catalog\frontend
mkdir catalog\agent
mkdir catalog\devops
mkdir catalog\tests
mkdir presets
mkdir skills
mkdir prompts
mkdir references
mkdir references\analysis
mkdir tf
mkdir tests
```

**验收标准**:
- [ ] 目录结构创建完毕
- [ ] `git init` 成功

---

## Task P1-T2: 搬迁模板资产

**预计时间**: 2 小时

```powershell
# 搬迁路径映射:
# .agent/templates/backend/     → catalog/backend/
# .agent/templates/frontend/    → catalog/frontend/
# .agent/templates/agent/       → catalog/agent/
# .agent/templates/devops/      → catalog/devops/
# .agent/templates/tests/       → catalog/tests/
# .agent/templates/orchestration/ → catalog/agent/orchestration/
# .agent/templates/doc_intelligence/ → catalog/backend/doc-intelligence/
# .agent/templates/azure/       → catalog/backend/azure/

$src = "d:\BaiduSyncdisk\workspace\python_workspace\ottawa-genai-research-assistant\.agent\templates"
$dst = "d:\BaiduSyncdisk\workspace\python_workspace\template-factory\catalog"

# 复制 (保留原件, 不是剪切)
Copy-Item -Recurse "$src\backend\*" "$dst\backend\"
Copy-Item -Recurse "$src\frontend\*" "$dst\frontend\"
Copy-Item -Recurse "$src\agent\*" "$dst\agent\"
Copy-Item -Recurse "$src\devops\*" "$dst\devops\"
Copy-Item -Recurse "$src\tests\*" "$dst\tests\"
Copy-Item -Recurse "$src\orchestration\*" "$dst\agent\orchestration\"
Copy-Item -Recurse "$src\doc_intelligence\*" "$dst\backend\doc-intelligence\"
Copy-Item -Recurse "$src\azure\*" "$dst\backend\azure\"
```

**验收标准**:
- [ ] 所有 128 个 .template 文件搬迁完成
- [ ] 文件内容无损
- [ ] 原项目 .agent/templates/ 保持不动 (副本)

---

## Task P1-T3: 搬迁 Skills

**预计时间**: 30 分钟

```powershell
$src = "d:\BaiduSyncdisk\workspace\python_workspace\ottawa-genai-research-assistant\.agent\skills"
$dst = "d:\BaiduSyncdisk\workspace\python_workspace\template-factory\skills"

# 只搬迁与模板工厂相关的 skills
Copy-Item -Recurse "$src\dev-senior_architect" "$dst\architect"
Copy-Item -Recurse "$src\dev-code_reviewer" "$dst\code-reviewer"
Copy-Item -Recurse "$src\dev-template_extraction" "$dst\template-extraction"
Copy-Item -Recurse "$src\dev-senior_fullstack" "$dst\fullstack"
Copy-Item -Recurse "$src\dev-senior_qa" "$dst\qa"
Copy-Item -Recurse "$src\dev-product_manager" "$dst\product-manager"
```

**验收标准**:
- [ ] 6 个核心 skill 搬迁完成
- [ ] SKILL.md 文件内容无损

---

## Task P1-T4: 搬迁参考项目索引

**预计时间**: 1 小时

创建 `references/registry.yaml`:

```yaml
# references/registry.yaml
# 参考项目注册表 — 记录所有研究过的开源项目
version: "1.0"
total_projects: 38
last_updated: "2026-02-12"

projects:
  # ── Backend ──────────────────────────
  - name: fastapi-full-stack-template
    url: https://github.com/fastapi/full-stack-fastapi-template
    stars: 17000+
    stack: [FastAPI, React, SQLModel, Docker]
    status: extracted     # extracted | reference | pending
    extracted_modules: [fastapi-route, service, schemas]
    
  - name: fastapi-best-practices
    url: https://github.com/zhanymkanov/fastapi-best-practices
    stars: 9000+
    stack: [FastAPI, Netflix Dispatch patterns]
    status: reference
    notes: "每域一包结构参考"
    
  - name: azure-search-openai-demo
    url: https://github.com/Azure-Samples/azure-search-openai-demo
    stars: 6000+
    stack: [FastAPI, Azure, RAG]
    status: extracted
    extracted_modules: [rag-pipeline, text-splitter, embeddings-manager]
    
  # ── Frontend ─────────────────────────
  - name: lobe-chat
    url: https://github.com/lobehub/lobe-chat
    stars: 50000+
    stack: [Next.js, Zustand, TypeScript]
    status: extracted
    extracted_modules: [zustand-store, chat-ui, model-select]
    
  - name: chatbot-ui
    url: https://github.com/mckaywrigley/chatbot-ui
    stars: 28000+
    stack: [Next.js, Supabase, TypeScript]
    status: extracted
    extracted_modules: [chat-ui, chat-helpers]
    
  - name: rag-web-ui
    url: https://github.com/rag-web-ui/rag-web-ui
    stars: 1000+
    stack: [React, FastAPI, LangChain]
    status: extracted
    extracted_modules: [chat-citation, document-upload, chat-api]
    
  # ── Agent ────────────────────────────
  - name: MetaGPT
    url: https://github.com/geekan/MetaGPT
    stars: 45000+
    stack: [Python, Multi-Agent]
    status: extracted
    extracted_modules: [role, action, memory, prompt-registry]
    
  - name: joyagent-jdgenie
    url: https://github.com/jd-opensource/joyagent-jdgenie
    stars: 5000+
    stack: [Python, Multi-Agent, Tools]
    status: pending
    notes: "Agent tools 待提取"
    
  # ── 其他 30 个项目 (精简) ───────────
  # ... (按同样格式记录)
```

**验收标准**:
- [ ] registry.yaml 包含所有 38 个项目
- [ ] 每个项目有 name, url, stars, stack, status
- [ ] 已提取的项目列出 extracted_modules

---

## Task P1-T5: 创建元项目 README 和配置

**预计时间**: 1 小时

创建以下文件:
- `README.md` — 元项目说明
- `pyproject.toml` — Python 包配置
- `.gitignore`
- `LICENSE` (MIT)

```toml
# pyproject.toml
[project]
name = "template-factory"
version = "0.1.0"
description = "AI-assisted meta-project for template-driven project generation"
requires-python = ">=3.11"
dependencies = [
    "typer[all]>=0.9",
    "copier>=9.0",
    "httpx>=0.27",
    "pyyaml>=6.0",
]

[project.optional-dependencies]
ai = [
    "tree-sitter>=0.22",
    "tree-sitter-python>=0.21",
    "tree-sitter-typescript>=0.21",
    "PyGithub>=2.0",
]

[project.scripts]
tf = "tf.cli:app"
```

**验收标准**:
- [ ] `pip install -e .` 成功
- [ ] `tf --help` 显示帮助 (即使命令未实现)

---

## Task P1-T6: 初始提交

**预计时间**: 15 分钟

```powershell
cd d:\BaiduSyncdisk\workspace\python_workspace\template-factory
git add .
git commit -m "feat: initialize template-factory meta-project

- Migrate 128 templates from ottawa-genai-research-assistant
- Migrate 6 core skills
- Create reference project registry (38 projects)
- Set up project structure: catalog/ presets/ skills/ prompts/ tf/"
```

**验收标准**:
- [ ] Git commit 成功
- [ ] 文件结构清晰

---

# Phase 2: 模板格式标准化 (2-3 天)

> **目标**: .template → .jinja + module-card.yaml
> **写代码量**: ~200 行 (格式转换脚本)

## Task P2-T1: 编写格式转换脚本

**预计时间**: 4 小时  
**文件**: `scripts/migrate_templates.py`

```python
"""
模板格式迁移脚本:
1. .template → .jinja 重命名
2. {{FeatureName}} → {{ feature_name | pascal_case }} (copier 语法)
3. 为每个模块目录生成 module-card.yaml
4. 为每个模块目录生成 copier.yaml

这个脚本只运行一次，不是常驻代码。
"""
```

核心转换规则:

```
旧格式 (.template):                    新格式 (.jinja):
────────────────────                   ────────────────────
{{FeatureName}}                  →     {{ feature_name | title }}
{{feature_name}}                 →     {{ feature_name }}
{{featureName}}                  →     {{ feature_name | camel_case }}
{{API_BASE_URL}}                 →     {{ api_base_url }}
{{ALIAS}}                        →     {{ alias }}
{{APP_NAME}}                     →     {{ app_name }}
{{TABLE_NAME}}                   →     {{ table_name }}
{{ROUTE_PREFIX}}                 →     {{ route_prefix }}
{{date}}                         →     {{ now() | strftime('%Y-%m-%d') }}
```

**验收标准**:
- [ ] 所有 128 个 .template → .jinja 转换完成
- [ ] 占位符语法符合 Jinja2 标准
- [ ] 文件内容语义不变

---

## Task P2-T2: 生成 module-card.yaml

**预计时间**: 4 小时

对每个模块目录，从现有的 TEMPLATE_EXTRACTION_PLAN.md 和文件头部注释提取信息，生成 `module-card.yaml`。

**可以用 AI 辅助**: 读取现有 .template 文件头部的 `@source` 和 `@template` 标签，自动生成 YAML。

**验收标准**:
- [ ] 每个模块目录都有 module-card.yaml
- [ ] 包含 name, layer, priority, source, files, dependencies
- [ ] 格式符合架构文档定义

---

## Task P2-T3: 生成 copier.yaml

**预计时间**: 3 小时

对每个模块，定义 copier 需要的变量提问：

```yaml
# catalog/backend/fastapi-route/copier.yaml
_templates_suffix: .jinja

feature_name:
  type: str
  help: "Feature name (snake_case, e.g. 'documents')"
  validator: "{% if not feature_name %}Required{% endif %}"

route_prefix:
  type: str
  help: "API route prefix (e.g. '/api/v1/documents')"
  default: "/api/v1/{{ feature_name }}"
```

**验收标准**:
- [ ] 每个模块目录都有 copier.yaml
- [ ] `copier copy catalog/backend/fastapi-route ./test-output` 可运行

---

## Task P2-T4: 生成全局 index.yaml

**预计时间**: 2 小时

遍历 catalog/ 目录，汇总所有模块的 module-card.yaml，生成全局索引。

```python
# 伪代码 (可以写个小脚本)
for module_dir in catalog.walk():
    card = yaml.load(module_dir / "module-card.yaml")
    index["modules"][card.name] = {
        "layer": card.layer,
        "priority": card.priority,
        "requires": card.requires,
        "tags": card.tags,
    }
```

**验收标准**:
- [ ] index.yaml 包含所有模块
- [ ] 依赖图部分可用于拓扑排序
- [ ] `tf list` 可直接读取此文件

---

## Task P2-T5: 创建预置套餐文件

**预计时间**: 2 小时

创建 4 个 preset YAML 文件：

| 文件 | 模块数 | 描述 |
|:---|:---|:---|
| `presets/rag-chat.yaml` | ~12 | RAG 聊天应用 |
| `presets/admin-dashboard.yaml` | ~8 | 管理后台 |
| `presets/api-service.yaml` | ~6 | 纯后端 API |
| `presets/ai-agent.yaml` | ~5 | 多智能体系统 |

**验收标准**:
- [ ] 4 个 preset 文件创建完成
- [ ] 每个 preset 的模块列表与 index.yaml 对应
- [ ] 默认变量定义完整

---

# Phase 3: CLI 工具 (2-3 天)

> **目标**: `tf create` 和 `tf list` 可用
> **写代码量**: ~400 行 Python

## Task P3-T1: CLI 入口

**预计时间**: 2 小时  
**文件**: `tf/cli.py` (~100 行)

```python
"""Template Factory CLI — 入口"""
import typer

app = typer.Typer(name="tf", help="Template Factory — 模板驱动的项目生成器")

@app.command()
def create(name: str, preset: str = "rag-chat", output: str = "./"):
    """从预置套餐创建新项目。"""
    from .create import run_create
    run_create(name, preset, output)

@app.command("list")
def list_(layer: str = typer.Option(None, help="Filter by layer")):
    """列出所有可用模板和套餐。"""
    from .catalog import run_list
    run_list(layer)

@app.command()
def status():
    """查看模板库统计。"""
    from .catalog import run_status
    run_status()

@app.command()
def search(query: str):
    """搜索模板库。"""
    from .catalog import run_search
    run_search(query)
```

**验收标准**:
- [ ] `tf --help` 显示所有命令
- [ ] `tf list` 输出模板列表
- [ ] `tf status` 输出统计信息

---

## Task P3-T2: tf create (项目生成)

**预计时间**: 4 小时  
**文件**: `tf/create.py` (~150 行)

核心逻辑：
1. 读取 preset YAML → 获取模块列表 + 默认变量
2. 解析依赖图 → 拓扑排序
3. 逐个模块调用 `copier copy` → 渲染 Jinja2 模板
4. 合并 npm/pip 依赖
5. 生成 `.tf.yaml` (项目血统记录)
6. 输出 next steps

**验收标准**:
- [ ] `tf create my-app --preset rag-chat` 端到端成功
- [ ] 生成的项目包含所有 preset 定义的模块
- [ ] 所有 `{{ placeholder }}` 已替换
- [ ] `.tf.yaml` 记录完整

---

## Task P3-T3: tf list / tf search / tf status

**预计时间**: 3 小时  
**文件**: `tf/catalog.py` (~100 行)

```
$ tf list
📦 Template Factory — 45 modules across 5 layers

Backend (18 modules):
  ├── fastapi-route      🔴 Critical  [api, fastapi, crud]
  ├── rag-pipeline       🔴 Critical  [rag, retrieval, azure]
  ├── chat-service       🔴 Critical  [chat, langchain]
  ├── azure-openai       🔴 Critical  [azure, openai]
  └── ... (14 more)

Frontend (20 modules):
  ├── chat-ui            🟠 High      [chat, components, react]
  ├── chat-citation      🔴 Critical  [citation, markdown]
  ├── zustand-store      🔴 Critical  [state, zustand]
  └── ... (17 more)

Presets:
  🎁 rag-chat          12 modules  "RAG 聊天应用"
  🎁 admin-dashboard    8 modules  "管理后台"
  🎁 api-service        6 modules  "纯后端 API"
  🎁 ai-agent           5 modules  "多智能体系统"
```

**验收标准**:
- [ ] `tf list` 输出格式美观
- [ ] `tf list --layer frontend` 筛选生效
- [ ] `tf search chat` 返回相关模板
- [ ] `tf status` 显示总计

---

## Task P3-T4: 端到端测试

**预计时间**: 3 小时

1. `tf create test-rag --preset rag-chat`
2. `cd test-rag && npm install && npm run build` (前端)
3. `cd test-rag && pip install -r requirements.txt && ruff check .` (后端)
4. 检查所有占位符已替换

**验收标准**:
- [ ] Build 通过 (前端 + 后端)
- [ ] 无残留 `{{ }}` 占位符
- [ ] `.tf.yaml` 内容正确

---

# Phase 4: AI 增强 (3-5 天)

> **目标**: `tf scan`, `tf analyze`, `tf extract` 可用
> **写代码量**: ~300 行 Python + ~10 个 Prompt
> **前提**: 本地已安装 Ollama + 模型

## Task P4-T1: 安装 Ollama + 模型

**预计时间**: 2-4 小时 (含下载)

```powershell
# 安装 Ollama
winget install Ollama.Ollama

# 下载模型
ollama pull qwen2.5-coder:32b     # 代码分析 (~18GB)
ollama pull nomic-embed-text       # 代码相似度 (~300MB)

# 验证
ollama run qwen2.5-coder:32b "Explain the Strategy pattern in Python"
```

**验收标准**:
- [ ] Ollama 运行在 `http://localhost:11434`
- [ ] 至少 1 个代码模型可用

---

## Task P4-T2: Ollama 调用封装

**预计时间**: 1 小时  
**文件**: `tf/llm.py` (~50 行)

```python
"""最小 Ollama 封装。"""
import httpx

OLLAMA_URL = "http://localhost:11434"

async def ask(prompt: str, model: str = "qwen2.5-coder:32b") -> str:
    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(f"{OLLAMA_URL}/v1/chat/completions", json={
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2,
        })
        return resp.json()["choices"][0]["message"]["content"]

def is_available() -> bool:
    try:
        return httpx.get(f"{OLLAMA_URL}/api/tags", timeout=2).status_code == 200
    except Exception:
        return False
```

**验收标准**:
- [ ] `ask("What is FastAPI?")` 返回合理回答
- [ ] `is_available()` 正确检测 Ollama 状态

---

## Task P4-T3: 编写 Agent Prompts

**预计时间**: 4 小时  
**文件**: `prompts/*.md`

| Prompt 文件 | 用途 | 输入 | 输出格式 |
|:---|:---|:---|:---|
| `scout.md` | 评估项目提取价值 | README + 目录树 | JSON (scores + recommendation) |
| `architect.md` | 识别可提取模块 | 目录树 + 文件签名 | YAML (modules list) |
| `extractor.md` | 标记 placeholder | 源代码 | JSON (placeholder list) |
| `reviewer.md` | 审核模板质量 | .jinja 内容 | JSON (issues + score) |
| `module-card-gen.md` | 生成 Module Card | 源文件列表 | YAML (module-card) |

**验收标准**:
- [ ] 每个 Prompt 有明确的输入/输出格式要求
- [ ] 输出是结构化的 JSON/YAML (可程序解析)
- [ ] 对测试项目的输出质量 ≥ 3.5/5.0

---

## Task P4-T4: tf scan 实现

**预计时间**: 4 小时  
**文件**: `tf/scan.py` (~150 行)

```python
"""
tf scan — 扫描 GitHub 发现有价值的项目

底层工具: gh CLI + Ollama
人工参与: 扫描结果需要人工确认是否 clone
"""

def scan(topic: str, language: str = "Python", min_stars: int = 500):
    # 1. 调用 gh CLI 搜索
    repos = _gh_search(topic, language, min_stars)  # subprocess: gh search repos

    # 2. 过滤 License
    repos = [r for r in repos if r.license in ALLOWED_LICENSES]

    # 3. AI 评估 (Ollama)
    if llm.is_available():
        for repo in repos[:20]:  # 只评估 Top 20
            repo.ai_score = await _evaluate_with_llm(repo)

    # 4. 排序输出
    repos.sort(key=lambda r: r.total_score, reverse=True)

    # 5. 输出 Markdown 报告 (人工阅读)
    _print_report(repos)
    _save_report(repos, f"scan_{topic}_{date}.md")
```

**验收标准**:
- [ ] `tf scan --topic rag --lang Python` 输出 Top 20 项目
- [ ] Ollama 不可用时降级为纯 stars/metadata 排序
- [ ] 报告格式人类可读

---

## Task P4-T5: tf analyze 实现

**预计时间**: 4 小时  
**文件**: `tf/analyze.py` (~100 行)

```python
"""
tf analyze — 分析项目架构，识别可提取模块

底层工具: tree-sitter (AST) + Ollama (模块识别)
人工参与: Module Card 草稿需要人工审核修改
"""

def analyze(path: str):
    # 1. 扫描目录结构
    tree = _scan_directory(path)

    # 2. 解析文件签名 (tree-sitter 或正则)
    signatures = _extract_signatures(path)

    # 3. AI 识别模块 (Ollama)
    prompt = _build_prompt(tree, signatures)  # 使用 prompts/architect.md
    modules = await llm.ask(prompt)

    # 4. 输出 Module Card 草稿 (人工审核)
    for module in modules:
        _save_module_card_draft(module, f"drafts/{module.name}.yaml")

    typer.echo("📋 Module Card 草稿已生成，请在 drafts/ 目录审核")
```

**验收标准**:
- [ ] `tf analyze --path ./references/rag-web-ui` 输出模块列表
- [ ] Module Card 草稿格式符合规范
- [ ] 明确提示用户需要审核

---

## Task P4-T6: tf extract 实现

**预计时间**: 4 小时  
**文件**: `tf/extract.py` (~100 行)

```python
"""
tf extract — AI 辅助提取模板

底层: Ollama (placeholder 检测) + 方法论规则 (SKILL.md)
人工参与: 提取结果需要人工审核 + 修改
"""

def extract(module_card: str, source_path: str):
    # 1. 读取 Module Card
    card = yaml.load(module_card)

    # 2. 读取源文件
    sources = _read_sources(card.files, source_path)

    # 3. AI 标记 placeholder (Ollama)
    placeholders = await _detect_placeholders(sources)  # prompts/extractor.md

    # 4. 人工确认 placeholder 列表
    typer.echo("=== AI 建议的 Placeholder ===")
    for p in placeholders:
        typer.echo(f"  {p.original} → {p.placeholder}  ({p.reason})")
    if not typer.confirm("确认这些替换?"):
        typer.echo("请手动编辑后重新运行")
        return

    # 5. 应用替换 + 添加头部注释
    templates = _apply_replacements(sources, placeholders)
    templates = _add_headers(templates, card)

    # 6. 写入 catalog/
    _save_templates(templates, f"catalog/{card.layer}/{card.name}/")

    # 7. 更新 index.yaml
    _update_index(card)
```

**验收标准**:
- [ ] AI placeholder 检测与人工判断一致度 ≥ 70%
- [ ] 人工确认步骤不可跳过
- [ ] 生成的 .jinja 文件语法正确

---

# Phase 5: 验证 (Dog-fooding) (1 天)

> **目标**: 用元项目验证能否重新生成 ottawa-genai-research-assistant 的关键模块

## Task P5-T1: 生成测试项目

**预计时间**: 2 小时

```powershell
# 用 rag-chat 套餐生成测试项目
cd d:\BaiduSyncdisk\workspace\python_workspace
tf create test-rag-app --preset rag-chat

# 验证
cd test-rag-app
pip install -r requirements.txt
ruff check .
cd frontend && npm install && npm run build
```

**验收标准**:
- [ ] 项目生成 < 2 分钟
- [ ] Build 通过 (前端 + 后端)
- [ ] 代码结构与 ottawa 项目一致

---

## Task P5-T2: 与原项目对比

**预计时间**: 2 小时

对比 `test-rag-app/` 和 `ottawa-genai-research-assistant/` 的关键文件:
1. 路由文件结构
2. Service 层模式
3. 前端组件结构
4. Store 管理模式

**验收标准**:
- [ ] 代码模式与原项目一致
- [ ] 变量替换完整正确
- [ ] 记录差异和改进项

---

## Task P5-T3: 编写文档

**预计时间**: 2 小时

更新元项目 README.md:
1. Quick Start (3 步使用)
2. 可用 Preset 列表
3. 可用模块目录
4. 如何添加新模板
5. 如何创建新 Preset

**验收标准**:
- [ ] README 完整, 新用户可跟着操作
- [ ] Quick Start 验证通过

---

## Milestone Checklist

### M1: 元项目创建 (End of P1) ✅
- [ ] 独立仓库创建完成
- [ ] 128 个模板搬迁完成
- [ ] 6 个 Skill 搬迁完成
- [ ] 38 个参考项目注册完成
- [ ] 初始 commit 完成

### M2: 格式标准化 (End of P2) ✅
- [ ] 所有 .template → .jinja 转换完成
- [ ] 每个模块有 module-card.yaml + copier.yaml
- [ ] index.yaml 全局索引生成
- [ ] 4 个预置套餐定义完成

### M3: CLI 可用 (End of P3) ✅ — **核心里程碑**
- [ ] `tf create --preset rag-chat` 端到端成功
- [ ] 生成的项目 Build 通过
- [ ] `tf list / search / status` 可用

### M4: AI 增强 (End of P4) ✅
- [ ] Ollama 运行, 至少 1 个代码模型
- [ ] `tf scan` 输出项目评估报告
- [ ] `tf analyze` 输出 Module Card 草稿
- [ ] `tf extract` AI 辅助 + 人工确认

### M5: 验证通过 (End of P5) ✅ — **最终里程碑**
- [ ] Dog-fooding: 用元项目生成的项目质量合格
- [ ] README 完整, 可交付
- [ ] 代码总量 < 1000 行 (不含模板)

---

## 代码量预估

| 文件 | 行数 | 说明 |
|:---|:---|:---|
| `tf/cli.py` | ~100 | Typer 入口 |
| `tf/create.py` | ~150 | 调用 copier |
| `tf/catalog.py` | ~100 | list/search/status |
| `tf/scan.py` | ~150 | gh CLI + Ollama |
| `tf/analyze.py` | ~100 | tree-sitter + Ollama |
| `tf/extract.py` | ~100 | Ollama + 方法论 |
| `tf/llm.py` | ~50 | Ollama 封装 |
| `scripts/migrate_templates.py` | ~200 | 一次性格式转换 |
| **小计** | **~950** | 不含模板和 prompt |

| Prompt 文件 | 用途 |
|:---|:---|
| `prompts/scout.md` | 项目评估 |
| `prompts/architect.md` | 模块识别 |
| `prompts/extractor.md` | Placeholder 检测 |
| `prompts/reviewer.md` | 质量审核 |
| `prompts/module-card-gen.md` | Module Card 生成 |
| **小计** | **5 个核心 Prompt** |

---

**Document Maintained By**: Development Team  
**Last Updated**: 2026-02-12  
**Next Action**: Phase 1 — 创建元项目仓库

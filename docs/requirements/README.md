# 需求文档管理目录 (Requirements Management)

本项目遵循 **`dev-prd`** skill 规范，将需求按阶段和功能进行模块化拆分，以提高 AI 辅助开发的精准度。

## 目录结构

### 1. 核心导航

- [**Master PRD**](./master_prd.md): 项目总纲、愿景、全局技术栈及 NFRs。
- [**Phase 1**](./phase1_internal_rag.md): 内部逻辑、基础 RAG（已完成维护期）。
- [**Phase 2**](./phase2_external_integration.md): 外部集成、高级分析（**当前活跃阶段**）。

### 2. 功能详情 (Features)

存放具体复杂模块的颗粒度需求：

- [分析与可视化](./features/prd_analytics.md)

## 开发建议

开发新功能时，请运行：

```bash
python .skills/dev-prd/scripts/generate_prd.py "NewFeatureName"
```

并在 `prd_newfeaturename.md` 中定义详细的 Acceptance Criteria (AC)。

# 📄 H. Document Intelligence Templates (RAG Layer)

> **层级**: Document Intelligence | **模板数**: 5
> **主要参考**: [RAGFlow](../../.github/references/ragflow/) + [PageIndex](../../.github/references/pageindex/)

基于 RAGFlow 的**深度文档解析**和 PageIndex 的**推理式检索**。

> **注**: H 层是**文档智能层**，位于 A 层 (Backend) 和 C/G 层 (Agent/Orchestration) 之间。它负责将原始文档转化为可检索的知识，是 RAG 系统的核心。

---

### H1. `doc_intelligence/document_parser.py.template` — 多格式文档解析器
- 策略模式：运行时切换解析引擎 (DeepDoc / MinerU / Docling / PaddleOCR)
- 10 种布局组件识别 + 表格结构识别 (TSR)
- 按文档类型选择模板：论文、书籍、法律、手册、简历、Q&A

### H2. `doc_intelligence/tree_indexer.py.template` — 层级树索引构建
- 三路处理策略：有目录+有页码 / 有目录+无页码 / 无目录 (LLM 生成)
- 并发验证标题 + 带重试的自动修复
- 递归拆分超大节点

### H3. `doc_intelligence/hybrid_retriever.py.template` — 混合检索器
- BaseRetriever 抽象：向量/树搜索/关键词多种实现
- HybridRetriever 组合 + asyncio.gather 并行
- Reciprocal Rank Fusion (RRF) 融合重排

### H4. `doc_intelligence/citation_tracker.py.template` — 溯源引用追踪
- Grounded Citations：每个引用追溯到文件、页码、章节
- build_context_with_markers() 引导 LLM 正确引用
- verify_citations() 后验证防止幻觉

### H5. `doc_intelligence/layout_analyzer.py.template` — 布局分析器
- YOLOv8/v10 视觉优先识别
- 双栏优化 + 表格结构识别 (TSR)

---

> 📖 **完整代码示例**: 请参阅 [template_system_design.md](./template_system_design.md) L1319-L1591

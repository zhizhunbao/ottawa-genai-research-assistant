# Ottawa GenAI Research Assistant - Product Requirements Document

**Project:** Ottawa Economic Development Team GenAI Research Assistant  
**Phase:** Phase 1 - Internal PDF Analysis 🔄 **IN PROGRESS** | Next: Data Visualization & Trust Validation  
**Updated:** November 2025

---

## 🚀 **Executive Summary**

The Ottawa Economic Development team is developing a **Generative AI Research Assistant** with Algonquin College to answer natural-language questions, generate summaries, and produce visuals sourced from Economic Development Update PDFs hosted on ottawa.ca (Q1 2022 – Q4 2025). The initiative now follows a **greenfield build** that aligns with City technology guidance (Azure AI stack, agentic RAG exploration, trustability-first design).

**Current Status:** Phase 1 scoping and ingestion pipeline design 🔄 **IN PROGRESS** — focus on corpus preparation, retrieval architecture decisions, evaluation metrics, and frontend chat experience definition.

**Next Focus:** Implement end-to-end RAG workflow (ingest → retrieval → answer generation → trust scoring) and establish visualization + reporting pathways for SMEs to pilot.

---

## 🎯 **Updated Project Objectives**

### **Phase 1 - Internal PDF Analysis** 🔄 **CURRENT FOCUS**

- **Objective**: Deliver a RAG-based assistant that serves Economic Development Update PDFs (ottawa.ca) so analysts can answer stakeholder question lists without redeploying the stack
- **Data Scope**: Primary focus on Q1 2022 – Q4 2025 ED Update PDFs (gap during Q3 2019 – Q3 2021 acknowledged)
- **Core Features**: Natural-language Q&A, sourced summaries, auto-generated charts/tables, speaking-note style outputs
- **Key Requirements**: Trustability indicators with source citations, configurable question lists, reusable ingestion pipeline for new PDFs

### **Phase 2 - External Data Integration** 📋 **PLANNED**

- **Expansion Scope**: Integrate prioritized external data sources (e.g., Statistics Canada APIs, Ottawa Real Estate Board updates) and targeted PDF scraping
- **Enhanced Features**: Augment indicators, enrich analytics, broaden charting templates, begin agentic workflows crossing multiple corpora
- **Data Fusion**: Combine public datasets (ottawa.ca, Business Newsroom posts, partner PDFs) with internal ED Update corpus through orchestrated pipelines

### **Phase 3 - Advanced Analytics** 📋 **FUTURE**

- **Intelligent Analysis**: Cross-report trend analysis and forecasting
- **Automated Reporting**: Regularly generate comprehensive economic analysis reports
- **Decision Support**: Provide data-driven insights for policy making

---

## 📊 **Project Status Dashboard**

| Component | Status | Progress | Next Action |
|-----------|--------|----------|-------------|
| 📂 **PDF Ingestion Pipeline** | 🔄 In Progress | 35% | Finalize ottawa.ca download automation + metadata tagging |
| 🔎 **RAG Retrieval & Backend** | 🟡 Scoping | 20% | Select vector store (Azure AI Search vs Qdrant) and evaluation harness |
| 💬 **Frontend Chat Experience** | 📋 Planned | 0% | Design React widget UX + role-based access plan |
| 📉 **Visualization Layer** | 📋 Planned | 0% | Define chart templates + pandas/Plotly pipeline |
| ✅ **Trustability Metrics** | 📋 Planned | 0% | Confirm accuracy/faithfulness/context recall measurement libraries |
| 🚀 **Deployment & Ops** | 🟡 Scoping | 10% | Draft containerization + observability requirements |

---

## 📂 **Data Scope & Management**

### **Phase 1 - Internal Documents** 🔄

- **Primary Corpus**: Economic Development Update PDFs on ottawa.ca (Q1 2022 – Q4 2025) supplied by EcDev; note publication gap between Q3 2019 – Q3 2021
- **Storage Method**: Azure AI Search or equivalent vector DB (FAISS/Qdrant) with hybrid semantic + keyword retrieval
- **Access Mode**: Offline-friendly processing with repeatable ingestion scripts; keep corpus updatable without redeploying

### **Phase 2 - External Sources** 📋

- **StatsCan Data**: Priority APIs for Ottawa-level indicators (employment, GDP, housing starts)
- **Real Estate Reports**: Ottawa Real Estate Board monthly updates, CMHC housing outlooks
- **Business-specified PDFs**: Content from Ottawa Board of Trade, Invest Ottawa, partner organizations per SME guidance

### **Future Expansion** 🔮

- **ottawa.ca Content**: Public policies and reports
- **Social Media Data**: Public sentiment and feedback analysis
- **Real-time Data Sources**: Dynamic economic indicator integration

---

## ⚙️ **Technical Architecture (Updated)**

### **Architecture Principles**

- **Greenfield Build**: No dependency on legacy Kevin code; follow City guidance (Azure AI stack, open-standard tooling) and document every library.
- **Modular RAG Pipeline**: Isolate ingestion, retrieval, reasoning, visualization, and evaluation layers for rapid iteration and testing.
- **Observability & Trust**: Instrument telemetry (OpenTelemetry-style) and capture per-response trustability metadata (sources, metrics, hallucination flags).
- **Deployment Readiness**: Containerize services for Azure Container Apps/Kubernetes with Infrastructure-as-Code handoff.

### **Core Technology Stack**

- **Frontend**: HTML/CSS/JavaScript interface with a React chat widget for city staff; lightweight demo/ops views can be built with Streamlit as needed.
- **Backend Orchestrator**: FastAPI services leveraging Microsoft Semantic Kernel (or LangChain) for agentic workflows, tool routing, and evaluation.
- **Vector & Indexing**: Azure AI Search, FAISS, or Qdrant for hybrid semantic + keyword retrieval.
- **LLM & Embeddings**: Azure AI Foundry (GPT-4o / GPT-4 Turbo), OpenRouter or Ollama for experiments, Hugging Face embeddings.
- **Analytics & Visualization**: pandas, NumPy, Matplotlib/Seaborn, Plotly for chart generation.
- **Security**: Azure Key Vault for secrets, RBAC aligned with City policies, audit logging of user prompts/actions.

### **AI & Processing Components**

- **Document Processing**: PDF extraction, layout-aware chunking, metadata tagging (report type, quarter, topic).
- **Vectorization & Retrieval**: Batch embedding jobs, periodic re-embedding, hybrid search with filters (date, topic, department).
- **Agentic Reasoning**: Retrieval-augmented answering with optional planner/executor agents for multi-hop queries and evaluation sweeps.
- **Visualization**: Automatic figure/table synthesis using structured data extracted from PDFs or external indicators.
- **Evaluation & Trust**: Response scoring (accuracy, faithfulness, context recall) plus BLEU/ROUGE/NLI experiments; surfaced to users as confidence badges.

---

## 👥 **User Roles & Permissions**

| Role | Access Level | Capabilities |
|------|-------------|--------------|
| **🔬 Researcher** | Basic | Upload docs, basic chat, simple reports |
| **📊 Analyst** | Advanced | All researcher features + advanced reports |
| **⚙️ Admin** | Full | All features + user management |

**Target Users:**

- Primary: Economic Development team members
- Secondary: Other municipal departments (PoC validation)
- Future: Public residents (through portal)

---

## 🛠 **Feature Implementation Status**

### **Core Features (Phase 1)** 🔄

| Feature | Status | Description | Priority |
|---------|--------|-------------|----------|
| **📄 PDF Upload & Processing** | 🔄 In Progress | Batch upload and parse quarterly economic reports | P0 |
| **🔍 Semantic Search** | 🔄 In Progress | Vector database-based semantic retrieval | P0 |
| **💬 Natural Language Q&A** | 📋 Planned | Natural language query and answer generation | P0 |
| **📊 Auto Visualization** | 📋 Planned | Automatically generate appropriate charts and tables | P1 |
| **🔗 API Interface** | 📋 Planned | RESTful API for other systems to call | P1 |
| **🔒 Trust Validation** | 📋 Planned | BLEU, ROUGE, NLI validation methods | P1 |

### **Enhanced Features (Phase 2)** 📋

| Feature | Status | Description | Timeline |
|---------|--------|-------------|----------|
| **🌐 External Data Integration** | 📋 Planned | StatsCan, real estate data integration | Q2 2026 |
| **📈 Trend Analysis** | 📋 Planned | Cross-report trend analysis and prediction | Q3 2026 |
| **📋 Report Export** | 📋 Planned | PDF/Word format report export | Q2 2026 |
| **⚡ Real-time Updates** | 📋 Future | Real-time data source integration | Q4 2026 |

---

## 🔒 **Security & Compliance Requirements**

### **API Key Management**

- **Azure AI Foundry / OpenAI**: Keys provisioned by City with usage & cost limits; document consumption for SMEs.
- **Development Phase**: Students leverage institutional Azure/OpenRouter/Ollama resources for experimentation prior to City onboarding.
- **Key Storage**: Always load keys via Azure Key Vault or scoped secrets managers; never embed in code or configs.

### **Data Security**

- **Source Data**: Current corpus is public (ottawa.ca PDFs), but enforce role-based access to tooling and logs.
- **Audit Logs**: Capture prompt, retrieval context, response, trust metrics, and chart generation actions.
- **Compliance Requirements**: Meet municipal IT standards, follow City-approved libraries, and respect data residency requirements.

### **Trust & Reliability**

- **Hallucination Detection**: Implement accuracy/faithfulness/context recall metrics; supplement with BLEU/ROUGE/NLI experiments.
- **Answer Attribution**: Cite document title, page, and snippet for every response and visualization.
- **Confidence Scoring**: Surface evaluation scores + heuristics (retrieval density, model self-check) inside the UI.

---

## 📈 **Success Metrics & Validation**

### **Phase 1 Targets** 🎯

- [ ] Fully ingest & index Q1 2022 – Q4 2025 ED Update PDFs with repeatable pipeline
- [ ] Achieve ≥75% answer accuracy on SME-provided held-out question lists
- [ ] Query response time < 3 seconds (P95) for standard prompts
- [ ] Visualization/table generation accuracy > 90% (spot-checked by analysts)
- [ ] User satisfaction score > 4.0/5.0 during pilot sessions
- [ ] Every response presents traceable sources + trust indicators

### **Trust Validation Metrics**

- [ ] Accuracy ≥ 75% (alignment with SME answer key)
- [ ] Faithfulness ≥ 90% (citation-backed statements)
- [ ] Context recall ≥ 85% (grounding coverage)
- [ ] Hallucination detection accuracy ≥ 85% (self-check/evaluator agreement)
- [ ] BLEU/ROUGE/NLI pilots documented for research comparison

### **System Performance**

- [ ] API availability > 99.5%
- [ ] Concurrent user support > 50
- [ ] Data processing throughput > 100 PDFs/hour

---

## 📋 **Deliverables & Milestones**

### **Phase 1 Deliverables** 🎯

1. **GenAI Research Assistant MVP**: End-to-end RAG workflow (ingest → retrieval → answer → visualization) over ED Update PDFs
2. **API Interface Documentation**: REST/GraphQL specs covering ingestion triggers, query endpoints, trust telemetry
3. **Trust Validation Report**: Research + implementation log for accuracy/faithfulness/context recall measurement and BLEU/ROUGE/NLI experiments
4. **Demo Version**: React chat UI + sourced answers + chart/table generation for SME review

### **Technical Deliverables**

- **Codebase**: Greenfield FastAPI/React services aligned with City stack guidance
- **Deployment Package**: Docker containers and K8s configuration files
- **Test Suite**: Automated testing and performance benchmarks
- **User Manual**: System usage and maintenance guide

### **Research Deliverables**

- **Trust Research**: Comparative analysis of BLEU, ROUGE, NLI and other validation methods
- **Best Practices**: Experience summary of GenAI applications in government departments
- **Optimization Recommendations**: System performance and user experience improvement suggestions

---

## 📅 **Updated Development Timeline**

### **Completed** ✅

- **Nov 2025**: Stakeholder clarifications workshop & consolidated brief (Js, Eric, student team)
- **Nov 2025**: Tech stack alignment with City guidance + trustability metric targets

### **In Progress** 🔄

- **Nov 2025 – Dec 2025**: Phase 1 RAG prototype over ED Update PDFs (ingestion, retrieval, visualization, trust telemetry)
- **Nov 2025 – Dec 2025**: Evaluation metric selection, ingestion automation, and UI concepting

### **Planned** 📋

- **Jan–Apr 2026**: Phase 2 – integrate first external data source + PDF scraping pipeline
- **Q2 2026**: Trust validation system implementation & API interface documentation
- **Q2 2026**: Expanded visualization/report export features

### **Future** 🔮

- **Q3 2026**: Advanced analytics (trend forecasting, cross-report comparisons)
- **Q4 2026**: Production deployment, observability hardening, and citywide user training

---

**Document Version:** 3.0  
**Last Updated:** November 2025  
**Next Review:** December 15, 2025

## 📚 Related Documentation

### 🏠 Main Project
- [📖 Main README](../README.md) - Project overview and quick start guide

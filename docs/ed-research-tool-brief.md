# Ottawa EcDev GenAI Research Tool – Consolidated Brief

---

## 1. Purpose & Scope
- Build a GenAI research assistant for Economic Development (EcDev) analysts that answers natural-language questions, generates narrative updates, charts, and speaking notes directly from an updatable document corpus (primarily PDFs) without redeploying the system.
- Phase 1 focuses on Economic Development (ED) Update reports hosted on ottawa.ca (Q1 2022 – Q4 2025), with EcDev supplying the PDF library as needed.
  - Example report: [Economic Development Update – Q4 2024](https://documents.ottawa.ca/sites/default/files/economic_update_q4_2024_en.pdf)
  - All PDFs available at: [Economic development update | City of Ottawa](https://ottawa.ca/en/planning-development-and-construction/housing-and-development-reports/local-economic-development-information/economic-development-update)
  - Note: Gap in publication due to COVID (Q3 2019 – Q3 2021), focus on Q1 2022 – Q4 2025
- Phase 2 expands to external sources via APIs (e.g., Statistics Canada) and targeted PDF scraping (e.g., [Ottawa Real Estate Board Market Update example](https://www.oreb.ca/wp-content/uploads/2025/08/OREB_MarketUpdate_HLP_July25.pdf)).

## 2. Core User Needs
- Ask open-ended questions and receive sourced reports/visuals tied to Ottawa’s economy.
- Produce periodic narrative summaries, tables, and graphs for reports or presentations.
- Summarize lengthy documents or web content with ready-to-use speaking notes.
- Provide credible outputs with trustability metrics (hallucination measure, validity) and cite underlying sources for every response.

## 3. Data Inputs & Stakeholders
- **Primary City sources:** ED Update PDFs on ottawa.ca, ED site content (with refreshed fall release), City Newsroom (Business/Economy/Innovation), Ottawa Business Journal.
- **External partners & data providers:**
  - **Chambers & Organizations:** Ottawa Board of Trade, Regroupement des Gens d'Affaires de la Capitale Nationale (Francophone Chamber of Commerce), Invest Ottawa (Lead Economic Development Agency), YOW (Airport)
  - **Tourism & Creative:** Ottawa Tourism, Ottawa Film Office, Ottawa Music Industry Coalition, Ottawa Festivals
  - **Districts:** Business Improvement Areas, ByWard Market District Authority
  - **Research Organizations:** Statistics Canada, Conference Board of Canada, Canadian Urban Institute
  - **Real Estate:** Ottawa Real Estate Board, Canada Mortgage and Housing Corporation (CMHC)
  - **Research Firms:** Colliers, Cushman & Wakefield, Marcus & Millichap, CBRE
- **Collaboration:** Keep SMEs (Js, Eric) looped in for business context; development treated as greenfield but aligned with City guidance.

## 4. Trustability Targets & Evaluation
- Every answer must include source tracking and a trustability indicator.
- Initial metrics for held-out question sets:
  - Accuracy ≥ 75%
  - Faithfulness ≥ 90%
  - Context recall ≥ 85%
- Further research required on hallucination avoidance and evaluation libraries (students to propose options; SMEs to provide recommendations).

## 5. Delivery Phases & Timelines
- **Phase 1 (Sep–Dec 2025):** RAG-based prototype over ED Update PDFs, enabling Q&A, summaries, visual generation, and agentic workflows within the City environment.
- **Phase 2 (Jan–Apr 2026):** Integrate at least one external data source via API (e.g., StatsCan APIs for key economic indicators), plus PDF scraping pipelines (e.g., OREB market updates); expand analytics outputs.

## 6. Technical & Security Guidance
- Data is public, but adhere to City's preferred stack and document all libraries.
- Majority of tools must be open source or based on widely adopted standards (OpenTelemetry, OpenAI/S3 compatibility, etc.).
- Recommended platform components:
  - **LLM & Embeddings:** Azure AI Foundry / Azure AI Search (LLM API + embeddings + vector store), OpenRouter or Ollama for LLMs (models ≥3B parameters), Hugging Face embeddings
  - **Vector Storage:** FAISS or Qdrant as vector store
  - **Orchestration:** Microsoft Semantic Kernel for orchestration with OpenAI, FastAPI backend orchestrator
  - **Frontend:** HTML/CSS/JavaScript (React chat widget)
  - **Analytics:** NumPy, pandas, Matplotlib/Seaborn; integrate OpenTelemetry-style observability where possible
  - **Evaluations:** Library recommendations forthcoming from City SMEs; students can propose options
- **Development Environment:** Students can initiate development on local machines or College-provided servers. Use students' Azure Foundry accounts or institutional environments.
- **Testing/Production Environment:** Students work with City Tech team to determine server sizing for hosting the solution in the City environment for testing.

## 7. Outstanding Actions
- Draft detailed plan aligning solution architecture with trustability metrics and agentic RAG exploration.
- Confirm evaluation library stack once City SMEs share recommendations; supplement if needed.
- Continue documenting assumptions, risk areas, and library usage for SME review.
- Provide list of evaluation-metric libraries (City SMEs to share; students can supplement).
- Students to draft plan aligning with goals/metrics and confirm library stack.

---

## Additional Notes
- City cannot share existing project code or OpenAI usage.
- Deliver tangible solution for City SMEs to review and adopt.
- Goal: address focus areas above and extend with Agentic RAG capabilities.


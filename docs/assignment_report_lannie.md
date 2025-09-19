Hye Ran Yoo 

# City of Ottawa — EcDev GenAI Research Tool (PoC)

> **Project Goal (original brief)**  
> Develop a proof of concept for an **internal research tool** for EcDev using GenAI. The solution will let staff ask questions in plain English and generate reports/visuals from uploaded PDFs or information posted on the ED site. The PoC uses **public-domain** information (e.g., ED Update reports on ottawa.ca) and is **student-led** as part of the CityStudio program.

## Overview
A GenAI-based PoC to support EcDev’s internal research. Staff ask questions in plain English and receive:
- Summaries grounded in **uploaded PDFs** and **public ED content**
- **Tables/charts** and a concise **report** with cited snippets

The PoC uses only **public data** and is developed by students through CityStudio.

---

## Objectives
- Natural-language Q&A that produces analysis and simple visuals
- Retrieval from public PDFs/ED pages with cited sources
- Speed up internal research/reporting; improve repeatability
- Provide an extensible architecture/flow suitable for future work

## In Scope
- PDF upload and processing of collected public text
- Embedding-based retrieval + LLM answer generation
- Basic report (summary + citations) and simple charts/tables

## Out of Scope (for PoC)
- Private/sensitive data handling
- Enterprise-grade auth/permissions
- Large-scale deployment/high availability

## Public Data Sources
- **ED Update reports on ottawa.ca**
- Other public documents relevant to EcDev

## Key Features
- 🔎 **Plain-English questions**
- 📚 **RAG** (retrieve relevant snippets and cite them)
- 📊 **Visuals** (simple tables/charts)
- 📝 **Auto-generated mini-report** with sources

## High-Level Architecture (PoC)
- **Frontend:** React/Vite
- **Backend:** FastAPI + Uvicorn
- **Vector Store:** ChromaDB (local) or Pinecone (optional)
- **LLM:** OpenAI by default (pluggable)
- **Storage:** SQLite (local)

## Summary
[User] → Frontend → API (FastAPI)
↳ Retrieval (Vector DB)
↳ LLM (report + visual plan)
↳ JSON (text + chart data)



## Getting Started (Local)
```bash
# 1) Clone (SSH)
git clone git@github.com:<owner>/ottawa-genai-research-assistant.git
cd ottawa-genai-research-assistant

# 2) Backend
python -m venv .venv-ottawa
source .venv-ottawa/Scripts/activate   # Git Bash on Windows
pip install -r requirements.txt
cp env.example .env
cd backend
python -m uvicorn app.main:app --reload --port 8000

# 3) Frontend (new terminal)
cd frontend
echo "VITE_API_BASE=http://127.0.0.1:8000" > .env.local
npm ci || npm install
npm run dev
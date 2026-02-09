# Ottawa GenAI Research Assistant - System Architecture

**Version**: 2.0  
**Date**: January 2026  
**Status**: Target Architecture for Production Deployment

---

## Architecture Overview

This document describes the target production architecture for the Ottawa GenAI Research Assistant, designed to meet enterprise requirements with Azure cloud services integration.

## System Components

### 1. External Services Layer

#### Azure OpenAI - ADA002
- **Purpose**: Generate embeddings for document chunks
- **Model**: text-embedding-ada-002
- **Usage**: Convert text into vector representations for semantic search
- **Key Vault**: API keys stored in Azure Key Vault

#### Azure AI Foundry
- **Purpose**: LLM inference and response generation
- **Models**: GPT-4o, GPT-4 Turbo
- **Usage**: 
  - Generate answers with grounded context
  - Provide grounded answers with citations
- **Integration**: Via Azure AI Foundry endpoints

### 2. Document Storage & Processing Layer

#### Azure Blob Storage
- **Purpose**: Persistent document storage
- **Content**: 
  - Original PDF files (Economic Development Updates Q1 2022 - Q4 2025)
  - Processed document metadata
- **Features**:
  - Top 5 Cosine/Hybrid Chunks retrieval
  - Cognitive Search integration
  - Create doc embeddings

#### Azure AI Search - Vector Index
- **Purpose**: Hybrid search (vector + keyword)
- **Features**:
  - Semantic search capabilities
  - Vector similarity search
  - Keyword-based search
  - Hybrid ranking
- **Index Content**: Document chunks with embeddings

#### Azure OpenAI - ADA002 (Embedding Service)
- **Purpose**: Generate embeddings for search queries and documents
- **Integration**: Connected to Azure AI Search for vector indexing

### 3. Backend Application Layer

#### FastAPI Backend
- **Purpose**: Core application server and API gateway
- **Responsibilities**:
  1. **Retrieve request** - Handle incoming user queries
  2. **Orchestrate query processing** - Coordinate RAG workflow
  3. **Execute query processing (RAG Orchestrator)** - Manage retrieval and generation
  4. **Log & monitor** - Track system performance and usage

#### RAG Orchestrator
- **Purpose**: Coordinate the Retrieval-Augmented Generation workflow
- **Process Flow**:
  1. Receive user query from FastAPI
  2. Generate query embedding via Azure OpenAI ADA002
  3. Search Azure AI Search for relevant chunks
  4. Retrieve top 5 chunks (cosine/hybrid)
  5. Build prompt with context
  6. Send to Azure AI Foundry (GPT-4o)
  7. Return grounded answer with citations

#### Prompt Engineering Module
- **Purpose**: Construct effective prompts for LLM
- **Features**:
  - Context injection
  - Citation formatting
  - Query optimization

#### Azure OpenAI Analytics
- **Purpose**: Monitor and analyze LLM usage
- **Metrics**:
  - Token usage
  - Response times
  - Cost tracking
  - Log & monitor activities

### 4. Frontend Layer

#### Website Input
- **Purpose**: User interface for queries
- **Features**:
  - Natural language query input
  - Display grounded answers with citations
  - Show source documents
- **Input**: "Provide me insights about the Q1 2024 Report"
- **Output**: 
  1. **Retrieve request** from user
  2. **Display results** with citations

#### FastAPI Integration
- **Purpose**: Connect frontend to backend services
- **Endpoints**:
  - POST /api/v1/query - Submit user queries
  - GET /api/v1/documents - List available documents
  - GET /api/v1/history - Retrieve query history

### 5. Monitoring & Logging

#### Azure OpenAI GPT-4o
- **Purpose**: Generate responses and monitor usage
- **Features**:
  - Grounded answer generation
  - Citation tracking
  - Performance logging

---

## Data Flow

### Query Processing Flow

```
1. User Input (Website)
   ↓
2. FastAPI Backend (Retrieve request)
   ↓
3. RAG Orchestrator (Orchestrate query processing)
   ↓
4. Azure OpenAI ADA002 (Generate query embedding)
   ↓
5. Azure AI Search (Search vector index)
   ↓
6. Retrieve Top 5 Chunks (Cosine/Hybrid)
   ↓
7. Prompt Engineering (Build context prompt)
   ↓
8. Azure AI Foundry GPT-4o (Generate answer)
   ↓
9. FastAPI Backend (Return response)
   ↓
10. Website (Display grounded answer with citations)
```

### Document Ingestion Flow

```
1. Documents (PDF files)
   ↓
2. Azure Blob Storage (Store original files)
   ↓
3. Document Processing Pipeline
   ↓
4. Text Extraction & Chunking
   ↓
5. Azure OpenAI ADA002 (Create doc embeddings)
   ↓
6. Azure AI Search (Index chunks with embeddings)
   ↓
7. Vector Index (Ready for search)
```

---

## Key Integration Points

### 1. Azure Key Vault Integration
- **Purpose**: Secure credential management
- **Stored Secrets**:
  - Azure OpenAI API keys
  - Azure AI Search keys
  - Azure Blob Storage connection strings
  - Azure AI Foundry endpoints

### 2. Azure AI Search Integration
- **Search Strategy**: Hybrid (Vector + Keyword)
- **Ranking**: Cosine similarity + BM25
- **Top K**: 5 chunks per query

### 3. Azure OpenAI Integration
- **Embedding Model**: text-embedding-ada-002
- **Generation Model**: GPT-4o / GPT-4 Turbo
- **Features**:
  - Grounded generation
  - Citation support
  - Token usage tracking

---

## Architecture Principles

### 1. Cloud-Native Design
- All services hosted on Azure
- Serverless where possible
- Scalable and resilient

### 2. Security First
- All credentials in Azure Key Vault
- No hardcoded secrets
- Azure Entra ID authentication

### 3. Observability
- Comprehensive logging
- Performance monitoring
- Cost tracking

### 4. Separation of Concerns
- Clear layer boundaries
- Independent service scaling
- Modular components

---

## Deployment Architecture

### Production Environment
- **Frontend**: Azure Static Web Apps or Azure App Service
- **Backend**: Azure Container Apps or Azure App Service
- **Storage**: Azure Blob Storage (Standard tier)
- **Search**: Azure AI Search (Standard tier)
- **AI Services**: Azure OpenAI Service (Pay-as-you-go)

### Development Environment
- **Frontend**: Local development server
- **Backend**: Local FastAPI with Docker
- **Storage**: Local file system or Azure Storage Emulator
- **Search**: Azure AI Search (Basic tier)
- **AI Services**: Azure OpenAI Service (shared)

---

## Technology Stack

### Backend
- **Framework**: FastAPI 0.104+
- **Language**: Python 3.9+
- **Key Libraries**:
  - `azure-storage-blob` - Blob Storage SDK
  - `azure-search-documents` - AI Search SDK
  - `openai` - Azure OpenAI SDK
  - `pydantic` - Data validation
  - `uvicorn` - ASGI server

### Frontend
- **Framework**: React 18
- **Language**: TypeScript 4.9+
- **Build Tool**: Vite (migrating from Create React App)
- **Key Libraries**:
  - `react-router-dom` - Routing
  - `axios` - HTTP client
  - `react-markdown` - Markdown rendering

### Infrastructure
- **Cloud Provider**: Microsoft Azure
- **Container**: Docker
- **Orchestration**: Azure Container Apps
- **CI/CD**: GitHub Actions
- **Monitoring**: Azure Application Insights

---

## Security Considerations

### Authentication & Authorization
- **User Auth**: Azure Entra ID (replacing Google OAuth)
- **Service Auth**: Managed Identity for Azure services
- **API Security**: JWT tokens with Azure AD validation

### Data Protection
- **In Transit**: TLS 1.2+ for all connections
- **At Rest**: Azure Storage encryption
- **Secrets**: Azure Key Vault with RBAC

### Compliance
- **Data Residency**: Canada region (if required)
- **Audit Logging**: All API calls logged
- **Access Control**: Role-based access (RBAC)

---

## Performance Targets

### Response Times
- **Query Processing**: < 3 seconds (P95)
- **Document Upload**: < 10 seconds per PDF
- **Search Latency**: < 500ms

### Scalability
- **Concurrent Users**: 50+
- **Documents**: 1000+ PDFs
- **Queries**: 10,000+ per day

### Availability
- **Uptime**: 99.5%+
- **Error Rate**: < 1%
- **Recovery Time**: < 5 minutes

---

## Chat History (Azure Cosmos DB)

### Purpose
Persist user chat sessions for conversation continuity across logins.

### Data Model

```json
{
  "id": "session-uuid",
  "userId": "entra-id-user-oid",
  "title": "Q1 2024 Employment Trends",
  "createdAt": "2026-02-10T10:00:00Z",
  "updatedAt": "2026-02-10T10:15:00Z",
  "messages": [
    {
      "id": "msg-uuid",
      "role": "user",
      "content": "What was the employment rate in Q1 2024?",
      "timestamp": "2026-02-10T10:00:00Z"
    },
    {
      "id": "msg-uuid",
      "role": "assistant",
      "content": "According to the Q1 2024 report...",
      "citations": [
        {
          "documentName": "Q1_2024_Economic_Update.pdf",
          "pageNumber": 5,
          "excerpt": "Employment rate increased to 62.3%..."
        }
      ],
      "confidence": "high",
      "timestamp": "2026-02-10T10:00:02Z"
    }
  ]
}
```

### API Endpoints

```
GET    /api/v1/chat/sessions          - List user's chat sessions
POST   /api/v1/chat/sessions          - Create new session
GET    /api/v1/chat/sessions/{id}     - Get session with messages
DELETE /api/v1/chat/sessions/{id}     - Delete session
POST   /api/v1/chat/sessions/{id}/messages - Add message to session
```

### Partition Strategy
- **Partition Key**: `userId` (for efficient user-scoped queries)
- **TTL**: Optional 90-day retention policy

---

## Internationalization (i18n)

### Architecture

```
Frontend (React)
    │
    ├── react-i18next
    │       │
    │       ├── /locales/en/translation.json
    │       └── /locales/fr/translation.json
    │
    └── LanguageContext
            │
            └── localStorage (persist preference)
```

### Implementation
- **Library**: react-i18next
- **Language Detection**: Browser preference → User setting → Default (en)
- **Persistence**: localStorage key `i18n-language`
- **Scope**: UI labels only (LLM responses in query language)

### Translation Files Structure

```json
{
  "nav": {
    "home": "Home / Accueil",
    "chat": "Chat / Clavardage",
    "reports": "Reports / Rapports"
  },
  "chat": {
    "placeholder": "Ask a question... / Posez une question...",
    "send": "Send / Envoyer"
  }
}
```

---

## Visualization Components

### Architecture

```
Backend (FastAPI)                    Frontend (React)
    │                                     │
    └── /api/v1/charts/data ────────────► Recharts
            │                                 │
            └── Extract numeric data          ├── LineChart
                from RAG response             ├── BarChart
                                              └── PieChart
```

### Chart Generation Flow
1. RAG response includes structured data (JSON)
2. Frontend detects `chartData` in response
3. Recharts renders appropriate chart type
4. Export functionality: PNG/PDF via html2canvas

### Supported Chart Types

| Type | Use Case | Data Format |
|------|----------|-------------|
| LineChart | Trends over time | `[{period, value}]` |
| BarChart | Category comparison | `[{category, value}]` |
| PieChart | Distribution | `[{label, value}]` |

---

## Statistics & Dashboard API

### Endpoints

```
GET /api/v1/stats/overview
GET /api/v1/stats/documents
GET /api/v1/stats/queries?from=DATE&to=DATE
GET /api/v1/stats/usage
```

### Response Format

```json
{
  "overview": {
    "totalDocuments": 48,
    "indexedDocuments": 45,
    "totalQueries": 1250,
    "avgResponseTime": 1.8
  },
  "period": {
    "from": "2026-01-01",
    "to": "2026-02-08"
  }
}
```

### Data Sources
- **Document stats**: Azure Blob Storage + AI Search index
- **Query stats**: Application Insights custom metrics
- **Usage stats**: Cosmos DB aggregations

---

## LLM Evaluation Service

### Architecture

```
RAG Orchestrator
    │
    └── Response + Context
            │
            ▼
    Evaluation Service
            │
            ├── GPT-4o (Evaluator)
            │       │
            │       └── 6-Dimension Scoring
            │
            └── Azure Cosmos DB
                    │
                    └── Evaluation Results
```

### 6-Dimension Evaluation

| Dimension | Description | Prompt Strategy |
|-----------|-------------|-----------------|
| Coherence | Logical flow | "Rate the logical coherence 1-5" |
| Relevancy | Query alignment | "Rate relevance to question 1-5" |
| Completeness | Answer thoroughness | "Rate completeness 1-5" |
| Grounding | Based on context (no hallucination) | "Rate grounding in sources 1-5" |
| Helpfulness | Practical usefulness | "Rate helpfulness 1-5" |
| Faithfulness | Citation accuracy | "Rate citation accuracy 1-5" |

### Evaluation Data Model

```json
{
  "id": "eval-uuid",
  "queryId": "query-uuid",
  "timestamp": "2026-02-10T10:00:00Z",
  "scores": {
    "coherence": 4.5,
    "relevancy": 4.0,
    "completeness": 3.5,
    "grounding": 5.0,
    "helpfulness": 4.0,
    "faithfulness": 4.5
  },
  "overallScore": 4.25,
  "alertTriggered": false
}
```

### Sampling Strategy
- **Production**: Evaluate 10% of queries (cost optimization)
- **Alert Threshold**: Overall score < 3.5 triggers notification

---

## Migration Path

### Phase 1: Infrastructure Setup (Current)
- ✅ Set up Azure subscriptions
- ✅ Configure Azure Key Vault
- ⏳ Deploy Azure Blob Storage
- ⏳ Configure Azure AI Search
- ⏳ Set up Azure OpenAI Service

### Phase 2: Backend Refactoring (In Progress)
- ⏳ Implement RAG Orchestrator
- ⏳ Integrate Azure Blob Storage
- ⏳ Integrate Azure AI Search
- ⏳ Integrate Azure OpenAI
- ⏳ Replace local vector store

### Phase 3: Frontend Migration (Planned)
- ⏳ Migrate to Vite
- ⏳ Implement Azure Entra ID auth
- ⏳ Update API integration
- ⏳ Add citation display

### Phase 4: Production Deployment (Planned)
- ⏳ Deploy to Azure Container Apps
- ⏳ Configure monitoring
- ⏳ Set up CI/CD pipeline
- ⏳ User acceptance testing

---

## Appendix

### A. Azure Service SKUs

| Service | SKU | Estimated Cost |
|---------|-----|----------------|
| Azure Blob Storage | Standard (LRS) | ~$20/month |
| Azure AI Search | Standard S1 | ~$250/month |
| Azure OpenAI | Pay-as-you-go | ~$100-500/month |
| Azure Container Apps | Consumption | ~$50/month |
| Azure Key Vault | Standard | ~$5/month |

### B. API Endpoints

```
POST   /api/v1/query              - Submit user query
GET    /api/v1/documents           - List documents
POST   /api/v1/documents/upload    - Upload new document
GET    /api/v1/documents/{id}      - Get document details
DELETE /api/v1/documents/{id}      - Delete document
GET    /api/v1/history             - Query history
GET    /api/v1/health              - Health check
```

### C. Environment Variables

```bash
# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://xxx.openai.azure.com/
AZURE_OPENAI_KEY=<from-key-vault>
AZURE_OPENAI_DEPLOYMENT_GPT4=gpt-4o
AZURE_OPENAI_DEPLOYMENT_EMBEDDING=text-embedding-ada-002

# Azure AI Search
AZURE_SEARCH_ENDPOINT=https://xxx.search.windows.net
AZURE_SEARCH_KEY=<from-key-vault>
AZURE_SEARCH_INDEX=documents

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=<from-key-vault>
AZURE_STORAGE_CONTAINER=documents

# Azure Key Vault
AZURE_KEY_VAULT_URL=https://xxx.vault.azure.net/
```

---

**Document Maintained By**: Development Team
**Last Updated**: February 2026
**Next Review**: March 2026

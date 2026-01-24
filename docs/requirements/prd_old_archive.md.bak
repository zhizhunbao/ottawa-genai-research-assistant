# Ottawa GenAI Research Assistant - Product Requirements Document

**Project:** Ottawa Economic Development Team GenAI Research Assistant  
**Version:** 3.0  
**Date:** January 2026  
**Status:** Phase 1 - Internal PDF Analysis 🔄 IN PROGRESS

---

## 1. Executive Summary

### Product Overview

The Ottawa Economic Development team is developing a **Generative AI Research Assistant** with Algonquin College to answer natural-language questions, generate summaries, and produce visuals sourced from Economic Development Update PDFs hosted on ottawa.ca (Q1 2022 – Q4 2025).

### Key Objectives

- Build a RAG-based assistant for Economic Development analysts
- Enable natural-language Q&A without system redeployment
- Generate narrative updates, charts, and speaking notes from PDF corpus
- Provide trustable outputs with source citations and confidence metrics

### Target Users

- **Primary**: Economic Development team members (analysts, researchers)
- **Secondary**: Other municipal departments for validation
- **Future**: Public residents through portal

### Success Criteria

- ≥75% answer accuracy on SME-provided question sets
- ≥90% faithfulness (citation-backed statements)
- ≥85% context recall (grounding coverage)
- Query response time < 3 seconds (P95)
- User satisfaction score > 4.0/5.0

### Timeline

- **Phase 1** (Sep–Dec 2025): RAG prototype over ED Update PDFs
- **Phase 2** (Jan–Apr 2026): External data integration (StatsCan APIs, PDF scraping)
- **Phase 3** (Q3–Q4 2026): Advanced analytics and production deployment

---

## 2. Product Vision & Goals

### Problem Statement

Economic Development analysts spend significant time manually searching through quarterly PDF reports to answer stakeholder questions, prepare briefings, and generate visualizations. This process is:

- Time-consuming and repetitive
- Prone to missing relevant information across multiple reports
- Difficult to maintain consistency in responses
- Lacks automated visualization capabilities

### Value Proposition

A GenAI-powered research assistant that:

- Instantly retrieves relevant information from entire PDF corpus
- Generates accurate, sourced answers with confidence metrics
- Automatically creates charts and tables from data
- Produces ready-to-use speaking notes and summaries
- Maintains trustability through citation tracking and validation

### Business Objectives

- **Efficiency**: Reduce research time by 60%+ for common queries
- **Quality**: Improve answer consistency and completeness
- **Scalability**: Handle growing document corpus without manual indexing
- **Trust**: Provide verifiable, auditable responses for stakeholder communications
- **Innovation**: Demonstrate municipal AI adoption best practices

### Success Metrics (KPIs)

| Metric              | Target   | Measurement Method                |
| ------------------- | -------- | --------------------------------- |
| Answer Accuracy     | ≥75%     | SME evaluation against answer key |
| Faithfulness        | ≥90%     | Citation verification             |
| Context Recall      | ≥85%     | Grounding coverage analysis       |
| Response Time (P95) | <3s      | API monitoring                    |
| User Satisfaction   | >4.0/5.0 | Post-pilot survey                 |
| System Uptime       | >99.5%   | Azure monitoring                  |
| Concurrent Users    | 50+      | Load testing                      |

---

## 3. User Stories & Personas

### Primary Persona: Economic Development Analyst

**Demographics:**

- Role: Economic Development Analyst
- Experience: 3-5 years in municipal economic analysis
- Technical Skills: Proficient with Excel, PowerPoint, basic data tools
- Pain Points: Manual PDF searching, inconsistent data extraction, time pressure

**Goals:**

- Quickly answer stakeholder questions with accurate data
- Generate professional visualizations for reports
- Maintain credibility through sourced information
- Reduce repetitive research tasks

**User Journey:**

1. Receives question from stakeholder about Q3 2024 employment trends
2. Opens GenAI Research Assistant
3. Enters natural language query
4. Reviews answer with source citations
5. Generates chart for presentation
6. Exports speaking notes

### User Stories

#### US-001: Natural Language Query

**As an** Economic Development Analyst,  
**I want to** ask questions in natural language,  
**So that** I can quickly find information without learning complex search syntax.

**Acceptance Criteria:**

- Given I'm on the chat interface
- When I type "What were the employment trends in Q3 2024?"
- Then the system returns a sourced answer within 3 seconds
- And displays confidence score and source citations

#### US-002: Source Verification

**As an** Economic Development Analyst,  
**I want to** see exact source citations for every answer,  
**So that** I can verify information and cite sources in my reports.

**Acceptance Criteria:**

- Given the system provides an answer
- When I review the response
- Then I see document title, page number, and relevant excerpt
- And I can click to view the original PDF section

#### US-003: Automatic Visualization

**As an** Economic Development Analyst,  
**I want to** automatically generate charts from data,  
**So that** I can create professional presentations quickly.

**Acceptance Criteria:**

- Given the system retrieves numerical data
- When I request a visualization
- Then the system generates an appropriate chart type
- And allows me to download as PNG/SVG

#### US-004: Speaking Notes Generation

**As an** Economic Development Analyst,  
**I want to** generate speaking notes from report summaries,  
**So that** I can prepare for stakeholder briefings efficiently.

**Acceptance Criteria:**

- Given I select a report or topic
- When I request speaking notes
- Then the system generates bullet-point summaries
- And highlights key statistics and trends

#### US-005: Document Upload

**As an** Admin,  
**I want to** upload new quarterly reports,  
**So that** the system stays current without redeployment.

**Acceptance Criteria:**

- Given I have a new ED Update PDF
- When I upload it through the admin interface
- Then the system processes and indexes it within 10 minutes
- And the document becomes searchable immediately

---

## 4. Functional Requirements

### 4.1 Document Management

#### FR-DOC-001: PDF Upload

**Priority:** Must-have  
The system shall allow administrators to upload PDF documents through a web interface.

**Acceptance Criteria:**

- Supports PDF files up to 50MB
- Validates file format before processing
- Returns upload confirmation with processing status
- Handles batch uploads (multiple files)

#### FR-DOC-002: Document Processing

**Priority:** Must-have  
The system shall extract text, tables, and metadata from uploaded PDFs within 10 minutes.

**Acceptance Criteria:**

- Extracts text with layout preservation
- Identifies and extracts tables as structured data
- Tags documents with metadata (quarter, year, report type)
- Handles multi-column layouts and headers/footers

#### FR-DOC-003: Document Indexing

**Priority:** Must-have  
The system shall create vector embeddings and index documents for semantic search.

**Acceptance Criteria:**

- Chunks documents into semantic units (paragraphs, sections)
- Generates embeddings using Azure OpenAI ADA-002
- Stores vectors in Azure AI Search with metadata
- Completes indexing within 15 minutes of upload

#### FR-DOC-004: Document Listing

**Priority:** Should-have  
The system shall display a list of all indexed documents with metadata.

**Acceptance Criteria:**

- Shows document title, upload date, status
- Allows filtering by quarter, year, report type
- Displays processing status (pending, indexed, failed)
- Supports search by document name

### 4.2 Query & Retrieval

#### FR-QRY-001: Natural Language Query

**Priority:** Must-have  
The system shall accept natural language queries and return relevant answers within 3 seconds (P95).

**Acceptance Criteria:**

- Accepts queries up to 500 characters
- Returns response within 3 seconds for 95% of queries
- Handles follow-up questions with context
- Supports both English and French queries

#### FR-QRY-002: Semantic Search

**Priority:** Must-have  
The system shall perform hybrid semantic and keyword search to retrieve relevant document chunks.

**Acceptance Criteria:**

- Combines vector similarity and keyword matching
- Returns top 5 most relevant chunks
- Ranks results by relevance score
- Filters by date range or document type if specified

#### FR-QRY-003: Answer Generation

**Priority:** Must-have  
The system shall generate answers using retrieved context and Azure AI Foundry GPT-4o.

**Acceptance Criteria:**

- Grounds answers in retrieved document chunks
- Includes inline citations with document references
- Indicates when information is not found in corpus
- Maintains conversational context for follow-ups

#### FR-QRY-004: Source Citation

**Priority:** Must-have  
The system shall provide exact source citations for every statement in the answer.

**Acceptance Criteria:**

- Cites document title, page number, section
- Links to original PDF location
- Highlights relevant text excerpt
- Displays multiple sources when applicable

### 4.3 Visualization & Reporting

#### FR-VIZ-001: Chart Generation

**Priority:** Should-have  
The system shall automatically generate appropriate charts from numerical data in answers.

**Acceptance Criteria:**

- Detects numerical data in retrieved content
- Selects appropriate chart type (line, bar, pie)
- Generates charts using Matplotlib/Plotly
- Allows download as PNG, SVG, or interactive HTML

#### FR-VIZ-002: Table Extraction

**Priority:** Should-have  
The system shall extract and format tables from PDFs for display and export.

**Acceptance Criteria:**

- Preserves table structure and formatting
- Displays tables in responsive web format
- Allows export to CSV or Excel
- Handles multi-page tables

#### FR-VIZ-003: Speaking Notes

**Priority:** Should-have  
The system shall generate bullet-point speaking notes from report summaries.

**Acceptance Criteria:**

- Produces 5-10 key points per topic
- Highlights statistics and trends
- Formats for easy reading (bullets, short sentences)
- Includes source references

### 4.4 Trust & Validation

#### FR-TRS-001: Confidence Scoring

**Priority:** Must-have  
The system shall display a confidence score for each answer based on retrieval quality and model certainty.

**Acceptance Criteria:**

- Calculates score from retrieval relevance and model logits
- Displays score as percentage or badge (High/Medium/Low)
- Explains score factors to user
- Warns when confidence is below threshold (70%)

#### FR-TRS-002: Accuracy Validation

**Priority:** Must-have  
The system shall validate answers against ground truth using accuracy, faithfulness, and context recall metrics.

**Acceptance Criteria:**

- Achieves ≥75% accuracy on held-out test set
- Achieves ≥90% faithfulness (citation-backed)
- Achieves ≥85% context recall (grounding coverage)
- Logs validation results for monitoring

#### FR-TRS-003: Hallucination Detection

**Priority:** Should-have  
The system shall detect and flag potential hallucinations in generated answers.

**Acceptance Criteria:**

- Compares answer statements to retrieved context
- Flags unsupported claims
- Uses NLI (Natural Language Inference) models
- Displays warnings for flagged content

### 4.5 User Management

#### FR-USR-001: Role-Based Access

**Priority:** Should-have  
The system shall support three user roles: Researcher, Analyst, and Admin.

**Acceptance Criteria:**

- Researcher: Query and view documents
- Analyst: All Researcher features + export reports
- Admin: All features + document upload and user management
- Enforces permissions on all endpoints

#### FR-USR-002: Authentication

**Priority:** Must-have  
The system shall authenticate users via Azure Entra ID (replacing Google OAuth).

**Acceptance Criteria:**

- Integrates with Azure Entra ID
- Issues JWT tokens with 24-hour expiry
- Supports single sign-on (SSO)
- Logs authentication events

### 4.6 API Interface

#### FR-API-001: RESTful Endpoints

**Priority:** Must-have  
The system shall provide RESTful API endpoints for all core functions.

**Acceptance Criteria:**

- POST /api/v1/query - Submit queries
- GET /api/v1/documents - List documents
- POST /api/v1/documents/upload - Upload PDFs
- GET /api/v1/history - Query history
- Follows REST conventions (GET, POST, PUT, DELETE)

#### FR-API-002: Response Format

**Priority:** Must-have  
The system shall return all API responses in consistent JSON format.

**Acceptance Criteria:**

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "timestamp": "2026-01-23T10:30:00Z"
}
```

#### FR-API-003: Error Handling

**Priority:** Must-have  
The system shall return appropriate HTTP status codes and error messages.

**Acceptance Criteria:**

- 400 for invalid input with field-specific errors
- 401 for authentication failures
- 403 for authorization failures
- 404 for resource not found
- 500 for server errors with generic message

---

## 5. Non-Functional Requirements

### 5.1 Performance

#### NFR-PERF-001: Response Time

**Priority:** Critical  
The system shall return query responses within 3 seconds for 95% of requests.

**Rationale:** Analysts need quick answers to maintain workflow efficiency.

**Verification:** Load testing with realistic query patterns.

#### NFR-PERF-002: Concurrent Users

**Priority:** High  
The system shall support 50+ concurrent users without performance degradation.

**Rationale:** Economic Development team and potential cross-department usage.

**Verification:** Load testing with 50+ simulated users.

#### NFR-PERF-003: Document Processing

**Priority:** High  
The system shall process and index PDF documents within 10 minutes of upload.

**Rationale:** Timely availability of new reports for analysis.

**Verification:** Automated testing with sample PDFs.

### 5.2 Security

#### NFR-SEC-001: Data Encryption

**Priority:** Critical  
The system shall encrypt all data in transit using TLS 1.2+ and at rest using Azure Storage encryption.

**Rationale:** Protect sensitive municipal data and comply with security policies.

**Verification:** Security audit and penetration testing.

#### NFR-SEC-002: Secret Management

**Priority:** Critical  
The system shall store all API keys and credentials in Azure Key Vault.

**Rationale:** Prevent credential exposure and enable rotation.

**Verification:** Code review and security scan.

#### NFR-SEC-003: Audit Logging

**Priority:** High  
The system shall log all user queries, document uploads, and administrative actions.

**Rationale:** Compliance, troubleshooting, and usage analysis.

**Verification:** Log review and compliance audit.

#### NFR-SEC-004: Rate Limiting

**Priority:** Medium  
The system shall implement rate limiting to prevent abuse (100 requests/minute per user).

**Rationale:** Protect against DoS attacks and control API costs.

**Verification:** Load testing with rate limit violations.

### 5.3 Scalability

#### NFR-SCAL-001: Document Capacity

**Priority:** High  
The system shall support 1000+ PDF documents without performance degradation.

**Rationale:** Accommodate growing corpus over multiple years.

**Verification:** Performance testing with 1000+ documents.

#### NFR-SCAL-002: Query Volume

**Priority:** High  
The system shall handle 10,000+ queries per day.

**Rationale:** Support team-wide adoption and future expansion.

**Verification:** Load testing with sustained query volume.

### 5.4 Reliability

#### NFR-REL-001: Uptime

**Priority:** Critical  
The system shall achieve 99.5% uptime (excluding planned maintenance).

**Rationale:** Analysts depend on system availability for time-sensitive work.

**Verification:** Azure monitoring and SLA tracking.

#### NFR-REL-002: Error Rate

**Priority:** High  
The system shall maintain error rate below 1% for all API requests.

**Rationale:** Ensure reliable user experience.

**Verification:** Application monitoring and error tracking.

#### NFR-REL-003: Recovery Time

**Priority:** High  
The system shall recover from failures within 5 minutes.

**Rationale:** Minimize disruption to analyst workflows.

**Verification:** Disaster recovery testing.

### 5.5 Usability

#### NFR-USE-001: Accessibility

**Priority:** High  
The system shall comply with WCAG 2.1 Level AA accessibility standards.

**Rationale:** Ensure inclusive access for all municipal staff.

**Verification:** Accessibility audit and testing.

#### NFR-USE-002: Browser Compatibility

**Priority:** High  
The system shall support latest versions of Chrome, Firefox, Edge, and Safari.

**Rationale:** Accommodate diverse user preferences.

**Verification:** Cross-browser testing.

#### NFR-USE-003: Mobile Responsiveness

**Priority:** Medium  
The system shall provide responsive design for tablet and mobile devices.

**Rationale:** Enable access from various devices.

**Verification:** Responsive design testing.

### 5.6 Maintainability

#### NFR-MAIN-001: Code Quality

**Priority:** High  
The system shall maintain code quality with automated linting, type checking, and test coverage >80%.

**Rationale:** Ensure long-term maintainability and reduce technical debt.

**Verification:** CI/CD pipeline checks.

#### NFR-MAIN-002: Documentation

**Priority:** High  
The system shall include comprehensive API documentation, deployment guides, and user manuals.

**Rationale:** Enable knowledge transfer and future maintenance.

**Verification:** Documentation review.

#### NFR-MAIN-003: Observability

**Priority:** High  
The system shall implement OpenTelemetry-style instrumentation for metrics, logs, and traces.

**Rationale:** Enable troubleshooting and performance optimization.

**Verification:** Monitoring dashboard review.

---

## 6. Technical Specifications

### 6.1 System Architecture

**Architecture Style:** Microservices with RAG (Retrieval-Augmented Generation) pipeline

**Core Components:**

1. **Frontend**: React 18 + TypeScript chat interface
2. **Backend Orchestrator**: FastAPI + Microsoft Semantic Kernel
3. **Vector Store**: Azure AI Search (hybrid semantic + keyword)
4. **LLM Service**: Azure AI Foundry (GPT-4o, ADA-002)
5. **Document Storage**: Azure Blob Storage
6. **Secret Management**: Azure Key Vault
7. **Monitoring**: Azure Application Insights + OpenTelemetry

### 6.2 Technology Stack

#### Backend

- **Framework**: FastAPI 0.104+
- **Language**: Python 3.11+
- **Key Libraries**:
  - `azure-storage-blob` - Blob Storage SDK
  - `azure-search-documents` - AI Search SDK
  - `openai` - Azure OpenAI SDK
  - `semantic-kernel` - Orchestration framework
  - `pydantic` - Data validation
  - `uvicorn` - ASGI server
  - `pandas`, `numpy` - Data processing
  - `matplotlib`, `plotly` - Visualization

#### Frontend

- **Framework**: React 18
- **Language**: TypeScript 4.9+
- **Build Tool**: Vite
- **Key Libraries**:
  - `react-router-dom` - Routing
  - `axios` - HTTP client
  - `react-markdown` - Markdown rendering
  - `recharts` - Chart components
  - `tailwindcss` - Utility-first CSS framework (Design System)
  - `lucide-react` - Icon set

#### Infrastructure

- **Cloud Provider**: Microsoft Azure
- **Container**: Docker
- **Orchestration**: Azure Container Apps
- **CI/CD**: GitHub Actions
- **Monitoring**: Azure Application Insights

### 6.3 Data Models

#### Document Model

```python
{
  "id": "uuid",
  "title": "Economic Development Update Q4 2024",
  "file_name": "economic_update_q4_2024_en.pdf",
  "upload_date": "2025-01-15T10:00:00Z",
  "quarter": "Q4",
  "year": 2024,
  "report_type": "ED_UPDATE",
  "status": "indexed",
  "page_count": 45,
  "chunk_count": 120,
  "metadata": {
    "language": "en",
    "topics": ["employment", "investment", "tourism"]
  }
}
```

#### Query Model

```python
{
  "id": "uuid",
  "user_id": "user_uuid",
  "query_text": "What were employment trends in Q3 2024?",
  "timestamp": "2026-01-23T10:30:00Z",
  "response": {
    "answer": "...",
    "sources": [...],
    "confidence": 0.87,
    "metrics": {
      "accuracy": 0.82,
      "faithfulness": 0.93,
      "context_recall": 0.88
    }
  },
  "response_time_ms": 2450
}
```

### 6.4 API Endpoints

```
# Query Endpoints
POST   /api/v1/query              - Submit user query
GET    /api/v1/query/{id}         - Get query result
GET    /api/v1/history            - Query history

# Document Endpoints
GET    /api/v1/documents          - List documents
POST   /api/v1/documents/upload   - Upload PDF
GET    /api/v1/documents/{id}     - Get document details
DELETE /api/v1/documents/{id}     - Delete document

# Visualization Endpoints
POST   /api/v1/visualize          - Generate chart
POST   /api/v1/speaking-notes     - Generate speaking notes

# Admin Endpoints
GET    /api/v1/users              - List users
POST   /api/v1/users              - Create user
PUT    /api/v1/users/{id}         - Update user

# Health & Monitoring
GET    /api/v1/health             - Health check
GET    /api/v1/metrics            - System metrics
```

### 6.5 Integration Points

#### Azure OpenAI

- **Embedding Model**: text-embedding-ada-002
- **Generation Model**: GPT-4o / GPT-4 Turbo
- **Usage**: Query embedding, document embedding, answer generation

#### Azure AI Search

- **Search Type**: Hybrid (vector + keyword)
- **Ranking**: Cosine similarity + BM25
- **Filters**: Date range, document type, topic

#### Azure Blob Storage

- **Container**: `documents`
- **Content**: Original PDFs, processed metadata
- **Access**: Private with SAS tokens

#### Azure Key Vault

- **Secrets**: API keys, connection strings, certificates
- **Access**: Managed Identity with RBAC

### 6.6 Design Requirements

The application must follow a specific aesthetic derived from the legacy prototype to ensure a premium, modern feel:

- **Design System**: Tailwind CSS
- **Visual Style**:
  - **Gradients**: Use `bg-gradient-to-r from-primary-500 to-secondary-500` for primary actions and headers.
  - **Glassmorphism**: Use `bg-white/10 backdrop-blur-md` for overlays and cards.
  - **Shadows**: Soft, diffused shadows (`shadow-soft`, `shadow-glow`).
  - **Typography**: Inter font family, clean and readable.
- **Responsiveness**: Mobile-first design, fully responsive layouts.
- **Micro-interactions**: Subtle hover effects, transitions (`transition-all`), and loading states (`animate-spin`).

---

## 7. Constraints & Assumptions

### Technical Constraints

- Must use Azure cloud services (organizational requirement)
- Python 3.11+ for backend (City standard)
- React for frontend (team expertise)
- OpenAI-compatible APIs only (no proprietary formats)

### Business Constraints

- Budget: ~$500-1000/month for Azure services
- Timeline: Phase 1 delivery by December 2025
- Team: 3-4 student developers + 2 City SMEs
- Data: Public documents only (no confidential content)

### Assumptions

- PDF documents follow consistent formatting
- Users have basic familiarity with chat interfaces
- Azure services maintain 99.9%+ availability
- Document corpus grows by ~4 PDFs per year (quarterly reports)
- Users primarily access from desktop browsers
- English is primary language (French support in Phase 2)

---

## 8. Success Criteria & Validation

### Definition of Done (Phase 1)

- [ ] All Must-have functional requirements implemented
- [ ] All Critical non-functional requirements met
- [ ] ≥75% accuracy on SME test question set
- [ ] ≥90% faithfulness (citation verification)
- [ ] ≥85% context recall (grounding coverage)
- [ ] <3s response time (P95)
- [ ] User satisfaction >4.0/5.0 in pilot
- [ ] Security audit passed
- [ ] Documentation complete (API docs, user manual, deployment guide)
- [ ] Deployed to City test environment
- [ ] SME acceptance sign-off

### Testing Requirements

#### Unit Testing

- Backend: >80% code coverage
- Frontend: >70% code coverage
- All critical paths tested

#### Integration Testing

- End-to-end RAG workflow
- API endpoint contracts
- Azure service integrations

#### Performance Testing

- Load testing with 50+ concurrent users
- Response time validation (P95 <3s)
- Document processing throughput

#### Security Testing

- Penetration testing
- Vulnerability scanning
- Secret management audit

#### User Acceptance Testing

- SME pilot with 5-10 analysts
- Real-world query scenarios
- Feedback collection and iteration

---

## 9. Timeline & Milestones

### Phase 1: Internal PDF Analysis (Sep–Dec 2025) 🔄 IN PROGRESS

| Milestone                  | Target Date | Status         | Deliverables                                |
| -------------------------- | ----------- | -------------- | ------------------------------------------- |
| **M1: Project Kickoff**    | Sep 2025    | ✅ Complete    | Stakeholder alignment, tech stack selection |
| **M2: Ingestion Pipeline** | Oct 2025    | 🔄 In Progress | PDF processing, chunking, embedding         |
| **M3: RAG Backend**        | Nov 2025    | 🔄 In Progress | Retrieval, generation, trust scoring        |
| **M4: Frontend MVP**       | Nov 2025    | 📋 Planned     | React chat interface, source display        |
| **M5: Visualization**      | Dec 2025    | 📋 Planned     | Chart generation, table extraction          |
| **M6: Phase 1 Delivery**   | Dec 2025    | 📋 Planned     | Testing, documentation, SME pilot           |

### Phase 2: External Data Integration (Jan–Apr 2026) 📋 PLANNED

| Milestone                  | Target Date | Status     | Deliverables                       |
| -------------------------- | ----------- | ---------- | ---------------------------------- |
| **M7: StatsCan API**       | Feb 2026    | 📋 Planned | API integration, data fusion       |
| **M8: PDF Scraping**       | Mar 2026    | 📋 Planned | OREB reports, partner PDFs         |
| **M9: Enhanced Analytics** | Apr 2026    | 📋 Planned | Trend analysis, forecasting        |
| **M10: Phase 2 Delivery**  | Apr 2026    | 📋 Planned | Expanded corpus, advanced features |

### Phase 3: Production Deployment (Q3–Q4 2026) 🔮 FUTURE

| Milestone                     | Target Date | Status    | Deliverables                     |
| ----------------------------- | ----------- | --------- | -------------------------------- |
| **M11: Production Hardening** | Q3 2026     | 🔮 Future | Observability, scaling, security |
| **M12: User Training**        | Q3 2026     | 🔮 Future | Documentation, workshops         |
| **M13: Public Launch**        | Q4 2026     | 🔮 Future | Public portal, citywide rollout  |

---

## 10. Risks & Mitigation

### Technical Risks

| Risk                         | Impact | Probability | Mitigation                                            |
| ---------------------------- | ------ | ----------- | ----------------------------------------------------- |
| **Azure OpenAI rate limits** | High   | Medium      | Implement caching, request queuing, fallback models   |
| **PDF extraction quality**   | High   | Medium      | Test with diverse PDFs, manual review pipeline        |
| **Vector search accuracy**   | High   | Low         | Hybrid search, query expansion, relevance tuning      |
| **Response latency**         | Medium | Medium      | Optimize chunking, caching, async processing          |
| **Hallucination rate**       | High   | Medium      | Trust validation, citation enforcement, user warnings |

### Business Risks

| Risk                | Impact | Probability | Mitigation                                          |
| ------------------- | ------ | ----------- | --------------------------------------------------- |
| **Budget overrun**  | Medium | Low         | Monitor Azure costs, optimize API usage             |
| **Timeline delays** | Medium | Medium      | Agile sprints, MVP-first approach, buffer time      |
| **User adoption**   | High   | Low         | Early SME involvement, training, feedback loops     |
| **Scope creep**     | Medium | High        | Strict prioritization, phase gating, change control |

### Data Risks

| Risk                         | Impact | Probability | Mitigation                                         |
| ---------------------------- | ------ | ----------- | -------------------------------------------------- |
| **Inconsistent PDF formats** | Medium | High        | Robust parsing, manual fallback, format guidelines |
| **Missing data**             | Low    | Medium      | Gap documentation, external source integration     |
| **Data quality issues**      | Medium | Medium      | Validation rules, SME review, error reporting      |

---

## 11. Appendix

### A. Glossary

- **RAG**: Retrieval-Augmented Generation - AI technique combining search and generation
- **Embedding**: Vector representation of text for semantic search
- **Chunking**: Splitting documents into smaller semantic units
- **Faithfulness**: Measure of how well answers are grounded in source documents
- **Context Recall**: Measure of how much relevant context is retrieved
- **Hallucination**: AI-generated content not supported by source documents
- **Azure Entra ID**: Microsoft's identity and access management service (formerly Azure AD)
- **SME**: Subject Matter Expert

### B. Related Documents

- [Architecture Document](./Architecture.md) - Detailed system architecture
- [Project Brief](./ed-research-tool-brief.md) - Original project requirements
- [README](../README.md) - Project overview and setup guide

### C. Stakeholders

| Role                 | Name               | Responsibility                               |
| -------------------- | ------------------ | -------------------------------------------- |
| **Product Owner**    | Js (City EcDev)    | Requirements, acceptance, business alignment |
| **Technical SME**    | Eric (City IT)     | Architecture guidance, security, deployment  |
| **Development Team** | Algonquin Students | Implementation, testing, documentation       |
| **End Users**        | EcDev Analysts     | User testing, feedback, adoption             |

### D. Change Log

| Version | Date     | Author | Changes                                     |
| ------- | -------- | ------ | ------------------------------------------- |
| 1.0     | Sep 2025 | Team   | Initial draft                               |
| 2.0     | Nov 2025 | Team   | Greenfield alignment, trust metrics         |
| 3.0     | Jan 2026 | Team   | Consolidated PRD with complete requirements |

---

**Document Owner:** Ottawa Economic Development Team  
**Maintained By:** Algonquin College Development Team  
**Next Review:** February 2026

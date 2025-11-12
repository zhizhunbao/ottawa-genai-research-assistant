# 🏛️ Ottawa GenAI Research Assistant

**Enterprise-grade research assistant for the City of Ottawa, engineered for government compliance, security, and maintainability.**

- **Free AI provider support:** Google Gemini & Groq (no OpenAI fees)
- **Extensive automated testing:** 134 tests with 88.8% overall coverage
- **Production deployment:** Render-hosted frontend and backend
- **Government-ready architecture:** Security controls, accessibility, bilingual UX

## 🚀 Live Demo

- **Production app:** [https://ottawa-genai-frontend.onrender.com](https://ottawa-genai-frontend.onrender.com)
- **Backend API:** [https://ottawa-genai-backend.onrender.com](https://ottawa-genai-backend.onrender.com)
- **API Docs:** [Swagger](https://ottawa-genai-backend.onrender.com/docs) · [ReDoc](https://ottawa-genai-backend.onrender.com/redoc)

Production releases run on the Render platform to ensure dependable uptime and observability.

## 🌟 Highlights

- **Free AI services:** Gemini 1.5 Flash & Groq Llama 3.3 70B integration with seamless failover
- **AI-powered workflows:** Chat, document analysis, report automation, and configuration management
- **Authentication:** Google OAuth 2.0 with JWT verification and smart user provisioning
- **Accessibility & UX:** WCAG 2.1 compliant, responsive UI, English/French language toggle
- **Operations ready:** Deployment blueprints, CI/CD, extensive documentation, and coding standards

## 🏗️ Architecture Overview

| Layer | Technology | Key Capabilities |
|-------|------------|------------------|
| Frontend | React 18, TypeScript, Context API | Responsive UI, bilingual support, secure auth flows |
| Backend | FastAPI, Pydantic, Repository pattern | RESTful APIs, JWT auth, provider orchestration |
| Storage | JSON-based persistence (monk) | User, document, chat, and report data |
| Quality | Pytest, React Testing Library, Ruff | 134 tests, formatting, linting, GitHub Actions CI |
| Deployment | Render (frontend/backend) | Managed hosting, GitHub Pages preview, Docker support |

For full project details, see `docs/Product Requirements Document (PRD).md` and `docs/Project Status Report.md`.

## 🧪 Test Coverage Snapshot

| API Module | Coverage | Status | Notes |
|------------|----------|--------|-------|
| Authentication | 94.1% (16/17) | 🟢 Excellent | OAuth 2.0, JWT issuance, user lifecycle |
| Chat | 100% (11/11) | 🟢 Perfect | Multi-provider AI conversation engine |
| Documents | 100% (18/18) | 🟢 Perfect | Upload, retrieval, retention policies |
| Reports | 100% (21/21) | 🟢 Perfect | Automated research report generation |
| Settings | 100% (15/15) | 🟢 Perfect | Configuration management APIs |
| **System total** | **88.8%** (119/134) | 🟢 Production ready | Integration + unit coverage |

Run `pytest --cov=app --cov-report=html` in the backend directory for detailed coverage reports.

## 📁 Project Structure

```
ottawa-genai-research-assistant/
├── docs/                    # Product, architecture, testing, deployment, and standards
├── backend/                 # FastAPI service (app/, tests/, monk/ storage, Dockerfile)
├── frontend/                # React app (src/, tests/, Dockerfile, npm config)
├── render.yaml              # Render blueprint for multi-service deployment
├── requirements.txt         # Top-level Python dependencies
└── README.md                # You are here
```

Refer to `docs/Project Status Report.md` and `docs/Product Requirements Document (PRD).md` for delivery history and scope.

## ⚡ Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Google Cloud OAuth 2.0 client ID/secret
- API keys (choose one free provider):
  - Google Gemini
  - Groq
- Optional: OpenAI API key

### 1. Configure Environment

```bash
# Backend configuration
cp backend/env.example backend/.env

# Frontend configuration
cp frontend/env.example frontend/.env.local
```

Populate credentials:

```bash
# backend/.env
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
# Optional
# OPENAI_API_KEY=your_openai_key

# frontend/.env.local
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
```

Gemini keys: https://makersuite.google.com/app/apikey  
Groq keys: https://console.groq.com/keys

### 2. Launch Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Launch Frontend

```bash
cd frontend
npm install
npm start
```

- Backend API: http://localhost:8000  
- Frontend UI: http://localhost:3000

## 🧪 Testing

```bash
# Backend (unit + integration)
cd backend
pytest
pytest tests/unit/ -v
pytest tests/integration/ -v
pytest --cov=app --cov-report=html

# Frontend
cd frontend
npm test
npm run test:integration
```

Frontend integration tests validate end-to-end workflows including authentication, chat, and document management.

## 🔐 Google OAuth Setup

1. In the [Google Cloud Console](https://console.cloud.google.com/):
   - Create/select a project
   - Enable **Google Identity Services API**
   - Create OAuth 2.0 Web Client credentials
   - Authorized origins: `http://localhost:3000` and your production domains
   - Optional redirect URI: `http://localhost:3000/auth/callback`
2. Copy the client ID/secret into backend and frontend environment files.

Authentication flow:

1. Frontend requests a credential via Google Identity Services.
2. Frontend submits the credential to `/api/v1/auth/google`.
3. Backend verifies the token, provisions the user if needed, and returns an application JWT.
4. Smart username generation ensures unique identities (`john_doe`, `john_doe_1`, ...).

## 📊 API Overview

```
Authentication
  POST /api/v1/auth/login
  POST /api/v1/auth/google
  POST /api/v1/auth/logout
  GET  /api/v1/auth/me

Chat
  POST   /api/v1/chat/message
  GET    /api/v1/chat/history
  DELETE /api/v1/chat/{id}
  GET    /api/v1/chat/suggestions

Documents
  POST   /api/v1/documents/upload
  GET    /api/v1/documents
  GET    /api/v1/documents/{id}
  DELETE /api/v1/documents/{id}

Reports
  POST   /api/v1/reports/generate
  GET    /api/v1/reports
  GET    /api/v1/reports/{id}
  DELETE /api/v1/reports/{id}

Settings
  GET /api/v1/settings/languages
  GET /api/v1/settings/ai-models
  GET /api/v1/settings/user-prefs
  PUT /api/v1/settings/user-prefs
```

Full API references are generated automatically by FastAPI at the `/docs` and `/redoc` endpoints.

## 📚 Documentation

- **[Product Requirements Document (PRD)](docs/Product%20Requirements%20Document%20(PRD).md)** - Complete product specifications, features, and technical requirements
- **[Project Status Report](docs/Project%20Status%20Report.md)** - Current project status, progress tracking, and delivery milestones

## 🧑‍💻 Development Workflow

```bash
# Backend formatting and linting
cd backend
ruff check . --fix
ruff format .

# Frontend formatting and linting
cd frontend
npm run format
npm run lint
```

API strategy options (frontend):

```bash
# Mock-only
REACT_APP_API_STRATEGY=mock

# Hybrid (real API with mock fallback)
REACT_APP_API_STRATEGY=hybrid

# Real API (default)
REACT_APP_API_STRATEGY=real
```

## 🚢 Deployment

### Render Production Deployment

1. Commit and push to trigger CI/CD:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```
2. Provision services in Render using `render.yaml`:
   - Frontend: `ottawa-genai-frontend`
   - Backend: `ottawa-genai-backend`
   - Database: PostgreSQL (optional, current build uses JSON storage)
3. Monitor health checks and logs via Render dashboard.

For more deployment details, see the Deployment section in `docs/Project Status Report.md`.

### GitHub Pages Demo Deployment

1. Set `"homepage": "https://YOUR_USERNAME.github.io/ottawa-genai-research-assistant"` in `frontend/package.json`.
2. Enable GitHub Pages via repository settings (`Pages` → Source → GitHub Actions).
3. Push to `main` to trigger the GitHub Pages workflow.

## 📈 Release History

- **v1.4.2 – System Enhancements & UI Improvements**
  - Hardened authentication services, improved chat UX, refreshed documentation.
- **v1.4.1 – Critical Datetime Fix**
  - Resolved auth datetime regression, stabilized production deployment.
- **v1.4.0 – AI Services Integration**
  - Added Gemini and Groq providers, achieved 100% coverage across major APIs.
- **v1.3.0 – Code Quality & Linting**
  - Introduced Ruff, streamlined formatting, and upgraded dev workflow.
- **v1.2.0 – Google OAuth Integration**
  - Delivered full OAuth 2.0 login with JWT token issuance.
- **v1.1.0 – Core Feature Expansion**
  - Chat, documents, reports, bilingual UX, responsive design.
- **v1.0.0 – Initial Release**
  - FastAPI backend, React frontend, mock API support.

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch.
3. Implement changes with accompanying tests.
4. Ensure CI passes and maintain ≥88.8% coverage.
5. Submit a pull request for review.

Follow the development workflow guidelines above for code formatting and linting.

## 📝 License

This project is developed for Ottawa Economic Development. Refer to the `LICENSE` file for full terms.

## 🆘 Support

- Open an issue on GitHub for bugs or feature requests.
- Review the documentation in the `docs/` directory for project details.
- Consult live API documentation at `/docs` and `/redoc`.
- Run `pytest --cov` for the latest test coverage metrics.

---

**Built with ❤️ for the City of Ottawa — production-ready AI research assistance with measurable quality.**
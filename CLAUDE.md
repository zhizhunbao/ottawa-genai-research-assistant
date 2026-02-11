# Ottawa GenAI Research Assistant

> AI-powered research assistant with RAG capabilities for document analysis and natural language queries.

## Project Overview

A full-stack application that enables users to upload documents, perform natural language queries, and receive AI-generated responses with citations.

## Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Package Manager**: uv
- **Database**: PostgreSQL with SQLAlchemy
- **AI Services**: Azure OpenAI, Azure AI Search
- **Storage**: Azure Blob Storage
- **Authentication**: Azure Entra ID (MSAL)

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui + Tailwind CSS
- **State Management**: Zustand
- **i18n**: react-i18next (EN/FR)

## Project Structure

```
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── core/      # Config, dependencies, Azure services
│   │   ├── research/  # RAG query endpoints
│   │   ├── documents/ # Document upload/management
│   │   ├── chat/      # Chat history
│   │   └── health/    # Health checks
│   └── tests/
├── frontend/          # React frontend
│   └── src/
│       ├── features/  # Feature modules
│       ├── shared/    # Shared components
│       └── stores/    # Zustand stores
└── docs/              # Documentation
    └── plans/         # Implementation plans
```

## Development Commands

```bash
# Backend
cd backend
uv sync                    # Install dependencies
uv run pytest             # Run tests
uv run pytest --cov       # Run tests with coverage
uv run ruff check .       # Lint
uv run ruff format .      # Format
uv run mypy app/          # Type check

# Frontend
cd frontend
npm install               # Install dependencies
npm run dev               # Start dev server
npm run build             # Build for production
npm run test              # Run tests
npm run lint              # Lint
npm run type-check        # Type check
```

## Code Standards

### Python (Backend)
- Use type hints for all function parameters and returns
- Follow PEP 8 with Ruff configuration
- Use Pydantic models for request/response schemas
- Async/await for all I/O operations
- Repository pattern for data access

### TypeScript (Frontend)
- Strict TypeScript mode
- Functional components with hooks
- Feature-based folder structure
- Use shadcn/ui components
- Bilingual support required (EN/FR)

## Available Commands

Use `/command-name` to invoke these workflows:

| Command | Description |
|---------|-------------|
| `/full-dev` | Complete development workflow (MetaGPT-Enhanced) |
| `/full-dev auto` | Auto-continue mode |
| `/full-dev status` | Show progress with role info |
| `/plan` | Create implementation plan before coding |
| `/code-review` | Security and quality code review |
| `/build-fix` | Fix TypeScript/Python build errors |
| `/test` | Run and fix tests |
| `/e2e` | Generate E2E tests |
| `/security` | Security audit |
| `/performance` | Performance optimization |

## MetaGPT-Enhanced Workflow

借鉴 MetaGPT 的多角色协作模式：

| Phase | Role | Name |
|-------|------|------|
| Requirements | Product Manager | Alice |
| Architecture | Architect | Bob |
| Stories | Tech Lead | Charlie |
| Backend | Backend Engineer | David |
| Frontend | Frontend Engineer | Eve |
| Testing | QA Engineer | Frank |
| Review | Code Reviewer | Grace |
| Deployment | DevOps Engineer | Henry |

配置文件: `.agent/workflows/metagpt-enhanced/`

## Git Workflow

- Branch naming: `feature/US-XXX-description`, `fix/US-XXX-description`
- Commit format: `type(scope): description`
- Always run tests before committing
- Create PR with description and test plan

## Security Rules

- Never commit secrets or API keys
- Use environment variables for configuration
- Validate all user inputs
- Use parameterized queries
- Follow OWASP guidelines

## State Management

Development state is tracked in `.dev-state.yaml` at project root.
Implementation plans are stored in `docs/plans/`.

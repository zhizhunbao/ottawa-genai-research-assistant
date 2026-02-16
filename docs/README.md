# Documentation Index

## Directory Structure

```
docs/
├── requirements/          Product requirements (PRDs)
│   ├── master_prd.md      Overall vision, tech stack, KPIs
│   ├── phases/            Phase-level PRDs (P1 infrastructure, P2 RAG, P3 advanced)
│   ├── features/          Feature-level PRDs (file explorer, etc.)
│   └── external/          Separate sub-project PRDs (template factory)
│
├── architecture/          System architecture documents
│   ├── system-architecture.md   Main system architecture
│   ├── architecture.pdf         Architecture diagram (PDF)
│   └── external/                Sub-project architecture docs
│
├── plans/                 Implementation plans
│   ├── MASTER-PLAN.md     Master execution plan with all phases
│   ├── phases/            Per-user-story implementation plans (US-xxx)
│   ├── features/          Feature-level plans (chat module, project completion)
│   └── external/          Sub-project plans (template factory)
│
├── guides/                Developer guides
│   ├── setup.md           Local development setup
│   ├── api.md             API reference
│   ├── deployment.md      Deployment guide
│   └── LOCAL-TUNNEL.md    Public tunnel access guide
│
├── reports/               Status and test reports
├── codemaps/              Auto-generated code maps
├── sprints/               Sprint planning documents
├── project/               Project meta (changelog, contributing)
└── templates/             Template documentation
```

## Quick Links

| Document                                                   | Description                                 |
| ---------------------------------------------------------- | ------------------------------------------- |
| [Master PRD](requirements/master_prd.md)                   | Product vision, tech stack, success metrics |
| [Master Plan](plans/MASTER-PLAN.md)                        | Execution plan with phase status            |
| [System Architecture](architecture/system-architecture.md) | Azure cloud-native architecture             |
| [Setup Guide](guides/setup.md)                             | Local development environment               |

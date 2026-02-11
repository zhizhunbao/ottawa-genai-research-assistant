---
description: Git workflow standards for commits, branches, and pull requests
---

# Git Workflow Standards (Git 工作流规范)

## Commit Message Format (提交信息格式)

```
<type>: <description>

<optional body>
```

### Types (类型)

- **feat**: New feature (新功能)
- **fix**: Bug fix (修复)
- **refactor**: Code refactoring (重构)
- **docs**: Documentation changes (文档)
- **test**: Test additions/changes (测试)
- **chore**: Build/tooling changes (构建/工具)
- **perf**: Performance improvements (性能)
- **ci**: CI/CD changes (持续集成)

### Examples (示例)

```
feat: add semantic search for markets

fix: resolve race condition in cache invalidation

refactor: extract user validation into separate service

docs: update API documentation for search endpoint
```

## Commit Best Practices (提交最佳实践)

### 1. Atomic Commits (原子提交)

Each commit should represent a single logical change.

### 2. Descriptive Messages (描述性消息)

```bash
# ✅ Good - Clear and specific
git commit -m "fix: prevent duplicate market creation by adding unique constraint"

# ❌ Bad - Vague
git commit -m "fix: bug"
```

### 3. Present Tense (现在时态)

```bash
# ✅ Good
git commit -m "feat: add search functionality"

# ❌ Bad
git commit -m "feat: added search functionality"
```

## Branch Naming (分支命名)

```
<type>/<short-description>

Examples:
feature/semantic-search
fix/cache-race-condition
refactor/user-service
docs/api-documentation
```

## Pull Request Workflow (PR 工作流)

### 1. Before Creating PR (创建 PR 前)

```bash
# Update from main
git checkout main
git pull origin main

# Rebase your branch
git checkout feature/my-feature
git rebase main

# Run tests
uv run pytest tests/

# Check code quality
uv run ruff check .
uv run ruff format .
```

### 2. PR Title Format

```
<type>: <clear description>

Examples:
feat: Add semantic search with OpenAI embeddings
fix: Resolve race condition in Redis cache
```

## Pre-Commit Checklist (提交前检查清单)

Before every commit:

- [ ] Code compiles/runs without errors
- [ ] All tests pass
- [ ] No console.log or debug statements
- [ ] No hardcoded secrets or API keys
- [ ] Code follows style guidelines
- [ ] Comments explain WHY, not WHAT
- [ ] No unnecessary files included

## Common Mistakes to Avoid (常见错误)

### 1. Committing Secrets (提交密钥)

```bash
# ❌ Never commit
.env
config/secrets.json

# ✅ Always add to .gitignore
echo ".env" >> .gitignore
```

### 2. Large Commits (大型提交)

```bash
# ❌ Bad - Too many changes
git add .
git commit -m "feat: add everything"

# ✅ Good - Logical chunks
git add app/services/search.py
git commit -m "feat: add search service"
```

---

**记住：清晰的 Git 历史是团队协作的基础。每次提交都应该是有意义的、可追溯的。**

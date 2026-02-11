# Commit Command

Create a well-formatted git commit with conventional commit message.

## Usage

```
/commit                   # Commit all staged changes
/commit <message>         # Commit with provided message
```

## Execution Instructions

### 1. Check Status

```bash
git status
git diff --staged
```

### 2. Review Changes

- List all files being committed
- Summarize the changes
- Check for any sensitive data

### 3. Generate Commit Message

Follow Conventional Commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting (no code change)
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `test`: Adding/updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

**Scope:** Module or component affected (e.g., `auth`, `chat`, `documents`)

### 4. Pre-commit Checks

Before committing, verify:
- [ ] No hardcoded secrets
- [ ] Tests pass
- [ ] Linting passes
- [ ] Type checking passes

```bash
# Backend
uv run ruff check .
uv run mypy app/

# Frontend
npm run lint
npm run type-check
```

### 5. Create Commit

```bash
git add <files>
git commit -m "<message>"
```

## Examples

```bash
# Feature
feat(chat): add message streaming support

# Bug fix
fix(auth): resolve token refresh race condition

# With body
feat(documents): implement PDF text extraction

- Add PyMuPDF for PDF parsing
- Extract text with page numbers
- Handle encrypted PDFs gracefully

Closes #123

# Breaking change
feat(api)!: change response format for /research endpoint

BREAKING CHANGE: Response now includes confidence scores
```

## Commit Message Guidelines

1. **Use imperative mood**: "add feature" not "added feature"
2. **Keep first line under 72 characters**
3. **Reference issues** when applicable
4. **Explain why**, not just what
5. **One logical change per commit**

## Files to Never Commit

- `.env` files
- `*.pem`, `*.key` files
- `node_modules/`, `__pycache__/`
- IDE settings (`.idea/`, `.vscode/`)
- Build outputs (`dist/`, `build/`)

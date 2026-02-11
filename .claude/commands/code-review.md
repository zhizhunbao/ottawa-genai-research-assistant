# Code Review

Comprehensive security and quality review for uncommitted changes.

## Review Process

1. **Get Changed Files**: `git diff --name-only HEAD`
2. **Review Each File** by priority
3. **Generate Report** with:
   - Severity: CRITICAL, HIGH, MEDIUM, LOW
   - File location and line number
   - Issue description
   - Suggested fix
4. **Block commit if CRITICAL or HIGH issues found**

## Security Checks (CRITICAL)

- [ ] **Hardcoded Credentials** - API keys, passwords, tokens
- [ ] **SQL Injection** - String concatenation in queries
- [ ] **XSS Vulnerabilities** - Unescaped user input
- [ ] **Missing Input Validation**
- [ ] **Insecure Dependencies** - Outdated, vulnerable packages
- [ ] **Path Traversal** - User-controlled file paths
- [ ] **CSRF Vulnerabilities**
- [ ] **Authentication Bypass**

## Code Quality (HIGH)

- [ ] **Large Functions** - Over 50 lines
- [ ] **Large Files** - Over 800 lines
- [ ] **Deep Nesting** - Over 4 levels
- [ ] **Missing Error Handling** - Empty try/catch
- [ ] **Debug Statements** - console.log in production
- [ ] **TODO/FIXME** - Comments without issue reference
- [ ] **Missing Documentation** - Public APIs without JSDoc/docstring

## Performance (MEDIUM)

- [ ] **Inefficient Algorithms** - O(n²) that could be O(n log n)
- [ ] **Unnecessary Re-renders** - React components
- [ ] **Missing Caching**
- [ ] **N+1 Queries**
- [ ] **Large Bundle Size**

## Best Practices (LOW)

- [ ] **Mutation Patterns** - Should use immutable patterns
- [ ] **Missing Tests** for new code
- [ ] **Accessibility Issues** - Missing ARIA labels
- [ ] **Unclear Naming** - x, tmp, data
- [ ] **Magic Numbers** - No named constants

## Review Commands

```bash
# Python
uv run ruff check .
uv run mypy app/
uv run bandit -r app/

# TypeScript
npm run lint
npm run type-check
```

## Output Format

```
## Code Review Report

### CRITICAL Issues
[CRITICAL] Hardcoded API Key
- File: src/api/client.ts:42
- Issue: API key exposed in source code
- Fix: Move to environment variable

### HIGH Issues
...

### Summary
- CRITICAL: 1
- HIGH: 2
- MEDIUM: 5
- LOW: 3

### Verdict: ❌ BLOCKED (CRITICAL issues found)
```

## Approval Criteria

- ✅ **Approved**: No CRITICAL or HIGH issues
- ⚠️ **Warning**: Only MEDIUM issues (merge with caution)
- ❌ **Blocked**: CRITICAL or HIGH issues found

**Never approve code with security vulnerabilities!**

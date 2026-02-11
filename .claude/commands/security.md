# Security Audit

Comprehensive security review of the codebase.

## Usage

```
/security              # Full security audit
/security <path>       # Audit specific path
/security deps         # Check dependencies only
```

## Audit Checklist

### 1. Secrets & Credentials (CRITICAL)

```bash
# Search for potential secrets
grep -rn "password\|secret\|api_key\|token\|credential" --include="*.py" --include="*.ts" --include="*.js"
```

Check for:
- [ ] Hardcoded API keys
- [ ] Hardcoded passwords
- [ ] Private keys in code
- [ ] Connection strings with credentials
- [ ] JWT secrets in code

**Required**: All secrets must be in environment variables.

### 2. Input Validation (HIGH)

Check all user inputs:
- [ ] API request bodies validated with Pydantic
- [ ] Query parameters sanitized
- [ ] File uploads validated (type, size)
- [ ] Path parameters checked for traversal

### 3. SQL Injection (CRITICAL)

```python
# BAD - String concatenation
query = f"SELECT * FROM users WHERE id = {user_id}"

# GOOD - Parameterized query
query = "SELECT * FROM users WHERE id = :id"
result = session.execute(query, {"id": user_id})
```

### 4. XSS Prevention (HIGH)

Frontend checks:
- [ ] User input escaped before rendering
- [ ] dangerouslySetInnerHTML avoided
- [ ] Content-Security-Policy headers set

### 5. Authentication & Authorization (CRITICAL)

- [ ] All protected routes require authentication
- [ ] RBAC properly implemented
- [ ] Session tokens are secure (HttpOnly, Secure, SameSite)
- [ ] Password hashing uses strong algorithm (bcrypt/argon2)

### 6. CORS Configuration (MEDIUM)

```python
# Check CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://trusted-domain.com"],  # Not "*"
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

### 7. Dependency Vulnerabilities (HIGH)

```bash
# Python
uv run pip-audit
uv run safety check

# Node.js
npm audit
```

### 8. Logging & Error Handling (MEDIUM)

- [ ] Sensitive data not logged
- [ ] Stack traces not exposed to users
- [ ] Error messages don't reveal internals

## Security Tools

```bash
# Python security scanning
uv run bandit -r app/
uv run safety check

# Node.js security
npm audit
npx snyk test

# Secret scanning
git secrets --scan
trufflehog filesystem .
```

## Report Format

```markdown
## Security Audit Report

**Date**: YYYY-MM-DD
**Scope**: Full codebase / Specific path

### Critical Issues (Immediate Action Required)
| Issue | Location | Description | Remediation |
|-------|----------|-------------|-------------|
| Hardcoded API Key | src/api.ts:42 | API key in source | Move to env var |

### High Issues
...

### Medium Issues
...

### Low Issues
...

### Summary
- Critical: X
- High: X
- Medium: X
- Low: X

### Recommendations
1. [Recommendation 1]
2. [Recommendation 2]
```

## OWASP Top 10 Checklist

- [ ] A01: Broken Access Control
- [ ] A02: Cryptographic Failures
- [ ] A03: Injection
- [ ] A04: Insecure Design
- [ ] A05: Security Misconfiguration
- [ ] A06: Vulnerable Components
- [ ] A07: Auth Failures
- [ ] A08: Software/Data Integrity
- [ ] A09: Logging Failures
- [ ] A10: SSRF

# Build Fix

Incrementally fix TypeScript and Python build errors one at a time.

## Workflow

### 1. Run Build

```bash
# Python
cd backend
uv run python -m py_compile app/main.py
uv run mypy app/

# TypeScript
cd frontend
npm run build
# or
npx tsc --noEmit
```

### 2. Parse Error Output

- Group by file
- Sort by severity
- Determine fix order (consider dependencies)

### 3. Fix One at a Time

For each error:

1. **Show Error Context** - 5 lines before/after
2. **Explain Problem** - Why this error occurs
3. **Propose Fix** - Specific code change
4. **Apply Fix** - Make the modification
5. **Rebuild** - Verify error is resolved
6. **Confirm** - No new errors introduced

### 4. Stop Conditions

Stop fixing if:
- Fix introduces new errors
- Same error persists after 3 attempts
- User requests pause

### 5. Generate Summary

```markdown
## Build Fix Summary

### Fixed ✅
- [Error 1]: file:line - description

### Remaining ⚠️
- [Error 2]: file:line - description

### New Issues ❌
- [Error 3]: file:line - description
```

## Common Error Types

### TypeScript

| Code | Description | Common Fix |
|------|-------------|------------|
| TS2304 | Cannot find name | Add import or declaration |
| TS2322 | Type mismatch | Type cast or correct type |
| TS2345 | Argument type error | Check function signature |
| TS2551 | Property typo | Fix property name |
| TS7006 | Implicit any | Add type annotation |

### Python

| Type | Description | Common Fix |
|------|-------------|------------|
| ImportError | Module not found | Install dependency or fix path |
| TypeError | Type error | Check argument types |
| AttributeError | Attribute missing | Check object type |
| SyntaxError | Syntax error | Check brackets, indentation |

## Best Practices

1. **Fix one error at a time** - Avoid cascade issues
2. **Start from root cause** - Some errors result from others
3. **Preserve type safety** - Avoid `any` or `# type: ignore`
4. **Verify each fix** - Ensure no new issues
5. **Document complex fixes** - For future reference

## Emergency Fixes (Use Sparingly)

If you need to pass build quickly:

```typescript
// TypeScript: Temporary ignore (fix ASAP)
// @ts-ignore - TODO: Fix type issue #123

// Or use any (not recommended)
const data = response as any;
```

```python
# Python: Temporary ignore (fix ASAP)
# type: ignore  # TODO: Fix type issue #123
```

**Warning**: These are temporary solutions. Must be properly fixed ASAP!

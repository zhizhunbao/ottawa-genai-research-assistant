---
description: Testing requirements with TDD workflow and 80% coverage minimum
---

# Testing Requirements (测试要求)

## Minimum Test Coverage: 80% (最低测试覆盖率：80%)

**MANDATORY**: All production code must have at least 80% test coverage.

### Test Types (ALL Required)

1. **Unit Tests** (单元测试)
   - Individual functions
   - Utilities
   - Components
   - Business logic

2. **Integration Tests** (集成测试)
   - API endpoints
   - Database operations
   - Service interactions

3. **E2E Tests** (端到端测试)
   - Critical user flows
   - Authentication flows

## Test-Driven Development (TDD) - MANDATORY

**Required workflow for ALL new features:**

```
1. RED    - Write failing test first
2. GREEN  - Implement minimal code to pass
3. REFACTOR - Improve code quality
4. VERIFY - Check 80%+ coverage
5. REPEAT - Continue cycle
```

## Test Structure (AAA Pattern)

```python
def test_descriptive_name():
    # Arrange
    input_data = {"name": "Test", "age": 25}

    # Act
    result = process_user(input_data)

    # Assert
    assert result["is_valid"] is True
    assert result["name"] == "Test"
```

## Test Naming Conventions

### ✅ Good Test Names

```typescript
test("returns empty array when no items match query", () => {});
test("throws error when API key is missing", () => {});
test("validates email format before saving user", () => {});
```

### ❌ Bad Test Names

```typescript
test("works", () => {});
test("test search", () => {});
```

## Coverage Requirements

### Minimum Coverage by Type

- **Unit Tests**: 90%+ coverage
- **Integration Tests**: 80%+ coverage
- **E2E Tests**: Critical paths only

### Check Coverage

```bash
# TypeScript/JavaScript
npm run test:coverage

# Python
uv run pytest --cov=app --cov-report=html
uv run pytest --cov=app --cov-report=term-missing
```

## Pre-Commit Testing Checklist

Before every commit:

- [ ] All tests pass locally
- [ ] Coverage is 80%+ (check with coverage tool)
- [ ] No skipped tests (unless documented)
- [ ] No console.log in tests
- [ ] Test names are descriptive
- [ ] Tests are isolated (no shared state)
- [ ] Mocks are properly configured

---

**记住：测试不是可选的。80% 覆盖率是最低要求，不是目标。始终先写测试（TDD）。**

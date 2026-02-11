# Test Command

Run tests and fix failures systematically.

## Usage

```
/test              # Run all tests
/test backend      # Run backend tests only
/test frontend     # Run frontend tests only
/test fix          # Run tests and fix failures
/test coverage     # Run with coverage report
```

## Execution Instructions

### 1. Run Tests

```bash
# Backend (Python/pytest)
cd backend
uv run pytest -v
uv run pytest --cov=app --cov-report=term-missing

# Frontend (TypeScript/Vitest)
cd frontend
npm run test
npm run test:coverage
```

### 2. Parse Results

- Count passed/failed/skipped
- Group failures by file
- Identify root causes

### 3. Fix Failures (if `/test fix`)

For each failing test:

1. **Read test file** - Understand what's being tested
2. **Read implementation** - Check the code being tested
3. **Identify issue** - Is it test bug or implementation bug?
4. **Fix appropriately**:
   - Test bug: Update test expectations
   - Implementation bug: Fix the code
5. **Re-run** - Verify fix works
6. **Continue** - Move to next failure

### 4. Output Format

```markdown
## Test Results

### Summary
- ✅ Passed: 45
- ❌ Failed: 3
- ⏭️ Skipped: 2
- Coverage: 78%

### Failed Tests

#### 1. test_user_authentication
- File: `backend/tests/users/test_routes.py:42`
- Error: `AssertionError: 401 != 200`
- Cause: Missing auth header in request
- Status: 🔧 Fixed

#### 2. test_document_upload
- File: `backend/tests/documents/test_upload.py:78`
- Error: `FileNotFoundError`
- Cause: Test fixture missing
- Status: ⏳ Pending

### Coverage Report
| Module | Coverage |
|--------|----------|
| app/core | 85% |
| app/research | 72% |
| app/documents | 68% |
```

## Test Writing Guidelines

### Backend (pytest)

```python
# Good test structure
class TestUserService:
    """Tests for UserService."""

    @pytest.fixture
    def service(self, db_session):
        return UserService(db_session)

    async def test_create_user_success(self, service):
        """Should create user with valid data."""
        result = await service.create_user(valid_data)
        assert result.id is not None
        assert result.email == valid_data.email

    async def test_create_user_duplicate_email(self, service):
        """Should raise error for duplicate email."""
        with pytest.raises(DuplicateEmailError):
            await service.create_user(duplicate_data)
```

### Frontend (Vitest)

```typescript
// Good test structure
describe('ChatInput', () => {
  it('should submit message on enter', async () => {
    const onSubmit = vi.fn();
    render(<ChatInput onSubmit={onSubmit} />);

    await userEvent.type(screen.getByRole('textbox'), 'Hello');
    await userEvent.keyboard('{Enter}');

    expect(onSubmit).toHaveBeenCalledWith('Hello');
  });
});
```

## Best Practices

1. **Test behavior, not implementation**
2. **Use descriptive test names**
3. **One assertion per test (when possible)**
4. **Use fixtures for setup/teardown**
5. **Mock external dependencies**
6. **Test edge cases and error paths**

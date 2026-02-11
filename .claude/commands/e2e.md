# E2E Test Generation

Generate end-to-end tests for user journeys.

## Usage

```
/e2e                    # Generate E2E tests for all features
/e2e <feature>          # Generate E2E tests for specific feature
/e2e run                # Run existing E2E tests
```

## Execution Instructions

### 1. Identify User Journeys

For the requested feature, identify key user flows:
- Happy path (main success scenario)
- Error paths (validation, auth failures)
- Edge cases (empty states, limits)

### 2. Generate Test File

Create test file in appropriate location:
- Frontend: `frontend/e2e/` or `frontend/tests/e2e/`
- Use Playwright or Cypress syntax based on project setup

### 3. Test Structure

```typescript
// Example: Playwright E2E test
import { test, expect } from '@playwright/test';

test.describe('Research Chat', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Login and navigate
    await page.goto('/');
    await page.click('[data-testid="login-button"]');
    // ... auth flow
  });

  test('should send a research query and receive response', async ({ page }) => {
    // Arrange
    await page.goto('/chat');

    // Act
    await page.fill('[data-testid="chat-input"]', 'What is machine learning?');
    await page.click('[data-testid="send-button"]');

    // Assert
    await expect(page.locator('[data-testid="message-list"]'))
      .toContainText('machine learning', { timeout: 30000 });
    await expect(page.locator('[data-testid="citations"]'))
      .toBeVisible();
  });

  test('should handle empty query', async ({ page }) => {
    await page.goto('/chat');
    await page.click('[data-testid="send-button"]');

    await expect(page.locator('[data-testid="error-message"]'))
      .toContainText('Please enter a question');
  });
});
```

## Key User Journeys

### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout
- [ ] Session expiration

### Research Chat
- [ ] Send query and receive response
- [ ] View citations in response
- [ ] Start new conversation
- [ ] View chat history
- [ ] Switch language (EN/FR)

### Document Upload (if applicable)
- [ ] Upload valid document
- [ ] Handle invalid file type
- [ ] View upload progress
- [ ] Cancel upload

## Test Data Management

```typescript
// fixtures/testData.ts
export const testUser = {
  email: 'test@example.com',
  password: 'TestPassword123!'
};

export const testQueries = {
  simple: 'What is AI?',
  complex: 'Compare supervised and unsupervised learning approaches',
  french: 'Qu\'est-ce que l\'apprentissage automatique?'
};
```

## Best Practices

1. **Use data-testid attributes** for reliable selectors
2. **Wait for network idle** before assertions
3. **Use realistic timeouts** for AI responses
4. **Test both languages** (EN/FR)
5. **Clean up test data** after runs
6. **Use page objects** for maintainability
7. **Run in CI/CD pipeline**

## Output

After generating tests, provide:
- List of test files created
- Instructions to run tests
- Any manual setup required

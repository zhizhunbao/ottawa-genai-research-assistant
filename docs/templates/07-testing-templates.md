# 🧪 D. Testing Templates

> **层级**: Testing | **模板数**: 4
> **主要参考**: [full-stack-fastapi-template](../../.github/references/full-stack-fastapi-template/)

---

### D1. `tests/backend/conftest.py.template` — Pytest Fixtures

> **来源**: [`full-stack-fastapi-template/backend/tests/conftest.py`](../../.github/references/full-stack-fastapi-template/backend/tests/conftest.py)

```python
# 核心模式:
@pytest.fixture(scope="session", autouse=True)
def db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        init_db(session)
        yield session
        # cleanup

@pytest.fixture(scope="module")
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="module")
def superuser_token_headers(client): ...
@pytest.fixture(scope="module")
def normal_user_token_headers(client, db): ...
```

---

### D2. `tests/e2e/feature.spec.ts.template` — Playwright E2E

> **来源**: [`full-stack-fastapi-template/frontend/tests/login.spec.ts`](../../.github/references/full-stack-fastapi-template/frontend/tests/login.spec.ts)

```typescript
// 核心模式:
test.use({ storageState: { cookies: [], origins: [] } });

const fillForm = async (page: Page, email: string, password: string) => {
  await page.getByTestId("email-input").fill(email);
  await page.getByTestId("password-input").fill(password);
};

test("Log in with valid credentials", async ({ page }) => {
  await page.goto("/login");
  await fillForm(page, superuser, password);
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForURL("/");
  await expect(page.getByText("Welcome back")).toBeVisible();
});

test("Logged-out user cannot access protected routes", async ({ page }) => {
  // ... logout then try accessing /settings → redirect to /login
});
```

---

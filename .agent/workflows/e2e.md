---
description: Generate E2E tests for critical user flows using Playwright
---

# E2E Testing

为关键用户流程生成端到端测试。

## 何时使用

- 关键用户流程
- 认证/授权流程
- 支付流程
- 核心业务工作流
- 多步骤表单

## E2E 测试结构

```typescript
import { test, expect } from "@playwright/test";

test.describe("User Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    // 每个测试前的设置
    await page.goto("/");
  });

  test("user can sign up with valid credentials", async ({ page }) => {
    // 导航到注册页面
    await page.click('[data-testid="signup-button"]');

    // 填写表单
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "SecurePass123!");
    await page.fill('input[name="confirmPassword"]', "SecurePass123!");

    // 提交
    await page.click('button[type="submit"]');

    // 验证结果
    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("h1")).toContainText("Welcome");
  });

  test("user cannot access protected page without auth", async ({ page }) => {
    await page.goto("/dashboard");

    // 应重定向到登录
    await expect(page).toHaveURL("/login");
  });
});
```

## 测试模式

### 1. 页面对象模式（推荐）

```typescript
// pages/login.page.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.page.fill('[data-testid="email"]', email);
    await this.page.fill('[data-testid="password"]', password);
    await this.page.click('[data-testid="submit"]');
  }
}

// 使用
test("login flow", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login("user@example.com", "password");
  await expect(page).toHaveURL("/dashboard");
});
```

### 2. 数据驱动测试

```typescript
const testCases = [
  { email: "valid@example.com", password: "Valid123!", shouldPass: true },
  { email: "invalid", password: "short", shouldPass: false },
];

for (const { email, password, shouldPass } of testCases) {
  test(`login with ${email}`, async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    if (shouldPass) {
      await expect(page).toHaveURL("/dashboard");
    } else {
      await expect(page.locator(".error")).toBeVisible();
    }
  });
}
```

## 最佳实践

### ✅ 做

- 使用 `data-testid` 属性定位元素
- 等待网络请求完成
- 使用 `expect` 断言可见性
- 测试关键用户路径
- 隔离测试数据

### ❌ 不做

- 不要依赖 CSS 选择器（容易变化）
- 不要使用固定的 `sleep/wait`
- 不要在测试间共享状态
- 不要测试第三方服务

## 常用断言

```typescript
// 可见性
await expect(element).toBeVisible();
await expect(element).toBeHidden();

// 文本
await expect(element).toContainText("Hello");
await expect(element).toHaveText("Exact Text");

// URL
await expect(page).toHaveURL("/dashboard");
await expect(page).toHaveURL(/\/users\/\d+/);

// 表单
await expect(input).toHaveValue("value");
await expect(checkbox).toBeChecked();

// 计数
await expect(page.locator(".item")).toHaveCount(5);
```

## 运行测试

```bash
# 运行所有 E2E 测试
npx playwright test

# 运行特定测试
npx playwright test auth.spec.ts

# 带 UI 运行
npx playwright test --ui

# 生成报告
npx playwright show-report
```

## Python (Playwright)

```python
import pytest
from playwright.sync_api import Page, expect

def test_login_flow(page: Page):
    page.goto("/login")
    page.fill('[data-testid="email"]', "user@example.com")
    page.fill('[data-testid="password"]', "password")
    page.click('[data-testid="submit"]')

    expect(page).to_have_url("/dashboard")
```

---

**E2E 测试应覆盖关键用户路径，而不是每个细节！**

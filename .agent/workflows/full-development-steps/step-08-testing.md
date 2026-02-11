# Step 8: 测试

## 阶段信息

- **阶段**: `testing` - 测试
- **Skill**: `dev-senior_qa`
- **输入**: `docs/requirements/master_prd.md`, `backend/`, `frontend/`
- **产出物**: `backend/tests/`, `docs/test-report.md`

---

## 执行步骤

### 1. 加载上下文

读取并分析：

- `docs/requirements/master_prd.md` - 验收标准
- `docs/sprints/Sprint_Plan_Ottawa_GenAI_Research_Assistant.md` - 功能列表
- `backend/app/` - 后端代码
- `frontend/src/` - 前端代码

### 2. 加载 Skill

加载 `dev-senior_qa` skill，获取测试专业知识。

### 3. 🎯 模板和脚本查找 (Template-First)

**在写测试之前，先执行以下步骤：**

#### 3.1 查找测试模板

检查 `.agent/templates/tests/` 目录，可用模板：

| 模板文件                      | 用途                       | 变量                                  |
| ----------------------------- | -------------------------- | ------------------------------------- |
| `conftest.py.template`        | Pytest fixtures 和共享配置 | `{{feature_name}}`                    |
| `test_routes.py.template`     | FastAPI 路由端点测试       | `{{feature_name}}`, `{{FeatureName}}` |
| `test_service.py.template`    | 服务层业务逻辑测试         | `{{feature_name}}`, `{{FeatureName}}` |
| `component.test.tsx.template` | React 组件测试             | `{{feature_name}}`, `{{FeatureName}}` |

#### 3.2 使用脚本

| 脚本                 | 命令                                                      | 用途                   |
| -------------------- | --------------------------------------------------------- | ---------------------- |
| `coverage_report.py` | `python .agent/scripts/coverage_report.py --threshold 80` | 测试覆盖率报告         |
| `coverage_report.py` | `python .agent/scripts/coverage_report.py --backend`      | 仅后端覆盖率           |
| `extract_i18n.py`    | `python .agent/scripts/extract_i18n.py --check`           | 检查缺失的 i18n 翻译键 |

#### 3.3 如果缺少模板

如果需要测试但没有对应模板（例如 WebSocket 测试、性能测试）：

1. 在 `.agent/templates/tests/` 中创建新模板
2. 基于新模板为每个模块批量生成测试

### 4. 测试策略

```
测试金字塔:
                    ┌─────┐
                    │ E2E │  少量
                   ─┴─────┴─
                  │Integration│  中量
                 ─┴───────────┴─
                │   Unit Tests   │  大量
               ─┴────────────────┴─
```

| 测试类型 | 覆盖目标  | 工具               |
| -------- | --------- | ------------------ |
| 单元测试 | 函数、类  | pytest/jest        |
| 集成测试 | API、服务 | pytest/supertest   |
| E2E 测试 | 用户流程  | playwright/cypress |

### 4. 目录结构

```
tests/
├── backend/
│   ├── unit/
│   │   ├── test_models.py
│   │   ├── test_services.py
│   │   └── test_utils.py
│   ├── integration/
│   │   ├── test_api_users.py
│   │   ├── test_api_orders.py
│   │   └── conftest.py
│   └── conftest.py
├── frontend/
│   ├── unit/
│   │   ├── components/
│   │   └── hooks/
│   ├── integration/
│   │   └── pages/
│   └── setup.ts
├── e2e/
│   ├── specs/
│   │   ├── auth.spec.ts
│   │   ├── orders.spec.ts
│   │   └── ...
│   └── playwright.config.ts
└── fixtures/
    ├── users.json
    └── orders.json
```

### 5. 单元测试

#### 5.1 后端单元测试

```python
# tests/backend/unit/test_user_service.py
import pytest
from unittest.mock import Mock, patch
from services.user_service import UserService
from schemas.user import UserCreate

class TestUserService:
    @pytest.fixture
    def mock_db(self):
        return Mock()

    @pytest.fixture
    def service(self, mock_db):
        return UserService(mock_db)

    def test_create_user_success(self, service, mock_db):
        # Arrange
        user_data = UserCreate(email="test@example.com", password="123456", name="Test")

        # Act
        result = service.create(user_data)

        # Assert
        assert result is not None
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()

    def test_create_user_duplicate_email(self, service, mock_db):
        # Arrange
        mock_db.query.return_value.filter.return_value.first.return_value = Mock()
        user_data = UserCreate(email="existing@example.com", password="123456", name="Test")

        # Act & Assert
        with pytest.raises(ValueError, match="Email already exists"):
            service.create(user_data)
```

#### 5.2 前端单元测试

```tsx
// tests/frontend/unit/components/UserCard.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { UserCard } from "@/components/features/UserCard";

describe("UserCard", () => {
  const mockUser = {
    id: 1,
    name: "Test User",
    email: "test@example.com",
    avatar: "https://example.com/avatar.jpg",
  };

  it("renders user information correctly", () => {
    render(<UserCard user={mockUser} />);

    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    render(<UserCard user={mockUser} onClick={handleClick} />);

    fireEvent.click(screen.getByRole("article"));

    expect(handleClick).toHaveBeenCalledWith(1);
  });
});
```

### 6. 集成测试

```python
# tests/backend/integration/test_api_users.py
import pytest
from fastapi.testclient import TestClient
from main import app

class TestUserAPI:
    @pytest.fixture
    def client(self):
        return TestClient(app)

    def test_create_user(self, client):
        # Arrange
        payload = {
            "email": "test@example.com",
            "password": "123456",
            "name": "Test User"
        }

        # Act
        response = client.post("/api/v1/users", json=payload)

        # Assert
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "test@example.com"
        assert "id" in data

    def test_get_user_not_found(self, client):
        response = client.get("/api/v1/users/99999")
        assert response.status_code == 404
```

### 7. E2E 测试

```typescript
// tests/e2e/specs/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("user can register", async ({ page }) => {
    await page.goto("/register");

    await page.fill('[name="email"]', "newuser@example.com");
    await page.fill('[name="password"]', "SecurePass123!");
    await page.fill('[name="name"]', "New User");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator(".welcome-message")).toContainText(
      "Welcome, New User",
    );
  });

  test("user can login", async ({ page }) => {
    await page.goto("/login");

    await page.fill('[name="email"]', "existing@example.com");
    await page.fill('[name="password"]', "password123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/dashboard");
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.fill('[name="email"]', "wrong@example.com");
    await page.fill('[name="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    await expect(page.locator(".error-message")).toBeVisible();
  });
});
```

### 8. 覆盖率要求

| 类型         | 最低覆盖率    |
| ------------ | ------------- |
| 后端单元测试 | 80%           |
| 前端单元测试 | 70%           |
| 集成测试     | 关键路径 100% |
| E2E 测试     | 核心流程 100% |

### 9. 运行测试

```bash
# 后端测试
cd backend && uv run pytest --cov=app --cov-report=html --tb=short

# 前端测试 (如果已配置)
cd frontend && npm run test -- --run
```

### 10. 测试报告

生成 `docs/test-report.md`：

```markdown
# 测试报告

## 概览

- 测试日期: {date}
- 总测试数: {total}
- 通过: {passed}
- 失败: {failed}
- 跳过: {skipped}

## 覆盖率

| 模块     | 行覆盖率 | 分支覆盖率 |
| -------- | -------- | ---------- |
| backend  | 85%      | 78%        |
| frontend | 72%      | 65%        |

## 失败用例

(如有)

## E2E 测试结果

| 场景     | 状态 | 用时 |
| -------- | ---- | ---- |
| 用户注册 | ✓    | 2.3s |
| 用户登录 | ✓    | 1.8s |
```

---

## 完成检查

- [ ] 单元测试覆盖率达标
- [ ] 集成测试通过
- [ ] E2E 测试通过
- [ ] 无阻断性 Bug
- [ ] 测试报告已生成

## 状态更新

```yaml
current_phase: review

phases:
  testing:
    status: completed
    completed_at: "{current_time}"
    output: "docs/test-report.md"
```

## 下一步

→ 进入 `step-09-review.md`

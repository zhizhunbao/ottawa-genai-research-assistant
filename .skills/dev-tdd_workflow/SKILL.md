---
name: dev-tdd_workflow
description: 测试驱动开发工作流。Use when (1) 编写新功能, (2) 修复 bug, (3) 重构代码, (4) 添加 API 端点, (5) 创建新组件。强制 80%+ 测试覆盖率
---

# Test-Driven Development Workflow (Kiro 适配版)

## Objectives

- 强制测试优先的开发流程
- 确保 80%+ 测试覆盖率
- 覆盖单元测试、集成测试和 E2E 测试
- 减少生产环境 bug
- 提高代码可维护性

## Core Principles

### 1. Tests BEFORE Code (测试先行)
**永远先写测试，再写实现代码**

### 2. RED-GREEN-REFACTOR Cycle
```
🔴 RED:      写一个失败的测试
🟢 GREEN:    写最少的代码让测试通过
🔵 REFACTOR: 重构代码，保持测试通过
🔁 REPEAT:   下一个功能/场景
```

### 3. Coverage Requirements
- **最低 80% 覆盖率** (unit + integration + E2E)
- **100% 覆盖率** 用于：
  - 金融计算
  - 认证逻辑
  - 安全关键代码
  - 核心业务逻辑

## TDD Workflow Steps

### Step 1: 定义用户故事
```
作为 [角色]，我想要 [功能]，以便 [价值]

示例：
作为用户，我想要语义搜索市场，
以便即使没有精确关键词也能找到相关市场。
```

### Step 2: 编写测试用例（先写测试！）

**Python (pytest) 示例：**
```python
# tests/test_search.py
import pytest
from app.services.search import semantic_search

def test_semantic_search_returns_relevant_results():
    """测试语义搜索返回相关结果"""
    query = "election prediction"
    results = semantic_search(query)
    
    assert len(results) > 0
    assert all(r['similarity_score'] > 0.7 for r in results)

def test_semantic_search_handles_empty_query():
    """测试空查询的处理"""
    results = semantic_search("")
    
    assert results == []

def test_semantic_search_fallback_when_redis_down():
    """测试 Redis 不可用时的降级"""
    # Mock Redis failure
    with pytest.raises(RedisError):
        # Test fallback behavior
        pass

@pytest.mark.parametrize("query,expected_count", [
    ("election", 5),
    ("sports", 3),
    ("nonexistent", 0),
])
def test_semantic_search_various_queries(query, expected_count):
    """参数化测试多种查询"""
    results = semantic_search(query)
    assert len(results) == expected_count
```

**TypeScript (Vitest) 示例：**
```typescript
// tests/search.test.ts
import { describe, it, expect, vi } from 'vitest'
import { semanticSearch } from '@/lib/search'

describe('Semantic Search', () => {
  it('returns relevant markets for query', async () => {
    const results = await semanticSearch('election')
    
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].similarity_score).toBeGreaterThan(0.7)
  })

  it('handles empty query gracefully', async () => {
    const results = await semanticSearch('')
    
    expect(results).toEqual([])
  })

  it('falls back when Redis unavailable', async () => {
    // Mock Redis failure
    vi.mock('@/lib/redis', () => ({
      searchByVector: vi.fn().mockRejectedValue(new Error('Redis down'))
    }))

    const results = await semanticSearch('test')
    
    // Should use fallback search
    expect(results).toBeDefined()
  })
})
```

### Step 3: 运行测试（应该失败）
```bash
# Python
uv run pytest tests/test_search.py

# TypeScript
npm test search.test.ts

# 预期结果：❌ FAIL - 因为还没实现
```

**重要：** 确认测试失败的原因是"功能未实现"，而不是测试写错了！

### Step 4: 实现最小代码（让测试通过）

**Python 实现：**
```python
# app/services/search.py
from typing import List, Dict
from app.lib.redis_client import search_by_vector
from app.lib.openai_client import generate_embedding

def semantic_search(query: str) -> List[Dict]:
    """语义搜索市场"""
    # Handle empty query
    if not query:
        return []
    
    try:
        # Generate embedding
        embedding = generate_embedding(query)
        
        # Search in Redis
        results = search_by_vector(embedding)
        
        # Filter by similarity threshold
        return [r for r in results if r['similarity_score'] > 0.7]
    
    except Exception as e:
        # Fallback to substring search
        return fallback_search(query)

def fallback_search(query: str) -> List[Dict]:
    """降级搜索"""
    # Simple substring search
    pass
```

### Step 5: 再次运行测试（应该通过）
```bash
uv run pytest tests/test_search.py

# 预期结果：✅ PASS - 所有测试通过
```

### Step 6: 重构（改进代码质量）
```python
# 重构后的代码
from typing import List, Dict, Optional
from dataclasses import dataclass

@dataclass
class SearchResult:
    id: str
    title: str
    similarity_score: float

class SemanticSearchService:
    """语义搜索服务"""
    
    SIMILARITY_THRESHOLD = 0.7
    
    def __init__(self, redis_client, openai_client):
        self.redis = redis_client
        self.openai = openai_client
    
    def search(self, query: str) -> List[SearchResult]:
        """执行语义搜索"""
        if not query:
            return []
        
        try:
            return self._vector_search(query)
        except Exception:
            return self._fallback_search(query)
    
    def _vector_search(self, query: str) -> List[SearchResult]:
        """向量搜索"""
        embedding = self.openai.generate_embedding(query)
        results = self.redis.search_by_vector(embedding)
        return self._filter_by_threshold(results)
    
    def _filter_by_threshold(self, results: List[Dict]) -> List[SearchResult]:
        """过滤低相似度结果"""
        return [
            SearchResult(**r) 
            for r in results 
            if r['similarity_score'] > self.SIMILARITY_THRESHOLD
        ]
    
    def _fallback_search(self, query: str) -> List[SearchResult]:
        """降级搜索"""
        # Implementation
        pass
```

### Step 7: 验证测试仍然通过
```bash
uv run pytest tests/test_search.py

# 预期结果：✅ PASS - 重构后测试仍然通过
```

### Step 8: 检查覆盖率
```bash
# Python
uv run pytest --cov=app --cov-report=html tests/

# TypeScript
npm test -- --coverage

# 目标：80%+ 覆盖率
```

## Test Types & Patterns

### 1. Unit Tests (单元测试)

**测试内容：**
- 单个函数
- 工具函数
- 纯函数
- 数据转换

**示例：**
```python
def test_calculate_liquidity_score():
    """测试流动性评分计算"""
    market_data = {
        'volume': 100000,
        'spread': 0.01,
        'traders': 500
    }
    
    score = calculate_liquidity_score(market_data)
    
    assert 0 <= score <= 100
    assert score > 80  # High liquidity
```

### 2. Integration Tests (集成测试)

**测试内容：**
- API 端点
- 数据库操作
- 外部服务调用
- 服务间交互

**FastAPI 示例：**
```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_search_endpoint():
    """测试搜索 API 端点"""
    response = client.get("/api/search?q=election")
    
    assert response.status_code == 200
    data = response.json()
    assert data['success'] is True
    assert len(data['results']) > 0

def test_search_endpoint_validation():
    """测试参数验证"""
    response = client.get("/api/search")  # Missing query
    
    assert response.status_code == 422  # Validation error
```

### 3. E2E Tests (端到端测试)

**测试内容：**
- 完整用户流程
- 多步骤操作
- 浏览器交互
- 全栈集成

**Playwright 示例：**
```python
# tests/e2e/test_search_flow.py
import pytest
from playwright.sync_api import Page, expect

def test_user_can_search_markets(page: Page):
    """测试用户可以搜索市场"""
    # 访问首页
    page.goto("http://localhost:3000")
    
    # 点击搜索
    page.click("a[href='/markets']")
    
    # 输入搜索词
    page.fill("input[placeholder='Search markets']", "election")
    
    # 等待结果
    page.wait_for_selector("[data-testid='market-card']")
    
    # 验证结果
    results = page.locator("[data-testid='market-card']")
    expect(results).to_have_count(5)
    
    # 验证内容
    first_result = results.first()
    expect(first_result).to_contain_text("election", ignore_case=True)
```

## Testing Best Practices

### ✅ DO (应该做的)

1. **先写测试，再写代码**
2. **一个测试一个断言** - 专注单一行为
3. **描述性测试名称** - 说明测试什么
4. **Arrange-Act-Assert 结构** - 清晰的测试结构
5. **Mock 外部依赖** - 隔离单元测试
6. **测试边界情况** - null、空、最大值
7. **测试错误路径** - 不只是正常流程
8. **保持测试快速** - 单元测试 < 50ms
9. **测试后清理** - 无副作用
10. **审查覆盖率报告** - 识别遗漏

### ❌ DON'T (不应该做的)

1. ❌ 先写代码再补测试
2. ❌ 跳过失败的测试
3. ❌ 一次写太多代码
4. ❌ 测试实现细节（测试行为）
5. ❌ Mock 所有东西（优先集成测试）
6. ❌ 忽略测试失败
7. ❌ 写脆弱的选择器
8. ❌ 测试相互依赖
9. ❌ 没有测试就重构
10. ❌ 追求 100% 覆盖率而忽略质量

## Mocking Patterns

### Python Mock 示例
```python
from unittest.mock import Mock, patch

@patch('app.lib.redis_client.search_by_vector')
def test_search_with_mocked_redis(mock_search):
    """使用 Mock 测试"""
    # Setup mock
    mock_search.return_value = [
        {'id': '1', 'title': 'Test', 'similarity_score': 0.9}
    ]
    
    # Test
    results = semantic_search("test")
    
    # Verify
    assert len(results) == 1
    mock_search.assert_called_once()
```

### TypeScript Mock 示例
```typescript
import { vi } from 'vitest'

vi.mock('@/lib/redis', () => ({
  searchByVector: vi.fn().mockResolvedValue([
    { id: '1', title: 'Test', similarity_score: 0.9 }
  ])
}))

it('searches with mocked Redis', async () => {
  const results = await semanticSearch('test')
  
  expect(results).toHaveLength(1)
})
```

## Coverage Verification

### 运行覆盖率报告
```bash
# Python
uv run pytest --cov=app --cov-report=html --cov-report=term

# TypeScript
npm test -- --coverage

# 查看 HTML 报告
# Python: open htmlcov/index.html
# TypeScript: open coverage/index.html
```

### 覆盖率阈值配置

**pytest (pyproject.toml):**
```toml
[tool.pytest.ini_options]
addopts = "--cov=app --cov-fail-under=80"
```

**Vitest (vitest.config.ts):**
```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    }
  }
})
```

## Common Mistakes to Avoid

### ❌ 错误：测试实现细节
```python
# 不要测试内部状态
assert service._cache == {'key': 'value'}
```

### ✅ 正确：测试用户可见行为
```python
# 测试用户看到的结果
result = service.get_data('key')
assert result == 'value'
```

### ❌ 错误：脆弱的选择器
```python
# 容易失效
page.click('.css-class-xyz')
```

### ✅ 正确：语义化选择器
```python
# 抗变化
page.click('button:has-text("Submit")')
page.click('[data-testid="submit-button"]')
```

## Integration with Kiro

### 使用 Kiro Hook 强制 TDD
```json
{
  "name": "TDD Reminder",
  "version": "1.0.0",
  "when": {
    "type": "fileCreated",
    "patterns": ["*.py", "*.ts"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Remind me to write tests FIRST before implementing this file. Follow TDD workflow: RED-GREEN-REFACTOR."
  }
}
```

### 使用 Kiro Skill
当用户说"写测试"、"TDD"、"test-driven" 时，自动加载此 skill。

## Quick Commands (Kiro 适配)

```bash
# Python 测试
uv run pytest                          # 运行所有测试
uv run pytest tests/test_search.py     # 运行特定测试
uv run pytest -v                       # 详细输出
uv run pytest --cov=app                # 覆盖率报告
uv run pytest -k "search"              # 运行匹配的测试

# TypeScript 测试
npm test                               # 运行所有测试
npm test search.test.ts                # 运行特定测试
npm test -- --watch                    # 监听模式
npm test -- --coverage                 # 覆盖率报告
```

## Success Metrics

- ✅ 80%+ 代码覆盖率
- ✅ 所有测试通过（绿色）
- ✅ 无跳过或禁用的测试
- ✅ 快速测试执行（< 30s 单元测试）
- ✅ E2E 测试覆盖关键流程
- ✅ 测试在生产前捕获 bug

---

**记住：测试不是可选的。它们是安全网，让你能够自信地重构、快速开发和保证生产可靠性。**

**TDD = 更少的 bug + 更好的设计 + 更快的开发**

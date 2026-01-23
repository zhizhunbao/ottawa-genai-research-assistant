---
name: dev-coding_standards
description: Universal coding standards and best practices for TypeScript, JavaScript, React, and Node.js. Use when (1) writing new code, (2) reviewing code quality, (3) establishing project conventions, (4) refactoring existing code.
---

# Coding Standards & Best Practices

Universal coding standards applicable across all projects.

## Core Principles

### 1. Readability First
- Code is read more than written
- Clear variable and function names
- Self-documenting code preferred over comments
- Consistent formatting

### 2. KISS (Keep It Simple, Stupid)
- Simplest solution that works
- Avoid over-engineering
- No premature optimization
- Easy to understand > clever code

### 3. DRY (Don't Repeat Yourself)
- Extract common logic into functions
- Create reusable components
- Share utilities across modules
- Avoid copy-paste programming

### 4. YAGNI (You Aren't Gonna Need It)
- Don't build features before they're needed
- Avoid speculative generality
- Add complexity only when required
- Start simple, refactor when needed

## Naming Conventions

### Variables

```typescript
// ✅ Descriptive names
const marketSearchQuery = 'election'
const isUserAuthenticated = true
const totalRevenue = 1000

// ❌ Unclear names
const q = 'election'
const flag = true
const x = 1000
```

### Functions

```typescript
// ✅ Verb-noun pattern
async function fetchMarketData(marketId: string) { }
function calculateSimilarity(a: number[], b: number[]) { }
function isValidEmail(email: string): boolean { }

// ❌ Unclear or noun-only
async function market(id: string) { }
function similarity(a, b) { }
function email(e) { }
```

### TypeScript/JavaScript Conventions

```typescript
// Variables and functions: camelCase
const userName = 'John'
function calculateTotal() {}

// Classes and interfaces: PascalCase
class UserService {}
interface UserData {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3
const API_BASE_URL = 'https://api.example.com'

// Private members: prefix #
class User {
  #internalState = {}
  #privateMethod() {}
}
```

### Python Conventions

```python
# Variables and functions: snake_case
user_name = "John"
def calculate_total():
    pass

# Classes: PascalCase
class UserService:
    pass

# Constants: UPPER_SNAKE_CASE
MAX_RETRY_COUNT = 3
API_BASE_URL = "https://api.example.com"

# Private members: prefix _
class User:
    def __init__(self):
        self._internal_state = {}
    
    def _private_method(self):
        pass
```

## Immutability Pattern (CRITICAL)

```typescript
// ✅ ALWAYS use spread operator
const updatedUser = {
  ...user,
  name: 'New Name'
}

const updatedArray = [...items, newItem]

// ❌ NEVER mutate directly
user.name = 'New Name'  // BAD
items.push(newItem)     // BAD
```

```python
# ✅ Create new objects
def update_user(user: dict, name: str) -> dict:
    return {**user, 'name': name}

def add_item(items: list, item: str) -> list:
    return [*items, item]

# ❌ Mutate existing objects
def update_user(user: dict, name: str) -> dict:
    user['name'] = name  # BAD
    return user
```

## Error Handling

```typescript
// ✅ Comprehensive error handling
async function fetchData(url: string) {
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Fetch failed:', error)
    throw new Error('Failed to fetch data')
  }
}

// ❌ No error handling
async function fetchData(url) {
  const response = await fetch(url)
  return response.json()
}
```

```python
# ✅ Specific exception handling
import logging

logger = logging.getLogger(__name__)

try:
    result = risky_operation()
except ValueError as e:
    logger.error(f"Invalid value: {e}")
    raise HTTPException(status_code=400, detail="Invalid input")
except ConnectionError as e:
    logger.error(f"Connection failed: {e}")
    raise HTTPException(status_code=503, detail="Service unavailable")
except Exception as e:
    logger.exception(f"Unexpected error: {e}")
    raise HTTPException(status_code=500, detail="Internal server error")

# ❌ Empty except
try:
    result = risky_operation()
except:
    pass  # BAD
```

## Async/Await Best Practices

```typescript
// ✅ Parallel execution when possible
const [users, markets, stats] = await Promise.all([
  fetchUsers(),
  fetchMarkets(),
  fetchStats()
])

// ❌ Sequential when unnecessary
const users = await fetchUsers()
const markets = await fetchMarkets()
const stats = await fetchStats()
```

## Type Safety

```typescript
// ✅ Proper types
interface Market {
  id: string
  name: string
  status: 'active' | 'resolved' | 'closed'
  created_at: Date
}

function getMarket(id: string): Promise<Market> {
  // Implementation
}

// ❌ Using 'any'
function getMarket(id: any): Promise<any> {
  // Implementation
}
```

## API Design

### REST Conventions

```
GET    /api/markets              # List all
GET    /api/markets/:id          # Get specific
POST   /api/markets              # Create new
PUT    /api/markets/:id          # Update (full)
PATCH  /api/markets/:id          # Update (partial)
DELETE /api/markets/:id          # Delete

# Query parameters for filtering
GET /api/markets?status=active&limit=10&offset=0
```

### Response Format

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total: number
    page: number
    limit: number
  }
}

// Success
return NextResponse.json({
  success: true,
  data: markets,
  meta: { total: 100, page: 1, limit: 10 }
})

// Error
return NextResponse.json({
  success: false,
  error: 'Invalid request'
}, { status: 400 })
```

### Input Validation

```typescript
import { z } from 'zod'

const CreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  endDate: z.string().datetime()
})

export async function POST(request: Request) {
  const body = await request.json()
  
  try {
    const validated = CreateSchema.parse(body)
    // Proceed with validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }
  }
}
```

## File Organization

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   └── (routes)/          # Page routes
├── components/            # React components
│   ├── ui/               # Generic UI
│   ├── forms/            # Form components
│   └── layouts/          # Layouts
├── hooks/                # Custom hooks
├── lib/                  # Utilities
│   ├── api/             # API clients
│   ├── utils/           # Helpers
│   └── constants/       # Constants
├── types/                # TypeScript types
└── styles/              # Global styles
```

### File Naming

```
components/Button.tsx          # PascalCase for components
hooks/useAuth.ts              # camelCase with 'use' prefix
lib/formatDate.ts             # camelCase for utilities
types/market.types.ts         # camelCase with .types suffix
```

## Comments & Documentation

### When to Comment

```typescript
// ✅ Explain WHY, not WHAT
// Use exponential backoff to avoid overwhelming API during outages
const delay = Math.min(1000 * Math.pow(2, retryCount), 30000)

// Deliberately using mutation here for performance with large arrays
items.push(newItem)

// ❌ Stating the obvious
// Increment counter by 1
count++

// Set name to user's name
name = user.name
```

### JSDoc for Public APIs

```typescript
/**
 * Searches items using semantic similarity.
 *
 * @param query - Natural language search query
 * @param limit - Maximum results (default: 10)
 * @returns Array sorted by similarity score
 * @throws {Error} If API fails
 *
 * @example
 * ```typescript
 * const results = await search('query', 5)
 * ```
 */
export async function search(
  query: string,
  limit: number = 10
): Promise<Item[]> {
  // Implementation
}
```

## Performance Best Practices

### Memoization

```typescript
import { useMemo, useCallback } from 'react'

// Memoize expensive computations
const sorted = useMemo(() => {
  return items.sort((a, b) => b.value - a.value)
}, [items])

// Memoize callbacks
const handleSearch = useCallback((query: string) => {
  setSearchQuery(query)
}, [])
```

### Lazy Loading

```typescript
import { lazy, Suspense } from 'react'

const HeavyComponent = lazy(() => import('./HeavyComponent'))

export function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyComponent />
    </Suspense>
  )
}
```

### Database Queries

```typescript
// ✅ Select only needed columns
const { data } = await supabase
  .from('items')
  .select('id, name, status')
  .limit(10)

// ❌ Select everything
const { data } = await supabase
  .from('items')
  .select('*')
```

## Code Smells to Avoid

### 1. Long Functions

```typescript
// ❌ Function > 50 lines
function processData() {
  // 100 lines of code
}

// ✅ Split into smaller functions
function processData() {
  const validated = validateData()
  const transformed = transformData(validated)
  return saveData(transformed)
}
```

### 2. Deep Nesting

```typescript
// ❌ 5+ levels of nesting
if (user) {
  if (user.isAdmin) {
    if (item) {
      if (item.isActive) {
        if (hasPermission) {
          // Do something
        }
      }
    }
  }
}

// ✅ Early returns
if (!user) return
if (!user.isAdmin) return
if (!item) return
if (!item.isActive) return
if (!hasPermission) return

// Do something
```

### 3. Magic Numbers

```typescript
// ❌ Unexplained numbers
if (retryCount > 3) { }
setTimeout(callback, 500)

// ✅ Named constants
const MAX_RETRIES = 3
const DEBOUNCE_DELAY_MS = 500

if (retryCount > MAX_RETRIES) { }
setTimeout(callback, DEBOUNCE_DELAY_MS)
```

## Validation Checklist

Before marking code complete:

- [ ] Clear, descriptive names
- [ ] Immutable data patterns
- [ ] Proper error handling
- [ ] Type safety (no 'any')
- [ ] Functions under 50 lines
- [ ] Nesting depth under 4 levels
- [ ] No magic numbers
- [ ] Comments explain WHY, not WHAT
- [ ] Performance optimizations applied
- [ ] Code follows DRY principle

**Remember**: Code quality is not negotiable. Clear, maintainable code enables rapid development and confident refactoring.

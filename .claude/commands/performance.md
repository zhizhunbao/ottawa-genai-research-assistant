# Performance Optimization

Analyze and optimize application performance.

## Usage

```
/performance              # Full performance audit
/performance backend      # Backend performance only
/performance frontend     # Frontend performance only
/performance <file>       # Analyze specific file
```

## Backend Performance

### 1. Database Queries

Check for:
- [ ] N+1 query problems
- [ ] Missing indexes
- [ ] Inefficient joins
- [ ] Large result sets without pagination

```python
# BAD - N+1 problem
users = session.query(User).all()
for user in users:
    print(user.posts)  # Separate query for each user

# GOOD - Eager loading
users = session.query(User).options(joinedload(User.posts)).all()
```

### 2. Async Operations

- [ ] All I/O operations are async
- [ ] Proper use of `asyncio.gather()` for parallel operations
- [ ] No blocking calls in async functions

```python
# BAD - Sequential
result1 = await fetch_data1()
result2 = await fetch_data2()

# GOOD - Parallel
result1, result2 = await asyncio.gather(
    fetch_data1(),
    fetch_data2()
)
```

### 3. Caching

- [ ] Expensive computations cached
- [ ] API responses cached where appropriate
- [ ] Cache invalidation strategy defined

### 4. Azure Services

- [ ] Connection pooling enabled
- [ ] Batch operations used where possible
- [ ] Retry policies configured

## Frontend Performance

### 1. Bundle Size

```bash
# Analyze bundle
npm run build
npx vite-bundle-visualizer
```

Check for:
- [ ] Large dependencies
- [ ] Unused imports
- [ ] Code splitting opportunities

### 2. React Optimization

- [ ] `useMemo` for expensive calculations
- [ ] `useCallback` for function props
- [ ] `React.memo` for pure components
- [ ] Virtualization for long lists

```typescript
// BAD - Recalculates on every render
const sorted = items.sort((a, b) => a.name.localeCompare(b.name));

// GOOD - Memoized
const sorted = useMemo(
  () => items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);
```

### 3. Network

- [ ] API calls debounced/throttled
- [ ] Images optimized and lazy loaded
- [ ] Data prefetching where appropriate

### 4. Core Web Vitals

- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1

## Profiling Commands

```bash
# Backend profiling
uv run python -m cProfile -o output.prof app/main.py
uv run snakeviz output.prof

# Frontend profiling
# Use React DevTools Profiler
# Use Chrome DevTools Performance tab
```

## Report Format

```markdown
## Performance Report

### Backend

#### Database Queries
| Query | Time | Calls | Issue |
|-------|------|-------|-------|
| get_user | 50ms | 100 | N+1 pattern |

#### Recommendations
1. Add index on `documents.user_id`
2. Use eager loading for user posts

### Frontend

#### Bundle Analysis
| Chunk | Size | Recommendation |
|-------|------|----------------|
| vendor | 500KB | Split lodash |
| main | 200KB | OK |

#### Component Performance
| Component | Renders | Time | Issue |
|-----------|---------|------|-------|
| MessageList | 50 | 200ms | Missing memo |

### Action Items
1. [ ] Fix N+1 query in UserService
2. [ ] Add React.memo to MessageList
3. [ ] Implement virtual scrolling for chat
```

## Quick Wins

1. **Add database indexes** for frequently queried columns
2. **Enable gzip compression** in production
3. **Use connection pooling** for database
4. **Lazy load** non-critical components
5. **Debounce** search/filter inputs

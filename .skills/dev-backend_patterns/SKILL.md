---
name: dev-backend_patterns
description: 后端架构模式专家。Use when (1) 设计后端架构, (2) 实现 Repository 模式, (3) 设计 Service Layer, (4) 实现缓存策略, (5) 错误处理模式, (6) 认证授权设计
---

# Backend Architecture Patterns (后端架构模式)

通用后端架构模式和最佳实践，适用于可扩展的服务端应用。

## Objectives

- 实现清晰的分层架构
- 应用经典设计模式
- 优化数据库访问
- 实现有效的缓存策略
- 设计健壮的错误处理
- 构建可扩展的后端系统

## Core Architecture Patterns

### 1. Repository Pattern (仓储模式)

**目的**: 抽象数据访问逻辑，使业务逻辑与数据源解耦

#### 定义接口

```python
from abc import ABC, abstractmethod
from typing import List, Optional, Generic, TypeVar
from pydantic import BaseModel

T = TypeVar('T', bound=BaseModel)

class Repository(ABC, Generic[T]):
    """通用仓储接口"""
    
    @abstractmethod
    async def find_all(self, **filters) -> List[T]:
        """查询所有记录"""
        pass
    
    @abstractmethod
    async def find_by_id(self, id: str) -> Optional[T]:
        """根据 ID 查询"""
        pass
    
    @abstractmethod
    async def create(self, data: T) -> T:
        """创建记录"""
        pass
    
    @abstractmethod
    async def update(self, id: str, data: T) -> T:
        """更新记录"""
        pass
    
    @abstractmethod
    async def delete(self, id: str) -> bool:
        """删除记录"""
        pass
```

#### 实现具体仓储

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.domain import Market
from app.models.schemas import MarketCreate, MarketUpdate

class MarketRepository(Repository[Market]):
    """市场数据仓储"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def find_all(self, status: Optional[str] = None, limit: int = 100) -> List[Market]:
        """查询市场列表"""
        query = select(Market)
        
        if status:
            query = query.where(Market.status == status)
        
        query = query.limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def find_by_id(self, id: str) -> Optional[Market]:
        """根据 ID 查询市场"""
        result = await self.db.execute(
            select(Market).where(Market.id == id)
        )
        return result.scalar_one_or_none()
    
    async def create(self, data: MarketCreate) -> Market:
        """创建市场"""
        market = Market(**data.model_dump())
        self.db.add(market)
        await self.db.commit()
        await self.db.refresh(market)
        return market
    
    async def update(self, id: str, data: MarketUpdate) -> Market:
        """更新市场"""
        market = await self.find_by_id(id)
        if not market:
            raise ValueError(f"Market {id} not found")
        
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(market, key, value)
        
        await self.db.commit()
        await self.db.refresh(market)
        return market
    
    async def delete(self, id: str) -> bool:
        """删除市场"""
        market = await self.find_by_id(id)
        if not market:
            return False
        
        await self.db.delete(market)
        await self.db.commit()
        return True
```

### 2. Service Layer Pattern (服务层模式)

**目的**: 封装业务逻辑，协调多个仓储和外部服务

```python
from typing import List, Optional
from app.repositories.market_repository import MarketRepository
from app.repositories.user_repository import UserRepository
from app.lib.openai_client import OpenAIClient
from app.lib.redis_client import RedisClient
from app.models.schemas import MarketCreate, MarketResponse

class MarketService:
    """市场业务服务"""
    
    def __init__(
        self,
        market_repo: MarketRepository,
        user_repo: UserRepository,
        openai: OpenAIClient,
        redis: RedisClient
    ):
        self.market_repo = market_repo
        self.user_repo = user_repo
        self.openai = openai
        self.redis = redis
    
    async def search_markets(
        self,
        query: str,
        limit: int = 10
    ) -> List[MarketResponse]:
        """语义搜索市场"""
        # 1. 生成查询向量
        embedding = await self.openai.generate_embedding(query)
        
        # 2. 向量搜索
        try:
            results = await self.redis.vector_search(embedding, limit)
        except Exception as e:
            # 降级到数据库搜索
            results = await self._fallback_search(query, limit)
        
        # 3. 获取完整数据
        market_ids = [r['id'] for r in results]
        markets = await self.market_repo.find_by_ids(market_ids)
        
        # 4. 按相似度排序
        score_map = {r['id']: r['score'] for r in results}
        markets.sort(key=lambda m: score_map.get(m.id, 0), reverse=True)
        
        return [MarketResponse.from_orm(m) for m in markets]
    
    async def create_market(
        self,
        data: MarketCreate,
        user_id: str
    ) -> MarketResponse:
        """创建市场"""
        # 1. 验证用户权限
        user = await self.user_repo.find_by_id(user_id)
        if not user or not user.can_create_market:
            raise PermissionError("User cannot create markets")
        
        # 2. 创建市场
        market = await self.market_repo.create(data)
        
        # 3. 生成并存储向量
        embedding = await self.openai.generate_embedding(
            f"{market.name} {market.description}"
        )
        await self.redis.store_vector(market.id, embedding)
        
        # 4. 发送通知（异步）
        await self._notify_market_created(market)
        
        return MarketResponse.from_orm(market)
    
    async def _fallback_search(self, query: str, limit: int) -> List[dict]:
        """降级搜索"""
        markets = await self.market_repo.search_by_text(query, limit)
        return [{'id': m.id, 'score': 0.5} for m in markets]
    
    async def _notify_market_created(self, market):
        """发送市场创建通知"""
        # 实现通知逻辑
        pass
```

### 3. Dependency Injection (依赖注入)

**目的**: 解耦组件，便于测试和维护

```python
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.repositories.market_repository import MarketRepository
from app.repositories.user_repository import UserRepository
from app.services.market_service import MarketService
from app.lib.openai_client import OpenAIClient
from app.lib.redis_client import RedisClient

# 依赖工厂函数
def get_market_repository(db: AsyncSession = Depends(get_db)) -> MarketRepository:
    return MarketRepository(db)

def get_user_repository(db: AsyncSession = Depends(get_db)) -> UserRepository:
    return UserRepository(db)

def get_openai_client() -> OpenAIClient:
    return OpenAIClient()

def get_redis_client() -> RedisClient:
    return RedisClient()

def get_market_service(
    market_repo: MarketRepository = Depends(get_market_repository),
    user_repo: UserRepository = Depends(get_user_repository),
    openai: OpenAIClient = Depends(get_openai_client),
    redis: RedisClient = Depends(get_redis_client)
) -> MarketService:
    return MarketService(market_repo, user_repo, openai, redis)

# 在路由中使用
from fastapi import APIRouter

router = APIRouter()

@router.get("/search")
async def search_markets(
    query: str,
    service: MarketService = Depends(get_market_service)
):
    results = await service.search_markets(query)
    return {"success": True, "data": results}
```

## Database Optimization Patterns

### 1. N+1 Query Prevention (防止 N+1 查询)

#### ❌ 错误：N+1 查询

```python
# 1 次查询获取市场
markets = await market_repo.find_all()

# N 次查询获取创建者（每个市场一次）
for market in markets:
    market.creator = await user_repo.find_by_id(market.creator_id)
```

#### ✅ 正确：批量查询

```python
# 1 次查询获取市场
markets = await market_repo.find_all()

# 1 次查询获取所有创建者
creator_ids = [m.creator_id for m in markets]
creators = await user_repo.find_by_ids(creator_ids)

# 构建映射
creator_map = {c.id: c for c in creators}

# 关联数据
for market in markets:
    market.creator = creator_map.get(market.creator_id)
```

### 2. Select Only Needed Columns (只查询需要的列)

```python
# ❌ 查询所有列
markets = await db.execute(select(Market))

# ✅ 只查询需要的列
markets = await db.execute(
    select(Market.id, Market.name, Market.status, Market.volume)
)
```

### 3. Pagination (分页)

```python
async def find_paginated(
    self,
    page: int = 1,
    page_size: int = 20,
    **filters
) -> tuple[List[Market], int]:
    """分页查询"""
    # 构建基础查询
    query = select(Market)
    
    # 应用过滤
    if filters.get('status'):
        query = query.where(Market.status == filters['status'])
    
    # 计算总数
    count_query = select(func.count()).select_from(query.subquery())
    total = await self.db.scalar(count_query)
    
    # 应用分页
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    
    # 执行查询
    result = await self.db.execute(query)
    items = result.scalars().all()
    
    return items, total
```

## Caching Strategies (缓存策略)

### 1. Cache-Aside Pattern (旁路缓存)

```python
from typing import Optional
import json
from redis.asyncio import Redis

class CachedMarketRepository:
    """带缓存的市场仓储"""
    
    def __init__(self, base_repo: MarketRepository, redis: Redis):
        self.base_repo = base_repo
        self.redis = redis
        self.cache_ttl = 300  # 5 分钟
    
    async def find_by_id(self, id: str) -> Optional[Market]:
        """查询市场（带缓存）"""
        cache_key = f"market:{id}"
        
        # 1. 尝试从缓存读取
        cached = await self.redis.get(cache_key)
        if cached:
            return Market.parse_raw(cached)
        
        # 2. 缓存未命中，从数据库查询
        market = await self.base_repo.find_by_id(id)
        
        # 3. 写入缓存
        if market:
            await self.redis.setex(
                cache_key,
                self.cache_ttl,
                market.json()
            )
        
        return market
    
    async def invalidate_cache(self, id: str):
        """使缓存失效"""
        await self.redis.delete(f"market:{id}")
    
    async def update(self, id: str, data: MarketUpdate) -> Market:
        """更新市场并使缓存失效"""
        market = await self.base_repo.update(id, data)
        await self.invalidate_cache(id)
        return market
```

### 2. Write-Through Cache (写穿缓存)

```python
async def create(self, data: MarketCreate) -> Market:
    """创建市场并写入缓存"""
    # 1. 写入数据库
    market = await self.base_repo.create(data)
    
    # 2. 同时写入缓存
    cache_key = f"market:{market.id}"
    await self.redis.setex(
        cache_key,
        self.cache_ttl,
        market.json()
    )
    
    return market
```

### 3. Cache Warming (缓存预热)

```python
async def warm_cache(self):
    """预热热门市场缓存"""
    # 获取热门市场
    hot_markets = await self.base_repo.find_all(
        order_by='volume',
        limit=100
    )
    
    # 批量写入缓存
    pipeline = self.redis.pipeline()
    for market in hot_markets:
        cache_key = f"market:{market.id}"
        pipeline.setex(cache_key, self.cache_ttl, market.json())
    
    await pipeline.execute()
```

## Error Handling Patterns (错误处理模式)

### 1. Custom Exception Hierarchy (自定义异常层次)

```python
class AppException(Exception):
    """应用基础异常"""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

class NotFoundError(AppException):
    """资源未找到"""
    def __init__(self, resource: str, id: str):
        super().__init__(
            f"{resource} with id {id} not found",
            status_code=404
        )

class ValidationError(AppException):
    """验证错误"""
    def __init__(self, message: str):
        super().__init__(message, status_code=400)

class PermissionError(AppException):
    """权限错误"""
    def __init__(self, message: str = "Permission denied"):
        super().__init__(message, status_code=403)

class ServiceUnavailableError(AppException):
    """服务不可用"""
    def __init__(self, service: str):
        super().__init__(
            f"{service} is currently unavailable",
            status_code=503
        )
```

### 2. Centralized Error Handler (集中错误处理)

```python
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

async def app_exception_handler(request: Request, exc: AppException):
    """应用异常处理器"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.message
        }
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """验证异常处理器"""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": "Validation failed",
            "details": exc.errors()
        }
    )

async def generic_exception_handler(request: Request, exc: Exception):
    """通用异常处理器"""
    logger.exception(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "Internal server error"
        }
    )

# 注册异常处理器
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)
```

### 3. Retry with Exponential Backoff (指数退避重试)

```python
import asyncio
from typing import TypeVar, Callable

T = TypeVar('T')

async def retry_with_backoff(
    func: Callable[[], T],
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0
) -> T:
    """带指数退避的重试"""
    last_exception = None
    
    for attempt in range(max_retries):
        try:
            return await func()
        except Exception as e:
            last_exception = e
            
            if attempt < max_retries - 1:
                # 计算延迟：1s, 2s, 4s, 8s...
                delay = min(base_delay * (2 ** attempt), max_delay)
                logger.warning(
                    f"Attempt {attempt + 1} failed, retrying in {delay}s: {e}"
                )
                await asyncio.sleep(delay)
    
    raise last_exception

# 使用
async def fetch_external_data():
    return await retry_with_backoff(
        lambda: external_api.get_data(),
        max_retries=3
    )
```

## Authentication & Authorization (认证授权)

### 1. JWT Token Pattern

```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict) -> str:
    """创建访问令牌"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> dict:
    """验证令牌"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise PermissionError("Invalid token")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password: str) -> str:
    """哈希密码"""
    return pwd_context.hash(password)
```

### 2. Permission-Based Access Control

```python
from enum import Enum
from typing import List

class Permission(str, Enum):
    READ = "read"
    WRITE = "write"
    DELETE = "delete"
    ADMIN = "admin"

class Role(str, Enum):
    USER = "user"
    MODERATOR = "moderator"
    ADMIN = "admin"

ROLE_PERMISSIONS = {
    Role.USER: [Permission.READ, Permission.WRITE],
    Role.MODERATOR: [Permission.READ, Permission.WRITE, Permission.DELETE],
    Role.ADMIN: [Permission.READ, Permission.WRITE, Permission.DELETE, Permission.ADMIN]
}

def has_permission(user_role: Role, required_permission: Permission) -> bool:
    """检查用户是否有权限"""
    return required_permission in ROLE_PERMISSIONS.get(user_role, [])

def require_permission(permission: Permission):
    """权限装饰器"""
    def decorator(func):
        async def wrapper(*args, current_user, **kwargs):
            if not has_permission(current_user.role, permission):
                raise PermissionError(f"Permission {permission} required")
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator

# 使用
@router.delete("/{market_id}")
@require_permission(Permission.DELETE)
async def delete_market(market_id: str, current_user: User):
    # 只有有删除权限的用户可以访问
    pass
```

## Rate Limiting (速率限制)

```python
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, List

class RateLimiter:
    """简单的内存速率限制器"""
    
    def __init__(self):
        self.requests: Dict[str, List[datetime]] = defaultdict(list)
    
    async def check_limit(
        self,
        identifier: str,
        max_requests: int,
        window_seconds: int
    ) -> bool:
        """检查是否超过速率限制"""
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=window_seconds)
        
        # 获取时间窗口内的请求
        requests = self.requests[identifier]
        recent_requests = [r for r in requests if r > window_start]
        
        # 检查是否超限
        if len(recent_requests) >= max_requests:
            return False
        
        # 记录当前请求
        recent_requests.append(now)
        self.requests[identifier] = recent_requests
        
        return True

# 使用
limiter = RateLimiter()

@router.post("/search")
async def search(query: str, request: Request):
    # 获取客户端 IP
    client_ip = request.client.host
    
    # 检查速率限制：每分钟 60 次
    allowed = await limiter.check_limit(client_ip, 60, 60)
    
    if not allowed:
        raise AppException("Rate limit exceeded", status_code=429)
    
    # 处理请求
    results = await search_service.search(query)
    return {"success": True, "data": results}
```

## Background Jobs (后台任务)

```python
from fastapi import BackgroundTasks

async def send_email(email: str, subject: str, body: str):
    """发送邮件（后台任务）"""
    # 实现邮件发送逻辑
    await email_service.send(email, subject, body)

@router.post("/markets")
async def create_market(
    data: MarketCreate,
    background_tasks: BackgroundTasks,
    current_user: User
):
    """创建市场"""
    # 创建市场
    market = await market_service.create(data, current_user.id)
    
    # 添加后台任务
    background_tasks.add_task(
        send_email,
        current_user.email,
        "Market Created",
        f"Your market {market.name} has been created"
    )
    
    background_tasks.add_task(
        index_market_vectors,
        market.id
    )
    
    return {"success": True, "data": market}
```

## Logging & Monitoring (日志和监控)

```python
import logging
from typing import Any, Dict

# 配置结构化日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

class StructuredLogger:
    """结构化日志记录器"""
    
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
    
    def log(self, level: str, message: str, **context):
        """记录结构化日志"""
        log_entry = {
            "message": message,
            **context
        }
        
        getattr(self.logger, level)(log_entry)
    
    def info(self, message: str, **context):
        self.log("info", message, **context)
    
    def error(self, message: str, error: Exception = None, **context):
        if error:
            context["error"] = str(error)
            context["error_type"] = type(error).__name__
        self.log("error", message, **context)

# 使用
logger = StructuredLogger(__name__)

@router.get("/markets/{market_id}")
async def get_market(market_id: str, request: Request):
    logger.info(
        "Fetching market",
        market_id=market_id,
        client_ip=request.client.host,
        user_agent=request.headers.get("user-agent")
    )
    
    try:
        market = await market_service.get_by_id(market_id)
        return {"success": True, "data": market}
    except Exception as e:
        logger.error(
            "Failed to fetch market",
            error=e,
            market_id=market_id
        )
        raise
```

## Best Practices Summary

### Architecture
- ✅ 使用分层架构（Repository → Service → Controller）
- ✅ 依赖注入解耦组件
- ✅ 接口定义清晰的契约

### Database
- ✅ 防止 N+1 查询
- ✅ 只查询需要的列
- ✅ 使用索引优化查询
- ✅ 实现分页避免大结果集

### Caching
- ✅ 缓存热点数据
- ✅ 设置合理的 TTL
- ✅ 更新时使缓存失效
- ✅ 实现降级策略

### Error Handling
- ✅ 自定义异常层次
- ✅ 集中异常处理
- ✅ 记录详细错误日志
- ✅ 返回友好错误消息

### Security
- ✅ 验证所有输入
- ✅ 实现认证授权
- ✅ 使用速率限制
- ✅ 记录安全事件

---

**记住：好的架构模式让代码易于理解、测试和维护。选择适合项目复杂度的模式。**

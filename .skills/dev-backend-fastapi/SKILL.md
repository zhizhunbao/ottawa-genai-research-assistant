---
name: dev-backend-fastapi
description: FastAPI 后端开发专家。Use when (1) 构建 FastAPI 应用, (2) 设计 API 端点, (3) 实现依赖注入, (4) 异步编程, (5) 数据验证和序列化, (6) 认证授权
---

# FastAPI Backend Development Expert

## Objectives

- 构建高性能、可维护的 FastAPI 应用
- 实现清晰的项目结构和代码组织
- 掌握异步编程和依赖注入
- 实现安全的认证和授权
- 优化性能和错误处理

## Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI 应用入口
│   ├── core/                   # 核心配置
│   │   ├── config.py          # 配置管理
│   │   ├── security.py        # 安全相关
│   │   └── dependencies.py    # 全局依赖
│   ├── api/                    # API 路由
│   │   ├── deps.py            # API 依赖
│   │   └── v1/                # API v1
│   │       └── endpoints/
│   ├── models/                 # 数据模型
│   │   ├── domain/            # 领域模型
│   │   └── schemas/           # Pydantic schemas
│   ├── services/              # 业务逻辑层
│   ├── repositories/          # 数据访问层
│   ├── db/                    # 数据库
│   ├── middleware/            # 中间件
│   └── utils/                 # 工具函数
├── tests/                     # 测试
├── alembic/                   # 数据库迁移
└── pyproject.toml            # 依赖管理
```

## Core Patterns

### 1. Application Setup

**main.py**:
```python
from fastapi import FastAPI
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: 初始化数据库、缓存等
    yield
    # Shutdown: 清理资源

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS
app.add_middleware(CORSMiddleware, allow_origins=settings.BACKEND_CORS_ORIGINS)

# Include routers
app.include_router(api_router, prefix=settings.API_V1_STR)
```

### 2. Configuration Management

**core/config.py**:
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "RAG Research Assistant"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str
    
    # Azure Services
    AZURE_OPENAI_ENDPOINT: str
    AZURE_OPENAI_KEY: str
    AZURE_SEARCH_ENDPOINT: str
    AZURE_STORAGE_CONNECTION_STRING: str
    
    # Security
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
```

### 3. Dependency Injection

**api/deps.py**:
```python
from typing import Annotated
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)]
) -> User:
    payload = verify_token(token)
    user = user_service.get_by_id(payload.get("sub"))
    if not user:
        raise HTTPException(status_code=401)
    return user

# Type aliases
DBSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]
```

### 4. Pydantic Schemas

**models/schemas/document.py**:
```python
from pydantic import BaseModel, Field, ConfigDict

class DocumentBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class DocumentResponse(DocumentBase):
    id: str
    user_id: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
```

### 5. API Endpoints

**api/v1/endpoints/documents.py**:
```python
from fastapi import APIRouter, HTTPException, status

router = APIRouter()

@router.post("/", response_model=DocumentResponse, status_code=201)
async def create_document(
    document: DocumentCreate,
    db: DBSession,
    current_user: CurrentUser
):
    service = DocumentService(db)
    return service.create(document, user_id=current_user.id)

@router.get("/", response_model=DocumentListResponse)
async def list_documents(
    db: DBSession,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 10
):
    service = DocumentService(db)
    items = service.get_multi(user_id=current_user.id, skip=skip, limit=limit)
    total = service.count(user_id=current_user.id)
    return DocumentListResponse(items=items, total=total, page=skip//limit+1, page_size=limit)

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: str, db: DBSession, current_user: CurrentUser):
    service = DocumentService(db)
    document = service.get_by_id(document_id)
    if not document or document.user_id != current_user.id:
        raise HTTPException(status_code=404)
    return document
```

**For complete endpoint examples:** See `references/api-endpoints.md`

### 6. Service Layer

**services/document_service.py**:
```python
class DocumentService:
    def __init__(self, db: Session):
        self.repo = DocumentRepository(db)
    
    def create(self, document: DocumentCreate, user_id: str) -> Document:
        return self.repo.create(document, user_id=user_id)
    
    def get_by_id(self, document_id: str) -> Optional[Document]:
        return self.repo.get_by_id(document_id)
    
    def get_multi(self, user_id: str, skip: int = 0, limit: int = 10) -> List[Document]:
        return self.repo.get_multi(user_id=user_id, skip=skip, limit=limit)
```

### 7. Repository Pattern

**repositories/base.py**:
```python
from typing import Generic, TypeVar, Type, Optional, List

ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], db: Session):
        self.model = model
        self.db = db
    
    def get_by_id(self, id: str) -> Optional[ModelType]:
        return self.db.query(self.model).filter(self.model.id == id).first()
    
    def create(self, obj_in: BaseModel, **kwargs) -> ModelType:
        obj_data = obj_in.model_dump()
        obj_data.update(kwargs)
        db_obj = self.model(**obj_data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
```

**For complete repository implementation:** See `references/repository-pattern.md`

### 8. Error Handling

**middleware/error_handler.py**:
```python
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except ValueError as e:
            return JSONResponse(status_code=400, content={"detail": str(e)})
        except Exception as e:
            logger.exception(f"Unhandled exception: {e}")
            return JSONResponse(status_code=500, content={"detail": "Internal server error"})
```

### 9. Async Operations

```python
import asyncio

async def process_documents_batch(documents: List[str]) -> List[dict]:
    tasks = [process_single_document(doc) for doc in documents]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return [r for r in results if not isinstance(r, Exception)]
```

## Best Practices

### 1. Type Hints
```python
async def get_user(user_id: str) -> Optional[User]:
    pass
```

### 2. Data Validation
```python
from pydantic import BaseModel, Field, validator

class UserCreate(BaseModel):
    email: str = Field(..., regex=r"^[\w\.-]+@[\w\.-]+\.\w+$")
    password: str = Field(..., min_length=8)
    
    @validator('password')
    def password_strength(cls, v):
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        return v
```

### 3. Exception Handling
```python
from fastapi import HTTPException, status

if not document:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Document {document_id} not found"
    )
```

### 4. Logging
```python
import logging

logger = logging.getLogger(__name__)

async def process_request(data: dict):
    logger.info(f"Processing request: {data}")
    try:
        result = await some_operation(data)
        logger.info("Request processed successfully")
        return result
    except Exception as e:
        logger.error(f"Failed to process request: {e}", exc_info=True)
        raise
```

## Testing

**Unit Test Example**:
```python
def test_create_document(client, auth_headers):
    response = client.post(
        "/api/v1/documents/",
        json={"title": "Test", "content": "Content"},
        headers=auth_headers
    )
    assert response.status_code == 201
    assert response.json()["title"] == "Test"
```

**For complete testing guide:** See `references/testing-guide.md`

## Dependencies

```bash
# Core
uv add fastapi uvicorn[standard]

# Database
uv add sqlalchemy alembic psycopg2-binary

# Validation
uv add pydantic pydantic-settings

# Security
uv add python-jose[cryptography] passlib[bcrypt] python-multipart

# Testing
uv add --dev pytest pytest-asyncio httpx
```

## Quick Start Checklist

- [ ] 创建项目结构
- [ ] 配置环境变量（.env）
- [ ] 设置数据库连接
- [ ] 实现认证系统
- [ ] 创建 API 端点
- [ ] 添加中间件
- [ ] 编写测试
- [ ] 配置日志

## References

**For detailed examples and patterns:**
- `references/api-endpoints.md` - Complete API endpoint examples
- `references/repository-pattern.md` - Repository implementation details
- `references/testing-guide.md` - Comprehensive testing strategies
- `references/async-patterns.md` - Advanced async programming patterns

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)

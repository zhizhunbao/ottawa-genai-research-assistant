# ⚡ A. Backend Templates (FastAPI / Python)

> **层级**: Backend | **模板数**: 18 (core: 6 + domain: 9 + shared: 3)
> **主要参考**: [full-stack-fastapi-template](../../.github/references/full-stack-fastapi-template/) + [fastapi-best-practices](../../.github/references/fastapi-best-practices/)

基于 Netflix/Dispatch 的 **每域一包** 结构。

---

## Core Templates (全局共享基础设施)

### A1. `core/config.py.template` — 全局配置

> **来源**: [`full-stack-fastapi-template/backend/app/core/config.py`](../../.github/references/full-stack-fastapi-template/backend/app/core/config.py)

```python
# 核心模式:
class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True, extra="ignore")

    ENVIRONMENT: Literal["local", "staging", "production"] = "local"
    PROJECT_NAME: str
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    BACKEND_CORS_ORIGINS: Annotated[list[AnyUrl] | str, BeforeValidator(parse_cors)] = []
    SENTRY_DSN: HttpUrl | None = None

    # computed_field 自动组合 DB URL
    @computed_field
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> PostgresDsn: ...

    # model_validator 强制生产环境不使用默认密钥
    @model_validator(mode="after")
    def _enforce_non_default_secrets(self) -> Self: ...

settings = Settings()
```

**关键特性**:

- `SettingsConfigDict` 自动读取 `.env`
- `@computed_field` 组合派生配置
- `@model_validator` 安全检查 (禁止生产环境用默认密钥)
- `parse_cors` 支持逗号分隔字符串和列表两种格式

---

### A2. `core/base_schema.py.template` — 自定义 BaseModel

> **来源**: [`fastapi-best-practices` § Custom Base Model](../../.github/references/fastapi-best-practices/README.md)

```python
# 核心模式:
class CustomModel(BaseModel):
    model_config = ConfigDict(
        json_encoders={datetime: datetime_to_gmt_str},
        populate_by_name=True,
    )

    def serializable_dict(self, **kwargs):
        """Return a dict which contains only serializable fields."""
        default_dict = self.model_dump()
        return jsonable_encoder(default_dict)
```

**关键特性**:

- 全局统一 datetime 序列化格式 (GMT with timezone)
- `populate_by_name=True` 支持 alias 和原字段名
- `serializable_dict()` 确保 JSON 安全输出

---

### A3. `core/exceptions.py.template` — 全局异常体系

> **来源**: [`fastapi-best-practices` § Project Structure](../../.github/references/fastapi-best-practices/README.md)

```python
# 核心模式:
class AppException(Exception):
    def __init__(self, message, error_code="INTERNAL_ERROR", status_code=500, data=None): ...

class EntityNotFoundException(AppException): ...    # 404
class ValidationException(AppException): ...        # 422
class PermissionDeniedException(AppException): ...  # 403
class RateLimitException(AppException): ...          # 429
```

**关键特性**:

- 统一的 `error_code` 字符串（如 `"USER_NOT_FOUND"`），便于前端匹配
- 从 HTTPException 解耦，Service 层不依赖 FastAPI

---

### A4. `core/security.py.template` — 认证安全

> **来源**: [`full-stack-fastapi-template/backend/app/core/security.py`](../../.github/references/full-stack-fastapi-template/backend/app/core/security.py)

```python
# 核心模式:
def create_access_token(subject: str, expires_delta: timedelta) -> str: ...
def verify_password(plain_password: str, hashed_password: str) -> tuple[bool, str | None]: ...
def get_password_hash(password: str) -> str: ...
```

**关键特性**:

- JWT encode/decode (HS256)
- 密码哈希 (Argon2 + Bcrypt fallback)
- `verify_and_update` 自动升级旧哈希算法

---

### A5. `core/database.py.template` — 数据库连接

> **来源**: [`full-stack-fastapi-template/backend/app/core/db.py`](../../.github/references/full-stack-fastapi-template/backend/app/core/db.py)

```python
# 核心模式:
engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))

def init_db(session: Session) -> None:
    """Initialize DB with seed data (e.g., first superuser)."""
    ...
```

**关键特性**:

- 从 `config.py` 读取数据库 URI
- `init_db()` 种子数据初始化

---

### A6. `core/document_store.py.template` — 通用文档存储

> **来源**:
>
> - [LangChain Protocol](https://python.langchain.com/docs/modules/data_connection/document_loaders/): `Document` 基类规范。
> - [Dify.ai Architecture](https://github.com/langgenius/dify): 集成 SQL + JSONB 的元数据存储模式。
> - [dev-backend_patterns]: 本地开发规范。

```python
# 核心模式: 关系型大表 + JSONB 元数据
"""
适用场景: RAG 知识库、Agent Memory、非结构化爬虫结果。
科学依据: 在数据 Schema 频繁变化的 AI 时代，通过 JSON 字段规避频繁的数据库迁移 (Migrations)。
"""
class DocumentStore(Generic[T]):
    async def create(self, doc_type: str, data: dict, ...): ...
    async def get_by_id(self, doc_id: str): ...
    async def update_json_data(self, doc_id: str, data: dict): ...
```

---

## Domain Templates (Per-domain 模块标准文件集)

### A7. `domain/router.py.template` — API 路由

> **来源**: [`full-stack-fastapi-template/backend/app/api/routes/items.py`](../../.github/references/full-stack-fastapi-template/backend/app/api/routes/items.py) + [`fastapi-best-practices` § Follow the REST](../../.github/references/fastapi-best-practices/README.md)

```python
# 核心模式:
router = APIRouter(prefix="/{{feature_name}}s", tags=["{{feature_name}}s"])

@router.get("/", response_model={{FeatureName}}sPublic)
def read_items(session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100): ...

@router.get("/{id}", response_model={{FeatureName}}Public)
def read_item(session: SessionDep, current_user: CurrentUser, id: uuid.UUID): ...

@router.post("/", response_model={{FeatureName}}Public)
def create_item(*, session: SessionDep, current_user: CurrentUser, item_in: {{FeatureName}}Create): ...

@router.put("/{id}", response_model={{FeatureName}}Public)
def update_item(*, session: SessionDep, current_user: CurrentUser, id: uuid.UUID, item_in: {{FeatureName}}Update): ...

@router.delete("/{id}")
def delete_item(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Message: ...
```

**关键特性**:

- `Annotated` 类型别名 (`SessionDep`, `CurrentUser`) 简化签名
- 完整 CRUD 五件套
- `response_model` 精确控制响应
- 权限检查内嵌 (superuser vs owner)

---

### A8. `domain/schemas.py.template` — Pydantic 模型

> **来源**: [`full-stack-fastapi-template/backend/app/models.py`](../../.github/references/full-stack-fastapi-template/backend/app/models.py)

```python
# 核心模式: Base → Create / Update / Public (分层 Schema)
class {{FeatureName}}Base(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)

class {{FeatureName}}Create({{FeatureName}}Base): ...
class {{FeatureName}}Update({{FeatureName}}Base):
    title: str | None = Field(default=None)       # 所有字段可选
class {{FeatureName}}Public({{FeatureName}}Base):
    id: uuid.UUID
    created_at: datetime | None = None
class {{FeatureName}}sPublic(BaseModel):
    data: list[{{FeatureName}}Public]
    count: int
```

**关键特性**:

- **分层继承**: Base → Create (必填) → Update (可选) → Public (含 ID)
- `str | None` 现代类型标注
- `Field(min_length=..., max_length=...)` 声明式验证
- `{{FeatureName}}sPublic` 统一列表响应格式 (data + count)

---

### A9. `domain/models.py.template` — 数据库模型

> **来源**: [`full-stack-fastapi-template/backend/app/models.py`](../../.github/references/full-stack-fastapi-template/backend/app/models.py)

```python
# 核心模式:
class {{FeatureName}}({{FeatureName}}Base, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_type=DateTime(timezone=True),
    )
    owner_id: uuid.UUID = Field(foreign_key="user.id", nullable=False, ondelete="CASCADE")
```

**关键特性**:

- `uuid.UUID` 主键 (非自增 int)
- `created_at` 自动填充 UTC 时间
- `CASCADE` 外键级联删除

---

### A10. `domain/service.py.template` — 业务逻辑层

> **来源**: [`fastapi-best-practices` § Project Structure](../../.github/references/fastapi-best-practices/README.md) (Netflix/Dispatch Service 模式)

```python
# 核心模式:
class {{FeatureName}}Service:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def list(self, skip: int = 0, limit: int = 20) -> {{FeatureName}}List: ...
    async def get(self, id: str) -> {{FeatureName}}Response | None: ...
    async def create(self, data: {{FeatureName}}Create) -> {{FeatureName}}Response: ...
    async def update(self, id: str, data: {{FeatureName}}Update) -> {{FeatureName}}Response | None: ...
    async def delete(self, id: str) -> bool: ...
```

**关键特性**:

- Class-based (支持 DI)
- Async-First
- 与 Router 分离 (Router 只做 HTTP 适配)

---

### A11. `domain/dependencies.py.template` — 依赖注入

> **来源**: [`full-stack-fastapi-template/backend/app/api/deps.py`](../../.github/references/full-stack-fastapi-template/backend/app/api/deps.py) + [`fastapi-best-practices` § Dependencies](../../.github/references/fastapi-best-practices/README.md)

```python
# 核心模式:
# 1. Annotated 类型别名
SessionDep = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]

# 2. 实体验证依赖 (链式)
async def valid_post_id(post_id: UUID4) -> dict:
    post = await service.get_by_id(post_id)
    if not post:
        raise PostNotFound()
    return post

# 3. 权限守卫 (链式)
async def valid_owned_post(
    post: dict = Depends(valid_post_id),
    token_data: dict = Depends(parse_jwt_data),
) -> dict: ...
```

**关键特性**:

- `Annotated[X, Depends(Y)]` 语法，PEP 593 标准
- 实体存在性验证抽到依赖中，路由不重复写
- 链式依赖：`valid_owned_post` → `valid_post_id` → `parse_jwt_data`
- FastAPI 自动缓存依赖结果 (同一请求内)

---

### A12. `domain/constants.py.template` — 常量与错误码

> **来源**: [`fastapi-best-practices` § Project Structure](../../.github/references/fastapi-best-practices/README.md) (`src/posts/constants.py`)

```python
# 核心模式:
from enum import StrEnum

class ErrorCode(StrEnum):
    NOT_FOUND = "{{FEATURE_NAME}}_NOT_FOUND"
    ALREADY_EXISTS = "{{FEATURE_NAME}}_ALREADY_EXISTS"
    PERMISSION_DENIED = "{{FEATURE_NAME}}_PERMISSION_DENIED"
```

**关键特性**:

- Per-module 错误码，避免全局命名冲突
- `StrEnum` 可直接序列化为 JSON 字符串

---

### A13. `domain/exceptions.py.template` — 模块级异常

> **来源**: [`fastapi-best-practices` § Project Structure](../../.github/references/fastapi-best-practices/README.md) (`src/posts/exceptions.py`)

```python
# 核心模式:
from app.core.exceptions import AppException
from app.{{feature_name}}.constants import ErrorCode

class {{FeatureName}}NotFound(AppException):
    def __init__(self, id: str):
        super().__init__(
            message=f"{{FeatureName}} {id} not found",
            error_code=ErrorCode.NOT_FOUND,
            status_code=404,
        )
```

---

### A14. `domain/utils.py.template` — 工具函数

> **来源**: [`fastapi-best-practices` § Project Structure](../../.github/references/fastapi-best-practices/README.md) + [`full-stack-fastapi-template/backend/app/utils.py`](../../.github/references/full-stack-fastapi-template/backend/app/utils.py)

```python
# 核心模式: 非业务逻辑的辅助函数
def normalize_response(data: dict) -> dict: ...
def render_email_template(*, template_name: str, context: dict) -> str: ...
```

---

## Shared Templates (跨域共享)

### A15. `crud.py.template` — 通用 CRUD

> **来源**: [`full-stack-fastapi-template/backend/app/crud.py`](../../.github/references/full-stack-fastapi-template/backend/app/crud.py)

```python
# 核心模式: 纯函数式 CRUD (适合轻量场景)
def create_item(*, session: Session, item_in: ItemCreate, owner_id: uuid.UUID) -> Item:
    db_item = Item.model_validate(item_in, update={"owner_id": owner_id})
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return db_item

def update_item(*, session: Session, db_item: Item, item_in: ItemUpdate) -> Item:
    update_data = item_in.model_dump(exclude_unset=True)  # 部分更新
    db_item.sqlmodel_update(update_data)
    ...
```

**关键特性**:

- `model_validate(input, update={...})` 一步创建
- `model_dump(exclude_unset=True)` 部分更新
- 纯函数 (无类)，与 class-based Service 互补

---

### A16. `middleware.py.template` — 中间件

> **来源**: [`fastapi-best-practices` § Miscellaneous](../../.github/references/fastapi-best-practices/README.md) + [`full-stack-fastapi-template/backend/app/main.py`](../../.github/references/full-stack-fastapi-template/backend/app/main.py)

```python
# 核心模式:
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        request_id = str(uuid.uuid4())[:8]
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

# CORS 中间件 (来自 full-stack-fastapi-template)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.all_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### A17. `main.py.template` — 应用入口

> **来源**: [`full-stack-fastapi-template/backend/app/main.py`](../../.github/references/full-stack-fastapi-template/backend/app/main.py)

```python
# 核心模式:
def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}"

if settings.SENTRY_DSN and settings.ENVIRONMENT != "local":
    sentry_sdk.init(dsn=str(settings.SENTRY_DSN), enable_tracing=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
)
```

**关键特性**:

- 按环境控制 OpenAPI docs 显示
- Sentry 集成 (仅非 local 环境)
- 自定义 OpenAPI operationId 生成

---

# ☁️ F. Azure / Cloud Templates

> **层级**: Azure / Cloud | **模板数**: 6
> **主要参考**: [azure-search-openai-demo](../../.github/references/azure-search-openai-demo/) (⭐ 6k+)

基于微软官方 azure-search-openai-demo 提炼的平台级通用模式。

---

### F1. `azure/credential.py.template` — 分级凭据管理

> **来源**: [`azure-search-openai-demo/app/backend/app.py` § setup_clients](../../.github/references/azure-search-openai-demo/app/backend/app.py) (L477-501)

```python
# 核心模式: 生产环境用 ManagedIdentity，开发环境用 AzureDeveloperCLI
from azure.identity.aio import (
    AzureDeveloperCliCredential,
    ManagedIdentityCredential,
    get_bearer_token_provider,
)

def create_azure_credential(
    running_on_azure: bool,
    tenant_id: str | None = None,
    client_id: str | None = None,
) -> AzureDeveloperCliCredential | ManagedIdentityCredential:
    if running_on_azure:
        return ManagedIdentityCredential(client_id=client_id) if client_id \
            else ManagedIdentityCredential()
    elif tenant_id:
        return AzureDeveloperCliCredential(tenant_id=tenant_id, process_timeout=60)
    else:
        return AzureDeveloperCliCredential(process_timeout=60)

def create_token_provider(credential, scope="https://cognitiveservices.azure.com/.default"):
    return get_bearer_token_provider(credential, scope)
```

**关键特性**:

- 生产环境自动使用 Managed Identity，零密码
- 开发环境回退到 `azd auth login`
- `get_bearer_token_provider` 提供统一的 token 获取接口
- `RUNNING_ON_AZURE` 通过 `WEBSITE_HOSTNAME` 或 `RUNNING_IN_PRODUCTION` 环境变量判断

---

### F2. `azure/prompt_manager.py.template` — Jinja2 Prompt 管理器

> **来源**: [`azure-search-openai-demo/app/backend/approaches/promptmanager.py`](../../.github/references/azure-search-openai-demo/app/backend/approaches/promptmanager.py)

```python
# 核心模式: 用 Jinja2 渲染 Prompt，支持 OpenAI ChatCompletion 类型
from jinja2 import Environment, FileSystemLoader
from openai.types.chat import (
    ChatCompletionMessageParam,
    ChatCompletionSystemMessageParam,
    ChatCompletionToolParam,
)

class PromptManager:
    PROMPTS_DIRECTORY = pathlib.Path(__file__).parent / "prompts"

    def __init__(self):
        self.env = Environment(
            loader=FileSystemLoader(self.PROMPTS_DIRECTORY),
            autoescape=False, trim_blocks=True, lstrip_blocks=True,
        )

    def build_system_prompt(self, template_path, template_variables) -> ChatCompletionSystemMessageParam: ...
    def build_user_prompt(self, template_path, template_variables, image_sources=None) -> ChatCompletionUserMessageParam: ...
    def build_conversation(self, system_template_path, ..., past_messages=None) -> list[ChatCompletionMessageParam]: ...
    def load_tools(self, path) -> list[ChatCompletionToolParam]: ...
```

**关键特性**:

- Prompt 外部化为 `.jinja2` 文件，非硬编码
- 直接返回 OpenAI SDK 类型 (`ChatCompletionSystemMessageParam`)
- 支持多模态 (image_sources)
- `load_tools()` 从 JSON 文件加载 Function Calling 定义
- 与 MetaGPT 的 `prompt_registry.yaml` 互补：这个更偷重运行时渲染

---

### F3. `azure/openai_error.py.template` — OpenAI 错误适配

> **来源**: [`azure-search-openai-demo/app/backend/error.py`](../../.github/references/azure-search-openai-demo/app/backend/error.py)

```python
# 核心模式: 将 OpenAI APIError 转换为用户友好的错误响应
from openai import APIError

ERROR_MESSAGE_FILTER = "Your message contains content that was flagged by the content filter."
ERROR_MESSAGE_LENGTH = "Your message exceeded the context length limit."

def error_dict(error: Exception) -> dict:
    if isinstance(error, APIError) and error.code == "content_filter":
        return {"error": ERROR_MESSAGE_FILTER}
    if isinstance(error, APIError) and error.code == "context_length_exceeded":
        return {"error": ERROR_MESSAGE_LENGTH}
    return {"error": f"Error type: {type(error).__name__}"}

def error_response(error: Exception, route: str, status_code: int = 500):
    logging.exception("Exception in %s: %s", route, error)
    if isinstance(error, APIError) and error.code == "content_filter":
        status_code = 400
    return jsonify(error_dict(error)), status_code
```

**关键特性**:

- `content_filter` → 400 (Bad Request)，而非 500
- `context_length_exceeded` 提示用户缩短消息
- 统一的 `{"error": "..."}` JSON 格式

---

### F4. `azure/auth_decorator.py.template` — 认证装饰器

> **来源**: [`azure-search-openai-demo/app/backend/decorators.py`](../../.github/references/azure-search-openai-demo/app/backend/decorators.py) + [`core/authentication.py`](../../.github/references/azure-search-openai-demo/app/backend/core/authentication.py)

```python
# 核心模式: @authenticated 装饰器，解析 Authorization Header 到 auth_claims
from functools import wraps
from tenacity import AsyncRetrying, retry_if_exception_type, wait_random_exponential, stop_after_attempt

def authenticated(route_fn):
    @wraps(route_fn)
    async def auth_handler(*args, **kwargs):
        auth_helper = get_auth_client()  # 从 app config 获取
        auth_claims = await auth_helper.get_auth_claims_if_enabled(request.headers)
        return await route_fn(auth_claims, *args, **kwargs)
    return auth_handler

# AuthenticationHelper 核心方法:
# - get_token_auth_header(): 提取 Bearer Token
# - validate_access_token(): JWT 验证 (通过 Entra JWKS 端点)
# - get_auth_claims_if_enabled(): On-Behalf-Of Flow 交换 token
# - check_path_auth(): 资源级访问控制
```

**关键特性**:

- 支持 Entra ID (Azure AD) 的 On-Behalf-Of Flow
- `tenacity` 重试 JWKS 端点请求 (5xx 自动重试)
- 可配置的 `enable_unauthenticated_access` 回退策略
- `check_path_auth()` 实现文档级 ACL

---

### F5. `azure/observability.py.template` — 可观测性

> **来源**: [`azure-search-openai-demo/app/backend/app.py` § create_app](../../.github/references/azure-search-openai-demo/app/backend/app.py) (L747-768)

```python
# 核心模式: 一站式 Azure Monitor + OpenTelemetry 集成
from azure.monitor.opentelemetry import configure_azure_monitor
from opentelemetry.instrumentation.aiohttp_client import AioHttpClientInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
from opentelemetry.instrumentation.openai import OpenAIInstrumentor
from opentelemetry.instrumentation.asgi import OpenTelemetryMiddleware

def setup_observability(app, connection_string: str | None):
    if not connection_string:
        return
    configure_azure_monitor(
        instrumentation_options={"django": {"enabled": False}, "fastapi": {"enabled": False}}
    )
    AioHttpClientInstrumentor().instrument()  # 追踪 aiohttp 请求
    HTTPXClientInstrumentor().instrument()    # 追踪 httpx 请求
    OpenAIInstrumentor().instrument()         # 追踪 OpenAI SDK 调用
    app.asgi_app = OpenTelemetryMiddleware(app.asgi_app)  # ASGI 中间件
```

**关键特性**:

- `APPLICATIONINSIGHTS_CONNECTION_STRING` 环境变量驱动
- 自动追踪 aiohttp、httpx、OpenAI 的出站请求
- ASGI 中间件追踪所有入站请求
- 优雅降级：无 connection string 则不启用

---

### F6. `azure/streaming.py.template` — NDJSON 流式响应

> **来源**: [`azure-search-openai-demo/app/backend/app.py` § format_as_ndjson](../../.github/references/azure-search-openai-demo/app/backend/app.py) (L197-203)

```python
# 核心模式: 异步生成器 → NDJSON 流式 HTTP 响应
async def format_as_ndjson(r: AsyncGenerator[dict, None]) -> AsyncGenerator[str, None]:
    try:
        async for event in r:
            yield json.dumps(event, ensure_ascii=False, cls=JSONEncoder) + "\n"
    except Exception as error:
        logging.exception("Exception while generating response stream: %s", error)
        yield json.dumps({"error": str(error)})

# 路由中使用:
result = await approach.run_stream(messages, context=context)
response = await make_response(format_as_ndjson(result))
response.timeout = None
response.mimetype = "application/json-lines"
```

**关键特性**:

- NDJSON (每行一个 JSON + `\n`)，比 SSE 更简单
- 流中异常不丢失，转为 error JSON 输出
- `response.timeout = None` 确保长时间流不断开

---

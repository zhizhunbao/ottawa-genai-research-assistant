"""
FastAPI Application Entry Point

Main entry point for the Ottawa GenAI Research Assistant Backend.

@template A17 backend/main.py — FastAPI Entry (lifespan + CORS + routers + exception handler)
@reference full-stack-fastapi-template/backend/app/main.py
@reference fastapi-best-practices §1 Project Structure
"""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.admin.routes import router as admin_router
from app.analysis.routes import router as analysis_router
from app.analytics.routes import router as analytics_router
from app.benchmark.routes import router as benchmark_router
from app.chat.routes import router as chat_router
from app.models.routes import router as models_router
from app.prompts.routes import router as prompts_router
from app.search.admin_routes import router as search_admin_router
from app.core.config import settings
from app.core.database import init_db
from app.core.exceptions import AppError
from app.documents.folder_routes import router as folders_router
from app.documents.routes import router as documents_router
from app.documents.sync_routes import router as sync_router
from app.evaluation.routes import router as evaluation_router
from app.feedback.routes import router as feedback_router
from app.health.routes import router as health_router
from app.knowledge.routes import router as knowledge_router
from app.research.routes import router as research_router
from app.users.routes import router as users_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifecycle management."""
    # Startup
    print(f"Starting {settings.app_name}...")
    await init_db()

    # Seed defaults (unified initialization)
    await _seed_default_data()

    # Initialize search engines
    _init_search_engines()

    # Initialize embedding providers
    _init_embedding_providers()

    yield
    # Shutdown
    print("Shutting down...")


app = FastAPI(
    title=settings.app_name,
    description="Ottawa GenAI Research Assistant API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由（prefix 在各模块的 routes.py 中定义）
app.include_router(admin_router)
app.include_router(users_router)
app.include_router(research_router)
app.include_router(analysis_router)
app.include_router(analytics_router)
app.include_router(documents_router)
app.include_router(folders_router)
app.include_router(health_router)
app.include_router(chat_router)
app.include_router(evaluation_router)
app.include_router(feedback_router)
app.include_router(sync_router)
app.include_router(knowledge_router)
app.include_router(benchmark_router)
app.include_router(models_router)
app.include_router(prompts_router)
app.include_router(search_admin_router)


# 全局异常处理器
@app.exception_handler(AppError)
async def app_exception_handler(request: Request, exc: AppError) -> JSONResponse:
    """处理自定义应用异常"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "data": None,
            "error": exc.message,
            "detail": exc.detail,
        },
    )


@app.get("/")
async def root() -> dict[str, str]:
    """根路径健康检查"""
    return {"message": "Ottawa GenAI Research Assistant API", "status": "healthy"}


@app.get("/health")
async def health_check() -> dict[str, str]:
    """健康检查端点"""
    return {"status": "healthy"}


async def _seed_default_data() -> None:
    """
    Seed default data into the database on startup.

    Imports all seed modules (triggering SeedRegistry registration),
    then upserts all registered entries into universal_documents.
    """
    import app.core.seeds  # noqa: F401 — trigger registration

    from app.core.database import async_session_maker
    from app.core.seed import SeedRegistry, seed_defaults

    print(f"  Seed registry: {SeedRegistry.count()} entries registered")

    async with async_session_maker() as session:
        result = await seed_defaults(session)
        print(
            f"  Seed data: {result['inserted']} inserted, "
            f"{result['skipped']} skipped"
        )



def _init_search_engines() -> None:
    """
    Register available search engines into the global SearchRouter.

    Wraps existing Azure service + adds SQLite FTS.
    Engines that fail to init are skipped (graceful degradation).
    """
    from app.search.engine import search_router

    # 1. SQLite FTS — always available (local, no cloud dependency)
    try:
        from app.search.sqlite_engine import SQLiteFTSEngine

        fts_engine = SQLiteFTSEngine()
        search_router.register(fts_engine)
        print("  ✓ SQLite FTS search engine registered")
    except Exception as e:
        print(f"  ✗ SQLite FTS init failed: {e}")

    # 2. PageIndex — always available (local, page-level search)
    try:
        from app.search.pageindex_engine import PageIndexEngine

        pi_engine = PageIndexEngine()
        search_router.register(pi_engine)
        print("  ✓ PageIndex search engine registered")
    except Exception as e:
        print(f"  ✗ PageIndex init failed: {e}")

    # 3. Azure AI Search — optional (needs Azure credentials)
    try:
        if (
            getattr(settings, "azure_search_endpoint", None)
            and getattr(settings, "azure_search_api_key", None)
        ):
            from app.azure.search import AzureSearchService
            from app.search.azure_engine import AzureSearchAdapter

            azure_svc = AzureSearchService(
                endpoint=settings.azure_search_endpoint,
                api_key=settings.azure_search_api_key,
                index_name=getattr(settings, "azure_search_index_name", "documents"),
            )
            # OpenAI for embeddings (optional)
            openai_svc = None
            try:
                from app.azure.openai import AzureOpenAIService

                openai_svc = AzureOpenAIService(
                    endpoint=settings.azure_openai_endpoint,
                    api_key=settings.azure_openai_api_key,
                )
            except Exception:
                pass

            azure_adapter = AzureSearchAdapter(azure_svc, openai_svc)
            search_router.register(azure_adapter)
            print("  ✓ Azure AI Search engine registered")
        else:
            print("  - Azure Search skipped (no credentials)")
    except Exception as e:
        print(f"  ✗ Azure Search init failed: {e}")

    print(f"  Available engines: {search_router.available_engines}")


def _init_embedding_providers() -> None:
    """
    Register available embedding providers into the global EmbeddingRouter.

    Registers Azure OpenAI and Ollama embedding providers.
    Providers that fail to init are skipped (graceful degradation).
    """
    from app.search.embedding import (
        AzureEmbeddingProvider,
        OllamaEmbeddingProvider,
        embedding_router,
    )

    # 1. Azure OpenAI Embedding — optional (needs Azure credentials)
    try:
        if (
            getattr(settings, "azure_openai_endpoint", None)
            and getattr(settings, "azure_openai_api_key", None)
        ):
            from app.azure.openai import AzureOpenAIService

            openai_svc = AzureOpenAIService(
                endpoint=settings.azure_openai_endpoint,
                api_key=settings.azure_openai_api_key,
            )
            embed_model = getattr(
                settings, "azure_openai_embedding_deployment", "text-embedding-ada-002"
            )
            azure_provider = AzureEmbeddingProvider(openai_svc, model=embed_model)
            embedding_router.register(azure_provider)
            print(f"  ✓ Azure embedding provider registered ({embed_model})")
        else:
            print("  - Azure embedding skipped (no credentials)")
    except Exception as e:
        print(f"  ✗ Azure embedding init failed: {e}")

    # 2. Ollama Embedding — optional (needs Ollama running + embed models)
    try:
        from app.ollama.service import OllamaService

        ollama_svc = OllamaService(base_url=settings.ollama_base_url)
        # We register a default provider; actual model availability
        # is checked dynamically via the /embedding-models endpoint
        ollama_provider = OllamaEmbeddingProvider(
            ollama_svc, model="nomic-embed-text"
        )
        embedding_router.register(ollama_provider)
        print("  ✓ Ollama embedding provider registered (nomic-embed-text)")
    except Exception as e:
        print(f"  ✗ Ollama embedding init failed: {e}")

    print(f"  Available embedding providers: {[p['key'] for p in embedding_router.available_providers]}")

"""
Research Routes

API endpoints for RAG-powered research assistance and semantic query handling.

@template A7 backend/domain/router.py — API Routes
"""

import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.core.dependencies import OptionalOpenAIService, OptionalSearchService
from app.core.schemas import ApiResponse
from app.research.schemas import (
    ChatRequest,
    ChatResponse,
    SearchQuery,
    SearchResponse,
    StreamChatRequest,
)
from app.research.service import ResearchService

router = APIRouter(prefix="/api/v1/research", tags=["research"])


async def _format_ndjson(gen):
    """Convert async generator of dicts to NDJSON stream."""
    try:
        async for event in gen:
            yield json.dumps(event, ensure_ascii=False) + "\n"
    except Exception as error:
        yield json.dumps({"error": str(error)}, ensure_ascii=False) + "\n"


@router.post("/search", response_model=ApiResponse[SearchResponse])
async def search(
    query: SearchQuery,
    search_service: OptionalSearchService,
    openai_service: OptionalOpenAIService,
) -> ApiResponse[SearchResponse]:
    """Execute semantic search

    Searches relevant documents in the knowledge base.
    Uses hybrid search (Vector + BM25) if Azure AI Search is configured.
    """
    service = ResearchService(
        search_service=search_service,
        openai_service=openai_service,
    )
    result = await service.search(query)
    return ApiResponse.ok(result)


@router.post("/chat", response_model=ApiResponse[ChatResponse])
async def chat(
    request: ChatRequest,
    search_service: OptionalSearchService,
    openai_service: OptionalOpenAIService,
) -> ApiResponse[ChatResponse]:
    """RAG-enhanced chat (non-streaming)

    Processes user messages, retrieves relevant context, and generates an AI response.
    """
    service = ResearchService(
        search_service=search_service,
        openai_service=openai_service,
    )
    result = await service.chat(request)
    return ApiResponse.ok(result)


@router.post("/chat/stream")
async def chat_stream(
    request: StreamChatRequest,
    search_service: OptionalSearchService,
    openai_service: OptionalOpenAIService,
) -> StreamingResponse:
    """RAG-enhanced streaming chat (SSE/NDJSON)

    Streams AI response tokens in real-time via NDJSON protocol.

    Event types:
    - `sources`: Retrieved document references
    - `text`: LLM generated text token
    - `confidence`: Confidence score (0-1)
    - `chart`: Optional chart data for visualization
    - `done`: End of stream signal
    """
    service = ResearchService(
        search_service=search_service,
        openai_service=openai_service,
    )
    return StreamingResponse(
        _format_ndjson(service.chat_stream(request)),
        media_type="application/x-ndjson",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/models")
async def list_models() -> ApiResponse:
    """List available LLM models (cloud + local).

    Returns the configured Azure OpenAI deployment
    and local models from the Ollama server (if running).
    """
    from app.core.config import settings
    from app.ollama.service import OllamaService

    models = []

    # Cloud model — only the configured deployment
    if settings.azure_openai_endpoint and settings.azure_openai_api_key:
        deployment = settings.azure_openai_chat_deployment
        models.append({
            "id": deployment,
            "name": deployment,
            "provider": "azure",
            "available": True,
        })

    # Local models (Ollama) — dynamically queried
    try:
        ollama = OllamaService(base_url=settings.ollama_base_url)
        if await ollama.is_available():
            ollama_models = await ollama.list_models()
            for m in ollama_models:
                models.append({
                    "id": m.get("name", m.get("model", "")),
                    "name": m.get("name", m.get("model", "")),
                    "provider": "ollama",
                    "available": True,
                    "size": m.get("size"),
                })
    except Exception:
        pass  # Ollama not running — skip silently

    return ApiResponse.ok(models)


@router.get("/embedding-models")
async def list_embedding_models() -> ApiResponse:
    """List available embedding models (cloud + local).

    Returns registered embedding providers (Azure, Ollama)
    and dynamically discovers additional Ollama embedding models.
    """
    from app.search.embedding import OllamaEmbeddingProvider, embedding_router

    models = []
    registered_ids: set[str] = set()

    # From registered providers
    for info in embedding_router.available_providers:
        model_id = info["model"]
        registered_ids.add(model_id)
        models.append({
            "id": model_id,
            "provider": info["provider"],
            "dimension": info["dimension"],
            "available": True,
            "registered": True,
        })

    # Check Ollama for additional embedding models not yet registered
    try:
        from app.core.config import settings
        from app.ollama.service import OllamaService

        ollama = OllamaService(base_url=settings.ollama_base_url)
        if await ollama.is_available():
            embed_models = await ollama.list_embedding_models()
            for m in embed_models:
                mid = m.get("name", m.get("model", ""))
                if mid and mid not in registered_ids:
                    base_name = mid.split(":")[0]
                    models.append({
                        "id": mid,
                        "provider": "ollama",
                        "dimension": OllamaEmbeddingProvider.DIMENSIONS.get(
                            base_name, 768
                        ),
                        "available": True,
                        "registered": False,
                        "size": m.get("size"),
                    })
    except Exception:
        pass  # Ollama not running — skip silently

    return ApiResponse.ok(models)


@router.get("/active-strategy")
async def get_active_strategy(
    db=None,
) -> ApiResponse:
    """Get the current best strategy from the latest benchmark.

    Returns the #1 ranked leaderboard entry, including the strategy
    configuration and its evaluation scores.  If no benchmark has been
    run yet, returns null data.
    """
    from app.core.database import get_async_session

    # Use an ad-hoc session when no DI session is provided
    if db is None:
        async for session in get_async_session():
            strategy = await ResearchService.get_active_strategy(session)
            return ApiResponse.ok(strategy)
    strategy = await ResearchService.get_active_strategy(db)
    return ApiResponse.ok(strategy)


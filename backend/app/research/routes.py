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

"""
研究路由

定义研究/RAG 相关的 API 端点。
"""

from fastapi import APIRouter

from app.core.dependencies import OptionalOpenAIService, OptionalSearchService
from app.core.schemas import ApiResponse
from app.research.schemas import (
    ChatRequest,
    ChatResponse,
    SearchQuery,
    SearchResponse,
)
from app.research.service import ResearchService

router = APIRouter(prefix="/api/v1/research", tags=["research"])


@router.post("/search", response_model=ApiResponse[SearchResponse])
async def search(
    query: SearchQuery,
    search_service: OptionalSearchService,
    openai_service: OptionalOpenAIService,
) -> ApiResponse[SearchResponse]:
    """执行语义搜索

    根据查询在知识库中搜索相关文档。
    如果配置了 Azure AI Search，使用混合搜索 (Vector + BM25)。
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
    """RAG 增强的聊天

    处理用户消息并返回 AI 助手的回复。
    如果启用 RAG，先搜索相关文档作为上下文，再用 LLM 生成回复。
    """
    service = ResearchService(
        search_service=search_service,
        openai_service=openai_service,
    )
    result = await service.chat(request)
    return ApiResponse.ok(result)

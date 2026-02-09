"""
研究路由

定义研究/RAG 相关的 API 端点。
遵循 dev-backend_patterns skill 的 RESTful 结构。
"""

from fastapi import APIRouter

from app.research.schemas import (
    ChatRequest,
    ChatResponse,
    SearchQuery,
    SearchResponse,
)
from app.research.service import ResearchService
from app.core.schemas import ApiResponse
from app.core.dependencies import OptionalSearchService


router = APIRouter(prefix="/api/v1/research", tags=["research"])


@router.post("/search", response_model=ApiResponse[SearchResponse])
async def search(
    query: SearchQuery,
    search_service: OptionalSearchService,
) -> ApiResponse[SearchResponse]:
    """执行语义搜索

    根据查询在知识库中搜索相关文档。
    如果配置了 Azure AI Search，使用真实搜索；否则返回模拟数据。
    """
    service = ResearchService(search_service=search_service)
    result = await service.search(query)
    return ApiResponse.ok(result)


@router.post("/chat", response_model=ApiResponse[ChatResponse])
async def chat(
    request: ChatRequest,
    search_service: OptionalSearchService,
) -> ApiResponse[ChatResponse]:
    """RAG 增强的聊天

    处理用户消息并返回 AI 助手的回复。
    如果启用 RAG，会先搜索相关文档作为上下文。
    """
    service = ResearchService(search_service=search_service)
    result = await service.chat(request)
    return ApiResponse.ok(result)

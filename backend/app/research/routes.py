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


router = APIRouter(prefix="/api/v1/research", tags=["research"])


def get_research_service() -> ResearchService:
    """获取研究服务实例"""
    return ResearchService()


@router.post("/search", response_model=ApiResponse[SearchResponse])
async def search(
    query: SearchQuery,
) -> ApiResponse[SearchResponse]:
    """执行语义搜索

    根据查询在知识库中搜索相关文档。
    """
    service = get_research_service()
    result = await service.search(query)
    return ApiResponse.ok(result)


@router.post("/chat", response_model=ApiResponse[ChatResponse])
async def chat(
    request: ChatRequest,
) -> ApiResponse[ChatResponse]:
    """RAG 增强的聊天

    处理用户消息并返回 AI 助手的回复。
    如果启用 RAG，会先搜索相关文档作为上下文。
    """
    service = get_research_service()
    result = await service.chat(request)
    return ApiResponse.ok(result)

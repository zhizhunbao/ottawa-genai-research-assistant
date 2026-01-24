"""
研究服务层

包含 RAG 和 AI 搜索相关的业务逻辑。
遵循 dev-backend_patterns skill 的 Service 层模式。
"""

from typing import List

from app.core.config import settings
from app.research.schemas import (
    ChatMessage,
    ChatRequest,
    ChatResponse,
    SearchQuery,
    SearchResponse,
    SearchResult,
)
from app.core.enums import ChatRole
from app.core.exceptions import ExternalServiceError


class ResearchService:
    """研究服务类"""

    def __init__(self) -> None:
        self._validate_config()

    def _validate_config(self) -> None:
        """验证必要的配置"""
        # 配置验证将在实际调用时进行
        pass

    async def search(self, query: SearchQuery) -> SearchResponse:
        """执行语义搜索"""
        try:
            # TODO: 实现 Azure AI Search 集成
            # 目前返回模拟数据
            results = await self._mock_search(query)
            return SearchResponse(
                query=query.query,
                results=results,
                total=len(results),
            )
        except Exception as e:
            raise ExternalServiceError("Azure AI Search", str(e)) from e

    async def _mock_search(self, query: SearchQuery) -> List[SearchResult]:
        """模拟搜索结果（开发用）"""
        return [
            SearchResult(
                id="doc-1",
                title="Ottawa 新移民指南",
                content=f"关于 '{query.query}' 的相关信息...",
                score=0.95,
                source="官方文档",
                metadata={"category": "immigration"},
            ),
            SearchResult(
                id="doc-2",
                title="渥太华生活攻略",
                content=f"更多关于 '{query.query}' 的内容...",
                score=0.85,
                source="社区指南",
                metadata={"category": "lifestyle"},
            ),
        ]

    async def chat(self, request: ChatRequest) -> ChatResponse:
        """处理聊天请求（RAG 增强）"""
        try:
            sources: List[SearchResult] = []

            # 如果启用 RAG，先进行搜索
            if request.use_rag and request.messages:
                last_user_message = next(
                    (m for m in reversed(request.messages) if m.role == ChatRole.USER),
                    None,
                )
                if last_user_message:
                    search_query = SearchQuery(query=last_user_message.content)
                    search_response = await self.search(search_query)
                    sources = search_response.results

            # TODO: 实现 Azure OpenAI 集成
            # 目前返回模拟响应
            response_message = await self._mock_chat(request.messages, sources)

            return ChatResponse(
                message=response_message,
                sources=sources,
            )
        except Exception as e:
            raise ExternalServiceError("Azure OpenAI", str(e)) from e

    async def _mock_chat(
        self,
        messages: List[ChatMessage],
        sources: List[SearchResult],
    ) -> ChatMessage:
        """模拟聊天响应（开发用）"""
        last_message = messages[-1] if messages else None
        query = last_message.content if last_message else "你好"

        context = ""
        if sources:
            context = "\n\n根据以下来源信息：\n"
            for source in sources[:3]:
                context += f"- {source.title}: {source.content}\n"

        return ChatMessage(
            role=ChatRole.ASSISTANT,
            content=f"您好！关于 '{query}' 的问题，{context}我来为您解答...",
        )

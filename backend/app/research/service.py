"""
研究服务层

包含 RAG 和 AI 搜索相关的业务逻辑。
遵循 dev-backend_patterns skill 的 Service 层模式。
"""

import logging
from typing import List, Optional, TYPE_CHECKING

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

if TYPE_CHECKING:
    from app.core.azure_search import AzureSearchService
    from app.core.azure_openai import AzureOpenAIService

logger = logging.getLogger(__name__)


class ResearchService:
    """研究服务类"""

    def __init__(
        self,
        search_service: Optional["AzureSearchService"] = None,
        openai_service: Optional["AzureOpenAIService"] = None,
    ) -> None:
        """
        初始化研究服务

        Args:
            search_service: Azure Search 服务实例 (可选)
            openai_service: Azure OpenAI 服务实例 (可选)
        """
        self._search_service = search_service
        self._openai_service = openai_service
        self._validate_config()

    def _validate_config(self) -> None:
        """验证必要的配置"""
        # 配置验证将在实际调用时进行
        pass

    async def search(self, query: SearchQuery) -> SearchResponse:
        """
        执行语义搜索

        如果配置了 Azure Search，使用真实搜索；否则返回模拟数据。
        """
        try:
            if self._search_service:
                results = await self._azure_search(query)
            else:
                logger.warning("Azure Search not configured, using mock data")
                results = await self._mock_search(query)

            return SearchResponse(
                query=query.query,
                results=results,
                total=len(results),
            )
        except Exception as e:
            raise ExternalServiceError("Azure AI Search", str(e)) from e

    async def _azure_search(self, query: SearchQuery) -> List[SearchResult]:
        """
        使用 Azure AI Search 执行搜索

        Args:
            query: 搜索查询

        Returns:
            搜索结果列表
        """
        # 构建过滤器
        filters = None
        if query.filters:
            # 转换 dict 过滤器为 OData 格式
            filter_parts = []
            for key, value in query.filters.items():
                if isinstance(value, str):
                    filter_parts.append(f"{key} eq '{value}'")
                else:
                    filter_parts.append(f"{key} eq {value}")
            if filter_parts:
                filters = " and ".join(filter_parts)

        # 生成查询向量 (如果有 OpenAI 服务)
        query_vector = None
        if self._openai_service:
            try:
                query_vector = await self._openai_service.create_embedding(query.query)
            except Exception as e:
                logger.warning(f"Failed to create embedding, falling back to text search: {e}")

        # 执行搜索
        raw_results = await self._search_service.search(
            query=query.query,
            query_vector=query_vector,
            top_k=query.top_k,
            filters=filters,
        )

        # 转换为 SearchResult
        results = []
        for item in raw_results:
            results.append(
                SearchResult(
                    id=item["id"],
                    title=item.get("title", ""),
                    content=item.get("content", ""),
                    score=item.get("score", 0.0),
                    source=item.get("source"),
                    metadata={
                        "document_id": item.get("document_id"),
                        "page_number": item.get("page_number"),
                        "chunk_index": item.get("chunk_index"),
                    },
                )
            )

        return results

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

            # 使用 Azure OpenAI 生成回复
            if self._openai_service:
                response_message = await self._openai_chat(request.messages, sources)
            else:
                logger.warning("Azure OpenAI not configured, using mock response")
                response_message = await self._mock_chat(request.messages, sources)

            return ChatResponse(
                message=response_message,
                sources=sources,
            )
        except Exception as e:
            raise ExternalServiceError("Azure OpenAI", str(e)) from e

    async def _openai_chat(
        self,
        messages: List[ChatMessage],
        sources: List[SearchResult],
    ) -> ChatMessage:
        """使用 Azure OpenAI 生成聊天回复"""
        # 获取最后一条用户消息
        last_message = messages[-1] if messages else None
        query = last_message.content if last_message else "你好"

        # 构建上下文
        context = []
        for source in sources[:5]:  # 最多使用 5 个来源
            context.append(f"[{source.title}]: {source.content}")

        # 构建聊天历史
        chat_history = []
        for msg in messages[:-1]:  # 排除最后一条（当前问题）
            chat_history.append({
                "role": msg.role.value,
                "content": msg.content,
            })

        # 调用 RAG chat
        response = await self._openai_service.rag_chat(
            query=query,
            context=context,
            chat_history=chat_history if chat_history else None,
            temperature=0.7,
        )

        return ChatMessage(
            role=ChatRole.ASSISTANT,
            content=response,
        )

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

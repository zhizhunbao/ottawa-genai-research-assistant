"""
研究服务层

包含 RAG 和 AI 搜索相关的业务逻辑。
对应 US-301: Chart Visualization (添加图表数据提取)
"""

import logging
import re
from typing import TYPE_CHECKING, Optional

from app.core.enums import ChatRole
from app.core.exceptions import ExternalServiceError
from app.research.chart_service import ChartData
from app.research.schemas import (
    ChatMessage,
    ChatRequest,
    ChatResponse,
    SearchQuery,
    SearchResponse,
    SearchResult,
)

if TYPE_CHECKING:
    from app.core.azure_openai import AzureOpenAIService
    from app.core.azure_search import AzureSearchService

logger = logging.getLogger(__name__)

# 查询预处理常量
MAX_QUERY_LENGTH = 500
QUERY_CLEANUP_PATTERN = re.compile(r"\s+")


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
        pass

    def preprocess_query(self, query: str) -> str:
        """查询预处理: 清理空白、截断过长查询"""
        cleaned = QUERY_CLEANUP_PATTERN.sub(" ", query).strip()
        if len(cleaned) > MAX_QUERY_LENGTH:
            cleaned = cleaned[:MAX_QUERY_LENGTH]
        return cleaned

    async def search(self, query: SearchQuery) -> SearchResponse:
        """执行语义搜索，支持混合搜索 (Vector + BM25)"""
        try:
            # 查询预处理
            processed_query = SearchQuery(
                query=self.preprocess_query(query.query),
                top_k=query.top_k,
                filters=query.filters,
            )

            if self._search_service:
                results = await self._azure_search(processed_query)
            else:
                logger.warning("Azure Search not configured, using mock data")
                results = await self._mock_search(processed_query)

            return SearchResponse(
                query=query.query,  # 返回原始查询
                results=results,
                total=len(results),
            )
        except Exception as e:
            raise ExternalServiceError("Azure AI Search", str(e)) from e

    async def _azure_search(self, query: SearchQuery) -> list[SearchResult]:
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

    async def _mock_search(self, query: SearchQuery) -> list[SearchResult]:
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
            sources: list[SearchResult] = []
            query_text = ""

            # 如果启用 RAG，先进行搜索
            if request.use_rag and request.messages:
                last_user_message = next(
                    (m for m in reversed(request.messages) if m.role == ChatRole.USER),
                    None,
                )
                if last_user_message:
                    query_text = last_user_message.content
                    search_query = SearchQuery(query=query_text)
                    search_response = await self.search(search_query)
                    sources = search_response.results

            # 使用 Azure OpenAI 生成回复
            if self._openai_service:
                response_message = await self._openai_chat(request.messages, sources)
            else:
                logger.warning("Azure OpenAI not configured, using mock response")
                response_message = await self._mock_chat(request.messages, sources)

            # 计算置信度 (US-203)
            confidence = self._compute_confidence(sources)

            # 尝试提取图表数据 (US-301)
            chart_data = await self._extract_chart_data(sources, query_text)

            return ChatResponse(
                message=response_message,
                sources=sources,
                confidence=confidence,
                chart=chart_data,
            )
        except Exception as e:
            raise ExternalServiceError("Azure OpenAI", str(e)) from e

    async def _extract_chart_data(
        self,
        sources: list[SearchResult],
        query: str,
    ) -> ChartData | None:
        """从搜索结果中提取图表数据 (US-301)

        Args:
            sources: 搜索结果列表
            query: 用户查询

        Returns:
            图表数据，如果无法提取则返回 None
        """
        if not sources or not query:
            return None

        # 合并所有来源的内容
        combined_content = "\n".join(s.content for s in sources[:5])

        try:
            # 使用带 LLM 支持的提取器
            from app.research.chart_service import ChartDataExtractor
            extractor = ChartDataExtractor(openai_service=self._openai_service)
            return await extractor.extract_chart_data_llm(combined_content, query)
        except Exception as e:
            logger.warning(f"Failed to extract chart data: {e}")
            return None

    def _compute_confidence(self, sources: list[SearchResult]) -> float:
        """根据检索到的 sources 的平均分计算置信度

        Args:
            sources: 检索到的文档列表

        Returns:
            0-1 之间的置信度分数
        """
        if not sources:
            return 0.3  # 无来源时给低置信度
        avg_score = sum(s.score for s in sources) / len(sources)
        # 将 0-1 范围的分数映射为 0.1-1.0 的置信度
        return max(0.1, min(1.0, avg_score))

    async def _openai_chat(
        self,
        messages: list[ChatMessage],
        sources: list[SearchResult],
    ) -> ChatMessage:
        """使用 Azure OpenAI 生成聊天回复（RAG 增强）"""
        last_message = messages[-1] if messages else None
        query = last_message.content if last_message else "你好"

        # 将 SearchResult 转为结构化 dict（支持 citation）
        structured_sources = [
            {
                "title": s.title,
                "content": s.content,
                "page_number": (s.metadata or {}).get("page_number", "N/A"),
                "score": s.score,
                "source": s.source or "",
            }
            for s in sources[:5]
        ]

        # 构建聊天历史
        chat_history = [
            {"role": msg.role.value, "content": msg.content}
            for msg in messages[:-1]
        ] or None

        # 调用 RAG chat（使用结构化 sources）
        response = await self._openai_service.rag_chat(
            query=query,
            sources=structured_sources,
            chat_history=chat_history,
            temperature=0.7,
        )

        return ChatMessage(
            role=ChatRole.ASSISTANT,
            content=response,
        )

    async def _mock_chat(
        self,
        messages: list[ChatMessage],
        sources: list[SearchResult],
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

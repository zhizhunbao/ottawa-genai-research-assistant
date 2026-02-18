"""
Research Service Layer

Core logic for RAG-enhanced chat, semantic search, and chart data extraction.

@template A10 backend/domain/service.py — Shared CRUD & Logic Layer
"""

import json
import logging
import re
from collections.abc import AsyncGenerator
from typing import TYPE_CHECKING, Any, Optional

from app.core.enums import ChatRole
from app.core.exceptions import ExternalServiceError
from app.azure.prompts import CHART_EXTRACTION_PROMPT
from app.research.schemas import (
    ChartData,
    ChartType,
    ChatMessage,
    ChatRequest,
    ChatResponse,
    SearchQuery,
    SearchResponse,
    SearchResult,
    StreamChatRequest,
)

if TYPE_CHECKING:
    from app.azure.openai import AzureOpenAIService
    from app.azure.search import AzureSearchService

logger = logging.getLogger(__name__)

# ── 查询预处理常量 ────────────────────────────────────────────────────

MAX_QUERY_LENGTH = 500
QUERY_CLEANUP_PATTERN = re.compile(r"\s+")

# ── 图表提取常量 (US-301) ─────────────────────────────────────────────

# 数值模式匹配
NUMERIC_PATTERN = re.compile(r"(\d+(?:,\d{3})*(?:\.\d+)?)\s*%?")
# 年份/季度模式
TIME_PATTERN = re.compile(r"((?:Q[1-4]\s+)?20\d{2}|20\d{2}\s+Q[1-4])", re.IGNORECASE)
# 表格行模式 (用于解析简单表格)
TABLE_ROW_PATTERN = re.compile(r"([^\|]+)\s*\|\s*([^\|]+)")

# 图表类型关键词映射
CHART_TYPE_KEYWORDS: dict[ChartType, list[str]] = {
    ChartType.LINE: [
        "trend", "growth", "over time", "quarterly", "monthly", "yearly",
        "趋势", "增长", "变化", "走势",
    ],
    ChartType.BAR: [
        "compare", "comparison", "vs", "versus", "rank", "top",
        "比较", "对比", "排名",
    ],
    ChartType.PIE: [
        "share", "proportion", "distribution", "breakdown", "composition",
        "占比", "分布", "构成", "比例",
    ],
}


# ── Chart Data Extractor ──────────────────────────────────────────────


class ChartDataExtractor:
    """从文档内容中提取图表数据 (US-301)"""

    def __init__(self, openai_service: Any = None):
        """
        初始化提取器

        Args:
            openai_service: AzureOpenAIService 实例 (可选)
        """
        self._openai_service = openai_service

    async def extract_chart_data_llm(
        self,
        content: str,
        query: str,
    ) -> ChartData | None:
        """
        使用 LLM 从内容中提取结构化图表数据

        Args:
            content: 文档内容
            query: 用户查询

        Returns:
            图表数据，如果无法提取则返回 None
        """
        if not self._openai_service:
            logger.warning("Azure OpenAI not provided for Chart extraction, falling back to regex")
            return self.extract_chart_data(content, query)

        try:
            prompt = CHART_EXTRACTION_PROMPT.template.format(
                query=query, content=content[:6000]  # 限制上下文长度
            )

            response_text = await self._openai_service.chat_completion(
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,  # 使用低温度以获得稳定的 JSON
                system_prompt="You are a data extraction assistant. Respond ONLY with valid JSON or 'null'."
            )

            # 清理回复中的 markdown 代码块标记
            cleaned_response = response_text.strip()
            if cleaned_response.startswith("```json"):
                cleaned_response = cleaned_response.replace("```json", "", 1)
            if cleaned_response.endswith("```"):
                cleaned_response = cleaned_response.rsplit("```", 1)[0]
            cleaned_response = cleaned_response.strip()

            if not cleaned_response or cleaned_response.lower() == "null":
                return None

            data = json.loads(cleaned_response)
            return ChartData(**data)

        except Exception as e:
            logger.error(f"LLM chart extraction failed: {e}")
            # Fallback to regex if LLM fails
            return self.extract_chart_data(content, query)

    def extract_chart_data(
        self,
        content: str,
        query: str,
    ) -> ChartData | None:
        """
        尝试使用正则表达式从内容中提取图表数据 (向后兼容)

        Args:
            content: 文档内容
            query: 用户查询

        Returns:
            图表数据，如果无法提取则返回 None
        """
        if not content or not self._has_numeric_data(content):
            return None

        # 尝试提取表格数据
        table_data = self._extract_table_data(content)
        if table_data and len(table_data) >= 2:
            chart_type = self._determine_chart_type(query)
            return self._create_chart_data(table_data, chart_type, query)

        # 尝试提取时间序列数据
        time_series = self._extract_time_series(content)
        if time_series and len(time_series) >= 2:
            return ChartData(
                type=ChartType.LINE,
                title=self._generate_title(query),
                x_key="period",
                y_keys=["value"],
                data=time_series,
            )

        # 尝试提取分类数据 (用于饼图)
        category_data = self._extract_category_data(content)
        if category_data and len(category_data) >= 2:
            return ChartData(
                type=ChartType.PIE,
                title=self._generate_title(query),
                data=category_data,
            )

        return None

    def _has_numeric_data(self, content: str) -> bool:
        """检查内容是否包含足够的数值数据"""
        matches = NUMERIC_PATTERN.findall(content)
        return len(matches) >= 3

    def _extract_table_data(self, content: str) -> list[dict[str, Any]]:
        """从内容中提取表格数据"""
        data = []
        lines = content.split("\n")

        for line in lines:
            # 尝试匹配表格行 (label | value 格式)
            match = TABLE_ROW_PATTERN.match(line.strip())
            if match:
                label = match.group(1).strip()
                value_str = match.group(2).strip()

                # 提取数值
                num_match = NUMERIC_PATTERN.search(value_str)
                if num_match:
                    value = float(num_match.group(1).replace(",", ""))
                    data.append({"name": label, "value": value})

        return data

    def _extract_time_series(self, content: str) -> list[dict[str, Any]]:
        """从内容中提取时间序列数据"""
        data = []
        lines = content.split("\n")

        for line in lines:
            # 查找时间标识
            time_match = TIME_PATTERN.search(line)
            if time_match:
                period = time_match.group(1)
                # 获取时间标识之后的部分，避免匹配 Q1 中的 1
                after_time = line[time_match.end() :]

                # 查找对应的数值（在时间标识之后）
                num_matches = NUMERIC_PATTERN.findall(after_time)
                if num_matches:
                    # 取第一个有效数值
                    value = float(num_matches[0].replace(",", ""))
                    data.append({"period": period, "value": value})

        # 按时间排序
        data.sort(key=lambda x: x["period"])
        return data

    def _extract_category_data(self, content: str) -> list[dict[str, Any]]:
        """从内容中提取分类数据（用于饼图）"""
        data = []

        # 查找 "category: value%" 或 "category - value%" 格式
        pattern = re.compile(
            r"([A-Za-z\u4e00-\u9fff\s]+)[\:\-]\s*(\d+(?:\.\d+)?)\s*%",
            re.IGNORECASE,
        )

        for match in pattern.finditer(content):
            name = match.group(1).strip()
            value = float(match.group(2))
            if name and value > 0:
                data.append({"name": name, "value": value})

        return data

    def _determine_chart_type(self, query: str) -> ChartType:
        """根据查询内容确定图表类型"""
        query_lower = query.lower()

        for chart_type, keywords in CHART_TYPE_KEYWORDS.items():
            if any(keyword in query_lower for keyword in keywords):
                return chart_type

        # 默认使用柱状图
        return ChartType.BAR

    def _create_chart_data(
        self,
        data: list[dict[str, Any]],
        chart_type: ChartType,
        query: str,
    ) -> ChartData:
        """创建图表数据结构"""
        title = self._generate_title(query)

        if chart_type == ChartType.PIE:
            return ChartData(
                type=ChartType.PIE,
                title=title,
                data=data,
            )
        else:
            return ChartData(
                type=chart_type,
                title=title,
                x_key="name",
                y_keys=["value"],
                data=data,
            )

    def _generate_title(self, query: str) -> str:
        """根据查询生成图表标题"""
        # 简单处理：截取查询的前 50 个字符作为标题
        if len(query) > 50:
            return query[:47] + "..."
        return query


# 全局默认实例（向后兼容）
chart_extractor = ChartDataExtractor()


# ── Research Service ──────────────────────────────────────────────────


class ResearchService:
    """研究服务类"""

    # Known local model prefixes (Ollama format uses 'name:tag')
    LOCAL_MODEL_PREFIXES = ('llama', 'mistral', 'deepseek', 'qwen', 'phi', 'gemma', 'codellama', 'vicuna', 'neural')

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
        self._ollama_service = None  # Lazy-initialized
        self._validate_config()

    def _validate_config(self) -> None:
        """验证必要的配置"""
        pass

    def _is_local_model(self, model: str | None) -> bool:
        """Check if the model ID refers to a local Ollama model."""
        if not model:
            return False
        model_lower = model.lower()
        # Ollama models use 'name:tag' format (e.g. llama3.1:8b)
        if ':' in model_lower:
            return True
        # Also match known prefixes without tag
        return any(model_lower.startswith(prefix) for prefix in self.LOCAL_MODEL_PREFIXES)

    def _get_ollama_service(self):
        """Lazy-initialize Ollama service."""
        if self._ollama_service is None:
            from app.core.config import settings
            from app.ollama.service import OllamaService
            self._ollama_service = OllamaService(base_url=settings.ollama_base_url)
        return self._ollama_service

    @staticmethod
    async def get_active_strategy(db) -> dict | None:
        """Retrieve the top-ranked strategy from the most recent benchmark.

        Returns the #1 leaderboard entry as a dict, or None if no
        benchmark has been completed yet.
        """
        try:
            from sqlalchemy import desc, select
            from app.core.enums import DocumentType
            from app.core.models import UniversalDocument

            stmt = (
                select(UniversalDocument)
                .where(
                    UniversalDocument.type == DocumentType.EVALUATION_RESULT,
                    UniversalDocument.tags.contains(["benchmark"]),
                )
                .order_by(desc(UniversalDocument.created_at))
                .limit(5)
            )
            result = await db.execute(stmt)
            docs = result.scalars().all()

            for doc in docs:
                data = doc.data or {}
                leaderboard = data.get("leaderboard", [])
                if leaderboard:
                    return leaderboard[0]  # #1 ranked entry
            return None
        except Exception as e:
            logger.warning(f"Failed to get active strategy: {e}")
            return None

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

    async def chat_stream(
        self, request: StreamChatRequest
    ) -> AsyncGenerator[dict[str, Any], None]:
        """Stream RAG chat response as NDJSON events.

        Yields NDJSON events in order:
        1. {"type": "sources", "payload": [...]}     — retrieved documents
        2. {"type": "text", "text": "..."}           — text token chunks
        3. {"type": "chart", "payload": {...}}       — chart data (optional)
        4. {"type": "confidence", "payload": float}  — confidence score
        5. {"type": "done"}                          — end of stream

        Args:
            request: StreamChatRequest with messages, use_rag, temperature
        """
        import asyncio

        sources: list[SearchResult] = []
        query_text = ""

        # Step 1: RAG retrieval
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

        # Emit sources
        yield {
            "type": "sources",
            "payload": [s.model_dump() for s in sources],
        }

        # Step 2: Stream LLM response
        full_content = ""
        model_id = request.model  # May be None (use server default)
        usage_info = None  # Will be populated from LLM response

        if self._is_local_model(model_id):
            # ── Ollama (local model) ──
            ollama = self._get_ollama_service()
            system_prompt = None
            if sources:
                from app.azure.prompts import build_system_messages
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
                msgs = build_system_messages(
                    query=query_text or request.messages[-1].content,
                    sources=structured_sources,
                    chat_history=[
                        {"role": msg.role.value, "content": msg.content}
                        for msg in request.messages[:-1]
                    ] or None,
                )
                system_prompt = msgs[0]["content"] if msgs else None
                chat_messages = msgs[1:]  # Without system
            else:
                chat_messages = [
                    {"role": msg.role.value, "content": msg.content}
                    for msg in request.messages
                ]

            async for token in ollama.chat_completion_stream(
                messages=chat_messages,
                model=model_id,
                temperature=request.temperature,
                system_prompt=system_prompt,
            ):
                full_content += token
                yield {"type": "text", "text": token}

            # Ollama doesn't return usage — estimate from content
            est_prompt = sum(len(m.content) // 4 for m in request.messages)
            est_completion = len(full_content) // 4
            usage_info = {
                "prompt_tokens": est_prompt,
                "completion_tokens": est_completion,
                "total_tokens": est_prompt + est_completion,
            }

        elif self._openai_service:
            # ── Azure OpenAI ──
            # Optionally override the deployment if a specific model was requested
            original_deployment = self._openai_service.chat_deployment
            if model_id and not self._is_local_model(model_id):
                self._openai_service.chat_deployment = model_id

            try:
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
                chat_history = [
                    {"role": msg.role.value, "content": msg.content}
                    for msg in request.messages[:-1]
                ] or None

                async for item in self._openai_service.rag_chat_stream(
                    query=query_text or request.messages[-1].content,
                    sources=structured_sources,
                    chat_history=chat_history,
                    temperature=request.temperature,
                ):
                    if isinstance(item, dict) and "usage" in item:
                        usage_info = item["usage"]
                    elif isinstance(item, str):
                        full_content += item
                        yield {"type": "text", "text": item}
            finally:
                # Restore original deployment
                self._openai_service.chat_deployment = original_deployment
        else:
            # Mock streaming for development
            logger.warning("Azure OpenAI not configured, using mock stream")
            mock_response = f"关于 '{query_text or '你好'}' 的问题，"
            if sources:
                mock_response += "根据检索到的文档信息，"
                for s in sources[:2]:
                    mock_response += f"\n- {s.title}: {s.content[:100]}"
            mock_response += "\n\n以上是 AI 助手的模拟回复。"

            for char in mock_response:
                full_content += char
                yield {"type": "text", "text": char}
                await asyncio.sleep(0.02)  # Simulate typing

            # Mock usage estimate
            est_prompt = sum(len(m.content) // 4 for m in request.messages)
            est_completion = len(full_content) // 4
            usage_info = {
                "prompt_tokens": est_prompt,
                "completion_tokens": est_completion,
                "total_tokens": est_prompt + est_completion,
            }

        # Step 3: Emit usage with estimated cost
        if usage_info:
            effective_model = model_id or self._openai_service.chat_deployment if self._openai_service else "unknown"
            usage_info["estimated_cost"] = self._estimate_cost(
                effective_model, usage_info.get("prompt_tokens", 0), usage_info.get("completion_tokens", 0)
            )
            usage_info["model"] = effective_model
            yield {"type": "usage", "payload": usage_info}

        # Step 4: Emit confidence
        confidence = self._compute_confidence(sources)
        yield {"type": "confidence", "payload": confidence}

        # Step 5: Emit chart data (optional)
        chart_data = await self._extract_chart_data(sources, query_text)
        if chart_data:
            yield {"type": "chart", "payload": chart_data.model_dump()}

        # Step 6: Done
        yield {"type": "done"}

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
            extractor = ChartDataExtractor(openai_service=self._openai_service)
            return await extractor.extract_chart_data_llm(combined_content, query)
        except Exception as e:
            logger.warning(f"Failed to extract chart data: {e}")
            return None

    # ── Per-1K-token pricing (USD) ────────────────────────────────────
    MODEL_PRICING: dict[str, tuple[float, float]] = {
        # (input_per_1k, output_per_1k)
        "gpt-4o": (0.0025, 0.01),
        "gpt-4o-mini": (0.00015, 0.0006),
        "gpt-4-turbo": (0.01, 0.03),
        "gpt-4": (0.03, 0.06),
        "gpt-35-turbo": (0.0005, 0.0015),
        "gpt-3.5-turbo": (0.0005, 0.0015),
    }

    def _estimate_cost(
        self, model: str, prompt_tokens: int, completion_tokens: int
    ) -> float:
        """Estimate USD cost based on model and token counts.

        Returns cost in USD (e.g. 0.0012 = $0.0012).
        Returns 0.0 for local/unknown models.
        """
        model_lower = model.lower() if model else ""

        # Local models are free
        if self._is_local_model(model):
            return 0.0

        # Find matching pricing
        for key, (input_price, output_price) in self.MODEL_PRICING.items():
            if key in model_lower:
                cost = (prompt_tokens / 1000 * input_price) + (
                    completion_tokens / 1000 * output_price
                )
                return round(cost, 6)

        # Unknown model — use gpt-4o-mini as default
        default_in, default_out = self.MODEL_PRICING["gpt-4o-mini"]
        return round(
            (prompt_tokens / 1000 * default_in)
            + (completion_tokens / 1000 * default_out),
            6,
        )

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

"""
Azure OpenAI Service Wrapper

Provides LLM chat completion and embedding generation functionality.

@template F3 backend/azure/openai_error.py — OpenAI Adapter + Streaming Chat
@reference azure-search-openai-demo/app/backend/approaches/ (ChatReadRetrieveRead)
"""

from collections.abc import AsyncIterator

from openai import AsyncAzureOpenAI, AzureOpenAI
from openai.types.chat import ChatCompletion


class AzureOpenAIError(Exception):
    """Azure OpenAI 服务异常"""
    pass


class AzureOpenAIService:
    """Azure OpenAI 服务类"""

    def __init__(
        self,
        endpoint: str,
        api_key: str,
        api_version: str = "2024-02-15-preview",
        chat_deployment: str = "gpt-4o-mini",
        embedding_deployment: str = "text-embedding-ada-002",
    ):
        """
        初始化 Azure OpenAI 服务

        Args:
            endpoint: Azure OpenAI endpoint
            api_key: API Key
            api_version: API 版本
            chat_deployment: Chat 模型部署名称
            embedding_deployment: Embedding 模型部署名称
        """
        if not endpoint or not api_key:
            raise ValueError(
                "Azure OpenAI endpoint and API key are required. "
                "Please set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY."
            )

        self.endpoint = endpoint
        self.api_version = api_version
        self.chat_deployment = chat_deployment
        self.embedding_deployment = embedding_deployment

        # 同步客户端
        self._client = AzureOpenAI(
            azure_endpoint=endpoint,
            api_key=api_key,
            api_version=api_version,
        )

        # 异步客户端
        self._async_client = AsyncAzureOpenAI(
            azure_endpoint=endpoint,
            api_key=api_key,
            api_version=api_version,
        )

    async def create_embedding(self, text: str) -> list[float]:
        """
        为文本生成 embedding 向量

        Args:
            text: 输入文本

        Returns:
            1536 维向量
        """
        try:
            response = await self._async_client.embeddings.create(
                model=self.embedding_deployment,
                input=text,
            )
            return response.data[0].embedding
        except Exception as e:
            raise AzureOpenAIError(f"Failed to create embedding: {str(e)}") from e

    async def create_embeddings_batch(
        self,
        texts: list[str],
    ) -> list[list[float]]:
        """
        批量生成 embedding 向量

        Args:
            texts: 文本列表

        Returns:
            向量列表
        """
        try:
            response = await self._async_client.embeddings.create(
                model=self.embedding_deployment,
                input=texts,
            )
            return [item.embedding for item in response.data]
        except Exception as e:
            raise AzureOpenAIError(f"Failed to create embeddings batch: {str(e)}") from e

    async def chat_completion(
        self,
        messages: list[dict],
        temperature: float = 0.7,
        max_tokens: int | None = None,
        system_prompt: str | None = None,
    ) -> str:
        """
        生成 chat completion

        Args:
            messages: 消息列表 [{"role": "user", "content": "..."}]
            temperature: 温度参数 (0-2)
            max_tokens: 最大生成 token 数
            system_prompt: 系统提示词

        Returns:
            助手回复内容
        """
        try:
            # 构建消息列表
            chat_messages = []
            if system_prompt:
                chat_messages.append({"role": "system", "content": system_prompt})
            chat_messages.extend(messages)

            kwargs = {
                "model": self.chat_deployment,
                "messages": chat_messages,
                "temperature": temperature,
            }
            if max_tokens:
                kwargs["max_tokens"] = max_tokens

            response: ChatCompletion = await self._async_client.chat.completions.create(
                **kwargs
            )

            return response.choices[0].message.content or ""
        except Exception as e:
            raise AzureOpenAIError(f"Chat completion failed: {str(e)}") from e

    async def chat_completion_stream(
        self,
        messages: list[dict],
        temperature: float = 0.7,
        max_tokens: int | None = None,
        system_prompt: str | None = None,
    ) -> AsyncIterator[str]:
        """
        流式生成 chat completion

        Args:
            messages: 消息列表
            temperature: 温度参数
            max_tokens: 最大生成 token 数
            system_prompt: 系统提示词

        Yields:
            生成的文本片段
        """
        try:
            chat_messages = []
            if system_prompt:
                chat_messages.append({"role": "system", "content": system_prompt})
            chat_messages.extend(messages)

            kwargs = {
                "model": self.chat_deployment,
                "messages": chat_messages,
                "temperature": temperature,
                "stream": True,
            }
            if max_tokens:
                kwargs["max_tokens"] = max_tokens

            stream = await self._async_client.chat.completions.create(**kwargs)

            async for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            raise AzureOpenAIError(f"Stream chat completion failed: {str(e)}") from e

    async def rag_chat(
        self,
        query: str,
        context: list[str] | None = None,
        sources: list[dict] | None = None,
        chat_history: list[dict] | None = None,
        temperature: float = 0.7,
    ) -> str:
        """
        RAG 增强的聊天

        支持两种上下文格式:
        - context: 纯文本列表（向后兼容）
        - sources: 结构化搜索结果（推荐，支持 citation）

        Args:
            query: 用户问题
            context: 检索到的相关文档内容（纯文本列表）
            sources: 结构化搜索结果列表（含 title, content, page_number）
            chat_history: 聊天历史
            temperature: 温度参数

        Returns:
            助手回复
        """
        from app.azure.prompts import build_system_messages

        # 优先使用结构化 sources，fallback 到纯文本 context
        if sources:
            messages = build_system_messages(
                query=query,
                sources=sources,
                chat_history=chat_history,
            )
        elif context:
            # 向后兼容：将纯文本转为简单 sources 格式
            simple_sources = [
                {"title": f"Source {i+1}", "content": text, "score": 0.0}
                for i, text in enumerate(context)
            ]
            messages = build_system_messages(
                query=query,
                sources=simple_sources,
                chat_history=chat_history,
            )
        else:
            messages = build_system_messages(
                query=query,
                sources=[],
                chat_history=chat_history,
            )

        return await self.chat_completion(
            messages=messages[1:],  # 去掉第一个 system（由 chat_completion 处理）
            temperature=temperature,
            system_prompt=messages[0]["content"] if messages else None,
        )

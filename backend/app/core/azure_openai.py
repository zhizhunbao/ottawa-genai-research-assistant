"""
Azure OpenAI 服务

提供 LLM chat completion 和 embedding 生成功能。
遵循 dev-backend_patterns skill 规范。
"""

from typing import List, Optional, AsyncIterator

from openai import AzureOpenAI, AsyncAzureOpenAI
from openai.types.chat import ChatCompletion, ChatCompletionChunk

from app.core.config import settings


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

    async def create_embedding(self, text: str) -> List[float]:
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
        texts: List[str],
    ) -> List[List[float]]:
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
        messages: List[dict],
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        system_prompt: Optional[str] = None,
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
        messages: List[dict],
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        system_prompt: Optional[str] = None,
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
        context: List[str],
        chat_history: Optional[List[dict]] = None,
        temperature: float = 0.7,
    ) -> str:
        """
        RAG 增强的聊天

        Args:
            query: 用户问题
            context: 检索到的相关文档内容
            chat_history: 聊天历史
            temperature: 温度参数

        Returns:
            助手回复
        """
        # 构建 RAG 系统提示词
        system_prompt = """You are a helpful assistant for the Ottawa GenAI Research Assistant.
Your task is to answer questions based on the provided context.

Instructions:
- Answer in the same language as the user's question
- Use the provided context to give accurate answers
- If the context doesn't contain relevant information, say so honestly
- Be concise but thorough
- Cite sources when possible

Context:
"""
        system_prompt += "\n---\n".join(context) if context else "No relevant context found."

        # 构建消息
        messages = []
        if chat_history:
            messages.extend(chat_history)
        messages.append({"role": "user", "content": query})

        return await self.chat_completion(
            messages=messages,
            temperature=temperature,
            system_prompt=system_prompt,
        )

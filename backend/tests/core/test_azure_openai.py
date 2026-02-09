"""
Azure OpenAI 服务单元测试

测试 AzureOpenAIService 的核心功能。
"""

import pytest
from unittest.mock import MagicMock, AsyncMock, patch

from app.core.azure_openai import AzureOpenAIService, AzureOpenAIError


class TestAzureOpenAIService:
    """Azure OpenAI 服务测试"""

    @pytest.fixture
    def mock_clients(self):
        """Mock Azure OpenAI clients"""
        with patch("app.core.azure_openai.AzureOpenAI") as mock_sync, \
             patch("app.core.azure_openai.AsyncAzureOpenAI") as mock_async:
            mock_sync_instance = MagicMock()
            mock_async_instance = MagicMock()
            mock_sync.return_value = mock_sync_instance
            mock_async.return_value = mock_async_instance
            yield {
                "sync_class": mock_sync,
                "async_class": mock_async,
                "sync_instance": mock_sync_instance,
                "async_instance": mock_async_instance,
            }

    @pytest.fixture
    def openai_service(self, mock_clients):
        """创建测试用 OpenAI Service"""
        service = AzureOpenAIService(
            endpoint="https://test.openai.azure.com",
            api_key="test-api-key",
            api_version="2024-02-15-preview",
            chat_deployment="gpt-4o-mini",
            embedding_deployment="text-embedding-ada-002",
        )
        return service

    def test_init_success(self, mock_clients):
        """测试初始化成功"""
        service = AzureOpenAIService(
            endpoint="https://test.openai.azure.com",
            api_key="test-api-key",
            api_version="2024-02-15-preview",
            chat_deployment="gpt-4o-mini",
            embedding_deployment="text-embedding-ada-002",
        )

        assert service.endpoint == "https://test.openai.azure.com"
        assert service.chat_deployment == "gpt-4o-mini"
        assert service.embedding_deployment == "text-embedding-ada-002"

    def test_init_without_endpoint_raises_error(self, mock_clients):
        """测试无 endpoint 时抛出错误"""
        with pytest.raises(ValueError, match="endpoint and API key are required"):
            AzureOpenAIService(
                endpoint="",
                api_key="test-key",
            )

    def test_init_without_api_key_raises_error(self, mock_clients):
        """测试无 API key 时抛出错误"""
        with pytest.raises(ValueError, match="endpoint and API key are required"):
            AzureOpenAIService(
                endpoint="https://test.openai.azure.com",
                api_key="",
            )

    @pytest.mark.asyncio
    async def test_create_embedding_success(self, openai_service, mock_clients):
        """测试生成 embedding 成功"""
        # Mock embedding response
        mock_embedding = [0.1] * 1536
        mock_response = MagicMock()
        mock_response.data = [MagicMock(embedding=mock_embedding)]

        mock_clients["async_instance"].embeddings.create = AsyncMock(
            return_value=mock_response
        )
        openai_service._async_client = mock_clients["async_instance"]

        result = await openai_service.create_embedding("test text")

        assert result == mock_embedding
        assert len(result) == 1536
        mock_clients["async_instance"].embeddings.create.assert_called_once_with(
            model="text-embedding-ada-002",
            input="test text",
        )

    @pytest.mark.asyncio
    async def test_create_embedding_error(self, openai_service, mock_clients):
        """测试生成 embedding 失败时抛出错误"""
        mock_clients["async_instance"].embeddings.create = AsyncMock(
            side_effect=Exception("API Error")
        )
        openai_service._async_client = mock_clients["async_instance"]

        with pytest.raises(AzureOpenAIError, match="Failed to create embedding"):
            await openai_service.create_embedding("test text")

    @pytest.mark.asyncio
    async def test_create_embeddings_batch_success(self, openai_service, mock_clients):
        """测试批量生成 embedding 成功"""
        mock_embeddings = [[0.1] * 1536, [0.2] * 1536]
        mock_response = MagicMock()
        mock_response.data = [
            MagicMock(embedding=mock_embeddings[0]),
            MagicMock(embedding=mock_embeddings[1]),
        ]

        mock_clients["async_instance"].embeddings.create = AsyncMock(
            return_value=mock_response
        )
        openai_service._async_client = mock_clients["async_instance"]

        result = await openai_service.create_embeddings_batch(["text 1", "text 2"])

        assert len(result) == 2
        assert result[0] == mock_embeddings[0]
        assert result[1] == mock_embeddings[1]

    @pytest.mark.asyncio
    async def test_chat_completion_success(self, openai_service, mock_clients):
        """测试 chat completion 成功"""
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "Hello! How can I help you?"

        mock_clients["async_instance"].chat.completions.create = AsyncMock(
            return_value=mock_response
        )
        openai_service._async_client = mock_clients["async_instance"]

        result = await openai_service.chat_completion(
            messages=[{"role": "user", "content": "Hi"}],
            temperature=0.7,
        )

        assert result == "Hello! How can I help you?"
        mock_clients["async_instance"].chat.completions.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_chat_completion_with_system_prompt(self, openai_service, mock_clients):
        """测试带系统提示词的 chat completion"""
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "Response with system prompt"

        mock_clients["async_instance"].chat.completions.create = AsyncMock(
            return_value=mock_response
        )
        openai_service._async_client = mock_clients["async_instance"]

        await openai_service.chat_completion(
            messages=[{"role": "user", "content": "Hi"}],
            system_prompt="You are a helpful assistant.",
        )

        call_kwargs = mock_clients["async_instance"].chat.completions.create.call_args[1]
        messages = call_kwargs["messages"]
        assert messages[0]["role"] == "system"
        assert messages[0]["content"] == "You are a helpful assistant."

    @pytest.mark.asyncio
    async def test_chat_completion_with_max_tokens(self, openai_service, mock_clients):
        """测试带 max_tokens 的 chat completion"""
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "Short response"

        mock_clients["async_instance"].chat.completions.create = AsyncMock(
            return_value=mock_response
        )
        openai_service._async_client = mock_clients["async_instance"]

        await openai_service.chat_completion(
            messages=[{"role": "user", "content": "Hi"}],
            max_tokens=100,
        )

        call_kwargs = mock_clients["async_instance"].chat.completions.create.call_args[1]
        assert call_kwargs["max_tokens"] == 100

    @pytest.mark.asyncio
    async def test_chat_completion_error(self, openai_service, mock_clients):
        """测试 chat completion 失败时抛出错误"""
        mock_clients["async_instance"].chat.completions.create = AsyncMock(
            side_effect=Exception("API Error")
        )
        openai_service._async_client = mock_clients["async_instance"]

        with pytest.raises(AzureOpenAIError, match="Chat completion failed"):
            await openai_service.chat_completion(
                messages=[{"role": "user", "content": "Hi"}]
            )

    @pytest.mark.asyncio
    async def test_rag_chat_success(self, openai_service, mock_clients):
        """测试 RAG chat 成功"""
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "Based on the context..."

        mock_clients["async_instance"].chat.completions.create = AsyncMock(
            return_value=mock_response
        )
        openai_service._async_client = mock_clients["async_instance"]

        result = await openai_service.rag_chat(
            query="What is Ottawa?",
            context=["Ottawa is the capital of Canada."],
            temperature=0.7,
        )

        assert result == "Based on the context..."

    @pytest.mark.asyncio
    async def test_rag_chat_with_history(self, openai_service, mock_clients):
        """测试带历史的 RAG chat"""
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "Follow-up response"

        mock_clients["async_instance"].chat.completions.create = AsyncMock(
            return_value=mock_response
        )
        openai_service._async_client = mock_clients["async_instance"]

        await openai_service.rag_chat(
            query="Tell me more",
            context=["Additional context"],
            chat_history=[
                {"role": "user", "content": "What is Ottawa?"},
                {"role": "assistant", "content": "Ottawa is the capital of Canada."},
            ],
        )

        call_kwargs = mock_clients["async_instance"].chat.completions.create.call_args[1]
        messages = call_kwargs["messages"]
        # Should include: system + history (2) + current query (1) = 4 messages
        assert len(messages) == 4

    @pytest.mark.asyncio
    async def test_rag_chat_empty_context(self, openai_service, mock_clients):
        """测试空上下文的 RAG chat"""
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "No context available"

        mock_clients["async_instance"].chat.completions.create = AsyncMock(
            return_value=mock_response
        )
        openai_service._async_client = mock_clients["async_instance"]

        result = await openai_service.rag_chat(
            query="Something unknown",
            context=[],
        )

        assert result == "No context available"

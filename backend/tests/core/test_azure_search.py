"""
Azure AI Search 服务单元测试

测试 AzureSearchService 的核心功能。
"""

import pytest
from unittest.mock import Mock, MagicMock, patch
from datetime import datetime

from app.core.azure_search import AzureSearchService, AzureSearchError


class TestAzureSearchService:
    """Azure AI Search 服务测试"""

    @pytest.fixture
    def mock_search_client(self):
        """Mock SearchClient"""
        with patch("app.core.azure_search.SearchClient") as mock:
            mock_instance = MagicMock()
            mock.return_value = mock_instance
            yield mock, mock_instance

    @pytest.fixture
    def mock_index_client(self):
        """Mock SearchIndexClient"""
        with patch("app.core.azure_search.SearchIndexClient") as mock:
            mock_instance = MagicMock()
            mock.return_value = mock_instance
            yield mock, mock_instance

    @pytest.fixture
    def search_service(self, mock_search_client, mock_index_client):
        """创建测试用 Search Service"""
        service = AzureSearchService(
            endpoint="https://test.search.windows.net",
            api_key="test-api-key",
            index_name="test-index",
        )
        service._search_client = mock_search_client[1]
        service._index_client = mock_index_client[1]
        return service

    def test_init_success(self, mock_search_client, mock_index_client):
        """测试初始化成功"""
        service = AzureSearchService(
            endpoint="https://test.search.windows.net",
            api_key="test-api-key",
            index_name="test-index",
        )

        assert service.endpoint == "https://test.search.windows.net"
        assert service.index_name == "test-index"

    def test_init_without_endpoint_raises_error(self):
        """测试无 endpoint 时抛出错误"""
        with pytest.raises(ValueError, match="endpoint and API key are required"):
            AzureSearchService(
                endpoint="",
                api_key="test-key",
                index_name="test-index",
            )

    def test_init_without_api_key_raises_error(self):
        """测试无 API key 时抛出错误"""
        with pytest.raises(ValueError, match="endpoint and API key are required"):
            AzureSearchService(
                endpoint="https://test.search.windows.net",
                api_key="",
                index_name="test-index",
            )

    @pytest.mark.asyncio
    async def test_create_index_success(self, search_service):
        """测试创建索引成功"""
        search_service._index_client.create_or_update_index.return_value = MagicMock()

        result = await search_service.create_index()

        assert result is True
        search_service._index_client.create_or_update_index.assert_called_once()

    @pytest.mark.asyncio
    async def test_index_document_success(self, search_service):
        """测试索引文档成功"""
        mock_result = MagicMock()
        mock_result.succeeded = True
        search_service._search_client.upload_documents.return_value = [mock_result]

        result = await search_service.index_document(
            doc_id="doc-1",
            title="Test Document",
            content="Test content here",
            content_vector=[0.1] * 1536,
            source="test-source",
            document_id="original-doc-1",
            page_number=1,
            chunk_index=0,
        )

        assert result["id"] == "doc-1"
        assert result["success"] is True
        search_service._search_client.upload_documents.assert_called_once()

    @pytest.mark.asyncio
    async def test_index_documents_batch_success(self, search_service):
        """测试批量索引成功"""
        mock_results = [MagicMock(succeeded=True), MagicMock(succeeded=True)]
        search_service._search_client.upload_documents.return_value = mock_results

        documents = [
            {"id": "doc-1", "title": "Doc 1", "content": "Content 1", "content_vector": [0.1] * 1536},
            {"id": "doc-2", "title": "Doc 2", "content": "Content 2", "content_vector": [0.2] * 1536},
        ]

        result = await search_service.index_documents_batch(documents)

        assert result["total"] == 2
        assert result["succeeded"] == 2
        assert result["failed"] == 0

    @pytest.mark.asyncio
    async def test_search_keyword_only(self, search_service):
        """测试仅关键词搜索"""
        mock_results = MagicMock()
        mock_results.__iter__ = Mock(return_value=iter([
            {
                "id": "doc-1",
                "title": "Test Title",
                "content": "Test content",
                "source": "test-source",
                "document_id": "orig-1",
                "page_number": 1,
                "chunk_index": 0,
                "@search.score": 0.95,
            }
        ]))
        search_service._search_client.search.return_value = mock_results

        results = await search_service.search(
            query="test query",
            top_k=5,
        )

        assert len(results) == 1
        assert results[0]["id"] == "doc-1"
        assert results[0]["score"] == 0.95

    @pytest.mark.asyncio
    async def test_search_hybrid(self, search_service):
        """测试混合搜索（向量 + 关键词）"""
        mock_results = MagicMock()
        mock_results.__iter__ = Mock(return_value=iter([
            {
                "id": "doc-1",
                "title": "Test Title",
                "content": "Test content",
                "source": "test-source",
                "document_id": "orig-1",
                "page_number": 1,
                "chunk_index": 0,
                "@search.score": 0.98,
            }
        ]))
        search_service._search_client.search.return_value = mock_results

        results = await search_service.search(
            query="test query",
            query_vector=[0.1] * 1536,
            top_k=5,
        )

        assert len(results) == 1
        assert results[0]["score"] == 0.98
        # 验证向量查询参数
        call_kwargs = search_service._search_client.search.call_args[1]
        assert "vector_queries" in call_kwargs

    @pytest.mark.asyncio
    async def test_search_with_filter(self, search_service):
        """测试带过滤的搜索"""
        mock_results = MagicMock()
        mock_results.__iter__ = Mock(return_value=iter([]))
        search_service._search_client.search.return_value = mock_results

        await search_service.search(
            query="test",
            filters="source eq 'test-source'",
        )

        call_kwargs = search_service._search_client.search.call_args[1]
        assert call_kwargs["filter"] == "source eq 'test-source'"

    @pytest.mark.asyncio
    async def test_delete_document_success(self, search_service):
        """测试删除文档成功"""
        mock_result = MagicMock()
        mock_result.succeeded = True
        search_service._search_client.delete_documents.return_value = [mock_result]

        result = await search_service.delete_document("doc-1")

        assert result is True
        search_service._search_client.delete_documents.assert_called_once_with([{"id": "doc-1"}])

    @pytest.mark.asyncio
    async def test_delete_by_document_id_success(self, search_service):
        """测试按原始文档 ID 删除所有块"""
        # Mock 搜索返回
        mock_search_results = MagicMock()
        mock_search_results.__iter__ = Mock(return_value=iter([
            {"id": "chunk-1"},
            {"id": "chunk-2"},
        ]))
        search_service._search_client.search.return_value = mock_search_results

        # Mock 删除返回
        mock_delete_results = [MagicMock(succeeded=True), MagicMock(succeeded=True)]
        search_service._search_client.delete_documents.return_value = mock_delete_results

        result = await search_service.delete_by_document_id("original-doc-1")

        assert result == 2

    @pytest.mark.asyncio
    async def test_get_document_count(self, search_service):
        """测试获取文档数量"""
        mock_results = MagicMock()
        mock_results.get_count.return_value = 42
        search_service._search_client.search.return_value = mock_results

        count = await search_service.get_document_count()

        assert count == 42

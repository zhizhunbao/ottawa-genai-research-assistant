"""
Document Service Tests

Unit tests for document upload, processing status, and metadata service.

@template T2 backend/tests/test_service.py — Service Logic Pattern
"""

from unittest.mock import AsyncMock

import pytest

from app.core.enums import DocumentStatus, DocumentType
from app.documents.schemas import DocumentCreate
from app.documents.service import DocumentService


class TestDocumentService:
    """DocumentService 测试类"""

    @pytest.fixture
    def mock_doc_store(self) -> AsyncMock:
        """模拟 DocumentStore"""
        store = AsyncMock()
        return store

    @pytest.fixture
    def service(self, mock_doc_store: AsyncMock) -> DocumentService:
        """创建服务实例"""
        return DocumentService(mock_doc_store)

    @pytest.mark.asyncio
    async def test_upload_document_logic(self, service: DocumentService, mock_doc_store: AsyncMock) -> None:
        """测试文档上传（存入 Store）"""
        # Arrange
        data = DocumentCreate(
            title="Ottawa Budget 2024",
            file_name="budget.pdf",
            file_size=1024 * 1024,
            tags=["finance", "city"]
        )
        owner_id = "user-1"
        mock_doc_store.create.return_value = {
            "id": "doc-123",
            "type": DocumentType.UPLOADED_FILE, # 简化示例
            "data": data.model_dump(),
            "owner_id": owner_id,
            "status": DocumentStatus.PROCESSING,
            "tags": data.tags
        }

        # Act
        result = await service.upload(data, owner_id)

        # Assert
        assert result["id"] == "doc-123"
        assert result["status"] == DocumentStatus.PROCESSING
        mock_doc_store.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_document_success(self, service: DocumentService, mock_doc_store: AsyncMock) -> None:
        """测试获取文档"""
        # Arrange
        doc_id = "doc-123"
        mock_doc_store.get_by_id.return_value = {"id": doc_id, "title": "Test"}

        # Act
        result = await service.get_by_id(doc_id)

        # Assert
        assert result["id"] == doc_id
        mock_doc_store.get_by_id.assert_called_with(doc_id)

    @pytest.mark.asyncio
    async def test_list_documents(self, service: DocumentService, mock_doc_store: AsyncMock) -> None:
        """测试列出文档"""
        # Arrange
        owner_id = "user-1"
        mock_doc_store.list_by_type.return_value = [{"id": "1"}, {"id": "2"}]

        # Act
        results = await service.list(owner_id)

        # Assert
        assert len(results) == 2
        mock_doc_store.list_by_type.assert_called_with(
            doc_type=DocumentType.UPLOADED_FILE,
            owner_id=owner_id,
            limit=100
        )

    @pytest.mark.asyncio
    async def test_delete_document(self, service: DocumentService, mock_doc_store: AsyncMock) -> None:
        """测试删除文档"""
        # Arrange
        doc_id = "doc-123"
        mock_doc_store.delete.return_value = True

        # Act
        success = await service.delete(doc_id)

        # Assert
        assert success is True
        mock_doc_store.delete.assert_called_with(doc_id)

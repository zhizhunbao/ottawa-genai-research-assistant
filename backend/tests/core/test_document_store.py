"""
Document Store Integration Tests

Real database (SQLite) tests for CRUD operations on universal documents.

@template T3 backend/tests/test_db.py — Database Integration Pattern
"""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.document_store import DocumentStore
from app.core.enums import DocumentStatus, DocumentType


class TestDocumentStore:
    """DocumentStore 测试类"""

    @pytest.fixture
    def store(self, db_session: AsyncSession) -> DocumentStore:
        """创建 DocumentStore 实例"""
        return DocumentStore(db_session)

    @pytest.mark.asyncio
    async def test_create_document_success(self, store: DocumentStore) -> None:
        """测试创建文档成功"""
        # Arrange
        doc_type = DocumentType.CHART_RESULT
        data = {"chart_name": "Test Chart", "values": [1, 2, 3]}
        owner_id = "user-123"
        tags = ["test", "integration"]

        # Act
        result = await store.create(
            doc_type=doc_type,
            data=data,
            owner_id=owner_id,
            tags=tags
        )

        # Assert
        assert result["id"] is not None
        assert result["type"] == doc_type
        assert result["data"] == data
        assert result["owner_id"] == owner_id
        assert result["tags"] == tags
        assert result["status"] == DocumentStatus.ACTIVE

    @pytest.mark.asyncio
    async def test_get_by_id_success(self, store: DocumentStore) -> None:
        """测试按 ID 获取文档"""
        # Arrange
        created = await store.create(
            doc_type=DocumentType.SPEAKING_NOTE,
            data={"test": "data"}
        )
        doc_id = created["id"]

        # Act
        retrieved = await store.get_by_id(doc_id)

        # Assert
        assert retrieved is not None
        assert retrieved["id"] == doc_id
        assert retrieved["data"] == {"test": "data"}

    @pytest.mark.asyncio
    async def test_get_by_id_not_found(self, store: DocumentStore) -> None:
        """测试获取不存在的文档"""
        # Act
        result = await store.get_by_id("non-existent-id")

        # Assert
        assert result is None

    @pytest.mark.asyncio
    async def test_list_by_type_success(self, store: DocumentStore) -> None:
        """测试按类型列出文档"""
        # Arrange
        owner_id = "user-999"
        await store.create(DocumentType.PDF_CHUNK, {"p": 1}, owner_id=owner_id)
        await store.create(DocumentType.PDF_CHUNK, {"p": 2}, owner_id=owner_id)
        await store.create(DocumentType.PDF_CHUNK, {"p": 3}, owner_id="other-user")
        await store.create(DocumentType.CHART_RESULT, {"c": 1}, owner_id=owner_id)

        # Act
        results = await store.list_by_type(DocumentType.PDF_CHUNK, owner_id=owner_id)

        # Assert
        assert len(results) == 2
        for r in results:
            assert r["type"] == DocumentType.PDF_CHUNK
            assert r["owner_id"] == owner_id

    @pytest.mark.asyncio
    async def test_update_data_success(self, store: DocumentStore) -> None:
        """测试更新文档数据"""
        # Arrange
        created = await store.create(DocumentType.CHART_RESULT, {"v": 1})
        doc_id = created["id"]
        new_data = {"v": 2, "updated": True}

        # Act
        updated = await store.update_data(doc_id, new_data)

        # Assert
        assert updated is not None
        assert updated["data"] == new_data

        # 验证数据库中已保存
        db_doc = await store.get_by_id(doc_id)
        assert db_doc["data"] == new_data

    @pytest.mark.asyncio
    async def test_delete_document_success(self, store: DocumentStore) -> None:
        """测试删除文档"""
        # Arrange
        created = await store.create(DocumentType.CHART_RESULT, {"v": 1})
        doc_id = created["id"]

        # Act
        success = await store.delete(doc_id)

        # Assert
        assert success is True
        assert await store.get_by_id(doc_id) is None

    @pytest.mark.asyncio
    async def test_delete_non_existent_document(self, store: DocumentStore) -> None:
        """测试删除不存在的文档"""
        # Act
        success = await store.delete("no-id")

        # Assert
        assert success is False

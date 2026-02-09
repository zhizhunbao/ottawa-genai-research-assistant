"""
文档上传 API 集成测试

测试文件上传到 Azure Blob Storage 的完整流程。
"""

import pytest
from io import BytesIO
from unittest.mock import MagicMock, AsyncMock
from httpx import AsyncClient

from app.main import app
from app.core.dependencies import get_blob_storage
from app.documents.routes import get_document_service


class TestDocumentUploadEndpoint:
    """文档上传端点测试"""

    @pytest.fixture
    def mock_blob_storage(self):
        """Mock Blob Storage 服务"""
        mock_service = MagicMock()
        mock_service.upload_file = AsyncMock(return_value={
            "blob_name": "uuid/test.pdf",
            "blob_url": "https://test.blob.core.windows.net/documents/uuid/test.pdf",
            "filename": "test.pdf",
            "content_type": "application/pdf"
        })
        mock_service.download_file = AsyncMock(return_value=b"PDF content")
        mock_service.get_file_url = AsyncMock(
            return_value="https://test.blob.core.windows.net/documents/uuid/test.pdf?sas=token"
        )

        app.dependency_overrides[get_blob_storage] = lambda: mock_service
        yield mock_service
        app.dependency_overrides.pop(get_blob_storage, None)

    @pytest.mark.asyncio
    async def test_upload_pdf_success(self, client: AsyncClient, mock_blob_storage):
        """测试 PDF 上传成功"""
        # 创建测试 PDF 文件
        pdf_content = b"%PDF-1.4 test content"
        files = {
            "file": ("test.pdf", BytesIO(pdf_content), "application/pdf")
        }

        response = await client.post(
            "/api/v1/documents/upload",
            files=files,
            data={"title": "Test Document"}
        )

        # 验证响应
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "file_name" in data["data"]
        assert data["data"]["file_name"] == "test.pdf"

    @pytest.mark.asyncio
    async def test_upload_non_pdf_rejected(self, client: AsyncClient, mock_blob_storage):
        """测试非 PDF 文件被拒绝"""
        # 创建非 PDF 文件
        txt_content = b"This is a text file"
        files = {
            "file": ("test.txt", BytesIO(txt_content), "text/plain")
        }

        response = await client.post(
            "/api/v1/documents/upload",
            files=files
        )

        # 验证响应 - 应该返回 400
        assert response.status_code == 400
        data = response.json()
        assert "PDF" in data["detail"]

    @pytest.mark.asyncio
    async def test_upload_file_too_large(self, client: AsyncClient, mock_blob_storage):
        """测试文件过大被拒绝"""
        # 创建超过 50MB 的文件
        large_content = b"0" * (51 * 1024 * 1024)  # 51 MB
        files = {
            "file": ("large.pdf", BytesIO(large_content), "application/pdf")
        }

        response = await client.post(
            "/api/v1/documents/upload",
            files=files
        )

        # 验证响应 - 应该返回 413
        assert response.status_code == 413

    @pytest.fixture
    def mock_document_service(self):
        """Mock Document Service"""
        mock_service = MagicMock()
        mock_service.get_by_id = AsyncMock(return_value={
            "id": "doc-123",
            "file_name": "test.pdf",
            "blob_name": "uuid/test.pdf",
            "title": "Test Document"
        })
        mock_service.upload = AsyncMock(return_value={
            "id": "doc-123",
            "status": "processing"
        })

        app.dependency_overrides[get_document_service] = lambda: mock_service
        yield mock_service
        app.dependency_overrides.pop(get_document_service, None)

    @pytest.mark.asyncio
    async def test_download_document_success(self, client: AsyncClient, mock_blob_storage, mock_document_service):
        """测试文档下载成功"""
        response = await client.get("/api/v1/documents/doc-123/download")

        # 验证响应
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"

    @pytest.mark.asyncio
    async def test_download_document_not_found(self, client: AsyncClient, mock_blob_storage, mock_document_service):
        """测试下载不存在的文档"""
        mock_document_service.get_by_id = AsyncMock(return_value=None)

        response = await client.get("/api/v1/documents/nonexistent/download")

        # 验证响应 - 应该返回 404
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_get_download_url_success(self, client: AsyncClient, mock_blob_storage, mock_document_service):
        """测试获取下载 URL 成功"""
        response = await client.get("/api/v1/documents/doc-123/url?expiry_hours=2")

        # 验证响应
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "download_url" in data["data"]
        assert data["data"]["expires_in_hours"] == 2

    @pytest.mark.asyncio
    async def test_get_download_url_invalid_expiry(self, client: AsyncClient, mock_blob_storage, mock_document_service):
        """测试无效的过期时间"""
        response = await client.get("/api/v1/documents/doc-123/url?expiry_hours=100")

        # 验证响应 - 应该返回 400
        assert response.status_code == 400
        data = response.json()
        assert "between 1 and 24" in data["detail"]

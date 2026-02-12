"""
Azure Blob Storage 服务单元测试

测试 AzureBlobStorageService 的核心功能。

@template T2 backend/tests/test_service.py — Service Layer Mocking Pattern
"""

from io import BytesIO
from unittest.mock import MagicMock, patch

import pytest

from app.azure.storage import AzureBlobStorageService


class TestAzureBlobStorageService:
    """Azure Blob Storage 服务测试"""

    @pytest.fixture
    def mock_blob_service_client(self):
        """Mock BlobServiceClient"""
        with patch("app.azure.storage.BlobServiceClient") as mock:
            mock_instance = MagicMock()
            mock_instance.account_name = "testaccount"
            mock.from_connection_string.return_value = mock_instance
            yield mock, mock_instance

    @pytest.fixture
    def storage_service(self, mock_blob_service_client):
        """创建测试用 Storage Service"""
        mock_class, mock_instance = mock_blob_service_client
        mock_container_client = MagicMock()
        mock_instance.get_container_client.return_value = mock_container_client

        service = AzureBlobStorageService(
            connection_string="DefaultEndpointsProtocol=https;AccountName=test;AccountKey=testkey;EndpointSuffix=core.windows.net",
            container_name="documents"
        )
        service._mock_container_client = mock_container_client
        return service

    def test_init_success(self, mock_blob_service_client):
        """测试初始化成功"""
        mock_class, mock_instance = mock_blob_service_client
        mock_instance.get_container_client.return_value = MagicMock()

        service = AzureBlobStorageService(
            connection_string="DefaultEndpointsProtocol=https;AccountName=test;AccountKey=key;EndpointSuffix=core.windows.net",
            container_name="test-container"
        )

        assert service.container_name == "test-container"
        mock_class.from_connection_string.assert_called_once()

    def test_init_without_connection_string_raises_error(self):
        """测试无连接字符串时抛出错误"""
        with pytest.raises(ValueError, match="connection string is required"):
            AzureBlobStorageService(
                connection_string="",
                container_name="documents"
            )

    def test_generate_blob_name(self, storage_service):
        """测试 blob 名称生成"""
        blob_name = storage_service._generate_blob_name("test.pdf")

        # 格式: {uuid}/test.pdf
        parts = blob_name.split("/")
        assert len(parts) == 2
        assert parts[1] == "test.pdf"
        # UUID 格式检查
        assert len(parts[0]) == 36

    @pytest.mark.asyncio
    async def test_upload_file_success(self, storage_service):
        """测试文件上传成功"""
        mock_blob_client = MagicMock()
        mock_blob_client.url = "https://test.blob.core.windows.net/documents/uuid/test.pdf"
        storage_service._mock_container_client.get_blob_client.return_value = mock_blob_client

        file_content = b"PDF content here"
        file = BytesIO(file_content)

        result = await storage_service.upload_file(
            file=file,
            filename="test.pdf",
            content_type="application/pdf"
        )

        assert "blob_name" in result
        assert "blob_url" in result
        assert result["filename"] == "test.pdf"
        assert result["content_type"] == "application/pdf"
        mock_blob_client.upload_blob.assert_called_once()

    @pytest.mark.asyncio
    async def test_download_file_success(self, storage_service):
        """测试文件下载成功"""
        mock_blob_client = MagicMock()
        mock_download_stream = MagicMock()
        mock_download_stream.readall.return_value = b"PDF content"
        mock_blob_client.download_blob.return_value = mock_download_stream
        storage_service._mock_container_client.get_blob_client.return_value = mock_blob_client

        result = await storage_service.download_file("uuid/test.pdf")

        assert result == b"PDF content"
        mock_blob_client.download_blob.assert_called_once()

    @pytest.mark.asyncio
    async def test_download_file_not_found(self, storage_service):
        """测试下载不存在的文件"""
        from azure.core.exceptions import ResourceNotFoundError

        mock_blob_client = MagicMock()
        mock_blob_client.download_blob.side_effect = ResourceNotFoundError("Not found")
        storage_service._mock_container_client.get_blob_client.return_value = mock_blob_client

        result = await storage_service.download_file("nonexistent.pdf")

        assert result is None

    @pytest.mark.asyncio
    async def test_delete_file_success(self, storage_service):
        """测试删除文件成功"""
        mock_blob_client = MagicMock()
        storage_service._mock_container_client.get_blob_client.return_value = mock_blob_client

        result = await storage_service.delete_file("uuid/test.pdf")

        assert result is True
        mock_blob_client.delete_blob.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_file_not_found(self, storage_service):
        """测试删除不存在的文件"""
        from azure.core.exceptions import ResourceNotFoundError

        mock_blob_client = MagicMock()
        mock_blob_client.delete_blob.side_effect = ResourceNotFoundError("Not found")
        storage_service._mock_container_client.get_blob_client.return_value = mock_blob_client

        result = await storage_service.delete_file("nonexistent.pdf")

        assert result is False

    @pytest.mark.asyncio
    async def test_file_exists_true(self, storage_service):
        """测试文件存在检查 - 存在"""
        mock_blob_client = MagicMock()
        mock_blob_client.exists.return_value = True
        storage_service._mock_container_client.get_blob_client.return_value = mock_blob_client

        result = await storage_service.file_exists("uuid/test.pdf")

        assert result is True

    @pytest.mark.asyncio
    async def test_file_exists_false(self, storage_service):
        """测试文件存在检查 - 不存在"""
        mock_blob_client = MagicMock()
        mock_blob_client.exists.return_value = False
        storage_service._mock_container_client.get_blob_client.return_value = mock_blob_client

        result = await storage_service.file_exists("uuid/test.pdf")

        assert result is False

    @pytest.mark.asyncio
    async def test_list_files(self, storage_service):
        """测试列出文件"""
        from datetime import datetime

        mock_blob1 = MagicMock()
        mock_blob1.name = "uuid1/file1.pdf"
        mock_blob1.size = 1024
        mock_blob1.last_modified = datetime(2026, 2, 8, 10, 0, 0)
        mock_blob1.content_settings = MagicMock()
        mock_blob1.content_settings.content_type = "application/pdf"

        mock_blob2 = MagicMock()
        mock_blob2.name = "uuid2/file2.pdf"
        mock_blob2.size = 2048
        mock_blob2.last_modified = None
        mock_blob2.content_settings = None

        storage_service._mock_container_client.list_blobs.return_value = [mock_blob1, mock_blob2]

        result = await storage_service.list_files()

        assert len(result) == 2
        assert result[0]["name"] == "uuid1/file1.pdf"
        assert result[0]["size"] == 1024
        assert result[1]["name"] == "uuid2/file2.pdf"

    def test_extract_account_key(self, storage_service):
        """测试从连接字符串提取 account key"""
        key = storage_service._extract_account_key()
        assert key == "testkey"

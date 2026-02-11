"""
Azure Blob Storage 服务

提供文件上传、下载、删除功能。
遵循 dev-backend_patterns skill 规范。
"""

import logging
import uuid
from datetime import UTC, datetime, timedelta
from typing import BinaryIO

from azure.core.exceptions import AzureError, ResourceNotFoundError
from azure.storage.blob import (
    BlobSasPermissions,
    BlobServiceClient,
    generate_blob_sas,
)

logger = logging.getLogger(__name__)


class AzureBlobStorageError(Exception):
    """Azure Blob Storage 操作错误"""
    pass


class AzureBlobStorageService:
    """
    Azure Blob Storage 操作封装

    提供文件上传、下载、删除和 SAS URL 生成功能。
    """

    def __init__(self, connection_string: str, container_name: str):
        """
        初始化 Blob Storage 服务

        Args:
            connection_string: Azure Storage 连接字符串
            container_name: 容器名称
        """
        if not connection_string:
            raise ValueError("Azure Storage connection string is required")

        self.connection_string = connection_string
        self.container_name = container_name

        try:
            self.blob_service_client = BlobServiceClient.from_connection_string(
                connection_string
            )
            self.container_client = self.blob_service_client.get_container_client(
                container_name
            )
        except Exception as e:
            logger.error(f"Failed to initialize Blob Storage client: {e}")
            raise AzureBlobStorageError(f"Failed to initialize storage client: {e}")

    def _generate_blob_name(self, filename: str) -> str:
        """
        生成唯一的 blob 名称

        格式: {uuid}/{original_filename}
        """
        unique_id = str(uuid.uuid4())
        return f"{unique_id}/{filename}"

    async def upload_file(
        self,
        file: BinaryIO,
        filename: str,
        content_type: str = "application/pdf"
    ) -> dict:
        """
        上传文件到 Blob Storage

        Args:
            file: 文件对象 (BinaryIO)
            filename: 原始文件名
            content_type: MIME 类型

        Returns:
            dict: 包含 blob_name 和 blob_url
        """
        blob_name = self._generate_blob_name(filename)

        try:
            blob_client = self.container_client.get_blob_client(blob_name)

            # 上传文件
            blob_client.upload_blob(
                file,
                content_type=content_type,
                overwrite=True
            )

            logger.info(f"Successfully uploaded file: {blob_name}")

            return {
                "blob_name": blob_name,
                "blob_url": blob_client.url,
                "filename": filename,
                "content_type": content_type
            }

        except AzureError as e:
            logger.error(f"Failed to upload file {filename}: {e}")
            raise AzureBlobStorageError(f"Upload failed: {e}")

    async def download_file(self, blob_name: str) -> bytes | None:
        """
        下载文件内容

        Args:
            blob_name: Blob 名称

        Returns:
            bytes: 文件内容，如果不存在返回 None
        """
        try:
            blob_client = self.container_client.get_blob_client(blob_name)
            download_stream = blob_client.download_blob()
            content = download_stream.readall()

            logger.info(f"Successfully downloaded file: {blob_name}")
            return content

        except ResourceNotFoundError:
            logger.warning(f"File not found: {blob_name}")
            return None
        except AzureError as e:
            logger.error(f"Failed to download file {blob_name}: {e}")
            raise AzureBlobStorageError(f"Download failed: {e}")

    async def delete_file(self, blob_name: str) -> bool:
        """
        删除文件

        Args:
            blob_name: Blob 名称

        Returns:
            bool: 删除成功返回 True
        """
        try:
            blob_client = self.container_client.get_blob_client(blob_name)
            blob_client.delete_blob()

            logger.info(f"Successfully deleted file: {blob_name}")
            return True

        except ResourceNotFoundError:
            logger.warning(f"File not found for deletion: {blob_name}")
            return False
        except AzureError as e:
            logger.error(f"Failed to delete file {blob_name}: {e}")
            raise AzureBlobStorageError(f"Delete failed: {e}")

    async def get_file_url(
        self,
        blob_name: str,
        expiry_hours: int = 1
    ) -> str | None:
        """
        生成带 SAS 的临时访问 URL

        Args:
            blob_name: Blob 名称
            expiry_hours: URL 有效期（小时）

        Returns:
            str: 带 SAS token 的 URL
        """
        try:
            blob_client = self.container_client.get_blob_client(blob_name)

            # 检查 blob 是否存在
            if not blob_client.exists():
                return None

            # 从连接字符串解析账户信息
            account_name = self.blob_service_client.account_name
            account_key = self._extract_account_key()

            if not account_key:
                # 如果无法获取 account key，返回直接 URL（需要公共访问）
                return blob_client.url

            # 生成 SAS token
            sas_token = generate_blob_sas(
                account_name=account_name,
                container_name=self.container_name,
                blob_name=blob_name,
                account_key=account_key,
                permission=BlobSasPermissions(read=True),
                expiry=datetime.now(UTC) + timedelta(hours=expiry_hours)
            )

            return f"{blob_client.url}?{sas_token}"

        except Exception as e:
            logger.error(f"Failed to generate SAS URL for {blob_name}: {e}")
            return None

    def _extract_account_key(self) -> str | None:
        """从连接字符串提取 account key"""
        try:
            parts = dict(
                part.split("=", 1)
                for part in self.connection_string.split(";")
                if "=" in part
            )
            return parts.get("AccountKey")
        except Exception:
            return None

    async def list_files(self, prefix: str = "") -> list[dict]:
        """
        列出容器中的文件

        Args:
            prefix: 文件名前缀过滤

        Returns:
            List[dict]: 文件信息列表
        """
        try:
            blobs = self.container_client.list_blobs(name_starts_with=prefix)

            return [
                {
                    "name": blob.name,
                    "size": blob.size,
                    "last_modified": blob.last_modified.isoformat() if blob.last_modified else None,
                    "content_type": blob.content_settings.content_type if blob.content_settings else None
                }
                for blob in blobs
            ]

        except AzureError as e:
            logger.error(f"Failed to list files: {e}")
            raise AzureBlobStorageError(f"List files failed: {e}")

    async def file_exists(self, blob_name: str) -> bool:
        """
        检查文件是否存在

        Args:
            blob_name: Blob 名称

        Returns:
            bool: 存在返回 True
        """
        try:
            blob_client = self.container_client.get_blob_client(blob_name)
            return blob_client.exists()
        except AzureError:
            return False

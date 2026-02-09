"""
依赖注入模块

定义可复用的 FastAPI 依赖项。
遵循 dev-backend_patterns skill 规范。
遵循 dev-tdd_workflow skill 规范。
"""

from functools import lru_cache
from typing import Annotated, Optional

from fastapi import Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.core.config import settings


# 数据库会话依赖
DbSession = Annotated[AsyncSession, Depends(get_db)]

# 当前用户 ID 依赖
CurrentUserId = Annotated[str, Depends(get_current_user_id)]


class PaginationParams:
    """分页参数依赖"""

    def __init__(
        self,
        page: int = Query(1, ge=1, description="页码"),
        page_size: int = Query(20, ge=1, le=100, description="每页大小"),
    ) -> None:
        self.page = page
        self.page_size = page_size
        self.offset = (page - 1) * page_size


# 分页参数依赖
Pagination = Annotated[PaginationParams, Depends()]


# Azure Blob Storage 依赖
_blob_storage_instance: Optional["AzureBlobStorageService"] = None


def get_blob_storage() -> "AzureBlobStorageService":
    """
    获取 Azure Blob Storage 服务实例（单例）

    Returns:
        AzureBlobStorageService: Blob Storage 服务实例
    """
    global _blob_storage_instance

    if _blob_storage_instance is None:
        from app.core.azure_storage import AzureBlobStorageService

        if not settings.azure_storage_connection_string:
            raise ValueError(
                "Azure Storage connection string not configured. "
                "Please set AZURE_STORAGE_CONNECTION_STRING environment variable."
            )

        _blob_storage_instance = AzureBlobStorageService(
            connection_string=settings.azure_storage_connection_string,
            container_name=settings.azure_storage_container_name,
        )

    return _blob_storage_instance


# Blob Storage 依赖类型
BlobStorage = Annotated["AzureBlobStorageService", Depends(get_blob_storage)]


# Azure AI Search 依赖
_search_service_instance: Optional["AzureSearchService"] = None


def get_search_service() -> "AzureSearchService":
    """
    获取 Azure AI Search 服务实例（单例）

    Returns:
        AzureSearchService: Search 服务实例

    Raises:
        ValueError: 如果 Azure Search 未配置
    """
    global _search_service_instance

    if _search_service_instance is None:
        from app.core.azure_search import AzureSearchService

        if not settings.azure_search_endpoint or not settings.azure_search_api_key:
            raise ValueError(
                "Azure Search not configured. "
                "Please set AZURE_SEARCH_ENDPOINT and AZURE_SEARCH_API_KEY."
            )

        _search_service_instance = AzureSearchService(
            endpoint=settings.azure_search_endpoint,
            api_key=settings.azure_search_api_key,
            index_name=settings.azure_search_index_name,
        )

    return _search_service_instance


def get_search_service_optional() -> Optional["AzureSearchService"]:
    """
    获取 Azure AI Search 服务实例（可选，单例）

    如果未配置则返回 None，不抛出异常。
    用于需要 fallback 到 mock 的场景。

    Returns:
        AzureSearchService | None: Search 服务实例或 None
    """
    try:
        return get_search_service()
    except ValueError:
        return None


# Search 依赖类型
SearchService = Annotated["AzureSearchService", Depends(get_search_service)]
OptionalSearchService = Annotated[Optional["AzureSearchService"], Depends(get_search_service_optional)]


# Azure OpenAI 依赖
_openai_service_instance: Optional["AzureOpenAIService"] = None


def get_openai_service() -> "AzureOpenAIService":
    """
    获取 Azure OpenAI 服务实例（单例）

    Returns:
        AzureOpenAIService: OpenAI 服务实例

    Raises:
        ValueError: 如果 Azure OpenAI 未配置
    """
    global _openai_service_instance

    if _openai_service_instance is None:
        from app.core.azure_openai import AzureOpenAIService

        if not settings.azure_openai_endpoint or not settings.azure_openai_api_key:
            raise ValueError(
                "Azure OpenAI not configured. "
                "Please set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY."
            )

        _openai_service_instance = AzureOpenAIService(
            endpoint=settings.azure_openai_endpoint,
            api_key=settings.azure_openai_api_key,
            api_version=settings.azure_openai_api_version,
            chat_deployment=settings.azure_openai_chat_deployment,
            embedding_deployment=settings.azure_openai_embedding_deployment,
        )

    return _openai_service_instance


def get_openai_service_optional() -> Optional["AzureOpenAIService"]:
    """
    获取 Azure OpenAI 服务实例（可选，单例）

    如果未配置则返回 None，不抛出异常。
    用于需要 fallback 到 mock 的场景。

    Returns:
        AzureOpenAIService | None: OpenAI 服务实例或 None
    """
    try:
        return get_openai_service()
    except ValueError:
        return None


# OpenAI 依赖类型
OpenAIService = Annotated["AzureOpenAIService", Depends(get_openai_service)]
OptionalOpenAIService = Annotated[Optional["AzureOpenAIService"], Depends(get_openai_service_optional)]

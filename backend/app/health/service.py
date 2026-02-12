"""
Health Check Service

Monitors the availability and latency of Azure integration services.

@template A10 backend/domain/service.py — Shared CRUD & Logic Layer
"""

import logging
import time

from app.core.config import settings
from app.health.schemas import HealthCheckResponse, HealthStatus, ServiceHealth

logger = logging.getLogger(__name__)


class HealthCheckService:
    """Service for checking health of all Azure resources."""

    VERSION = "0.1.0"

    async def check_all(self) -> HealthCheckResponse:
        """Check health of all services."""
        services = []

        # Check each Azure service
        services.append(await self.check_storage())
        services.append(await self.check_search())
        services.append(await self.check_openai())

        # Determine overall status
        unhealthy_count = sum(1 for s in services if s.status == HealthStatus.UNHEALTHY)
        degraded_count = sum(1 for s in services if s.status == HealthStatus.DEGRADED)

        if unhealthy_count > 0:
            overall_status = HealthStatus.UNHEALTHY
        elif degraded_count > 0:
            overall_status = HealthStatus.DEGRADED
        else:
            overall_status = HealthStatus.HEALTHY

        return HealthCheckResponse(
            status=overall_status,
            version=self.VERSION,
            environment=settings.app_env,
            services=services,
        )

    async def check_storage(self) -> ServiceHealth:
        """Check Azure Blob Storage health."""
        start_time = time.time()
        name = "azure_storage"

        if not settings.azure_storage_connection_string:
            return ServiceHealth(
                name=name,
                status=HealthStatus.UNHEALTHY,
                message="Connection string not configured",
            )

        try:
            from app.azure.storage import AzureBlobStorageService

            storage = AzureBlobStorageService(
                connection_string=settings.azure_storage_connection_string,
                container_name=settings.azure_storage_container_name,
            )
            # Simple operation to verify connection
            await storage.list_files(prefix="__health_check__")

            latency_ms = (time.time() - start_time) * 1000
            return ServiceHealth(
                name=name,
                status=HealthStatus.HEALTHY,
                message="Connected",
                latency_ms=round(latency_ms, 2),
            )
        except Exception as e:
            logger.error(f"Storage health check failed: {e}")
            latency_ms = (time.time() - start_time) * 1000
            return ServiceHealth(
                name=name,
                status=HealthStatus.UNHEALTHY,
                message=str(e),
                latency_ms=round(latency_ms, 2),
            )

    async def check_search(self) -> ServiceHealth:
        """Check Azure AI Search health."""
        start_time = time.time()
        name = "azure_search"

        if not settings.azure_search_endpoint or not settings.azure_search_api_key:
            return ServiceHealth(
                name=name,
                status=HealthStatus.UNHEALTHY,
                message="Endpoint or API key not configured",
            )

        try:
            from app.azure.search import AzureSearchService

            search = AzureSearchService(
                endpoint=settings.azure_search_endpoint,
                api_key=settings.azure_search_api_key,
                index_name=settings.azure_search_index_name,
            )
            # Simple operation to verify connection
            await search.get_document_count()

            latency_ms = (time.time() - start_time) * 1000
            return ServiceHealth(
                name=name,
                status=HealthStatus.HEALTHY,
                message="Connected",
                latency_ms=round(latency_ms, 2),
            )
        except Exception as e:
            logger.error(f"Search health check failed: {e}")
            latency_ms = (time.time() - start_time) * 1000
            return ServiceHealth(
                name=name,
                status=HealthStatus.UNHEALTHY,
                message=str(e),
                latency_ms=round(latency_ms, 2),
            )

    async def check_openai(self) -> ServiceHealth:
        """Check Azure OpenAI health."""
        start_time = time.time()
        name = "azure_openai"

        if not settings.azure_openai_endpoint or not settings.azure_openai_api_key:
            return ServiceHealth(
                name=name,
                status=HealthStatus.UNHEALTHY,
                message="Endpoint or API key not configured",
            )

        try:
            from app.azure.openai import AzureOpenAIService

            openai_svc = AzureOpenAIService(
                endpoint=settings.azure_openai_endpoint,
                api_key=settings.azure_openai_api_key,
                chat_deployment=settings.azure_openai_chat_deployment,
                embedding_deployment=settings.azure_openai_embedding_deployment,
            )
            # Simple embedding to verify connection
            embedding = await openai_svc.create_embedding("health check")

            latency_ms = (time.time() - start_time) * 1000

            if len(embedding) != 1536:
                return ServiceHealth(
                    name=name,
                    status=HealthStatus.DEGRADED,
                    message=f"Unexpected embedding dimension: {len(embedding)}",
                    latency_ms=round(latency_ms, 2),
                )

            return ServiceHealth(
                name=name,
                status=HealthStatus.HEALTHY,
                message="Connected",
                latency_ms=round(latency_ms, 2),
            )
        except Exception as e:
            logger.error(f"OpenAI health check failed: {e}")
            latency_ms = (time.time() - start_time) * 1000
            return ServiceHealth(
                name=name,
                status=HealthStatus.UNHEALTHY,
                message=str(e),
                latency_ms=round(latency_ms, 2),
            )

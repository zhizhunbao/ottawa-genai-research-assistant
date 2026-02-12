"""Health check endpoint tests.

@template T1 backend/tests/test_routes.py — API Integration Pattern
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.health.schemas import HealthCheckResponse, HealthStatus, ServiceHealth
from app.health.service import HealthCheckService


class TestHealthCheckService:
    """Tests for HealthCheckService."""

    @pytest.fixture
    def service(self):
        """Create health check service instance."""
        return HealthCheckService()

    async def test_check_storage_success(self, service):
        """Test storage health check success."""
        with patch("app.health.service.settings") as mock_settings:
            mock_settings.azure_storage_connection_string = "test-connection"
            mock_settings.azure_storage_container_name = "test-container"

            with patch("app.azure.storage.AzureBlobStorageService") as mock_storage:
                mock_instance = MagicMock()
                mock_instance.list_files = AsyncMock(return_value=[])
                mock_storage.return_value = mock_instance

                result = await service.check_storage()

                assert result.name == "azure_storage"
                assert result.status == HealthStatus.HEALTHY
                assert result.message == "Connected"
                assert result.latency_ms is not None

    async def test_check_storage_not_configured(self, service):
        """Test storage health check when not configured."""
        with patch("app.health.service.settings") as mock_settings:
            mock_settings.azure_storage_connection_string = ""

            result = await service.check_storage()

            assert result.name == "azure_storage"
            assert result.status == HealthStatus.UNHEALTHY
            assert "not configured" in result.message

    async def test_check_storage_connection_error(self, service):
        """Test storage health check on connection error."""
        with patch("app.health.service.settings") as mock_settings:
            mock_settings.azure_storage_connection_string = "test-connection"
            mock_settings.azure_storage_container_name = "test-container"

            with patch("app.azure.storage.AzureBlobStorageService") as mock_storage:
                mock_storage.side_effect = Exception("Connection failed")

                result = await service.check_storage()

                assert result.name == "azure_storage"
                assert result.status == HealthStatus.UNHEALTHY
                assert "Connection failed" in result.message

    async def test_check_search_success(self, service):
        """Test search health check success."""
        with patch("app.health.service.settings") as mock_settings:
            mock_settings.azure_search_endpoint = "https://test.search.windows.net"
            mock_settings.azure_search_api_key = "test-key"
            mock_settings.azure_search_index_name = "test-index"

            with patch("app.azure.search.AzureSearchService") as mock_search:
                mock_instance = MagicMock()
                mock_instance.get_document_count = AsyncMock(return_value=0)
                mock_search.return_value = mock_instance

                result = await service.check_search()

                assert result.name == "azure_search"
                assert result.status == HealthStatus.HEALTHY
                assert result.message == "Connected"

    async def test_check_search_not_configured(self, service):
        """Test search health check when not configured."""
        with patch("app.health.service.settings") as mock_settings:
            mock_settings.azure_search_endpoint = ""
            mock_settings.azure_search_api_key = ""

            result = await service.check_search()

            assert result.name == "azure_search"
            assert result.status == HealthStatus.UNHEALTHY
            assert "not configured" in result.message

    async def test_check_openai_success(self, service):
        """Test OpenAI health check success."""
        with patch("app.health.service.settings") as mock_settings:
            mock_settings.azure_openai_endpoint = "https://test.openai.azure.com"
            mock_settings.azure_openai_api_key = "test-key"
            mock_settings.azure_openai_chat_deployment = "gpt-4o-mini"
            mock_settings.azure_openai_embedding_deployment = "text-embedding-ada-002"

            with patch("app.azure.openai.AzureOpenAIService") as mock_openai:
                mock_instance = MagicMock()
                mock_instance.create_embedding = AsyncMock(return_value=[0.0] * 1536)
                mock_openai.return_value = mock_instance

                result = await service.check_openai()

                assert result.name == "azure_openai"
                assert result.status == HealthStatus.HEALTHY
                assert result.message == "Connected"

    async def test_check_openai_not_configured(self, service):
        """Test OpenAI health check when not configured."""
        with patch("app.health.service.settings") as mock_settings:
            mock_settings.azure_openai_endpoint = ""
            mock_settings.azure_openai_api_key = ""

            result = await service.check_openai()

            assert result.name == "azure_openai"
            assert result.status == HealthStatus.UNHEALTHY
            assert "not configured" in result.message

    async def test_check_openai_wrong_dimension(self, service):
        """Test OpenAI health check with wrong embedding dimension."""
        with patch("app.health.service.settings") as mock_settings:
            mock_settings.azure_openai_endpoint = "https://test.openai.azure.com"
            mock_settings.azure_openai_api_key = "test-key"
            mock_settings.azure_openai_chat_deployment = "gpt-4o-mini"
            mock_settings.azure_openai_embedding_deployment = "text-embedding-ada-002"

            with patch("app.azure.openai.AzureOpenAIService") as mock_openai:
                mock_instance = MagicMock()
                mock_instance.create_embedding = AsyncMock(return_value=[0.0] * 512)
                mock_openai.return_value = mock_instance

                result = await service.check_openai()

                assert result.name == "azure_openai"
                assert result.status == HealthStatus.DEGRADED
                assert "Unexpected embedding dimension" in result.message

    async def test_check_all_healthy(self, service):
        """Test check_all when all services are healthy."""
        with patch.object(service, "check_storage") as mock_storage, \
             patch.object(service, "check_search") as mock_search, \
             patch.object(service, "check_openai") as mock_openai, \
             patch("app.health.service.settings") as mock_settings:

            mock_settings.app_env = "development"

            mock_storage.return_value = ServiceHealth(
                name="azure_storage",
                status=HealthStatus.HEALTHY,
                message="Connected",
            )
            mock_search.return_value = ServiceHealth(
                name="azure_search",
                status=HealthStatus.HEALTHY,
                message="Connected",
            )
            mock_openai.return_value = ServiceHealth(
                name="azure_openai",
                status=HealthStatus.HEALTHY,
                message="Connected",
            )

            result = await service.check_all()

            assert result.status == HealthStatus.HEALTHY
            assert len(result.services) == 3
            assert result.is_healthy

    async def test_check_all_unhealthy(self, service):
        """Test check_all when one service is unhealthy."""
        with patch.object(service, "check_storage") as mock_storage, \
             patch.object(service, "check_search") as mock_search, \
             patch.object(service, "check_openai") as mock_openai, \
             patch("app.health.service.settings") as mock_settings:

            mock_settings.app_env = "development"

            mock_storage.return_value = ServiceHealth(
                name="azure_storage",
                status=HealthStatus.HEALTHY,
                message="Connected",
            )
            mock_search.return_value = ServiceHealth(
                name="azure_search",
                status=HealthStatus.UNHEALTHY,
                message="Connection failed",
            )
            mock_openai.return_value = ServiceHealth(
                name="azure_openai",
                status=HealthStatus.HEALTHY,
                message="Connected",
            )

            result = await service.check_all()

            assert result.status == HealthStatus.UNHEALTHY
            assert not result.is_healthy

    async def test_check_all_degraded(self, service):
        """Test check_all when one service is degraded."""
        with patch.object(service, "check_storage") as mock_storage, \
             patch.object(service, "check_search") as mock_search, \
             patch.object(service, "check_openai") as mock_openai, \
             patch("app.health.service.settings") as mock_settings:

            mock_settings.app_env = "development"

            mock_storage.return_value = ServiceHealth(
                name="azure_storage",
                status=HealthStatus.HEALTHY,
                message="Connected",
            )
            mock_search.return_value = ServiceHealth(
                name="azure_search",
                status=HealthStatus.HEALTHY,
                message="Connected",
            )
            mock_openai.return_value = ServiceHealth(
                name="azure_openai",
                status=HealthStatus.DEGRADED,
                message="Slow response",
            )

            result = await service.check_all()

            assert result.status == HealthStatus.DEGRADED


class TestHealthCheckSchemas:
    """Tests for health check schemas."""

    def test_health_check_response_is_healthy(self):
        """Test HealthCheckResponse.is_healthy property."""
        response = HealthCheckResponse(
            status=HealthStatus.HEALTHY,
            version="0.1.0",
            environment="development",
            services=[],
        )
        assert response.is_healthy is True

        response.status = HealthStatus.UNHEALTHY
        assert response.is_healthy is False

    def test_service_health_creation(self):
        """Test ServiceHealth creation."""
        health = ServiceHealth(
            name="test_service",
            status=HealthStatus.HEALTHY,
            message="OK",
            latency_ms=10.5,
        )
        assert health.name == "test_service"
        assert health.status == HealthStatus.HEALTHY
        assert health.latency_ms == 10.5

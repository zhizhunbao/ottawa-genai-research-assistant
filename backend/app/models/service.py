"""
Model Service

Business logic for LLM and embedding model management.

@template A8 backend/domain/service.py — Business Logic Service
"""

import logging
import time
from collections.abc import AsyncIterator

from app.core.config import settings
from app.models.schemas import (
    DiskUsageStats,
    HealthStatus,
    ModelDetail,
    ModelInfo,
    ModelProvider,
    ModelType,
    PullProgress,
    RunningModel,
    TestResult,
)
from app.ollama.service import OllamaError, OllamaService

logger = logging.getLogger(__name__)


class ModelService:
    """Service for managing LLM and embedding models."""

    # Known embedding model base names
    EMBEDDING_MODELS = {
        "nomic-embed-text",
        "bge-m3",
        "mxbai-embed-large",
        "all-minilm",
        "snowflake-arctic-embed",
        "bge-large",
    }

    def __init__(self) -> None:
        self.ollama = OllamaService(base_url=settings.ollama_base_url)

    def _classify_model_type(self, name: str) -> ModelType:
        """Determine if a model is LLM or embedding based on name."""
        base_name = name.split(":")[0]
        if base_name in self.EMBEDDING_MODELS:
            return ModelType.EMBEDDING
        return ModelType.LLM

    def _format_size(self, size_bytes: int | None) -> str | None:
        """Format bytes as human-readable size."""
        if not size_bytes:
            return None
        return self.ollama.format_size(size_bytes)

    # ── List Models ──────────────────────────────────────────────────

    async def list_models(
        self, model_type: ModelType | None = None
    ) -> list[ModelInfo]:
        """
        List all available models (Azure + Ollama).

        Args:
            model_type: Filter by model type (LLM or EMBEDDING)

        Returns:
            List of ModelInfo
        """
        models: list[ModelInfo] = []

        # Azure OpenAI (LLM only)
        if model_type in (None, ModelType.LLM):
            if settings.azure_openai_endpoint and settings.azure_openai_api_key:
                deployment = settings.azure_openai_chat_deployment
                models.append(
                    ModelInfo(
                        id=deployment,
                        name=deployment,
                        provider=ModelProvider.AZURE,
                        model_type=ModelType.LLM,
                        available=True,
                    )
                )

        # Azure embedding model
        if model_type in (None, ModelType.EMBEDDING):
            if settings.azure_openai_endpoint and settings.azure_openai_api_key:
                embed_deployment = getattr(
                    settings, "azure_openai_embedding_deployment", None
                )
                if embed_deployment:
                    models.append(
                        ModelInfo(
                            id=embed_deployment,
                            name=embed_deployment,
                            provider=ModelProvider.AZURE,
                            model_type=ModelType.EMBEDDING,
                            available=True,
                        )
                    )

        # Ollama models
        try:
            if await self.ollama.is_available():
                ollama_models = await self.ollama.list_models()
                for m in ollama_models:
                    name = m.get("name", m.get("model", ""))
                    mt = self._classify_model_type(name)
                    if model_type and mt != model_type:
                        continue
                    models.append(
                        ModelInfo(
                            id=name,
                            name=name,
                            provider=ModelProvider.OLLAMA,
                            model_type=mt,
                            available=True,
                            size=m.get("size"),
                            size_formatted=self._format_size(m.get("size")),
                            modified_at=m.get("modified_at"),
                            digest=m.get("digest"),
                        )
                    )
        except OllamaError as e:
            logger.warning(f"Failed to list Ollama models: {e}")

        return models

    async def list_llm_models(self) -> list[ModelInfo]:
        """List LLM models only."""
        return await self.list_models(model_type=ModelType.LLM)

    async def list_embedding_models(self) -> list[ModelInfo]:
        """List embedding models only."""
        return await self.list_models(model_type=ModelType.EMBEDDING)

    # ── Model Details ────────────────────────────────────────────────

    async def get_model_detail(self, name: str) -> ModelDetail:
        """
        Get detailed information about a specific model.

        Args:
            name: Model name

        Returns:
            ModelDetail with full info
        """
        # For Azure models, return basic info
        if name in (
            settings.azure_openai_chat_deployment,
            getattr(settings, "azure_openai_embedding_deployment", None),
        ):
            mt = ModelType.EMBEDDING if "embed" in name.lower() else ModelType.LLM
            return ModelDetail(
                id=name,
                name=name,
                provider=ModelProvider.AZURE,
                model_type=mt,
                available=True,
            )

        # For Ollama models, get detailed info
        try:
            info = await self.ollama.show_model(name)
            mt = self._classify_model_type(name)

            # Parse parameters from modelfile or details
            parameters = info.get("parameters", {})
            details = info.get("details", {})

            # Extract context length from parameters
            context_length = None
            if isinstance(parameters, dict):
                context_length = parameters.get("num_ctx")

            return ModelDetail(
                id=name,
                name=name,
                provider=ModelProvider.OLLAMA,
                model_type=mt,
                available=True,
                parameters=parameters if isinstance(parameters, dict) else None,
                template=info.get("template"),
                system=info.get("system"),
                license=info.get("license"),
                modelfile=info.get("modelfile"),
                parameter_size=details.get("parameter_size"),
                quantization_level=details.get("quantization_level"),
                context_length=context_length,
            )
        except OllamaError:
            raise

    # ── Pull Model ───────────────────────────────────────────────────

    async def pull_model(self, name: str) -> AsyncIterator[PullProgress]:
        """
        Pull (download) a model with streaming progress.

        Args:
            name: Model name to pull

        Yields:
            PullProgress events
        """
        async for event in self.ollama.pull_model(name):
            yield PullProgress(
                status=event.get("status", ""),
                digest=event.get("digest"),
                total=event.get("total"),
                completed=event.get("completed"),
                percent=event.get("percent"),
            )

    # ── Delete Model ─────────────────────────────────────────────────

    async def delete_model(self, name: str) -> bool:
        """
        Delete a model.

        Args:
            name: Model name to delete

        Returns:
            True if deleted
        """
        return await self.ollama.delete_model(name)

    # ── Test Model ───────────────────────────────────────────────────

    async def test_model(
        self,
        model: str,
        prompt: str,
        max_tokens: int = 100,
        temperature: float = 0.7,
    ) -> TestResult:
        """
        Test a model with a prompt.

        Args:
            model: Model name
            prompt: Test prompt
            max_tokens: Max tokens to generate
            temperature: Temperature setting

        Returns:
            TestResult with response and latency
        """
        start_time = time.perf_counter()

        # Use Ollama for local models
        try:
            response = await self.ollama.chat_completion(
                messages=[{"role": "user", "content": prompt}],
                model=model,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            latency_ms = (time.perf_counter() - start_time) * 1000

            return TestResult(
                model=model,
                prompt=prompt,
                response=response,
                latency_ms=round(latency_ms, 2),
            )
        except OllamaError:
            raise

    # ── Disk Usage ───────────────────────────────────────────────────

    async def get_disk_usage(self) -> DiskUsageStats:
        """
        Get disk usage statistics for all Ollama models.

        Returns:
            DiskUsageStats with total size and per-model breakdown
        """
        models = await self.list_models()
        ollama_models = [m for m in models if m.provider == ModelProvider.OLLAMA]

        total_size = sum(m.size or 0 for m in ollama_models)

        return DiskUsageStats(
            total_size=total_size,
            total_size_formatted=self._format_size(total_size) or "0 B",
            model_count=len(ollama_models),
            models=ollama_models,
        )

    # ── Running Models ───────────────────────────────────────────────

    async def get_running_models(self) -> list[RunningModel]:
        """
        Get models currently loaded in Ollama memory.

        Returns:
            List of RunningModel
        """
        try:
            models = await self.ollama.get_running_models()
            return [
                RunningModel(
                    name=m.get("name", ""),
                    size=m.get("size"),
                    size_formatted=self._format_size(m.get("size")),
                    expires_at=m.get("expires_at"),
                )
                for m in models
            ]
        except OllamaError:
            return []

    # ── Health Check ─────────────────────────────────────────────────

    async def check_health(self) -> list[HealthStatus]:
        """
        Check health of all model providers.

        Returns:
            List of HealthStatus for each provider
        """
        results: list[HealthStatus] = []

        # Check Azure OpenAI
        azure_available = bool(
            settings.azure_openai_endpoint and settings.azure_openai_api_key
        )
        results.append(
            HealthStatus(
                provider=ModelProvider.AZURE,
                available=azure_available,
                message="Configured" if azure_available else "Not configured",
                model_count=1 if azure_available else 0,
            )
        )

        # Check Ollama
        try:
            ollama_available = await self.ollama.is_available()
            if ollama_available:
                models = await self.ollama.list_models()
                results.append(
                    HealthStatus(
                        provider=ModelProvider.OLLAMA,
                        available=True,
                        message="Running",
                        model_count=len(models),
                    )
                )
            else:
                results.append(
                    HealthStatus(
                        provider=ModelProvider.OLLAMA,
                        available=False,
                        message="Not running",
                    )
                )
        except Exception as e:
            results.append(
                HealthStatus(
                    provider=ModelProvider.OLLAMA,
                    available=False,
                    message=str(e),
                )
            )

        return results

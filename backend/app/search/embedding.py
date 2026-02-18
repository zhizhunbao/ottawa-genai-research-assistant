"""
Embedding Provider Abstraction

Routes embedding requests to Azure OpenAI or Ollama based on provider selection.
Follows the same pattern as SearchEngine / SearchRouter.

@reference sync-panel-enhancement.md Phase 2.5
@reference auto-model-strategy-evaluation.md Phase A
"""

import logging
from abc import ABC, abstractmethod
from typing import Any

logger = logging.getLogger(__name__)


class EmbeddingProvider(ABC):
    """Abstract embedding provider interface.

    All embedding providers (Azure, Ollama) must implement this.
    Similar to SearchEngine ABC but for vector generation.
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Provider identifier: azure | ollama"""
        ...

    @property
    @abstractmethod
    def model_id(self) -> str:
        """Current model ID (e.g. 'text-embedding-ada-002', 'nomic-embed-text')"""
        ...

    @property
    @abstractmethod
    def dimension(self) -> int:
        """Output embedding dimension (e.g. 1536, 768, 1024)"""
        ...

    @abstractmethod
    async def embed(self, text: str) -> list[float]:
        """Generate embedding for a single text."""
        ...

    @abstractmethod
    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings for multiple texts."""
        ...


class AzureEmbeddingProvider(EmbeddingProvider):
    """Wraps existing AzureOpenAIService embedding methods.

    Uses Azure OpenAI deployment for embedding generation.
    Supports ada-002 (1536d), text-embedding-3-small (1536d),
    and text-embedding-3-large (3072d).
    """

    DIMENSIONS: dict[str, int] = {
        "text-embedding-ada-002": 1536,
        "text-embedding-3-small": 1536,
        "text-embedding-3-large": 3072,
    }

    def __init__(self, openai_service: Any, model: str = "text-embedding-ada-002") -> None:
        self._service = openai_service
        self._model = model

    @property
    def name(self) -> str:
        return "azure"

    @property
    def model_id(self) -> str:
        return self._model

    @property
    def dimension(self) -> int:
        return self.DIMENSIONS.get(self._model, 1536)

    async def embed(self, text: str) -> list[float]:
        """Generate embedding via Azure OpenAI."""
        return await self._service.create_embedding(text)

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Generate batch embeddings via Azure OpenAI."""
        return await self._service.create_embeddings_batch(texts)


class OllamaEmbeddingProvider(EmbeddingProvider):
    """Uses OllamaService embedding methods.

    Supports local embedding models like nomic-embed-text (768d),
    bge-m3 (1024d), mxbai-embed-large (1024d).
    """

    DIMENSIONS: dict[str, int] = {
        "nomic-embed-text": 768,
        "bge-m3": 1024,
        "mxbai-embed-large": 1024,
        "all-minilm": 384,
        "snowflake-arctic-embed": 1024,
        "bge-large": 1024,
    }

    def __init__(self, ollama_service: Any, model: str = "nomic-embed-text") -> None:
        self._service = ollama_service
        self._model = model

    @property
    def name(self) -> str:
        return "ollama"

    @property
    def model_id(self) -> str:
        return self._model

    @property
    def dimension(self) -> int:
        base_name = self._model.split(":")[0]
        return self.DIMENSIONS.get(base_name, 768)

    async def embed(self, text: str) -> list[float]:
        """Generate embedding via Ollama."""
        return await self._service.create_embedding(text, model=self._model)

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Generate batch embeddings via Ollama."""
        return await self._service.create_embeddings_batch(texts, model=self._model)


class EmbeddingRouter:
    """Routes embedding requests to the correct provider.

    Manages multiple embedding providers and routes requests based on
    provider name and model ID. Supports fallback when a specific
    provider/model is not available.

    Usage:
        router = EmbeddingRouter()
        router.register(AzureEmbeddingProvider(openai_svc))
        router.register(OllamaEmbeddingProvider(ollama_svc, "nomic-embed-text"))

        vec = await router.embed("hello", provider="azure")
        vec = await router.embed("hello", provider="ollama", model="bge-m3")
    """

    def __init__(self) -> None:
        self._providers: dict[str, EmbeddingProvider] = {}

    def register(self, provider: EmbeddingProvider) -> None:
        """Register an embedding provider."""
        key = f"{provider.name}:{provider.model_id}"
        self._providers[key] = provider
        logger.info(
            f"Registered embedding provider: {key} (dim={provider.dimension})"
        )

    def get_provider(
        self,
        provider: str = "azure",
        model: str | None = None,
    ) -> EmbeddingProvider | None:
        """
        Get a registered embedding provider.

        Lookup priority:
        1. Exact match: provider:model
        2. First provider matching the provider name
        3. First available provider (fallback)
        """
        # 1. Exact match
        if model:
            key = f"{provider}:{model}"
            if key in self._providers:
                return self._providers[key]

        # 2. First matching provider name
        for k, p in self._providers.items():
            if k.startswith(f"{provider}:"):
                return p

        # 3. Fallback: any available provider
        if self._providers:
            return next(iter(self._providers.values()))

        return None

    @property
    def available_providers(self) -> list[dict[str, Any]]:
        """List all registered embedding providers with metadata."""
        return [
            {
                "key": k,
                "provider": p.name,
                "model": p.model_id,
                "dimension": p.dimension,
            }
            for k, p in self._providers.items()
        ]

    async def embed(
        self,
        text: str,
        provider: str = "azure",
        model: str | None = None,
    ) -> list[float]:
        """Generate embedding using the selected provider."""
        p = self.get_provider(provider, model)
        if not p:
            raise ValueError(
                f"No embedding provider registered for {provider}:{model}. "
                f"Available: {[k for k in self._providers]}"
            )
        return await p.embed(text)

    async def embed_batch(
        self,
        texts: list[str],
        provider: str = "azure",
        model: str | None = None,
    ) -> list[list[float]]:
        """Generate batch embeddings using the selected provider."""
        p = self.get_provider(provider, model)
        if not p:
            raise ValueError(
                f"No embedding provider registered for {provider}:{model}. "
                f"Available: {[k for k in self._providers]}"
            )
        return await p.embed_batch(texts)


# Global embedding router instance
embedding_router = EmbeddingRouter()

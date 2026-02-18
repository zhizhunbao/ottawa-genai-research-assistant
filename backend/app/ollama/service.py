"""
Ollama Service Wrapper

Provides local LLM chat completion via Ollama API (OpenAI-compatible).
Supports streaming and non-streaming chat completions.

@template none (custom integration)
@reference https://github.com/ollama/ollama/blob/main/docs/openai.md
"""

import logging
from collections.abc import AsyncIterator

import httpx

logger = logging.getLogger(__name__)


class OllamaError(Exception):
    """Ollama 服务异常"""
    pass


class OllamaService:
    """Ollama local LLM service (OpenAI-compatible API)"""

    def __init__(self, base_url: str = "http://localhost:11434") -> None:
        """
        Initialize Ollama service.

        Args:
            base_url: Ollama server URL (default: http://localhost:11434)
        """
        self.base_url = base_url.rstrip("/")
        self._client = httpx.AsyncClient(base_url=self.base_url, timeout=120.0)

    async def chat_completion(
        self,
        messages: list[dict],
        model: str = "llama3.1:8b",
        temperature: float = 0.7,
        max_tokens: int | None = None,
        system_prompt: str | None = None,
    ) -> str:
        """
        Generate a chat completion using a local Ollama model.

        Args:
            messages: Message list [{"role": "user", "content": "..."}]
            model: Ollama model name (e.g. 'llama3.1:8b', 'mistral:7b')
            temperature: Temperature parameter (0-2)
            max_tokens: Maximum tokens to generate
            system_prompt: System prompt

        Returns:
            Assistant response content
        """
        try:
            chat_messages = []
            if system_prompt:
                chat_messages.append({"role": "system", "content": system_prompt})
            chat_messages.extend(messages)

            payload: dict = {
                "model": model,
                "messages": chat_messages,
                "stream": False,
                "options": {
                    "temperature": temperature,
                },
            }
            if max_tokens:
                payload["options"]["num_predict"] = max_tokens

            response = await self._client.post("/api/chat", json=payload)
            response.raise_for_status()
            data = response.json()
            return data.get("message", {}).get("content", "")

        except httpx.ConnectError as e:
            raise OllamaError(
                f"Cannot connect to Ollama at {self.base_url}. "
                "Is Ollama running? Start with: ollama serve"
            ) from e
        except Exception as e:
            raise OllamaError(f"Ollama chat completion failed: {str(e)}") from e

    async def chat_completion_stream(
        self,
        messages: list[dict],
        model: str = "llama3.1:8b",
        temperature: float = 0.7,
        max_tokens: int | None = None,
        system_prompt: str | None = None,
    ) -> AsyncIterator[str]:
        """
        Stream chat completion from a local Ollama model.

        Args:
            messages: Message list
            model: Ollama model name
            temperature: Temperature parameter
            max_tokens: Maximum tokens to generate
            system_prompt: System prompt

        Yields:
            Generated text tokens
        """
        try:
            chat_messages = []
            if system_prompt:
                chat_messages.append({"role": "system", "content": system_prompt})
            chat_messages.extend(messages)

            payload: dict = {
                "model": model,
                "messages": chat_messages,
                "stream": True,
                "options": {
                    "temperature": temperature,
                },
            }
            if max_tokens:
                payload["options"]["num_predict"] = max_tokens

            async with self._client.stream("POST", "/api/chat", json=payload) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line.strip():
                        continue
                    import json
                    try:
                        data = json.loads(line)
                        content = data.get("message", {}).get("content", "")
                        if content:
                            yield content
                    except json.JSONDecodeError:
                        continue

        except httpx.ConnectError as e:
            raise OllamaError(
                f"Cannot connect to Ollama at {self.base_url}. "
                "Is Ollama running? Start with: ollama serve"
            ) from e
        except Exception as e:
            raise OllamaError(f"Ollama stream chat failed: {str(e)}") from e

    # ── Embedding Methods ─────────────────────────────────────────────

    # Known embedding model base names (Ollama doesn't tag them separately)
    KNOWN_EMBEDDING_MODELS = {
        "nomic-embed-text", "bge-m3", "mxbai-embed-large",
        "all-minilm", "snowflake-arctic-embed", "bge-large",
    }

    async def create_embedding(
        self, text: str, model: str = "nomic-embed-text"
    ) -> list[float]:
        """
        Generate embedding via Ollama API (POST /api/embed).

        Args:
            text: Text to embed
            model: Embedding model name (e.g. 'nomic-embed-text', 'bge-m3')

        Returns:
            Embedding vector as list of floats
        """
        try:
            response = await self._client.post("/api/embed", json={
                "model": model,
                "input": text,
            })
            response.raise_for_status()
            data = response.json()
            # Ollama /api/embed returns {"embeddings": [[...], ...]}
            embeddings = data.get("embeddings", [])
            if not embeddings:
                raise OllamaError(f"No embeddings returned for model {model}")
            return embeddings[0]

        except httpx.ConnectError as e:
            raise OllamaError(
                f"Cannot connect to Ollama at {self.base_url}. "
                "Is Ollama running? Start with: ollama serve"
            ) from e
        except OllamaError:
            raise
        except Exception as e:
            raise OllamaError(f"Ollama embedding failed: {str(e)}") from e

    async def create_embeddings_batch(
        self, texts: list[str], model: str = "nomic-embed-text"
    ) -> list[list[float]]:
        """
        Batch embedding generation.

        Ollama /api/embed supports multiple inputs natively.

        Args:
            texts: List of texts to embed
            model: Embedding model name

        Returns:
            List of embedding vectors
        """
        if not texts:
            return []

        try:
            response = await self._client.post("/api/embed", json={
                "model": model,
                "input": texts,
            })
            response.raise_for_status()
            data = response.json()
            embeddings = data.get("embeddings", [])
            if len(embeddings) != len(texts):
                logger.warning(
                    f"Embedding count mismatch: expected {len(texts)}, "
                    f"got {len(embeddings)}"
                )
            return embeddings

        except httpx.ConnectError as e:
            raise OllamaError(
                f"Cannot connect to Ollama at {self.base_url}. "
                "Is Ollama running? Start with: ollama serve"
            ) from e
        except Exception as e:
            raise OllamaError(f"Ollama batch embedding failed: {str(e)}") from e

    async def list_embedding_models(self) -> list[dict]:
        """
        List locally available Ollama models that support embedding.

        Filters installed models against known embedding model names.

        Returns:
            List of embedding model info dicts
        """
        all_models = await self.list_models()
        embed_models = []
        for m in all_models:
            name = m.get("name", m.get("model", ""))
            base_name = name.split(":")[0]
            if base_name in self.KNOWN_EMBEDDING_MODELS:
                embed_models.append(m)
        return embed_models

    # ── Model Listing ─────────────────────────────────────────────────

    async def list_models(self) -> list[dict]:
        """
        List locally available Ollama models.

        Returns:
            List of model info dicts
        """
        try:
            response = await self._client.get("/api/tags")
            response.raise_for_status()
            data = response.json()
            return data.get("models", [])
        except Exception as e:
            logger.warning(f"Failed to list Ollama models: {e}")
            return []

    async def is_available(self) -> bool:
        """Check if Ollama server is reachable."""
        try:
            response = await self._client.get("/api/tags")
            return response.status_code == 200
        except Exception:
            return False

    # ── Model Management ─────────────────────────────────────────────

    async def pull_model(self, name: str) -> AsyncIterator[dict]:
        """
        Pull (download) a model from Ollama registry with streaming progress.

        Args:
            name: Model name (e.g. 'llama3.1:8b', 'nomic-embed-text')

        Yields:
            Progress events: {status, digest?, total?, completed?, percent?}
        """
        try:
            async with self._client.stream(
                "POST",
                "/api/pull",
                json={"name": name, "stream": True},
                timeout=None,  # Download can take a long time
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line.strip():
                        continue
                    import json
                    try:
                        data = json.loads(line)
                        # Add percent calculation if total/completed available
                        if data.get("total") and data.get("completed"):
                            data["percent"] = round(
                                data["completed"] / data["total"] * 100, 1
                            )
                        yield data
                    except json.JSONDecodeError:
                        continue

        except httpx.ConnectError as e:
            raise OllamaError(
                f"Cannot connect to Ollama at {self.base_url}. "
                "Is Ollama running? Start with: ollama serve"
            ) from e
        except Exception as e:
            raise OllamaError(f"Ollama pull failed: {str(e)}") from e

    async def delete_model(self, name: str) -> bool:
        """
        Delete a model from local Ollama storage.

        Args:
            name: Model name to delete

        Returns:
            True if deleted successfully
        """
        try:
            response = await self._client.delete("/api/delete", json={"name": name})
            response.raise_for_status()
            return True
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise OllamaError(f"Model '{name}' not found") from e
            raise OllamaError(f"Failed to delete model: {str(e)}") from e
        except Exception as e:
            raise OllamaError(f"Ollama delete failed: {str(e)}") from e

    async def show_model(self, name: str) -> dict:
        """
        Get detailed information about a model.

        Args:
            name: Model name

        Returns:
            Model info dict with parameters, template, modelfile, etc.
        """
        try:
            response = await self._client.post("/api/show", json={"name": name})
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise OllamaError(f"Model '{name}' not found") from e
            raise OllamaError(f"Failed to get model info: {str(e)}") from e
        except Exception as e:
            raise OllamaError(f"Ollama show failed: {str(e)}") from e

    async def copy_model(self, source: str, destination: str) -> bool:
        """
        Copy/rename a model.

        Args:
            source: Source model name
            destination: New model name

        Returns:
            True if copied successfully
        """
        try:
            response = await self._client.post(
                "/api/copy", json={"source": source, "destination": destination}
            )
            response.raise_for_status()
            return True
        except Exception as e:
            raise OllamaError(f"Ollama copy failed: {str(e)}") from e

    async def get_running_models(self) -> list[dict]:
        """
        Get list of models currently loaded in memory.

        Returns:
            List of running model info dicts
        """
        try:
            response = await self._client.get("/api/ps")
            response.raise_for_status()
            data = response.json()
            return data.get("models", [])
        except Exception as e:
            logger.warning(f"Failed to get running models: {e}")
            return []

    def format_size(self, size_bytes: int) -> str:
        """Format bytes as human-readable size."""
        for unit in ["B", "KB", "MB", "GB", "TB"]:
            if size_bytes < 1024:
                return f"{size_bytes:.1f} {unit}"
            size_bytes /= 1024
        return f"{size_bytes:.1f} PB"

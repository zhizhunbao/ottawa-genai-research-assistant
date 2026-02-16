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

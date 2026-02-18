"""
Azure Search Engine Adapter

Wraps the existing AzureSearchService as a SearchEngine plugin.
Zero new Azure code — just adapts the interface.

@reference app/azure/search.py — The actual Azure AI Search SDK wrapper
"""

import logging
from typing import Any

from app.search.engine import SearchEngine, SearchResult

logger = logging.getLogger(__name__)


class AzureSearchAdapter(SearchEngine):
    """
    Adapter: AzureSearchService → SearchEngine interface.

    Wraps the existing AzureSearchService without modifying it.
    """

    def __init__(self, azure_service: Any, openai_service: Any = None):
        """
        Args:
            azure_service: Existing AzureSearchService instance
            openai_service: AzureOpenAIService for generating query embeddings
        """
        self._azure = azure_service
        self._openai = openai_service

    @property
    def name(self) -> str:
        return "azure_search"

    async def index_chunks(
        self,
        document_id: str,
        chunks: list[dict[str, Any]],
        embeddings: list[list[float]] | None = None,
    ) -> int:
        """Index chunks via existing AzureSearchService.index_documents_batch()."""
        docs = []
        for i, chunk in enumerate(chunks):
            doc = {
                "id": f"{document_id}_{i}",
                "title": chunk.get("title", ""),
                "content": chunk.get("content", ""),
                "source": chunk.get("source", ""),
                "document_id": document_id,
                "page_number": chunk.get("page_num", 0),
                "chunk_index": i,
            }
            if embeddings and i < len(embeddings):
                doc["content_vector"] = embeddings[i]
            docs.append(doc)

        result = await self._azure.index_documents_batch(docs)
        return result.get("succeeded", 0)

    async def search(
        self,
        query: str,
        top_k: int = 5,
        filters: dict[str, Any] | None = None,
    ) -> list[SearchResult]:
        """Search via existing AzureSearchService.search()."""
        # Convert dict filters to OData string
        odata_filter = None
        if filters:
            parts = []
            for key, value in filters.items():
                if isinstance(value, str):
                    parts.append(f"{key} eq '{value}'")
                else:
                    parts.append(f"{key} eq {value}")
            if parts:
                odata_filter = " and ".join(parts)

        # Generate query vector if OpenAI is available
        query_vector = None
        if self._openai:
            try:
                query_vector = await self._openai.create_embedding(query)
            except Exception as e:
                logger.warning(f"Embedding failed, text-only search: {e}")

        raw = await self._azure.search(
            query=query,
            query_vector=query_vector,
            top_k=top_k,
            filters=odata_filter,
        )

        return [
            SearchResult(
                id=r["id"],
                title=r.get("title", ""),
                content=r.get("content", ""),
                score=r.get("score", 0.0),
                source=r.get("source"),
                page_num=r.get("page_number"),
                metadata={
                    "document_id": r.get("document_id"),
                    "chunk_index": r.get("chunk_index"),
                },
                engine="azure_search",
            )
            for r in raw
        ]

    async def delete_by_document(self, document_id: str) -> int:
        """Delete via existing AzureSearchService.delete_by_document_id()."""
        return await self._azure.delete_by_document_id(document_id)

    async def get_stats(self) -> dict[str, Any]:
        """Get stats via existing AzureSearchService.get_document_count()."""
        try:
            count = await self._azure.get_document_count()
            return {"indexed_count": count, "status": "ready"}
        except Exception as e:
            return {"indexed_count": 0, "status": "unavailable", "error": str(e)}

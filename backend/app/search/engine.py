"""
Search Engine Abstraction

Abstract base class for search engines + Router for multi-engine dispatching.

@reference sqlite-rag engine.py — Hybrid search with RRF
@reference pageindex page_index.py — Vectorless page-level search
@reference azure-search-openai-demo — Strategy pattern for RAG approaches
"""

import asyncio
import logging
from abc import ABC, abstractmethod
from typing import Any

logger = logging.getLogger(__name__)


class SearchResult:
    """Unified search result across all engines."""

    def __init__(
        self,
        id: str,
        title: str,
        content: str,
        score: float,
        source: str | None = None,
        page_num: int | None = None,
        metadata: dict[str, Any] | None = None,
        engine: str = "unknown",
    ):
        self.id = id
        self.title = title
        self.content = content
        self.score = score
        self.source = source
        self.page_num = page_num
        self.metadata = metadata or {}
        self.engine = engine

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "score": self.score,
            "source": self.source,
            "page_num": self.page_num,
            "metadata": self.metadata,
            "engine": self.engine,
        }


class SearchEngine(ABC):
    """
    Abstract search engine interface.

    All search engines (Azure, SQLite FTS, PageIndex) must implement this.
    Inspired by azure-search-openai-demo's Approach ABC pattern.
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Engine identifier: azure_search | sqlite_fts | page_index"""
        ...

    @abstractmethod
    async def index_chunks(
        self,
        document_id: str,
        chunks: list[dict[str, Any]],
        embeddings: list[list[float]] | None = None,
    ) -> int:
        """Index document chunks. Returns count of indexed chunks."""
        ...

    @abstractmethod
    async def search(
        self,
        query: str,
        top_k: int = 5,
        filters: dict[str, Any] | None = None,
    ) -> list[SearchResult]:
        """Execute search query. Returns ranked results."""
        ...

    @abstractmethod
    async def delete_by_document(self, document_id: str) -> int:
        """Delete all indexed data for a document. Returns count."""
        ...

    @abstractmethod
    async def get_stats(self) -> dict[str, Any]:
        """Get engine statistics (doc count, chunk count, index size)."""
        ...


class SearchRouter:
    """
    Routes search requests to the correct engine(s).

    Supports single-engine search and multi-engine hybrid search with RRF fusion.

    @reference sqlite-rag engine.py — RRF implementation
    """

    DEFAULT_RRF_K = 60

    def __init__(self):
        self._engines: dict[str, SearchEngine] = {}

    def register(self, engine: SearchEngine) -> None:
        """Register a search engine."""
        self._engines[engine.name] = engine
        logger.info(f"Registered search engine: {engine.name}")

    def get_engine(self, name: str) -> SearchEngine | None:
        """Get a registered engine by name."""
        return self._engines.get(name)

    @property
    def available_engines(self) -> list[str]:
        """List registered engine names."""
        return list(self._engines.keys())

    async def search(
        self,
        query: str,
        engine: str = "azure_search",
        top_k: int = 5,
        filters: dict[str, Any] | None = None,
    ) -> list[SearchResult]:
        """Search using a single engine."""
        eng = self._engines.get(engine)
        if not eng:
            logger.warning(f"Engine '{engine}' not registered, falling back to first available")
            if not self._engines:
                return []
            eng = next(iter(self._engines.values()))

        return await eng.search(query, top_k=top_k, filters=filters)

    async def hybrid_search(
        self,
        query: str,
        engines: list[str],
        top_k: int = 5,
        filters: dict[str, Any] | None = None,
    ) -> list[SearchResult]:
        """
        Multi-engine search with Reciprocal Rank Fusion (RRF).

        @reference sqlite-rag Engine.search_documents() — RRF implementation:
            combined_rank = sum(1.0 / (K + rank_i) * weight_i)
        """
        valid_engines = [e for e in engines if e in self._engines]
        if not valid_engines:
            return await self.search(query, top_k=top_k, filters=filters)

        # Run all engines in parallel
        tasks = [
            self._engines[e].search(query, top_k=top_k, filters=filters)
            for e in valid_engines
        ]
        all_results = await asyncio.gather(*tasks, return_exceptions=True)

        # Merge with RRF
        return self._rrf_merge(
            [r for r in all_results if isinstance(r, list)],
            top_k=top_k,
        )

    def _rrf_merge(
        self,
        result_lists: list[list[SearchResult]],
        top_k: int = 5,
    ) -> list[SearchResult]:
        """
        Reciprocal Rank Fusion — merge multiple ranked lists.

        For each result, compute: score = Σ (1 / (K + rank_in_list_i))
        where K = 60 (standard RRF constant).

        @reference sqlite-rag engine.py lines 173-186
        """
        scores: dict[str, float] = {}
        best_result: dict[str, SearchResult] = {}

        for results in result_lists:
            for rank, result in enumerate(results):
                key = result.id
                rrf_score = 1.0 / (self.DEFAULT_RRF_K + rank + 1)
                scores[key] = scores.get(key, 0.0) + rrf_score

                # Keep the result with highest individual score
                if key not in best_result or result.score > best_result[key].score:
                    best_result[key] = result

        # Sort by RRF score descending
        sorted_keys = sorted(scores.keys(), key=lambda k: scores[k], reverse=True)

        merged = []
        for key in sorted_keys[:top_k]:
            result = best_result[key]
            result.score = scores[key]  # Replace with RRF combined score
            merged.append(result)

        return merged

    async def get_all_stats(self) -> dict[str, dict[str, Any]]:
        """Get stats from all engines."""
        stats = {}
        for name, engine in self._engines.items():
            try:
                stats[name] = await engine.get_stats()
            except Exception as e:
                stats[name] = {"error": str(e), "status": "unavailable"}
        return stats


# Global search router instance
search_router = SearchRouter()

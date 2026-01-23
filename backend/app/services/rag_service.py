"""
🔍 RAG (Retrieval-Augmented Generation) Service

Service for retrieving relevant document chunks to augment AI responses.
"""

from typing import Any, Dict, List, Optional

from app.core.config import Settings
from app.services.document_service import DocumentService
from app.services.embedding_service import EmbeddingService
from loguru import logger


class RAGService:
    """
    RAG service for retrieving relevant document context.
    
    This service encapsulates the retrieval logic for RAG, including:
    - Query rewriting for better retrieval
    - Context window management
    - Multi-document retrieval
    - Context formatting
    """

    def __init__(self, settings: Settings, document_service: DocumentService):
        """
        Initialize RAG service.

        Args:
            settings: Application settings
            document_service: Document service for searching documents
        """
        self.settings = settings
        self.document_service = document_service
        self.embedding_service = EmbeddingService()

        # Default configuration
        self.default_top_k = 5  # Number of chunks to retrieve
        self.default_similarity_threshold = 0.7  # Minimum similarity score
        self.max_context_length = 3000  # Maximum characters in context

    async def retrieve_context(
        self,
        query: str,
        top_k: Optional[int] = None,
        similarity_threshold: Optional[float] = None,
        doc_ids: Optional[List[str]] = None,
        max_context_length: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Retrieve relevant document chunks for a query.

        Args:
            query: User query text
            top_k: Number of chunks to retrieve (default: self.default_top_k)
            similarity_threshold: Minimum similarity score (default: self.default_similarity_threshold)
            doc_ids: Optional list of document IDs to filter by
            max_context_length: Maximum total context length in characters

        Returns:
            Dictionary containing:
            - chunks: List of relevant document chunks
            - sources: List of source document information
            - total_chunks: Total number of chunks retrieved
            - avg_similarity: Average similarity score
        """
        try:
            # Use defaults if not provided
            top_k = top_k or self.default_top_k
            similarity_threshold = similarity_threshold or self.default_similarity_threshold
            max_context_length = max_context_length or self.max_context_length

            # Rewrite query for better retrieval (optional enhancement)
            enhanced_query = self._rewrite_query(query)

            # Search documents
            search_results = await self.document_service.search_documents(
                query=enhanced_query,
                limit=top_k * 2,  # Get more results to filter and select best
                similarity_threshold=similarity_threshold,
                doc_id=doc_ids[0] if doc_ids and len(doc_ids) == 1 else None,
            )

            if not search_results:
                logger.info(f"No relevant documents found for query: {query[:50]}...")
                return {
                    "chunks": [],
                    "sources": [],
                    "total_chunks": 0,
                    "avg_similarity": 0.0,
                    "context": "",
                }

            # Filter by doc_ids if provided (for multiple documents)
            if doc_ids and len(doc_ids) > 1:
                search_results = [
                    r for r in search_results if r["doc_id"] in doc_ids
                ]

            # Select best chunks within context window
            selected_chunks = self._select_chunks_for_context(
                search_results, top_k, max_context_length
            )

            # Format context and extract sources
            context = self._format_context(selected_chunks)
            sources = self._extract_sources(selected_chunks)

            # Calculate average similarity
            avg_similarity = (
                sum(chunk["similarity_score"] for chunk in selected_chunks)
                / len(selected_chunks)
                if selected_chunks
                else 0.0
            )

            logger.info(
                f"Retrieved {len(selected_chunks)} chunks from {len(sources)} documents "
                f"(avg similarity: {avg_similarity:.3f})"
            )

            return {
                "chunks": selected_chunks,
                "sources": sources,
                "total_chunks": len(selected_chunks),
                "avg_similarity": round(avg_similarity, 4),
                "context": context,
            }

        except Exception as e:
            logger.error(f"Error retrieving context: {e}")
            return {
                "chunks": [],
                "sources": [],
                "total_chunks": 0,
                "avg_similarity": 0.0,
                "context": "",
            }

    def _rewrite_query(self, query: str) -> str:
        """
        Rewrite query to improve retrieval quality.

        This is a simple implementation. In production, you might use:
        - LLM-based query expansion
        - Keyword extraction
        - Synonym expansion
        - Query decomposition

        Args:
            query: Original query

        Returns:
            Enhanced query string
        """
        # Simple query enhancement: add common economic development terms
        # This helps with domain-specific queries
        enhanced = query.strip()

        # For now, return as-is (can be enhanced later)
        # Future: Use LLM to expand queries with synonyms and related terms
        return enhanced

    def _select_chunks_for_context(
        self,
        search_results: List[Dict[str, Any]],
        top_k: int,
        max_context_length: int,
    ) -> List[Dict[str, Any]]:
        """
        Select the best chunks within the context window limit.

        Args:
            search_results: List of search results from vector database
            top_k: Desired number of chunks
            max_context_length: Maximum total context length

        Returns:
            List of selected chunks
        """
        if not search_results:
            return []

        # Sort by similarity score (already sorted, but ensure)
        sorted_results = sorted(
            search_results, key=lambda x: x["similarity_score"], reverse=True
        )

        selected = []
        total_length = 0

        # Select chunks up to top_k and within context length limit
        for result in sorted_results:
            chunk_text = result.get("chunk_text", "")
            chunk_length = len(chunk_text)

            # Check if adding this chunk would exceed limits
            if len(selected) >= top_k:
                break

            if total_length + chunk_length > max_context_length:
                # Try to find a shorter chunk or stop
                continue

            selected.append(result)
            total_length += chunk_length

        return selected

    def _format_context(self, chunks: List[Dict[str, Any]]) -> str:
        """
        Format retrieved chunks into a context string for the LLM.

        Args:
            chunks: List of document chunks

        Returns:
            Formatted context string
        """
        if not chunks:
            return ""

        context_parts = []
        for i, chunk in enumerate(chunks, 1):
            doc_title = chunk.get("title", chunk.get("filename", "Unknown Document"))
            chunk_text = chunk.get("chunk_text", "")

            # Format: [Document Title] - Chunk text
            context_parts.append(
                f"[Document {i}: {doc_title}]\n{chunk_text}\n"
            )

        return "\n".join(context_parts)

    def _extract_sources(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Extract unique source document information from chunks.

        Args:
            chunks: List of document chunks

        Returns:
            List of unique source documents with metadata
        """
        sources_map = {}

        for chunk in chunks:
            doc_id = chunk.get("doc_id")
            if not doc_id:
                continue

            if doc_id not in sources_map:
                sources_map[doc_id] = {
                    "doc_id": doc_id,
                    "filename": chunk.get("filename", "Unknown"),
                    "title": chunk.get("title", "Unknown Document"),
                    "chunk_count": 0,
                    "max_similarity": 0.0,
                }

            # Update metadata
            sources_map[doc_id]["chunk_count"] += 1
            chunk_similarity = chunk.get("similarity_score", 0.0)
            if chunk_similarity > sources_map[doc_id]["max_similarity"]:
                sources_map[doc_id]["max_similarity"] = chunk_similarity

        return list(sources_map.values())

    async def retrieve_context_for_report(
        self,
        query: str,
        topic: Optional[str] = None,
        date_range: Optional[Dict[str, str]] = None,
        top_k: int = 10,
        doc_ids: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Retrieve context specifically for report generation.

        This method retrieves more chunks and provides additional filtering
        options for report generation.

        Args:
            query: Search query
            topic: Optional topic filter
            date_range: Optional date range filter ({"start": "...", "end": "..."})
            top_k: Number of chunks to retrieve
            doc_ids: Optional list of document IDs to filter by

        Returns:
            Dictionary with retrieved context and metadata
        """
        # Use the standard retrieve_context with document filtering
        # Future: Add topic and date filtering
        return await self.retrieve_context(query=query, top_k=top_k, doc_ids=doc_ids)


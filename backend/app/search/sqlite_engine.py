"""
SQLite FTS5 Search Engine

Local full-text search using SQLite FTS5 virtual tables.
Adapted from sqlite-rag's hybrid search (FTS5 + vector) with RRF fusion.

NOTE: This implementation uses FTS5 only (no sqlite-vec for now).
      Vector search is handled by Azure Search engine.
      To add local vector search later, install sqlite-vec and enable it.

@reference sqlite-rag/engine.py — search_documents() FTS5 + RRF
@reference sqlite-rag/database.py — FTS5 schema
@reference sqlite-rag/repository.py — Document CRUD
"""

import logging
import re
from typing import Any

import aiosqlite

from app.search.engine import SearchEngine, SearchResult

logger = logging.getLogger(__name__)

# FTS5 database path (separate from main app.db)
FTS_DB_PATH = "./data/fts_search.db"


class SQLiteFTSEngine(SearchEngine):
    """
    SQLite FTS5 full-text search engine.

    Schema directly from sqlite-rag/database.py:
        CREATE TABLE fts_documents (id TEXT PK, document_id TEXT, title TEXT, content TEXT, ...)
        CREATE VIRTUAL TABLE fts_index USING fts5(title, content, content='fts_documents', ...)

    @reference sqlite-rag engine.py — FTS query formatting and ranking
    """

    def __init__(self, db_path: str = FTS_DB_PATH):
        self._db_path = db_path
        self._initialized = False

    @property
    def name(self) -> str:
        return "sqlite_fts"

    async def _ensure_db(self) -> aiosqlite.Connection:
        """Create DB and tables if not exists."""
        conn = await aiosqlite.connect(self._db_path)
        conn.row_factory = aiosqlite.Row

        if not self._initialized:
            await conn.executescript("""
                CREATE TABLE IF NOT EXISTS fts_documents (
                    id TEXT PRIMARY KEY,
                    document_id TEXT NOT NULL,
                    title TEXT DEFAULT '',
                    content TEXT NOT NULL,
                    source TEXT DEFAULT '',
                    page_num INTEGER DEFAULT 0,
                    chunk_index INTEGER DEFAULT 0,
                    metadata TEXT DEFAULT '{}',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE INDEX IF NOT EXISTS idx_fts_docs_docid
                    ON fts_documents (document_id);
            """)

            # FTS5 virtual table — content-mirroring from fts_documents
            # @reference sqlite-rag/database.py line 105-108
            await conn.execute("""
                CREATE VIRTUAL TABLE IF NOT EXISTS fts_index
                USING fts5(title, content, content='fts_documents', content_rowid='rowid');
            """)

            await conn.commit()
            self._initialized = True

        return conn

    async def index_chunks(
        self,
        document_id: str,
        chunks: list[dict[str, Any]],
        embeddings: list[list[float]] | None = None,
    ) -> int:
        """Index chunks into FTS5."""
        conn = await self._ensure_db()
        try:
            count = 0
            for i, chunk in enumerate(chunks):
                chunk_id = f"{document_id}_{i}"
                title = chunk.get("title", "")
                content = chunk.get("content", "")
                source = chunk.get("source", "")
                page_num = chunk.get("page_num", 0)

                # Insert into base table
                await conn.execute(
                    """
                    INSERT OR REPLACE INTO fts_documents
                        (id, document_id, title, content, source, page_num, chunk_index)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (chunk_id, document_id, title, content, source, page_num, i),
                )

                # Sync to FTS5 index
                # @reference sqlite-rag uses content sync triggers; we do manual insert
                await conn.execute(
                    """
                    INSERT INTO fts_index (rowid, title, content)
                    VALUES (
                        (SELECT rowid FROM fts_documents WHERE id = ?),
                        ?, ?
                    )
                    """,
                    (chunk_id, title, content),
                )
                count += 1

            await conn.commit()
            logger.info(f"SQLite FTS indexed {count} chunks for doc {document_id}")
            return count
        finally:
            await conn.close()

    async def search(
        self,
        query: str,
        top_k: int = 5,
        filters: dict[str, Any] | None = None,
    ) -> list[SearchResult]:
        """
        Full-text search using FTS5 MATCH.

        Query formatting from sqlite-rag/engine.py Engine.search():
            fts_query = " ".join(re.findall(r"\\b\\w+\\b", query.lower())) + "*"

        @reference sqlite-rag engine.py lines 104-106
        """
        conn = await self._ensure_db()
        try:
            # Clean and format FTS5 query (from sqlite-rag)
            words = re.findall(r"\b\w+\b", query.lower())
            if not words:
                return []
            fts_query = " ".join(words) + "*"

            # Build optional document_id filter
            doc_filter = ""
            params: dict[str, Any] = {"query": fts_query, "k": top_k}
            if filters and "document_id" in filters:
                doc_filter = "AND d.document_id = :doc_id"
                params["doc_id"] = filters["document_id"]

            # FTS5 ranked search
            # @reference sqlite-rag engine.py search_documents() — fts_matches CTE
            rows = await conn.execute_fetchall(
                f"""
                SELECT
                    d.id,
                    d.document_id,
                    d.title,
                    d.content,
                    d.source,
                    d.page_num,
                    d.chunk_index,
                    fts_index.rank AS fts_rank
                FROM fts_index
                JOIN fts_documents d ON d.rowid = fts_index.rowid
                WHERE fts_index MATCH :query
                {doc_filter}
                ORDER BY fts_index.rank
                LIMIT :k
                """,
                params,
            )

            return [
                SearchResult(
                    id=row[0],                    # d.id
                    title=row[2] or "",           # d.title
                    content=row[3] or "",         # d.content
                    score=abs(float(row[7] or 0)),  # fts_rank (negative = better)
                    source=row[4],                # d.source
                    page_num=row[5],              # d.page_num
                    metadata={
                        "document_id": row[1],    # d.document_id
                        "chunk_index": row[6],    # d.chunk_index
                    },
                    engine="sqlite_fts",
                )
                for row in rows
            ]
        finally:
            await conn.close()

    async def delete_by_document(self, document_id: str) -> int:
        """Delete all chunks for a document from FTS."""
        conn = await self._ensure_db()
        try:
            # First delete from FTS index
            await conn.execute(
                """
                DELETE FROM fts_index
                WHERE rowid IN (
                    SELECT rowid FROM fts_documents WHERE document_id = ?
                )
                """,
                (document_id,),
            )
            # Then delete from base table
            cursor = await conn.execute(
                "DELETE FROM fts_documents WHERE document_id = ?",
                (document_id,),
            )
            await conn.commit()
            count = cursor.rowcount
            logger.info(f"SQLite FTS deleted {count} chunks for doc {document_id}")
            return count
        finally:
            await conn.close()

    async def get_stats(self) -> dict[str, Any]:
        """Get FTS index statistics."""
        conn = await self._ensure_db()
        try:
            row = await conn.execute_fetchall(
                "SELECT COUNT(*) as cnt FROM fts_documents"
            )
            chunk_count = row[0][0] if row else 0

            row2 = await conn.execute_fetchall(
                "SELECT COUNT(DISTINCT document_id) as cnt FROM fts_documents"
            )
            doc_count = row2[0][0] if row2 else 0

            return {
                "indexed_count": chunk_count,
                "document_count": doc_count,
                "status": "ready",
            }
        finally:
            await conn.close()

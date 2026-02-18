"""
Knowledge Base Service

Business logic for knowledge base CRUD and document management.
Reuses the existing UniversalDocument EAV table — no new DB migration needed.

@reference ragflow web/src/pages/datasets/ — Dataset CRUD patterns
@reference rag-web-ui models/knowledge.py — KnowledgeBase model
"""

import logging
from typing import Any

from app.core.document_store import DocumentStore
from app.core.enums import DocumentStatus, DocumentType, KBType
from app.knowledge.schemas import (
    KBCreate,
    KBDocumentResponse,
    KBResponse,
    KBUpdate,
    PipelineStepStatus,
)

logger = logging.getLogger(__name__)


class KnowledgeBaseService:
    """Knowledge Base CRUD using the existing UniversalDocument table."""

    def __init__(self, store: DocumentStore):
        self.store = store

    # ── CRUD ──────────────────────────────────────────────────

    async def create(self, data: KBCreate) -> KBResponse:
        """Create a new knowledge base."""
        kb_data = {
            "name": data.name,
            "description": data.description,
            "kb_type": data.type,
            "config": data.config,
            "folder_id": data.folder_id,
            "search_engines": data.search_engines,
            "doc_count": 0,
            "indexed_count": 0,
        }
        doc = await self.store.create(
            doc_type=DocumentType.KNOWLEDGE_BASE,
            data=kb_data,
            status=DocumentStatus.ACTIVE,
        )
        return self._to_response(doc)

    async def list_all(self) -> list[KBResponse]:
        """List all knowledge bases."""
        docs = await self.store.list_by_type(DocumentType.KNOWLEDGE_BASE)
        return [self._to_response(doc) for doc in docs]

    async def get(self, kb_id: str) -> KBResponse | None:
        """Get a single knowledge base."""
        doc = await self.store.get_by_id(kb_id)
        if not doc or doc.get("type") != DocumentType.KNOWLEDGE_BASE:
            return None
        return self._to_response(doc)

    async def update(self, kb_id: str, data: KBUpdate) -> KBResponse | None:
        """Update a knowledge base."""
        doc = await self.store.get_by_id(kb_id)
        if not doc or doc.get("type") != DocumentType.KNOWLEDGE_BASE:
            return None

        current_data = doc.get("data", {})
        if data.name is not None:
            current_data["name"] = data.name
        if data.description is not None:
            current_data["description"] = data.description
        if data.config is not None:
            current_data["config"] = data.config
        if data.folder_id is not None:
            current_data["folder_id"] = data.folder_id
        if data.search_engines is not None:
            current_data["search_engines"] = data.search_engines

        updated = await self.store.update_data(kb_id, current_data)
        if data.status is not None:
            await self.store.update_status(kb_id, data.status)

        if updated:
            return self._to_response(updated)
        return None

    async def delete(self, kb_id: str) -> bool:
        """Delete a knowledge base and all associated data."""
        doc = await self.store.get_by_id(kb_id)
        if not doc or doc.get("type") != DocumentType.KNOWLEDGE_BASE:
            return False
        # TODO: Also delete associated documents, chunks, pipeline runs
        return await self.store.delete(kb_id)

    # ── Document Management ───────────────────────────────────

    async def list_documents(self, kb_id: str) -> list[KBDocumentResponse]:
        """List documents in a knowledge base."""
        all_docs = await self.store.list_by_type(DocumentType.UPLOADED_FILE)
        kb_docs = [d for d in all_docs if d.get("data", {}).get("kb_id") == kb_id]
        return [self._to_doc_response(d) for d in kb_docs]

    async def get_document_count(self, kb_id: str) -> dict[str, int]:
        """Get document counts for a KB."""
        docs = await self.list_documents(kb_id)
        indexed = sum(1 for d in docs if d.status == DocumentStatus.INDEXED)
        return {"total": len(docs), "indexed": indexed}

    # ── Pipeline Tracking ─────────────────────────────────────

    async def get_pipeline_steps(self, document_id: str) -> list[PipelineStepStatus]:
        """Get pipeline step statuses for a document."""
        # Find pipeline runs for this document
        all_runs = await self.store.list_by_type(DocumentType.PIPELINE_RUN)
        doc_runs = [
            r for r in all_runs
            if r.get("data", {}).get("document_id") == document_id
        ]
        return [
            PipelineStepStatus(
                step=r["data"].get("step", "unknown"),
                status=r.get("status", "pending"),
                progress=r["data"].get("progress", 0.0),
                error=r["data"].get("error"),
                started_at=r["data"].get("started_at"),
                completed_at=r["data"].get("completed_at"),
                metadata=r["data"].get("metadata", {}),
            )
            for r in doc_runs
        ]

    async def record_pipeline_step(
        self,
        document_id: str,
        step: str,
        status: str,
        progress: float = 0.0,
        error: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Record a pipeline step execution."""
        step_data = {
            "document_id": document_id,
            "step": step,
            "progress": progress,
            "error": error,
            "metadata": metadata or {},
        }
        if status == "running":
            from datetime import UTC, datetime
            step_data["started_at"] = datetime.now(UTC).isoformat()
        elif status in ("completed", "failed"):
            from datetime import UTC, datetime
            step_data["completed_at"] = datetime.now(UTC).isoformat()

        return await self.store.create(
            doc_type=DocumentType.PIPELINE_RUN,
            data=step_data,
            status=DocumentStatus(status) if status in DocumentStatus.__members__.values() else DocumentStatus.ACTIVE,
        )

    # ── Helpers ───────────────────────────────────────────────

    def _to_response(self, doc: dict[str, Any]) -> KBResponse:
        """Convert UniversalDocument dict to KBResponse."""
        data = doc.get("data", {})
        return KBResponse(
            id=doc["id"],
            name=data.get("name", "Untitled"),
            description=data.get("description"),
            type=data.get("kb_type", KBType.MANUAL_UPLOAD),
            config=data.get("config", {}),
            folder_id=data.get("folder_id"),
            search_engines=data.get("search_engines", ["azure_search"]),
            status=str(doc.get("status", "active")),
            doc_count=data.get("doc_count", 0),
            indexed_count=data.get("indexed_count", 0),
            created_at=str(doc.get("created_at", "")),
            updated_at=str(doc.get("updated_at", "")),
        )

    def _to_doc_response(self, doc: dict[str, Any]) -> KBDocumentResponse:
        """Convert a document dict to KBDocumentResponse."""
        data = doc.get("data", {})
        return KBDocumentResponse(
            id=doc["id"],
            title=data.get("title", data.get("file_name", "Untitled")),
            file_name=data.get("file_name"),
            url=data.get("url"),
            status=str(doc.get("status", "pending")),
            file_size=data.get("file_size"),
            page_count=data.get("page_count"),
            chunk_count=data.get("chunk_count"),
            created_at=str(doc.get("created_at", "")),
            updated_at=str(doc.get("updated_at", "")),
        )

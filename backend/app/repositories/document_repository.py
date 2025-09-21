"""Document repository."""

from datetime import datetime
from typing import Any

from app.models.document import Document, DocumentChunk

from .base import BaseRepository


class DocumentRepository(BaseRepository[Document]):
    """Repository for document data operations."""

    def __init__(
        self, data_file: str = "backend/monk/documents/documents.json"
    ):
        super().__init__(data_file)

    def _to_dict(self, document: Document) -> dict[str, Any]:
        """Convert Document model to dictionary."""
        return document.dict()

    def _from_dict(self, data: dict[str, Any]) -> Document:
        """Convert dictionary to Document model."""
        # Convert string dates to datetime objects
        if isinstance(data.get("upload_date"), str):
            data["upload_date"] = datetime.fromisoformat(
                data["upload_date"].replace("Z", "+00:00")
            )
        if isinstance(data.get("last_modified"), str):
            data["last_modified"] = datetime.fromisoformat(
                data["last_modified"].replace("Z", "+00:00")
            )

        return Document(**data)

    def find_by_filename(self, filename: str) -> Document | None:
        """Find document by filename."""
        data = self._load_data()
        for item in data:
            if item.get("filename") == filename:
                return self._from_dict(item)
        return None

    def find_by_status(self, status: str) -> list[Document]:
        """Find documents by status."""
        data = self._load_data()
        documents = []
        for item in data:
            if item.get("status") == status:
                documents.append(self._from_dict(item))
        return documents

    def find_by_language(self, language: str) -> list[Document]:
        """Find documents by language."""
        data = self._load_data()
        documents = []
        for item in data:
            if item.get("language") == language:
                documents.append(self._from_dict(item))
        return documents

    def find_by_tags(self, tags: list[str]) -> list[Document]:
        """Find documents containing any of the specified tags."""
        data = self._load_data()
        documents = []
        for item in data:
            item_tags = item.get("tags", [])
            if any(tag in item_tags for tag in tags):
                documents.append(self._from_dict(item))
        return documents

    def find_by_mime_type(self, mime_type: str) -> list[Document]:
        """Find documents by MIME type."""
        data = self._load_data()
        documents = []
        for item in data:
            if item.get("mime_type") == mime_type:
                documents.append(self._from_dict(item))
        return documents

    def find_processed_documents(self) -> list[Document]:
        """Find all processed documents."""
        return self.find_by_status("processed")

    def update_status(self, doc_id: str, status: str) -> Document | None:
        """Update document status."""
        updates = {
            "status": status,
            "last_modified": datetime.utcnow().isoformat(),
        }
        return self.update(doc_id, updates)


class DocumentChunkRepository(BaseRepository[DocumentChunk]):
    """Repository for document chunk data operations."""

    def __init__(self, data_file: str = "backend/monk/documents/chunks.json"):
        super().__init__(data_file)

    def _to_dict(self, chunk: DocumentChunk) -> dict[str, Any]:
        """Convert DocumentChunk model to dictionary."""
        return chunk.dict()

    def _from_dict(self, data: dict[str, Any]) -> DocumentChunk:
        """Convert dictionary to DocumentChunk model."""
        if isinstance(data.get("created_at"), str):
            data["created_at"] = datetime.fromisoformat(
                data["created_at"].replace("Z", "+00:00")
            )

        return DocumentChunk(**data)

    def find_by_document(self, doc_id: str) -> list[DocumentChunk]:
        """Find all chunks for a document."""
        data = self._load_data()
        chunks = []
        for item in data:
            if item.get("doc_id") == doc_id:
                chunks.append(self._from_dict(item))
        return sorted(chunks, key=lambda x: x.chunk_index)

    def find_by_page(
        self, doc_id: str, page_number: int
    ) -> list[DocumentChunk]:
        """Find chunks by document and page number."""
        data = self._load_data()
        chunks = []
        for item in data:
            if (
                item.get("doc_id") == doc_id
                and item.get("page_number") == page_number
            ):
                chunks.append(self._from_dict(item))
        return chunks

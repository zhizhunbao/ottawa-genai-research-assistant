"""
📄 Document Service

Handles PDF document processing, text extraction, and vector storage.
Now properly uses the Repository layer for data persistence.
"""

import hashlib
import logging
import math
import os
import random
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Union

import pdfplumber
import PyPDF2
from app.core.config import Settings
from app.models.document import Document, DocumentMetadata
from app.repositories.document_repository import DocumentRepository

logger = logging.getLogger(__name__)


class DocumentService:
    """Service for handling document processing and management."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self.upload_dir = settings.UPLOAD_DIR
        self.document_repo = DocumentRepository()

        # Ensure upload directory exists
        os.makedirs(self.upload_dir, exist_ok=True)

    async def process_document(
        self,
        file_path: str,
        doc_id: str,
        filename: str,
        user_id: str,
        language: str | None = "en",
    ) -> dict[str, Any]:
        """
        Process an uploaded PDF document and save to repository.

        Args:
            file_path: Path to the uploaded file
            doc_id: Unique document identifier
            filename: Original filename
            language: Document language

        Returns:
            Dictionary containing processing results
        """
        try:
            # Extract text from PDF
            extracted_text = await self._extract_text_from_pdf(file_path)

            # Get document metadata
            pdf_metadata = await self._extract_metadata(file_path)

            # Get file size
            file_size = os.path.getsize(file_path)

            # Create document metadata
            metadata = DocumentMetadata(
                pages=pdf_metadata.get("page_count", 0),
                author=pdf_metadata.get("author"),
                word_count=len(extracted_text.split()) if extracted_text else 0,
            )

            # Create document model
            document = Document(
                id=doc_id,
                user_id=user_id,
                filename=filename,
                title=pdf_metadata.get("title", filename),
                description=f"Processed PDF document: {filename}",
                file_path=file_path,
                file_size=file_size,
                mime_type="application/pdf",
                upload_date=datetime.now(timezone.utc),
                last_modified=datetime.now(timezone.utc),
                status="processed",
                language=language,
                content=extracted_text,
                chunks=[],  # Will be populated by chunking process
                metadata=metadata,
                vector_id=None,  # Will be set when vectors are created
            )

            # Save through repository
            self.document_repo.create(document)

            processing_result = {
                "status": "processed",
                "doc_id": doc_id,
                "filename": filename,
                "language": language,
                "page_count": metadata.pages,
                "word_count": metadata.word_count,
                "text_preview": (
                    extracted_text[:500] + "..."
                    if len(extracted_text) > 500
                    else extracted_text
                ),
                "processed_at": datetime.now(timezone.utc).isoformat(),
                "file_size": file_size,
            }

            return processing_result

        except Exception as e:
            # Create failed document record
            failed_document = Document(
                id=doc_id,
                user_id=user_id,  # 添加缺失的user_id字段
                filename=filename,
                title=filename,
                description=f"Failed to process: {str(e)}",
                file_path=file_path,
                file_size=(
                    os.path.getsize(file_path) if os.path.exists(file_path) else 0
                ),
                mime_type="application/pdf",
                upload_date=datetime.now(timezone.utc),
                last_modified=datetime.now(timezone.utc),
                status="error",
                language=language or "unknown",
                content="",
                chunks=[],
                metadata=DocumentMetadata(),
                vector_id=None,
            )

            # Save failed document
            self.document_repo.create(failed_document)

            return {
                "status": "error",
                "doc_id": doc_id,
                "filename": filename,
                "error": str(e),
                "processed_at": datetime.now(timezone.utc).isoformat(),
            }

    async def _extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text content from PDF file."""

        extracted_text = ""

        try:
            # Try with pdfplumber first (better for complex layouts)
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        extracted_text += page_text + "\n"

            # If pdfplumber didn't extract much text, try PyPDF2
            if len(extracted_text.strip()) < 100:
                with open(file_path, "rb") as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    extracted_text = ""

                    for page_num in range(len(pdf_reader.pages)):
                        page = pdf_reader.pages[page_num]
                        page_text = page.extract_text()
                        if page_text:
                            extracted_text += page_text + "\n"

            return extracted_text.strip()

        except Exception as e:
            raise Exception(f"Error extracting text from PDF: {str(e)}")

    async def _extract_metadata(self, file_path: str) -> dict[str, Any]:
        """Extract metadata from PDF file."""

        metadata = {}

        try:
            with open(file_path, "rb") as file:
                pdf_reader = PyPDF2.PdfReader(file)

                # Basic metadata
                metadata["page_count"] = len(pdf_reader.pages)
                metadata["file_size"] = os.path.getsize(file_path)

                # PDF metadata if available
                if pdf_reader.metadata:
                    pdf_meta = pdf_reader.metadata
                    metadata["title"] = pdf_meta.get("/Title", "")
                    metadata["author"] = pdf_meta.get("/Author", "")
                    metadata["subject"] = pdf_meta.get("/Subject", "")
                    metadata["creator"] = pdf_meta.get("/Creator", "")

                    # Convert creation date if available
                    if "/CreationDate" in pdf_meta:
                        metadata["creation_date"] = str(pdf_meta["/CreationDate"])

            return metadata

        except Exception as e:
            return {"error": f"Error extracting metadata: {str(e)}"}

    async def _chunk_text(
        self, text: str, chunk_size: int = 1000, overlap: int = 200
    ) -> list[str]:
        """Split text into overlapping chunks for vector storage."""

        if not text:
            return []

        chunks = []
        start = 0
        text_length = len(text)

        while start < text_length:
            end = start + chunk_size

            # Try to break at sentence boundaries
            if end < text_length:
                # Look for sentence endings near the chunk boundary
                sentence_endings = [". ", "! ", "? ", "\n\n"]
                best_break = end

                for ending in sentence_endings:
                    pos = text.rfind(ending, start + chunk_size - 200, end)
                    if pos > start:
                        best_break = pos + len(ending)
                        break

                end = best_break

            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)

            start = end - overlap

        return chunks

    async def _generate_embeddings(self, chunks: list[str]) -> list[list[float]]:
        """Generate embeddings for text chunks using a simple hash-based approach."""


        embeddings = []
        for chunk in chunks:
            try:
                # Create a deterministic embedding based on content
                # This is a simplified approach for demonstration
                # In production, use OpenAI embeddings or sentence-transformers

                # Generate multiple hashes to create more dimensions
                embedding = []

                # Use different hash functions and salts to create variety
                hash_functions = [
                    lambda x, salt: hashlib.md5(f"{salt}_{x}".encode()).hexdigest(),
                    lambda x, salt: hashlib.sha1(f"{salt}_{x}".encode()).hexdigest(),
                    lambda x, salt: hashlib.sha256(
                        f"{salt}_{x}".encode()
                    ).hexdigest()[:32],
                ]

                salts = ['text', 'content', 'chunk', 'semantic', 'vector', 'embed']

                for hash_func in hash_functions:
                    for salt in salts:
                        hex_hash = hash_func(chunk, salt)
                        # Convert hex pairs to normalized floats
                        for i in range(0, min(len(hex_hash), 32), 2):
                            hex_pair = hex_hash[i:i + 2]
                            value = int(hex_pair, 16) / 255.0
                            # Apply some mathematical transformation for better distribution
                            transformed_value = (
                                math.sin(value * math.pi) * 0.5 + 0.5
                            )
                            embedding.append(transformed_value)

                            if len(embedding) >= 384:
                                break
                    if len(embedding) >= 384:
                        break

                # Ensure exactly 384 dimensions
                embedding = embedding[:384]
                while len(embedding) < 384:
                    # Fill remaining with content-based values
                    chunk_len_factor = (len(chunk) % 256) / 255.0
                    embedding.append(chunk_len_factor)

                embeddings.append(embedding)

            except Exception as e:
                logger.error(f"Error generating embedding for chunk: {e}")
                # Fallback to deterministic random embedding based on chunk content
                random.seed(hash(chunk))  # Deterministic seed
                fallback_embedding = [random.random() for _ in range(384)]
                embeddings.append(fallback_embedding)

        return embeddings

    async def _store_in_vector_db(
        self,
        doc_id: str,
        chunks: list[str],
        embeddings: list[list[float]],
        metadata: dict[str, Any],
    ) -> bool:
        """Store document chunks and embeddings in vector database."""

        try:
            # Vector database storage would be implemented here
            # This would use ChromaDB, Pinecone, or similar

            # For now, simulate successful storage
            return True

        except Exception as e:
            raise Exception(f"Error storing in vector database: {str(e)}")

    async def search_documents(
        self, query: str, limit: int = 5, similarity_threshold: float = 0.7
    ) -> list[dict[str, Any]]:
        """Search for relevant document chunks based on query using cosine similarity."""

        try:
            # 1. Generate embedding for the query
            query_embedding = await self._generate_embeddings([query])
            if not query_embedding:
                return []

            query_vector = query_embedding[0]

            # 2. Get all documents from repository
            documents = self.document_repo.find_all()
            if not documents:
                return []

            results = []

            # 3. For each document, simulate chunk search with similarity calculation
            for doc in documents:
                try:
                    # Simulate document chunks (in production, these would be stored in vector DB)
                    sample_chunks = [
                        f"Content from {doc.filename} discussing economic trends "
                        f"and market analysis.",
                        f"Key findings from {doc.title} related to business "
                        f"development and growth.",
                        f"Statistical data and insights from {doc.filename} "
                        f"covering regional performance.",
                    ]

                    for i, chunk in enumerate(sample_chunks):
                        # Generate embedding for this chunk
                        chunk_embeddings = await self._generate_embeddings([chunk])
                        if not chunk_embeddings:
                            continue

                        chunk_vector = chunk_embeddings[0]

                        # Calculate cosine similarity
                        similarity = self._calculate_cosine_similarity(
                            query_vector, chunk_vector
                        )

                        if similarity >= similarity_threshold:
                            results.append({
                                "doc_id": doc.id,
                                "filename": doc.filename,
                                "title": doc.title,
                                "chunk_text": chunk,
                                "page_number": i + 1,  # Simulated page number
                                "similarity_score": round(similarity, 3),
                                "metadata": {
                                    "section": f"Section {i + 1}",
                                    "upload_date": doc.upload_date.isoformat(),
                                    "language": doc.language,
                                },
                            })

                except Exception as e:
                    logger.warning(f"Error processing document {doc.id}: {e}")
                    continue

            # Sort by similarity score (descending) and return top results
            results.sort(key=lambda x: x["similarity_score"], reverse=True)
            return results[:limit]

        except Exception as e:
            logger.error(f"Error in search_documents: {e}")
            raise Exception(f"Error searching documents: {str(e)}")

    def _calculate_cosine_similarity(
        self, vec1: list[float], vec2: list[float]
    ) -> float:
        """Calculate cosine similarity between two vectors."""
        try:

            # Calculate dot product
            dot_product = sum(a * b for a, b in zip(vec1, vec2))

            # Calculate magnitudes
            magnitude1 = math.sqrt(sum(a * a for a in vec1))
            magnitude2 = math.sqrt(sum(a * a for a in vec2))

            # Avoid division by zero
            if magnitude1 == 0 or magnitude2 == 0:
                return 0.0

            # Calculate cosine similarity
            similarity = dot_product / (magnitude1 * magnitude2)

            # Ensure the result is between 0 and 1
            return max(0.0, min(1.0, similarity))

        except Exception as e:
            logger.error(f"Error calculating cosine similarity: {e}")
            return 0.0

    async def get_document_content(
        self, doc_id: str, page: int | None = None
    ) -> dict[str, Any]:
        """Get content from a specific document using repository."""

        try:
            document = self.document_repo.get_by_id(doc_id)
            if not document:
                raise ValueError(f"Document with ID {doc_id} not found")

            return {
                "doc_id": doc_id,
                "content": document.content,
                "page": page,
                "total_pages": document.metadata.pages if document.metadata else 0,
                "filename": document.filename,
                "title": document.title,
                "status": document.status,
            }

        except Exception as e:
            raise Exception(f"Error retrieving document content: {str(e)}")

    async def delete_document(self, doc_id: str) -> bool:
        """Delete a document and all associated data."""

        try:
            # Get document info first
            document = self.document_repo.find_by_id(doc_id)
            if not document:
                return False

            # 1. Remove file from storage
            if os.path.exists(document.file_path):
                os.remove(document.file_path)

            # 2. Delete record from repository
            deleted = self.document_repo.delete(doc_id)

            # 3. Remove vectors from vector database (when implemented)
            # This would be implemented when vector storage is added

            return deleted

        except Exception as e:
            raise Exception(f"Error deleting document: {str(e)}")

    async def get_documents_list(self) -> list[dict[str, Any]]:
        """Get list of all uploaded documents from repository."""

        try:
            documents = self.document_repo.get_all()

            return [
                {
                    "id": doc.id,
                    "filename": doc.filename,
                    "title": doc.title,
                    "size": doc.file_size,
                    "upload_date": doc.upload_date.isoformat(),
                    "processed": doc.status == "processed",
                    "page_count": doc.metadata.pages if doc.metadata else None,
                    "language": doc.language,
                    "status": doc.status,
                }
                for doc in documents
            ]

        except Exception as e:
            raise Exception(f"Error retrieving documents list: {str(e)}")

    async def get_document_by_filename(self, filename: str) -> dict[str, Any] | None:
        """Get document by filename."""

        try:
            document = self.document_repo.find_by_filename(filename)
            if not document:
                return None

            return {
                "id": document.id,
                "filename": document.filename,
                "title": document.title,
                "size": document.file_size,
                "upload_date": document.upload_date.isoformat(),
                "status": document.status,
                "language": document.language,
                "content_preview": (
                    document.content[:500] + "..."
                    if len(document.content) > 500
                    else document.content
                ),
            }

        except Exception as e:
            raise Exception(f"Error retrieving document by filename: {str(e)}")

    async def get_documents_by_status(self, status: str) -> list[dict[str, Any]]:
        """Get documents by processing status."""

        try:
            documents = self.document_repo.find_by_status(status)

            return [
                {
                    "id": doc.id,
                    "filename": doc.filename,
                    "title": doc.title,
                    "status": doc.status,
                    "upload_date": doc.upload_date.isoformat(),
                    "language": doc.language,
                }
                for doc in documents
            ]

        except Exception as e:
            raise Exception(f"Error retrieving documents by status: {str(e)}")

    async def update_document_status(self, doc_id: str, status: str) -> bool:
        """Update document processing status."""

        try:
            document = self.document_repo.get_by_id(doc_id)
            if not document:
                return False

            document.status = status
            document.last_modified = datetime.now(timezone.utc)

            updated_doc = self.document_repo.update(doc_id, document)
            return updated_doc is not None

        except Exception as e:
            raise Exception(f"Error updating document status: {str(e)}")

    async def reprocess_document(self, doc_id: str, user_id: str) -> dict[str, Any]:
        """Reprocess a document that has already been uploaded."""

        try:
            # Get document info
            document = self.document_repo.get_by_id(doc_id)
            if not document:
                raise ValueError(f"Document with ID {doc_id} not found")

            # Verify ownership
            if document.user_id != user_id:
                raise ValueError("Document does not belong to the current user")

            # Check if file still exists
            if not os.path.exists(document.file_path):
                raise ValueError("Original document file not found")

            # Update status to processing
            self.document_repo.update_status(doc_id, "processing")

            # Reprocess the document using the existing process_document method
            processing_result = await self.process_document(
                file_path=document.file_path,
                doc_id=doc_id,
                filename=document.filename,
                user_id=user_id,
                language=document.language
            )

            return {
                "status": processing_result["status"],
                "processing_id": doc_id,
                "message": "Document reprocessing started successfully"
            }

        except Exception as e:
            # Update status to error if reprocessing fails
            self.document_repo.update_status(doc_id, "error")
            raise Exception(f"Error reprocessing document: {str(e)}")

    def get_user_documents(
        self, user_id: str, limit: int = 50, offset: int = 0
    ) -> list[Document]:
        """
        Get documents for a specific user.

        Args:
            user_id: User identifier
            limit: Maximum number of documents to return
            offset: Number of documents to skip

        Returns:
            List of user documents
        """
        try:
            # Get all documents for the user
            all_user_docs = []
            all_docs = self.document_repo.find_all()

            # Filter by user_id
            for doc in all_docs:
                if doc.user_id == user_id:
                    all_user_docs.append(doc)

            # Apply pagination
            return all_user_docs[offset: offset + limit]

        except Exception as e:
            raise Exception(f"Error getting user documents: {str(e)}")

    def get_document_by_id(self, doc_id: str, user_id: str) -> Document | None:
        """
        Get a specific document by ID, ensuring it belongs to the user.
        
        Args:
            doc_id: Document identifier
            user_id: User identifier
            
        Returns:
            Document if found and belongs to user, None otherwise
        """
        try:
            # Get document from repository
            document = self.document_repo.find_by_id(doc_id)
            
            # Check if document exists and belongs to the user
            if document and document.user_id == user_id:
                return document
            
            return None
            
        except Exception as e:
            raise Exception(f"Error getting document by ID: {str(e)}")

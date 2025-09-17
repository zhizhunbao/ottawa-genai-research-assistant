"""
📄 Document Service

Handles PDF document processing, text extraction, and vector storage.
Now properly uses the Repository layer for data persistence.
"""

import os
import PyPDF2
import pdfplumber
from typing import Dict, List, Optional, Any
from app.core.config import Settings
from app.models.document import Document, DocumentMetadata, DocumentChunk
from app.repositories.document_repository import DocumentRepository
import uuid
from datetime import datetime


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
        language: Optional[str] = "en"
    ) -> Dict[str, Any]:
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
                word_count=len(extracted_text.split()) if extracted_text else 0
            )
            
            # Create document model
            document = Document(
                id=doc_id,
                filename=filename,
                title=pdf_metadata.get("title", filename),
                description=f"Processed PDF document: {filename}",
                file_path=file_path,
                file_size=file_size,
                mime_type="application/pdf",
                upload_date=datetime.utcnow(),
                last_modified=datetime.utcnow(),
                status="processed",
                language=language,
                content=extracted_text,
                chunks=[],  # Will be populated by chunking process
                metadata=metadata,
                vector_id=None  # Will be set when vectors are created
            )
            
            # Save through repository
            saved_document = self.document_repo.create(document)
            
            processing_result = {
                "status": "completed",
                "doc_id": doc_id,
                "filename": filename,
                "language": language,
                "page_count": metadata.pages,
                "word_count": metadata.word_count,
                "text_preview": extracted_text[:500] + "..." if len(extracted_text) > 500 else extracted_text,
                "processed_at": datetime.utcnow().isoformat(),
                "file_size": file_size
            }
            
            return processing_result
            
        except Exception as e:
            # Create failed document record
            failed_document = Document(
                id=doc_id,
                filename=filename,
                title=filename,
                description=f"Failed to process: {str(e)}",
                file_path=file_path,
                file_size=os.path.getsize(file_path) if os.path.exists(file_path) else 0,
                mime_type="application/pdf",
                upload_date=datetime.utcnow(),
                last_modified=datetime.utcnow(),
                status="failed",
                language=language or "unknown",
                content="",
                chunks=[],
                metadata=DocumentMetadata(),
                vector_id=None
            )
            
            # Save failed document
            self.document_repo.create(failed_document)
            
            return {
                "status": "failed",
                "doc_id": doc_id,
                "filename": filename,
                "error": str(e),
                "processed_at": datetime.utcnow().isoformat()
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
                with open(file_path, 'rb') as file:
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
    
    async def _extract_metadata(self, file_path: str) -> Dict[str, Any]:
        """Extract metadata from PDF file."""
        
        metadata = {}
        
        try:
            with open(file_path, 'rb') as file:
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
    
    async def _chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
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
                sentence_endings = ['. ', '! ', '? ', '\n\n']
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
    
    async def _generate_embeddings(self, chunks: List[str]) -> List[List[float]]:
        """Generate embeddings for text chunks."""
        
        # TODO: Implement actual embedding generation
        # This would use sentence-transformers or OpenAI embeddings
        
        # For now, return mock embeddings
        embeddings = []
        for chunk in chunks:
            # Mock embedding (in reality, this would be 384 or 1536 dimensions)
            mock_embedding = [0.1] * 384  # Placeholder
            embeddings.append(mock_embedding)
        
        return embeddings
    
    async def _store_in_vector_db(
        self,
        doc_id: str,
        chunks: List[str],
        embeddings: List[List[float]],
        metadata: Dict[str, Any]
    ) -> bool:
        """Store document chunks and embeddings in vector database."""
        
        try:
            # TODO: Implement actual vector database storage
            # This would use ChromaDB, Pinecone, or similar
            
            # For now, simulate successful storage
            return True
            
        except Exception as e:
            raise Exception(f"Error storing in vector database: {str(e)}")
    
    async def search_documents(
        self,
        query: str,
        limit: int = 5,
        similarity_threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """Search for relevant document chunks based on query."""
        
        try:
            # TODO: Implement actual vector search
            # This would:
            # 1. Generate embedding for the query
            # 2. Search vector database for similar chunks
            # 3. Return relevant results with metadata
            
            # For now, return mock search results
            mock_results = [
                {
                    "doc_id": "1",
                    "filename": "Q3_Economic_Report.pdf",
                    "chunk_text": "Ottawa's economy grew by 3.2% in Q3 2024, driven by strong performance in the technology sector...",
                    "page_number": 5,
                    "similarity_score": 0.85,
                    "metadata": {"section": "Economic Overview"}
                },
                {
                    "doc_id": "2",
                    "filename": "Business_Support_Programs.pdf",
                    "chunk_text": "The Small Business Development Fund provided $2.5M in support to local entrepreneurs...",
                    "page_number": 12,
                    "similarity_score": 0.78,
                    "metadata": {"section": "Funding Programs"}
                }
            ]
            
            return mock_results[:limit]
            
        except Exception as e:
            raise Exception(f"Error searching documents: {str(e)}")
    
    async def get_document_content(self, doc_id: str, page: Optional[int] = None) -> Dict[str, Any]:
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
                "status": document.status
            }
            
        except Exception as e:
            raise Exception(f"Error retrieving document content: {str(e)}")
    
    async def delete_document(self, doc_id: str) -> bool:
        """Delete a document and all associated data."""
        
        try:
            # Get document info first
            document = self.document_repo.get_by_id(doc_id)
            if not document:
                return False
            
            # 1. Remove file from storage
            if os.path.exists(document.file_path):
                os.remove(document.file_path)
            
            # 2. Delete record from repository
            deleted = self.document_repo.delete(doc_id)
            
            # 3. TODO: Remove vectors from vector database
            # This would be implemented when vector storage is added
            
            return deleted
            
        except Exception as e:
            raise Exception(f"Error deleting document: {str(e)}")
    
    async def get_documents_list(self) -> List[Dict[str, Any]]:
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
                    "status": doc.status
                }
                for doc in documents
            ]
            
        except Exception as e:
            raise Exception(f"Error retrieving documents list: {str(e)}")
    
    async def get_document_by_filename(self, filename: str) -> Optional[Dict[str, Any]]:
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
                "content_preview": document.content[:500] + "..." if len(document.content) > 500 else document.content
            }
            
        except Exception as e:
            raise Exception(f"Error retrieving document by filename: {str(e)}")
    
    async def get_documents_by_status(self, status: str) -> List[Dict[str, Any]]:
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
                    "language": doc.language
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
            document.last_modified = datetime.utcnow()
            
            updated_doc = self.document_repo.update(doc_id, document)
            return updated_doc is not None
            
        except Exception as e:
            raise Exception(f"Error updating document status: {str(e)}") 
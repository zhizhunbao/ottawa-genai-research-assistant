"""
📄 Document Management API Endpoints

Handles PDF document upload, processing, and management.
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
import uuid

from app.core.config import get_settings
from app.services.document_service import DocumentService

router = APIRouter()

# Response Models
class DocumentInfo(BaseModel):
    id: str
    filename: str
    size: int
    upload_date: datetime
    processed: bool
    page_count: Optional[int] = None
    language: Optional[str] = None

class DocumentList(BaseModel):
    documents: List[DocumentInfo]
    total: int

class UploadResponse(BaseModel):
    id: str
    filename: str
    size: int
    message: str
    processing_status: str

@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    language: Optional[str] = "en",
    settings = Depends(get_settings)
):
    """
    Upload a PDF document for processing.
    
    - **file**: PDF file to upload (max 50MB)
    - **language**: Document language (en/fr)
    """
    try:
        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=400, 
                detail="Only PDF files are allowed"
            )
        
        # Check file size
        file_size = 0
        content = await file.read()
        file_size = len(content)
        
        max_size = settings.MAX_FILE_SIZE_MB * 1024 * 1024  # Convert to bytes
        if file_size > max_size:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size is {settings.MAX_FILE_SIZE_MB}MB"
            )
        
        # Generate unique ID and save file
        doc_id = str(uuid.uuid4())
        file_path = os.path.join(settings.UPLOAD_DIR, f"{doc_id}_{file.filename}")
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Initialize document service and process file
        doc_service = DocumentService(settings)
        processing_result = await doc_service.process_document(
            file_path=file_path,
            doc_id=doc_id,
            filename=file.filename,
            language=language
        )
        
        return UploadResponse(
            id=doc_id,
            filename=file.filename,
            size=file_size,
            message="Document uploaded successfully",
            processing_status=processing_result["status"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading document: {str(e)}")

@router.get("/list", response_model=DocumentList)
async def list_documents(
    limit: int = 50,
    offset: int = 0
):
    """
    Get list of uploaded documents.
    
    - **limit**: Maximum number of documents to return
    - **offset**: Number of documents to skip (for pagination)
    """
    try:
        # TODO: Implement actual document listing from database
        # For now, return mock data
        mock_documents = [
            DocumentInfo(
                id="1",
                filename="Q3_Economic_Report.pdf",
                size=2048576,
                upload_date=datetime.now(),
                processed=True,
                page_count=24,
                language="en"
            ),
            DocumentInfo(
                id="2",
                filename="Business_Support_Programs.pdf",
                size=1536000,
                upload_date=datetime.now(),
                processed=True,
                page_count=18,
                language="en"
            )
        ]
        
        return DocumentList(
            documents=mock_documents[offset:offset+limit],
            total=len(mock_documents)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing documents: {str(e)}")

@router.get("/{doc_id}", response_model=DocumentInfo)
async def get_document(doc_id: str):
    """
    Get information about a specific document.
    
    - **doc_id**: Unique document identifier
    """
    try:
        # TODO: Implement actual document retrieval from database
        # For now, return mock data
        return DocumentInfo(
            id=doc_id,
            filename="Sample_Document.pdf",
            size=1024000,
            upload_date=datetime.now(),
            processed=True,
            page_count=12,
            language="en"
        )
        
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Document not found: {doc_id}")

@router.delete("/{doc_id}")
async def delete_document(doc_id: str):
    """
    Delete a document and its associated data.
    
    - **doc_id**: Unique document identifier
    """
    try:
        # TODO: Implement actual document deletion
        # This should remove:
        # 1. The file from storage
        # 2. The record from database
        # 3. The vectors from vector database
        
        return {"message": f"Document {doc_id} deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting document: {str(e)}")

@router.post("/{doc_id}/reprocess")
async def reprocess_document(doc_id: str):
    """
    Reprocess a document (useful if processing failed or needs updating).
    
    - **doc_id**: Unique document identifier
    """
    try:
        # TODO: Implement document reprocessing
        return {"message": f"Document {doc_id} queued for reprocessing"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reprocessing document: {str(e)}")

@router.get("/{doc_id}/content")
async def get_document_content(
    doc_id: str,
    page: Optional[int] = None
):
    """
    Get extracted text content from a document.
    
    - **doc_id**: Unique document identifier
    - **page**: Specific page number (optional, returns all if not specified)
    """
    try:
        # TODO: Implement content retrieval from processed document
        mock_content = {
            "doc_id": doc_id,
            "total_pages": 12,
            "page": page or "all",
            "content": "Sample extracted text content from the PDF document..."
        }
        
        return mock_content
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving document content: {str(e)}") 
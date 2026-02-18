"""
Knowledge Base Routes

API endpoints for knowledge base CRUD, document management, and pipeline operations.

@reference ragflow web/src/pages/datasets/ — Dataset CRUD UI patterns
@reference rag-web-ui backend/app/services/ — KB service layer
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.document_store import DocumentStore
from app.core.schemas import ApiResponse
from app.knowledge.schemas import (
    BatchPipelineRequest,
    KBAddUrlRequest,
    KBCreate,
    KBDocumentListResponse,
    KBDocumentResponse,
    KBListResponse,
    KBResponse,
    KBUpdate,
    PipelineRunRequest,
    PipelineStatusResponse,
    SearchEngineStatusResponse,
)
from app.knowledge.service import KnowledgeBaseService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/knowledge-bases", tags=["knowledge-bases"])


def get_kb_service(db: AsyncSession = Depends(get_db)) -> KnowledgeBaseService:
    """Dependency injection for KnowledgeBaseService."""
    store = DocumentStore(db)
    return KnowledgeBaseService(store)


# ── Knowledge Base CRUD ───────────────────────────────────────


@router.post("", response_model=ApiResponse[KBResponse])
async def create_knowledge_base(
    data: KBCreate,
    service: KnowledgeBaseService = Depends(get_kb_service),
) -> ApiResponse[KBResponse]:
    """Create a new knowledge base."""
    result = await service.create(data)
    return ApiResponse.ok(result)


@router.get("", response_model=ApiResponse[KBListResponse])
async def list_knowledge_bases(
    service: KnowledgeBaseService = Depends(get_kb_service),
) -> ApiResponse[KBListResponse]:
    """List all knowledge bases."""
    items = await service.list_all()
    return ApiResponse.ok(KBListResponse(items=items, total=len(items)))


@router.get("/{kb_id}", response_model=ApiResponse[KBResponse])
async def get_knowledge_base(
    kb_id: str,
    service: KnowledgeBaseService = Depends(get_kb_service),
) -> ApiResponse[KBResponse]:
    """Get knowledge base details."""
    result = await service.get(kb_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge base not found",
        )
    return ApiResponse.ok(result)


@router.patch("/{kb_id}", response_model=ApiResponse[KBResponse])
async def update_knowledge_base(
    kb_id: str,
    data: KBUpdate,
    service: KnowledgeBaseService = Depends(get_kb_service),
) -> ApiResponse[KBResponse]:
    """Update a knowledge base."""
    result = await service.update(kb_id, data)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge base not found",
        )
    return ApiResponse.ok(result)


@router.delete("/{kb_id}", response_model=ApiResponse[bool])
async def delete_knowledge_base(
    kb_id: str,
    service: KnowledgeBaseService = Depends(get_kb_service),
) -> ApiResponse[bool]:
    """Delete a knowledge base and all associated data."""
    success = await service.delete(kb_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge base not found",
        )
    return ApiResponse.ok(True)


# ── KB Document Management ────────────────────────────────────


@router.get("/{kb_id}/documents", response_model=ApiResponse[KBDocumentListResponse])
async def list_kb_documents(
    kb_id: str,
    service: KnowledgeBaseService = Depends(get_kb_service),
) -> ApiResponse[KBDocumentListResponse]:
    """List documents in a knowledge base."""
    kb = await service.get(kb_id)
    if not kb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge base not found",
        )
    items = await service.list_documents(kb_id)
    return ApiResponse.ok(KBDocumentListResponse(
        kb_id=kb_id, items=items, total=len(items),
    ))


@router.post("/{kb_id}/add-url", response_model=ApiResponse[KBDocumentResponse])
async def add_url_to_kb(
    kb_id: str,
    data: KBAddUrlRequest,
    service: KnowledgeBaseService = Depends(get_kb_service),
) -> ApiResponse[KBDocumentResponse]:
    """Add a URL source to a knowledge base."""
    kb = await service.get(kb_id)
    if not kb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge base not found",
        )
    # Create document entry linked to this KB
    doc_data = {
        "title": data.title or data.url.split("/")[-1],
        "url": data.url,
        "kb_id": kb_id,
        "file_name": data.url.split("/")[-1],
    }
    from app.core.enums import DocumentStatus, DocumentType

    doc = await service.store.create(
        doc_type=DocumentType.UPLOADED_FILE,
        data=doc_data,
        status=DocumentStatus.PENDING,
    )
    result = service._to_doc_response(doc)
    return ApiResponse.ok(result)


# ── Pipeline Operations ───────────────────────────────────────


@router.get(
    "/{kb_id}/documents/{doc_id}/pipeline",
    response_model=ApiResponse[PipelineStatusResponse],
)
async def get_pipeline_status(
    kb_id: str,
    doc_id: str,
    service: KnowledgeBaseService = Depends(get_kb_service),
) -> ApiResponse[PipelineStatusResponse]:
    """Get pipeline step statuses for a document."""
    steps = await service.get_pipeline_steps(doc_id)

    # Determine overall status
    statuses = [s.status for s in steps]
    if any(s == "failed" for s in statuses):
        overall = "failed"
    elif any(s == "running" for s in statuses):
        overall = "processing"
    elif all(s in ("completed", "skipped") for s in statuses) and steps:
        overall = "indexed"
    else:
        overall = "pending"

    return ApiResponse.ok(PipelineStatusResponse(
        document_id=doc_id, steps=steps, overall_status=overall,
    ))


@router.post(
    "/{kb_id}/documents/{doc_id}/pipeline/run",
    response_model=ApiResponse[PipelineStatusResponse],
)
async def run_document_pipeline(
    kb_id: str,
    doc_id: str,
    request: PipelineRunRequest,
    service: KnowledgeBaseService = Depends(get_kb_service),
) -> ApiResponse[PipelineStatusResponse]:
    """Run pipeline steps for a document."""
    from app.core.enums import PipelineStep

    all_steps = [s.value for s in PipelineStep]
    selected = request.steps or all_steps

    # Record each step as pending
    for step in all_steps:
        step_status = "pending" if step in selected else "skipped"
        await service.record_pipeline_step(doc_id, step, step_status)

    # TODO: Actually trigger pipeline execution in background
    # For now, return the recorded state
    steps = await service.get_pipeline_steps(doc_id)
    return ApiResponse.ok(PipelineStatusResponse(
        document_id=doc_id, steps=steps, overall_status="pending",
    ))


@router.post(
    "/{kb_id}/pipeline/batch",
    response_model=ApiResponse[list[PipelineStatusResponse]],
)
async def batch_pipeline(
    kb_id: str,
    request: BatchPipelineRequest,
    service: KnowledgeBaseService = Depends(get_kb_service),
) -> ApiResponse[list[PipelineStatusResponse]]:
    """Batch pipeline operation on multiple documents."""
    results = []
    for doc_id in request.document_ids:
        run_req = PipelineRunRequest(steps=request.steps, engines=request.engines)
        # Reuse the single-doc endpoint logic
        from app.core.enums import PipelineStep

        all_steps = [s.value for s in PipelineStep]
        selected = run_req.steps or all_steps

        for step in all_steps:
            step_status = "pending" if step in selected else "skipped"
            await service.record_pipeline_step(doc_id, step, step_status)

        steps = await service.get_pipeline_steps(doc_id)
        results.append(PipelineStatusResponse(
            document_id=doc_id, steps=steps, overall_status="pending",
        ))

    return ApiResponse.ok(results)

"""
文档管理路由

定义文档上传、列表查询、删除等 API 端点。
遵循 dev-backend_patterns skill 规范。
遵循 step-06-backend.md Story 开发循环。
"""

import logging
from io import BytesIO

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.azure_storage import AzureBlobStorageService
from app.core.database import get_db
from app.core.dependencies import get_blob_storage, get_document_pipeline_optional
from app.core.document_store import DocumentStore
from app.core.enums import DocumentStatus
from app.core.exceptions import NotFoundError
from app.core.schemas import ApiResponse
from app.documents.schemas import (
    DocumentCreate,
    DocumentListResponse,
    DocumentResponse,
    DocumentUpdate,
    DocumentUploadResponse,
)
from app.documents.service import DocumentService

logger = logging.getLogger(__name__)


router = APIRouter(prefix="/api/v1/documents", tags=["documents"])

# 允许上传的文件类型
ALLOWED_CONTENT_TYPES = {
    "application/pdf": ".pdf",
}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


def get_document_service(db: AsyncSession = Depends(get_db)) -> DocumentService:
    """依赖注入获取文档服务"""
    store = DocumentStore(db)
    return DocumentService(store)


@router.post("", response_model=ApiResponse[DocumentResponse])
async def upload_document(
    data: DocumentCreate,
    service: DocumentService = Depends(get_document_service)
) -> ApiResponse[DocumentResponse]:
    """上传/注册文档"""
    result = await service.upload(data)
    # 将 dict 转换为 DocumentResponse
    return ApiResponse.ok(DocumentResponse(**result))


@router.get("", response_model=ApiResponse[DocumentListResponse])
async def list_documents(
    service: DocumentService = Depends(get_document_service)
) -> ApiResponse[DocumentListResponse]:
    """获取文档列表"""
    items = await service.list()
    # 包装成列表响应
    response_data = DocumentListResponse(
        items=[DocumentResponse(**item) for item in items],
        total=len(items)
    )
    return ApiResponse.ok(response_data)


@router.get("/{document_id}", response_model=ApiResponse[DocumentResponse])
async def get_document(
    document_id: str,
    service: DocumentService = Depends(get_document_service)
) -> ApiResponse[DocumentResponse]:
    """按 ID 获取文档详情"""
    result = await service.get_by_id(document_id)
    if not result:
        raise NotFoundError(f"Document {document_id}")
    return ApiResponse.ok(DocumentResponse(**result))


@router.delete("/{document_id}", response_model=ApiResponse[bool])
async def delete_document(
    document_id: str,
    service: DocumentService = Depends(get_document_service)
) -> ApiResponse[bool]:
    """删除文档"""
    success = await service.delete(document_id)
    if not success:
        raise NotFoundError(f"Document {document_id}")
    return ApiResponse.ok(True)


@router.patch("/{document_id}", response_model=ApiResponse[DocumentResponse])
async def update_document(
    document_id: str,
    data: DocumentUpdate,
    service: DocumentService = Depends(get_document_service)
) -> ApiResponse[DocumentResponse]:
    """更新文档信息"""
    result = await service.update(document_id, data)
    if not result:
        raise NotFoundError(f"Document {document_id}")
    return ApiResponse.ok(DocumentResponse(**result))


@router.post("/upload", response_model=ApiResponse[DocumentUploadResponse])
async def upload_pdf_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="PDF file to upload"),
    title: str | None = None,
    description: str | None = None,
    service: DocumentService = Depends(get_document_service),
    blob_storage: AzureBlobStorageService = Depends(get_blob_storage),
    pipeline=Depends(get_document_pipeline_optional),
) -> ApiResponse[DocumentUploadResponse]:
    """
    上传 PDF 文件到 Azure Blob Storage

    - 仅支持 PDF 文件
    - 最大文件大小: 50MB
    - 文件将存储到 Azure Blob Storage
    - 上传后自动触发 RAG 管道处理（后台任务）
    """
    # 验证文件类型
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only PDF files are allowed. Received: {file.content_type}",
        )

    # 验证文件名
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must have a .pdf extension",
        )

    # 读取文件内容
    content = await file.read()

    # 验证文件大小
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum allowed size of {MAX_FILE_SIZE // (1024*1024)}MB",
        )

    # 上传到 Azure Blob Storage
    try:
        upload_result = await blob_storage.upload_file(
            file=BytesIO(content),
            filename=file.filename,
            content_type=file.content_type or "application/pdf",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file to storage: {str(e)}",
        )

    # 创建文档记录
    doc_data = DocumentCreate(
        title=title or file.filename,
        description=description,
        file_name=file.filename,
        mime_type=file.content_type or "application/pdf",
        file_size=len(content),
        tags=[],
    )

    result = await service.upload(doc_data, blob_info=upload_result)
    document_id = result["id"]

    # 触发 RAG 管道处理（后台任务）
    if pipeline:
        background_tasks.add_task(
            _run_document_pipeline,
            pipeline=pipeline,
            service=service,
            document_id=document_id,
            pdf_bytes=content,
            metadata={
                "title": title or file.filename,
                "source": file.filename,
                "blob_name": upload_result.get("blob_name", ""),
            },
        )
        logger.info(f"Pipeline task queued for document {document_id}")
    else:
        logger.warning("Document pipeline not configured, skipping RAG processing")

    return ApiResponse.ok(
        DocumentUploadResponse(
            id=document_id,
            file_name=file.filename,
            blob_name=upload_result["blob_name"],
            blob_url=upload_result["blob_url"],
            status=result["status"],
        )
    )


async def _run_document_pipeline(
    pipeline,
    service: DocumentService,
    document_id: str,
    pdf_bytes: bytes,
    metadata: dict,
) -> None:
    """
    后台执行文档 RAG 管道

    处理流程: PDF → Extract → Chunk → Embed → Index
    完成后更新文档状态为 INDEXED 或 FAILED。
    """
    try:
        result = await pipeline.process(
            document_id=document_id,
            pdf_bytes=pdf_bytes,
            metadata=metadata,
        )

        if result.status == "success":
            logger.info(
                f"Pipeline completed for {document_id}: "
                f"{result.indexed_chunks}/{result.total_chunks} chunks indexed"
            )
            await service.update_status(document_id, DocumentStatus.INDEXED)
        else:
            logger.error(f"Pipeline failed for {document_id}: {result.error}")
            await service.update_status(document_id, DocumentStatus.FAILED)
    except Exception as e:
        logger.error(f"Pipeline exception for {document_id}: {e}")
        try:
            await service.update_status(document_id, DocumentStatus.FAILED)
        except Exception:
            logger.error(f"Failed to update status for {document_id}")


@router.get("/{document_id}/download")
async def download_document_file(
    document_id: str,
    service: DocumentService = Depends(get_document_service),
    blob_storage: AzureBlobStorageService = Depends(get_blob_storage),
):
    """
    下载文档文件

    返回 PDF 文件流
    """
    # 获取文档信息
    doc = await service.get_by_id(document_id)
    if not doc:
        raise NotFoundError(f"Document {document_id}")

    blob_name = doc.get("blob_name")
    if not blob_name:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document file not found in storage",
        )

    # 从 Blob Storage 下载
    try:
        content = await blob_storage.download_file(blob_name)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to download file: {str(e)}",
        )

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found in storage",
        )

    # 返回文件流
    return StreamingResponse(
        iter([content]),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{doc.get("file_name", "document.pdf")}"'
        },
    )


@router.get("/{document_id}/url")
async def get_document_download_url(
    document_id: str,
    expiry_hours: int = 1,
    service: DocumentService = Depends(get_document_service),
    blob_storage: AzureBlobStorageService = Depends(get_blob_storage),
) -> ApiResponse[dict]:
    """
    获取文档的临时下载 URL (带 SAS token)

    - URL 默认有效期 1 小时
    - 最长有效期 24 小时
    """
    if expiry_hours < 1 or expiry_hours > 24:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Expiry hours must be between 1 and 24",
        )

    # 获取文档信息
    doc = await service.get_by_id(document_id)
    if not doc:
        raise NotFoundError(f"Document {document_id}")

    blob_name = doc.get("blob_name")
    if not blob_name:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document file not found in storage",
        )

    # 生成临时 URL
    download_url = await blob_storage.get_file_url(blob_name, expiry_hours=expiry_hours)

    if not download_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate download URL",
        )

    return ApiResponse.ok({
        "download_url": download_url,
        "expires_in_hours": expiry_hours,
        "file_name": doc.get("file_name"),
    })


@router.get("/{document_id}/status", response_model=ApiResponse[dict])
async def get_document_status(
    document_id: str,
    service: DocumentService = Depends(get_document_service),
) -> ApiResponse[dict]:
    """
    获取文档处理状态

    返回文档的 RAG 管道处理进度:
    - processing: 正在处理中
    - indexed: 处理完成，已索引
    - failed: 处理失败
    """
    doc = await service.get_by_id(document_id)
    if not doc:
        raise NotFoundError(f"Document {document_id}")

    return ApiResponse.ok({
        "id": doc.get("id"),
        "title": doc.get("title"),
        "status": doc.get("status", "unknown"),
    })

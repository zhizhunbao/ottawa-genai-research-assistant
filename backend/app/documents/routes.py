"""
文档管理路由

定义文档上传、列表查询、删除等 API 端点。
遵循 dev-backend_patterns skill 规范。
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.document_store import DocumentStore
from app.core.schemas import ApiResponse
from app.core.exceptions import NotFoundError
from app.documents.schemas import DocumentCreate, DocumentResponse, DocumentListResponse, DocumentUpdate
from app.documents.service import DocumentService


router = APIRouter(prefix="/api/v1/documents", tags=["documents"])


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

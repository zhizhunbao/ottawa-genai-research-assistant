"""
文档模块 Schema

定义文档管理相关的 Pydantic 模型。
遵循 dev-backend_patterns skill 规范。
"""

from datetime import datetime

from pydantic import BaseModel, Field

from app.core.enums import DocumentStatus


class DocumentBase(BaseModel):
    """文档基础模型"""
    title: str = Field(..., description="The title of the document")
    description: str | None = Field(None, description="Detailed description")
    tags: list[str] = Field(default_factory=list, description="Categorization tags")


class DocumentCreate(DocumentBase):
    """创建文档请求 (含文件信息)"""
    file_name: str = Field(..., description="Original name of the file")
    mime_type: str = Field("application/pdf", description="File MIME type")
    file_size: int = Field(..., description="File size in bytes")


class DocumentUpdate(BaseModel):
    """更新文档请求"""
    title: str | None = None
    description: str | None = None
    status: DocumentStatus | None = None
    tags: list[str] | None = None


class DocumentResponse(DocumentBase):
    """文档响应模型"""
    id: str = Field(..., description="Unique document ID")
    owner_id: str | None = Field(None, description="ID of the owner user")
    status: DocumentStatus = Field(..., description="Processing status")
    file_name: str = Field(..., description="Stored file name")
    blob_name: str | None = Field(None, description="Azure Blob Storage name")
    blob_url: str | None = Field(None, description="Azure Blob Storage URL")
    created_at: datetime = Field(..., description="Upload timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True


class DocumentUploadResponse(BaseModel):
    """文件上传响应"""
    id: str = Field(..., description="Document ID")
    file_name: str = Field(..., description="Original file name")
    blob_name: str = Field(..., description="Azure Blob name")
    blob_url: str = Field(..., description="Azure Blob URL")
    status: DocumentStatus = Field(..., description="Processing status")


class DocumentListResponse(BaseModel):
    """文档列表响应"""
    items: list[DocumentResponse]
    total: int

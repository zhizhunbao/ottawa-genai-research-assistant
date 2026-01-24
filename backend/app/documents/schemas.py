"""
文档模块 Schema

定义文档管理相关的 Pydantic 模型。
遵循 dev-backend_patterns skill 规范。
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from app.core.enums import DocumentStatus, DocumentType


class DocumentBase(BaseModel):
    """文档基础模型"""
    title: str = Field(..., description="The title of the document")
    description: Optional[str] = Field(None, description="Detailed description")
    tags: List[str] = Field(default_factory=list, description="Categorization tags")


class DocumentCreate(DocumentBase):
    """创建文档请求 (含文件信息)"""
    file_name: str = Field(..., description="Original name of the file")
    mime_type: str = Field("application/pdf", description="File MIME type")
    file_size: int = Field(..., description="File size in bytes")


class DocumentUpdate(BaseModel):
    """更新文档请求"""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[DocumentStatus] = None
    tags: Optional[List[str]] = None


class DocumentResponse(DocumentBase):
    """文档响应模型"""
    id: str = Field(..., description="Unique document ID")
    owner_id: Optional[str] = Field(None, description="ID of the owner user")
    status: DocumentStatus = Field(..., description="Processing status")
    file_name: str = Field(..., description="Stored file name")
    created_at: datetime = Field(..., description="Upload timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    """文档列表响应"""
    items: List[DocumentResponse]
    total: int

"""
通用 Schemas 模块

定义通用的请求/响应模型。
遵循 dev-backend_patterns skill 规范。
遵循 dev-tdd_workflow skill 规范。
"""

from typing import Any, Generic, List, Optional, TypeVar

from pydantic import BaseModel, Field


T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """统一 API 响应格式"""

    success: bool = Field(..., description="Whether the request was successful")
    data: Optional[T] = Field(None, description="The response data")
    error: Optional[str] = Field(None, description="The error message if any")
    detail: Optional[Any] = Field(None, description="Detailed error information")

    @classmethod
    def ok(cls, data: T) -> "ApiResponse[T]":
        """创建成功响应"""
        return cls(success=True, data=data)

    @classmethod
    def fail(cls, error: str, detail: Optional[Any] = None) -> "ApiResponse[T]":
        """创建失败响应"""
        return cls(success=False, error=error, detail=detail)


class PaginationMeta(BaseModel):
    """分页元数据"""

    total: int = Field(..., description="Total number of records")
    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Number of records per page")
    total_pages: int = Field(..., description="Total number of pages")

    @classmethod
    def from_params(cls, total: int, page: int, page_size: int) -> "PaginationMeta":
        """从参数创建分页元数据"""
        total_pages = (total + page_size - 1) // page_size if page_size > 0 else 0
        return cls(total=total, page=page, page_size=page_size, total_pages=total_pages)


class PaginatedResponse(BaseModel, Generic[T]):
    """分页响应格式"""

    success: bool = True
    data: List[T] = Field(default_factory=list, description="List of data items")
    meta: PaginationMeta = Field(..., description="Pagination metadata")


class HealthResponse(BaseModel):
    """健康检查响应"""

    status: str = Field("healthy", description="The service health status")
    version: str = Field("0.1.0", description="The service version")

"""
通用 Schemas 模块

定义通用的请求/响应模型。
遵循 dev-backend_patterns skill 的 API 响应格式规范。
"""

from typing import Any, Generic, List, Optional, TypeVar

from pydantic import BaseModel, Field


T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """统一 API 响应格式"""

    success: bool = Field(..., description="请求是否成功")
    data: Optional[T] = Field(None, description="响应数据")
    error: Optional[str] = Field(None, description="错误消息")
    detail: Optional[Any] = Field(None, description="详细信息")

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

    total: int = Field(..., description="总记录数")
    page: int = Field(..., description="当前页码")
    page_size: int = Field(..., description="每页大小")
    total_pages: int = Field(..., description="总页数")

    @classmethod
    def from_params(cls, total: int, page: int, page_size: int) -> "PaginationMeta":
        """从参数创建分页元数据"""
        total_pages = (total + page_size - 1) // page_size if page_size > 0 else 0
        return cls(total=total, page=page, page_size=page_size, total_pages=total_pages)


class PaginatedResponse(BaseModel, Generic[T]):
    """分页响应格式"""

    success: bool = True
    data: List[T] = Field(default_factory=list, description="数据列表")
    meta: PaginationMeta = Field(..., description="分页元数据")


class HealthResponse(BaseModel):
    """健康检查响应"""

    status: str = "healthy"
    version: str = "0.1.0"

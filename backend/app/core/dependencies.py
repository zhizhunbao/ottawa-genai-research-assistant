"""
依赖注入模块

定义可复用的 FastAPI 依赖项。
遵循 dev-backend_patterns skill 规范。
遵循 dev-tdd_workflow skill 规范。
"""

from typing import Annotated

from fastapi import Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user_id


# 数据库会话依赖
DbSession = Annotated[AsyncSession, Depends(get_db)]

# 当前用户 ID 依赖
CurrentUserId = Annotated[str, Depends(get_current_user_id)]


class PaginationParams:
    """分页参数依赖"""

    def __init__(
        self,
        page: int = Query(1, ge=1, description="页码"),
        page_size: int = Query(20, ge=1, le=100, description="每页大小"),
    ) -> None:
        self.page = page
        self.page_size = page_size
        self.offset = (page - 1) * page_size


# 分页参数依赖
Pagination = Annotated[PaginationParams, Depends()]

"""
Universal Document Storage Model

Implements a single-table storage pattern for all data types using JSON fields for 
business-specific attributes (EAV pattern).

@template A9 backend/domain/models.py — SQLAlchemy ORM Model
@template A6 backend/core/models.py — EAV Pattern (JSON Fields + Type Discriminator)
@reference full-stack-fastapi-template/backend/app/models.py
"""

from datetime import UTC, datetime
from typing import Any

from sqlalchemy import JSON, DateTime, String
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.enums import DocumentStatus, DocumentType
from app.core.utils import generate_uuid


class UniversalDocument(Base):
    """通用文档/数据实体"""
    __tablename__ = "universal_documents"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid
    )

    # 业务类型
    type: Mapped[DocumentType] = mapped_column(SqlEnum(DocumentType), index=True, nullable=False)

    # 核心数据：JSON 格式存储所有多变的业务负载
    data: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)

    # 归属者：管理或具体用户 ID
    owner_id: Mapped[str | None] = mapped_column(String(36), index=True, nullable=True)

    # 状态
    status: Mapped[DocumentStatus] = mapped_column(
        SqlEnum(DocumentStatus),
        default=DocumentStatus.ACTIVE,
        index=True
    )

    # 标签系统：用于分类 and 检索
    tags: Mapped[list[str]] = mapped_column(JSON, default=list)

    # 时间戳 (UTC)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC)
    )

    def to_dict(self) -> dict[str, Any]:
        """转换为标准字典"""
        return {
            "id": self.id,
            "type": self.type,
            "data": self.data,
            "owner_id": self.owner_id,
            "status": self.status,
            "tags": self.tags,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

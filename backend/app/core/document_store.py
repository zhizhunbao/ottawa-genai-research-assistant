"""
通用文档存储服务 (DocumentStore)

提供统一的接口来保存、检索和管理存储在 universal_documents 表中的数据。
遵循 dev-backend_patterns skill 规范。
遵循 dev-tdd_workflow skill 规范。
"""

from typing import Any, Dict, List, Optional
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.models import UniversalDocument
from app.core.enums import DocumentStatus, DocumentType

class DocumentStore:
    """通用文档存储服务实现"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self, 
        doc_type: DocumentType, 
        data: Dict[str, Any], 
        owner_id: Optional[str] = None,
        status: DocumentStatus = DocumentStatus.ACTIVE,
        tags: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """创建/保存新文档"""
        new_doc = UniversalDocument(
            type=doc_type,
            data=data,
            owner_id=owner_id,
            status=status,
            tags=tags or []
        )
        self.db.add(new_doc)
        await self.db.flush()  # 获取生成的 ID
        return new_doc.to_dict()

    async def get_by_id(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """按 ID 查询文档"""
        stmt = select(UniversalDocument).where(UniversalDocument.id == doc_id)
        result = await self.db.execute(stmt)
        doc = result.scalar_one_or_none()
        return doc.to_dict() if doc else None

    async def list_by_type(
        self, 
        doc_type: DocumentType, 
        owner_id: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """按类型和所有者列表显示"""
        stmt = select(UniversalDocument).where(UniversalDocument.type == doc_type)
        if owner_id:
            stmt = stmt.where(UniversalDocument.owner_id == owner_id)
        
        stmt = stmt.order_by(UniversalDocument.created_at.desc()).limit(limit)
        result = await self.db.execute(stmt)
        return [doc.to_dict() for doc in result.scalars().all()]

    async def update_data(self, doc_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """更新文档的 data (JSON) 内容"""
        stmt = select(UniversalDocument).where(UniversalDocument.id == doc_id)
        result = await self.db.execute(stmt)
        doc = result.scalar_one_or_none()
        
        if doc:
            doc.data = data
            await self.db.flush()
            return doc.to_dict()
        return None

    async def delete(self, doc_id: str) -> bool:
        """物理删除文档"""
        stmt = delete(UniversalDocument).where(UniversalDocument.id == doc_id)
        result = await self.db.execute(stmt)
        return result.rowcount > 0

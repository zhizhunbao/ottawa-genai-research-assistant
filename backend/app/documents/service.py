"""
文档服务层

处理文档上传、元数据管理和状态追踪。
遵循 dev-backend_patterns skill 规范。
"""

from typing import List, Optional, Dict, Any
from app.documents.schemas import DocumentCreate, DocumentUpdate
from app.core.document_store import DocumentStore
from app.core.enums import DocumentStatus, DocumentType


class DocumentService:
    """文档服务类"""

    def __init__(self, document_store: DocumentStore):
        self.doc_store = document_store

    def _flatten_document(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        """将 UniversalDocument 的 data 字段扁平化到顶级"""
        if not doc:
            return doc
        
        flattened = doc.copy()
        data = flattened.pop("data", {})
        flattened.update(data)
        return flattened

    async def upload(self, data: DocumentCreate, owner_id: Optional[str] = None) -> Dict[str, Any]:
        """上传并创建文档记录"""
        doc_data = data.model_dump()
        
        result = await self.doc_store.create(
            doc_type=DocumentType.UPLOADED_FILE,
            data=doc_data,
            owner_id=owner_id,
            status=DocumentStatus.PROCESSING,
            tags=data.tags
        )
        return self._flatten_document(result)

    async def get_by_id(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """按 ID 查询文档"""
        result = await self.doc_store.get_by_id(doc_id)
        return self._flatten_document(result)

    async def list(self, owner_id: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        """列出文档"""
        items = await self.doc_store.list_by_type(
            doc_type=DocumentType.UPLOADED_FILE,
            owner_id=owner_id,
            limit=limit
        )
        return [self._flatten_document(item) for item in items]

    async def delete(self, doc_id: str) -> bool:
        """删除文档记录"""
        # 在实际实现中，这里还需要删除物理文件
        return await self.doc_store.delete(doc_id)

    async def update(self, doc_id: str, data: DocumentUpdate) -> Optional[Dict[str, Any]]:
        """更新文档元数据"""
        existing = await self.doc_store.get_by_id(doc_id)
        if not existing:
            return None
            
        current_data = existing["data"]
        update_dict = data.model_dump(exclude_unset=True)
        
        # 更新 JSON 数据部分
        for key, value in update_dict.items():
            if key in ["title", "description", "tags"]:
                current_data[key] = value
                
        result = await self.doc_store.update_data(doc_id, current_data)
        return self._flatten_document(result)

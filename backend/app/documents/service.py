"""
文档服务层

处理文档上传、元数据管理和状态追踪。
遵循 dev-backend_patterns skill 规范。
"""

from typing import Any

from app.core.document_store import DocumentStore
from app.core.enums import DocumentStatus, DocumentType
from app.documents.schemas import DocumentCreate, DocumentUpdate


class DocumentService:
    """文档服务类"""

    def __init__(self, document_store: DocumentStore):
        self.doc_store = document_store

    def _flatten_document(self, doc: dict[str, Any]) -> dict[str, Any]:
        """将 UniversalDocument 的 data 字段扁平化到顶级"""
        if not doc:
            return doc

        flattened = doc.copy()
        data = flattened.pop("data", {})
        flattened.update(data)
        return flattened

    async def upload(
        self,
        data: DocumentCreate,
        owner_id: str | None = None,
        blob_info: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        上传并创建文档记录

        Args:
            data: 文档创建数据
            owner_id: 所有者 ID
            blob_info: Azure Blob Storage 信息 (blob_name, blob_url)
        """
        doc_data = data.model_dump()

        # 添加 Blob Storage 信息
        if blob_info:
            doc_data["blob_name"] = blob_info.get("blob_name")
            doc_data["blob_url"] = blob_info.get("blob_url")

        result = await self.doc_store.create(
            doc_type=DocumentType.UPLOADED_FILE,
            data=doc_data,
            owner_id=owner_id,
            status=DocumentStatus.PROCESSING,
            tags=data.tags
        )
        return self._flatten_document(result)

    async def get_by_id(self, doc_id: str) -> dict[str, Any] | None:
        """按 ID 查询文档"""
        result = await self.doc_store.get_by_id(doc_id)
        return self._flatten_document(result)

    async def list(self, owner_id: str | None = None, limit: int = 100) -> list[dict[str, Any]]:
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

    async def update(self, doc_id: str, data: DocumentUpdate) -> dict[str, Any] | None:
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

    async def update_status(self, doc_id: str, new_status: DocumentStatus) -> bool:
        """更新文档处理状态"""
        return await self.doc_store.update_status(doc_id, new_status.value)

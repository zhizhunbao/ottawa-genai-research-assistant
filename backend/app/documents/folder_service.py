"""
FolderService - Manages folder hierarchy and file-tree operations for the VS Code-style explorer

@module app/documents/folder_service
@template A10 backend/domain/service.py — Generic CRUD Service Layer
@reference none
"""

from typing import Any

from app.core.document_store import DocumentStore
from app.core.enums import DocumentStatus, DocumentType
from app.documents.schemas import FolderCreate


class FolderService:
    """Folder hierarchy management service."""

    def __init__(self, document_store: DocumentStore) -> None:
        self._doc_store = document_store

    # ============================================================
    # Private Helpers
    # ============================================================

    @staticmethod
    def _flatten_document(doc: dict[str, Any]) -> dict[str, Any]:
        """Flatten UniversalDocument data dict into top-level fields."""
        if not doc:
            return doc

        data = doc.get("data", {})
        return {**doc, **data, "data": None}

    def _is_folder(self, flat: dict[str, Any]) -> bool:
        """Check whether a flattened document represents a folder."""
        return flat.get("type") == DocumentType.FOLDER

    @staticmethod
    def _sort_tree_nodes(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Sort nodes: folders first, then files, each group alphabetical by name."""
        return sorted(
            items,
            key=lambda x: (
                0 if x.get("type") == DocumentType.FOLDER else 1,
                (x.get("name") or "").lower(),
            ),
        )

    async def _list_all_nodes(self, owner_id: str | None = None) -> list[dict[str, Any]]:
        """Fetch all folders and files, returned as flattened dicts.

        Args:
            owner_id: Optional owner filter.

        Returns:
            Combined list of flattened folder and file dicts.
        """
        folders_raw = await self._doc_store.list_by_type(
            doc_type=DocumentType.FOLDER,
            owner_id=owner_id,
            limit=500,
        )
        files_raw = await self._doc_store.list_by_type(
            doc_type=DocumentType.UPLOADED_FILE,
            owner_id=owner_id,
            limit=500,
        )

        return [self._flatten_document(item) for item in [*folders_raw, *files_raw]]

    # ============================================================
    # Folder CRUD
    # ============================================================

    async def create_folder(
        self,
        data: FolderCreate,
        owner_id: str | None = None,
    ) -> dict[str, Any]:
        """Create a new folder node.

        Args:
            data: Folder creation payload (name, parent_id).
            owner_id: Optional owner ID.

        Returns:
            Created folder as a flattened dict.
        """
        folder_data = {
            "name": data.name,
            "parent_id": data.parent_id,
        }
        result = await self._doc_store.create(
            doc_type=DocumentType.FOLDER,
            data=folder_data,
            owner_id=owner_id,
            status=DocumentStatus.ACTIVE,
        )
        return self._flatten_document(result)

    async def get_folder(self, folder_id: str) -> dict[str, Any] | None:
        """Retrieve a single folder by ID, returning None if not found or not a folder."""
        result = await self._doc_store.get_by_id(folder_id)
        if not result:
            return None

        flat = self._flatten_document(result)
        if not self._is_folder(flat):
            return None
        return flat

    async def rename_folder(self, folder_id: str, new_name: str) -> dict[str, Any] | None:
        """Rename a folder. Returns updated folder or None if not found."""
        existing = await self._doc_store.get_by_id(folder_id)
        if not existing:
            return None

        # Build new data dict immutably
        updated_data = {**existing["data"], "name": new_name}
        result = await self._doc_store.update_data(folder_id, updated_data)
        return self._flatten_document(result) if result else None

    async def delete_folder(self, folder_id: str) -> bool:
        """Delete a folder and all descendants recursively.

        Depth-first: deletes children before the folder itself.
        """
        children = await self.get_children(folder_id)

        for child in children:
            if self._is_folder(child):
                await self.delete_folder(child["id"])
            else:
                await self._doc_store.delete(child["id"])

        return await self._doc_store.delete(folder_id)

    # ============================================================
    # Tree Queries
    # ============================================================

    async def list_root(self, owner_id: str | None = None) -> list[dict[str, Any]]:
        """List all root-level items (folders + files with no parent_id)."""
        all_nodes = await self._list_all_nodes(owner_id)

        # Keep only nodes without a parent
        root_items = [n for n in all_nodes if not n.get("parent_id")]
        return self._sort_tree_nodes(root_items)

    async def get_children(
        self,
        folder_id: str,
        owner_id: str | None = None,
    ) -> list[dict[str, Any]]:
        """Get direct children of a folder.

        Args:
            folder_id: Parent folder ID.
            owner_id: Optional owner filter.

        Returns:
            Sorted list of child nodes (folders first, then files).
        """
        all_nodes = await self._list_all_nodes(owner_id)

        children = [n for n in all_nodes if n.get("parent_id") == folder_id]
        return self._sort_tree_nodes(children)

    async def count_children(self, folder_id: str, owner_id: str | None = None) -> int:
        """Count direct children of a folder."""
        children = await self.get_children(folder_id, owner_id)
        return len(children)

    # ============================================================
    # Move Operations
    # ============================================================

    async def move_node(self, node_id: str, target_parent_id: str | None) -> dict[str, Any] | None:
        """Move any node (file or folder) to a new parent folder.

        Args:
            node_id: ID of the node to move.
            target_parent_id: Destination folder ID, or None for root.

        Returns:
            Updated node dict, or None if not found.
        """
        existing = await self._doc_store.get_by_id(node_id)
        if not existing:
            return None

        # Build new data dict immutably
        updated_data = {**existing["data"], "parent_id": target_parent_id}
        result = await self._doc_store.update_data(node_id, updated_data)
        return self._flatten_document(result) if result else None

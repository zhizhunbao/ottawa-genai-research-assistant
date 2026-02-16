"""
FolderRoutes - REST endpoints for folder CRUD and file-tree operations

@module app/documents/folder_routes
@template A7 backend/domain/router.py — API Routes
@reference none
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.document_store import DocumentStore
from app.core.schemas import ApiResponse
from app.documents.folder_service import FolderService
from app.documents.schemas import (
    FileNodeResponse,
    FolderContentsResponse,
    FolderCreate,
    FolderResponse,
    MoveNodeRequest,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/folders", tags=["folders"])


def get_folder_service(db: AsyncSession = Depends(get_db)) -> FolderService:
    """Dependency injection for FolderService."""
    store = DocumentStore(db)
    return FolderService(store)


# ============================================================
# Folder CRUD
# ============================================================


@router.post("", response_model=ApiResponse[FolderResponse])
async def create_folder(
    data: FolderCreate,
    service: FolderService = Depends(get_folder_service),
) -> ApiResponse[FolderResponse]:
    """Create a new folder."""
    result = await service.create_folder(data)
    return ApiResponse.ok(FolderResponse(
        id=result["id"],
        name=result.get("name", ""),
        parent_id=result.get("parent_id"),
        children_count=0,
        created_at=result["created_at"],
        updated_at=result["updated_at"],
    ))


@router.get("/{folder_id}", response_model=ApiResponse[FolderResponse])
async def get_folder(
    folder_id: str,
    service: FolderService = Depends(get_folder_service),
) -> ApiResponse[FolderResponse]:
    """Get folder details by ID."""
    result = await service.get_folder(folder_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found")

    children_count = await service.count_children(folder_id)
    return ApiResponse.ok(FolderResponse(
        id=result["id"],
        name=result.get("name", ""),
        parent_id=result.get("parent_id"),
        children_count=children_count,
        created_at=result["created_at"],
        updated_at=result["updated_at"],
    ))


@router.patch("/{folder_id}/rename", response_model=ApiResponse[FolderResponse])
async def rename_folder(
    folder_id: str,
    name: str,
    service: FolderService = Depends(get_folder_service),
) -> ApiResponse[FolderResponse]:
    """Rename a folder."""
    result = await service.rename_folder(folder_id, name)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found")

    return ApiResponse.ok(FolderResponse(
        id=result["id"],
        name=result.get("name", ""),
        parent_id=result.get("parent_id"),
        children_count=0,
        created_at=result["created_at"],
        updated_at=result["updated_at"],
    ))


@router.delete("/{folder_id}", response_model=ApiResponse[bool])
async def delete_folder(
    folder_id: str,
    service: FolderService = Depends(get_folder_service),
) -> ApiResponse[bool]:
    """Delete a folder and all its contents recursively."""
    success = await service.delete_folder(folder_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found")
    return ApiResponse.ok(True)


# ============================================================
# Tree Queries
# ============================================================


@router.get("/tree/root", response_model=ApiResponse[FolderContentsResponse])
async def list_root_contents(
    service: FolderService = Depends(get_folder_service),
) -> ApiResponse[FolderContentsResponse]:
    """List all root-level items (folders + files)."""
    items = await service.list_root()
    nodes = [_to_file_node(item) for item in items]
    return ApiResponse.ok(FolderContentsResponse(
        folder=None,
        items=nodes,
        total=len(nodes),
    ))


@router.get("/{folder_id}/children", response_model=ApiResponse[FolderContentsResponse])
async def list_folder_children(
    folder_id: str,
    service: FolderService = Depends(get_folder_service),
) -> ApiResponse[FolderContentsResponse]:
    """List direct children of a folder."""
    folder = await service.get_folder(folder_id)
    if not folder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found")

    items = await service.get_children(folder_id)
    nodes = [_to_file_node(item) for item in items]

    folder_resp = FolderResponse(
        id=folder["id"],
        name=folder.get("name", ""),
        parent_id=folder.get("parent_id"),
        children_count=len(nodes),
        created_at=folder["created_at"],
        updated_at=folder["updated_at"],
    )
    return ApiResponse.ok(FolderContentsResponse(
        folder=folder_resp,
        items=nodes,
        total=len(nodes),
    ))


# ============================================================
# Move Operations
# ============================================================


@router.patch("/{node_id}/move", response_model=ApiResponse[FileNodeResponse])
async def move_node(
    node_id: str,
    data: MoveNodeRequest,
    service: FolderService = Depends(get_folder_service),
) -> ApiResponse[FileNodeResponse]:
    """Move a file or folder to a new parent."""
    result = await service.move_node(node_id, data.target_parent_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Node not found")
    return ApiResponse.ok(_to_file_node(result))


# ============================================================
# Private Helpers
# ============================================================


def _to_file_node(item: dict) -> FileNodeResponse:
    """Convert a flattened document dict to a FileNodeResponse."""
    node_type = item.get("type", "uploaded_file")
    is_folder = node_type == "folder"

    return FileNodeResponse(
        id=item["id"],
        name=item.get("name") or item.get("title") or item.get("file_name", "Untitled"),
        type=node_type,
        parent_id=item.get("parent_id"),
        status=None if is_folder else item.get("status"),
        file_name=None if is_folder else item.get("file_name"),
        children_count=0,
        created_at=item["created_at"],
        updated_at=item["updated_at"],
    )

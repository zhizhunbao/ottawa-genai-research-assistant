"""
Sync Routes — Ottawa Economic Development Update PDF catalog & sync

Provides endpoints to:
  - List the known Ottawa ED Update PDF catalog (Q1 2022 – Q4 2025)
  - Check URL availability and import status
  - Preview a specific PDF (proxy-download for display)
  - Batch-sync or single-sync missing PDFs (with auto folder creation)
  - Retry failed documents
  - Delete synced documents from the knowledge base

@module documents/sync_routes
"""

import asyncio
import logging
from io import BytesIO
from urllib.parse import unquote, urlparse

import httpx
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.azure.storage import AzureBlobStorageService
from app.core.database import get_db
from app.core.dependencies import (
    get_blob_storage,
    get_document_pipeline_optional,
)
from app.core.document_store import DocumentStore
from app.core.enums import DocumentStatus, DocumentType
from app.core.schemas import ApiResponse
from app.documents.folder_service import FolderService
from app.documents.schemas import DocumentCreate, FolderCreate
from app.documents.service import DocumentService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/sync", tags=["sync"])

# ============================================================
# Ottawa ED Update PDF Catalog
# ============================================================

# Known Economic Development Update PDFs (Q1 2022 – Q4 2025)
# Base URL pattern: https://documents.ottawa.ca/sites/default/files/
# COVID gap: Q3 2019 – Q3 2021
OTTAWA_ED_CATALOG = [
    # 2022
    {
        "id": "ed-q1-2022",
        "title": "Economic Development Update – Q1 2022",
        "quarter": "Q1",
        "year": 2022,
        "url": "https://documents.ottawa.ca/sites/default/files/economic_update_q1_2022_en.pdf",
        "source": "documents.ottawa.ca",
    },
    {
        "id": "ed-q2-2022",
        "title": "Economic Development Update – Q2 2022",
        "quarter": "Q2",
        "year": 2022,
        "url": "https://documents.ottawa.ca/sites/default/files/economic_update_q2_2022_en.pdf",
        "source": "documents.ottawa.ca",
    },
    {
        "id": "ed-q3-2022",
        "title": "Economic Development Update – Q3 2022",
        "quarter": "Q3",
        "year": 2022,
        "url": "https://documents.ottawa.ca/sites/default/files/economic_update_q3_2022_en.pdf",
        "source": "documents.ottawa.ca",
    },
    {
        "id": "ed-q4-2022",
        "title": "Economic Development Update – Q4 2022",
        "quarter": "Q4",
        "year": 2022,
        "url": "https://documents.ottawa.ca/sites/default/files/economic_update_q4_2022_en.pdf",
        "source": "documents.ottawa.ca",
    },
    # 2023
    {
        "id": "ed-q1-2023",
        "title": "Economic Development Update – Q1 2023",
        "quarter": "Q1",
        "year": 2023,
        "url": "https://documents.ottawa.ca/sites/default/files/economic_update_q1_2023_en.pdf",
        "source": "documents.ottawa.ca",
    },
    {
        "id": "ed-q2-2023",
        "title": "Economic Development Update – Q2 2023",
        "quarter": "Q2",
        "year": 2023,
        "url": "https://documents.ottawa.ca/sites/default/files/economic_update_q2_2023_en.pdf",
        "source": "documents.ottawa.ca",
    },
    {
        "id": "ed-q3-2023",
        "title": "Economic Development Update – Q3 2023",
        "quarter": "Q3",
        "year": 2023,
        "url": "https://documents.ottawa.ca/sites/default/files/economic_update_q3_2023_en.pdf",
        "source": "documents.ottawa.ca",
    },
    {
        "id": "ed-q4-2023",
        "title": "Economic Development Update – Q4 2023",
        "quarter": "Q4",
        "year": 2023,
        "url": "https://documents.ottawa.ca/sites/default/files/economic_update_q4_2023_en.pdf",
        "source": "documents.ottawa.ca",
    },
    # 2024
    {
        "id": "ed-q1-2024",
        "title": "Economic Development Update – Q1 2024",
        "quarter": "Q1",
        "year": 2024,
        "url": "https://documents.ottawa.ca/sites/default/files/economic_update_q1_2024_en.pdf",
        "source": "documents.ottawa.ca",
    },
    {
        "id": "ed-q2-2024",
        "title": "Economic Development Update – Q2 2024",
        "quarter": "Q2",
        "year": 2024,
        "url": "https://documents.ottawa.ca/sites/default/files/economic_update_q2_2024_en.pdf",
        "source": "documents.ottawa.ca",
    },
    {
        "id": "ed-q3-2024",
        "title": "Economic Development Update – Q3 2024",
        "quarter": "Q3",
        "year": 2024,
        "url": "https://documents.ottawa.ca/sites/default/files/economic_update_q3_2024_en.pdf",
        "source": "documents.ottawa.ca",
    },
    {
        "id": "ed-q4-2024",
        "title": "Economic Development Update – Q4 2024",
        "quarter": "Q4",
        "year": 2024,
        "url": "https://documents.ottawa.ca/sites/default/files/economic_update_q4_2024_en.pdf",
        "source": "documents.ottawa.ca",
    },
    # 2025
    {
        "id": "ed-q1-2025",
        "title": "Economic Development Update – Q1 2025",
        "quarter": "Q1",
        "year": 2025,
        "url": "https://documents.ottawa.ca/sites/default/files/economic_update_q1_2025_en.pdf",
        "source": "documents.ottawa.ca",
    },
    {
        "id": "ed-q2-2025",
        "title": "Economic Development Update – Q2 2025",
        "quarter": "Q2",
        "year": 2025,
        "url": "https://documents.ottawa.ca/sites/default/files/economic_update_q2_2025_en.pdf",
        "source": "documents.ottawa.ca",
    },
    {
        "id": "ed-q3-2025",
        "title": "Economic Development Update – Q3 2025",
        "quarter": "Q3",
        "year": 2025,
        "url": "https://documents.ottawa.ca/sites/default/files/economic_update_q3_2025_en.pdf",
        "source": "documents.ottawa.ca",
    },
    {
        "id": "ed-q4-2025",
        "title": "Economic Development Update – Q4 2025",
        "quarter": "Q4",
        "year": 2025,
        "url": "https://documents.ottawa.ca/sites/default/files/economic_update_q4_2025_en.pdf",
        "source": "documents.ottawa.ca",
    },
]

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


# ============================================================
# Schemas
# ============================================================

class CatalogItem(BaseModel):
    """A single PDF in the catalog"""
    id: str
    title: str
    quarter: str
    year: int
    url: str
    source: str
    imported: bool = False
    document_id: str | None = None
    status: str | None = None
    url_available: bool | None = None  # None = not checked yet


class CatalogResponse(BaseModel):
    """Full catalog response with import status, grouped by source"""
    items: list[CatalogItem]
    total: int
    imported_count: int
    sources: list[str]  # distinct sources for grouping


class SyncRequest(BaseModel):
    """Request to sync specific items or all"""
    catalog_ids: list[str] | None = Field(
        None,
        description="Specific catalog IDs to sync. If null, syncs all missing.",
    )


class SyncResult(BaseModel):
    """Result of a sync operation"""
    queued: int
    skipped: int
    failed: int
    details: list[dict]


# ============================================================
# Helpers
# ============================================================

def _get_document_service(db: AsyncSession) -> DocumentService:
    store = DocumentStore(db)
    return DocumentService(store)


def _get_folder_service(db: AsyncSession) -> FolderService:
    store = DocumentStore(db)
    return FolderService(store)


async def _check_url_available(url: str) -> bool:
    """Check if a URL is reachable via HEAD request. Returns True if 2xx."""
    try:
        async with httpx.AsyncClient(
            timeout=10.0,
            follow_redirects=True,
            headers={"User-Agent": "Ottawa-GenAI-Research-Assistant/1.0"},
        ) as client:
            resp = await client.head(url)
            return resp.status_code < 400
    except Exception:
        return False


async def _check_urls_batch(urls: list[str]) -> dict[str, bool]:
    """Check multiple URLs in parallel. Returns url -> available."""
    tasks = [_check_url_available(url) for url in urls]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return {
        url: (result is True)
        for url, result in zip(urls, results)
    }


async def _ensure_folder_hierarchy(
    folder_service: FolderService,
    years: list[int],
) -> dict[int, str]:
    """
    Ensure the folder structure exists for organizing synced documents:

        📁 Ottawa ED Updates/
          📁 2022/
          📁 2023/
          📁 2024/
          📁 2025/

    Returns a dict mapping year → folder_id.
    Idempotent: reuses existing folders if already created.
    """
    ROOT_FOLDER_NAME = "Ottawa ED Updates"

    # Check if root folder already exists
    root_items = await folder_service.list_root()
    root_folder = next(
        (item for item in root_items
         if item.get("type") == DocumentType.FOLDER
         and item.get("name") == ROOT_FOLDER_NAME),
        None,
    )

    if root_folder:
        root_id = root_folder["id"]
    else:
        created = await folder_service.create_folder(
            FolderCreate(name=ROOT_FOLDER_NAME, parent_id=None)
        )
        root_id = created["id"]
        logger.info(f"Created root folder '{ROOT_FOLDER_NAME}' (id={root_id})")

    # Get existing children of root
    children = await folder_service.get_children(root_id)
    existing_year_folders: dict[str, str] = {
        item.get("name", ""): item["id"]
        for item in children
        if item.get("type") == DocumentType.FOLDER
    }

    year_to_folder_id: dict[int, str] = {}

    for year in years:
        year_str = str(year)
        if year_str in existing_year_folders:
            year_to_folder_id[year] = existing_year_folders[year_str]
        else:
            created = await folder_service.create_folder(
                FolderCreate(name=year_str, parent_id=root_id)
            )
            year_to_folder_id[year] = created["id"]
            logger.info(f"Created year folder '{year_str}' (id={created['id']})")

    return year_to_folder_id


# ============================================================
# Routes
# ============================================================

@router.get("/catalog", response_model=ApiResponse[CatalogResponse])
async def get_catalog(
    check_urls: bool = False,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[CatalogResponse]:
    """
    Get the Ottawa ED Update PDF catalog with import status.

    Args:
        check_urls: If true, also verify URL availability (adds ~2s latency).

    Returns the full catalog of known PDFs along with which ones
    have already been imported into the knowledge base.
    """
    service = _get_document_service(db)

    # Get all existing documents to check import status
    existing_docs = await service.list(limit=500)

    # Build a lookup by filename
    imported_by_filename: dict[str, dict] = {}
    for doc in existing_docs:
        fname = doc.get("file_name", "")
        if fname:
            imported_by_filename[fname] = doc

    # Also check by tag (url-import source)
    imported_by_url: dict[str, dict] = {}
    for doc in existing_docs:
        desc = doc.get("description", "") or ""
        for cat_item in OTTAWA_ED_CATALOG:
            url_path = urlparse(cat_item["url"]).path.split("/")[-1]
            if url_path == doc.get("file_name") or cat_item["url"] in desc:
                imported_by_url[cat_item["id"]] = doc
                break

    # Optionally check URL availability in parallel
    url_availability: dict[str, bool] = {}
    if check_urls:
        all_urls = [cat["url"] for cat in OTTAWA_ED_CATALOG]
        url_availability = await _check_urls_batch(all_urls)

    items: list[CatalogItem] = []
    imported_count = 0
    sources_set: set[str] = set()

    for cat in OTTAWA_ED_CATALOG:
        url_path = urlparse(cat["url"]).path.split("/")[-1]
        doc = imported_by_filename.get(url_path) or imported_by_url.get(cat["id"])

        is_imported = doc is not None
        if is_imported:
            imported_count += 1

        sources_set.add(cat["source"])

        items.append(CatalogItem(
            id=cat["id"],
            title=cat["title"],
            quarter=cat["quarter"],
            year=cat["year"],
            url=cat["url"],
            source=cat["source"],
            imported=is_imported,
            document_id=doc.get("id") if doc else None,
            status=doc.get("status") if doc else None,
            url_available=url_availability.get(cat["url"]) if check_urls else None,
        ))

    return ApiResponse.ok(CatalogResponse(
        items=items,
        total=len(items),
        imported_count=imported_count,
        sources=sorted(sources_set),
    ))


@router.post("/sync", response_model=ApiResponse[SyncResult])
async def sync_documents(
    req: SyncRequest,
    db: AsyncSession = Depends(get_db),
    blob_storage: AzureBlobStorageService = Depends(get_blob_storage),
) -> ApiResponse[SyncResult]:
    """
    Sync (download-only) missing PDFs from the Ottawa ED Update catalog.

    Download-only pipeline per document:
      1. Download PDF from ottawa.ca
      2. Upload to Azure Blob Storage
      3. Auto-create folder structure (Ottawa ED Updates / <year>)
      4. Create document record (status = PENDING)

    RAG pipeline is NOT triggered here. Use POST /process/{catalog_id}
    to process documents after reviewing.
    """
    service = _get_document_service(db)
    folder_service = _get_folder_service(db)

    # Get current catalog status
    catalog_resp = await get_catalog(db=db)
    catalog_items = catalog_resp.data.items  # type: ignore[union-attr]

    # Determine which items to sync
    if req.catalog_ids:
        to_sync = [
            item for item in catalog_items
            if item.id in req.catalog_ids and not item.imported
        ]
    else:
        to_sync = [item for item in catalog_items if not item.imported]

    if not to_sync:
        return ApiResponse.ok(SyncResult(
            queued=0, skipped=len(catalog_items), failed=0, details=[],
        ))

    # Auto-create folder hierarchy: Ottawa ED Updates / 2022, 2023, ...
    years_needed = sorted({item.year for item in to_sync})
    try:
        year_folder_map = await _ensure_folder_hierarchy(folder_service, years_needed)
        logger.info(f"Folder hierarchy ready: {year_folder_map}")
    except Exception as e:
        logger.warning(f"Failed to create folder hierarchy, files will go to root: {e}")
        year_folder_map = {}

    queued = 0
    skipped = 0
    failed = 0
    details: list[dict] = []

    for item in to_sync:
        try:
            # Step 1: Download the PDF
            async with httpx.AsyncClient(
                timeout=60.0,
                follow_redirects=True,
                headers={"User-Agent": "Ottawa-GenAI-Research-Assistant/1.0"},
            ) as client:
                resp = await client.get(item.url)
                resp.raise_for_status()

            content = resp.content

            # Validate it's a PDF
            if not content[:5].startswith(b"%PDF-"):
                details.append({
                    "id": item.id,
                    "status": "failed",
                    "reason": "Not a valid PDF file",
                })
                failed += 1
                continue

            if len(content) > MAX_FILE_SIZE:
                details.append({
                    "id": item.id,
                    "status": "failed",
                    "reason": "File exceeds 50MB limit",
                })
                failed += 1
                continue

            # Determine filename from URL
            url_path = urlparse(item.url).path
            filename = unquote(url_path.split("/")[-1]) if "/" in url_path else "document.pdf"

            # Step 2: Upload to Blob Storage
            upload_result = await blob_storage.upload_file(
                file=BytesIO(content),
                filename=filename,
                content_type="application/pdf",
            )

            # Step 3: Create document record
            doc_data = DocumentCreate(
                title=item.title,
                description=f"Synced from {item.source} — {item.quarter} {item.year}",
                file_name=filename,
                mime_type="application/pdf",
                file_size=len(content),
                tags=["sync", "ed-update", item.source, f"{item.quarter}-{item.year}"],
            )

            result = await service.upload(doc_data, blob_info=upload_result)
            document_id = result["id"]

            # Set status to PENDING (downloaded, not yet processed)
            await service.update_status(document_id, DocumentStatus.PENDING)

            # Move file into year folder
            parent_id = year_folder_map.get(item.year)
            if parent_id:
                await folder_service.move_node(document_id, parent_id)
                logger.debug(f"Moved {document_id} into folder {parent_id} ({item.year})")

            details.append({
                "id": item.id,
                "status": "downloaded",
                "document_id": document_id,
                "file_name": filename,
                "folder": f"Ottawa ED Updates/{item.year}",
            })
            queued += 1

        except httpx.HTTPStatusError as e:
            reason = f"HTTP {e.response.status_code}"
            if e.response.status_code == 404:
                reason = "URL not found (404)"
            details.append({
                "id": item.id,
                "status": "failed",
                "reason": reason,
            })
            failed += 1
        except Exception as e:
            details.append({
                "id": item.id,
                "status": "failed",
                "reason": str(e),
            })
            failed += 1

    return ApiResponse.ok(SyncResult(
        queued=queued,
        skipped=len(catalog_items) - len(to_sync) if not req.catalog_ids else 0,
        failed=failed,
        details=details,
    ))


@router.post("/retry/{catalog_id}", response_model=ApiResponse[dict])
async def retry_document(
    catalog_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    blob_storage: AzureBlobStorageService = Depends(get_blob_storage),
    pipeline=Depends(get_document_pipeline_optional),
) -> ApiResponse[dict]:
    """
    Retry the RAG pipeline for a failed document.

    Re-downloads the PDF from the catalog URL and re-runs the full pipeline.
    If the document doesn't exist yet, creates it (acts like a single sync).
    """
    # Find the catalog item
    cat_item = next((c for c in OTTAWA_ED_CATALOG if c["id"] == catalog_id), None)
    if not cat_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Catalog item '{catalog_id}' not found",
        )

    service = _get_document_service(db)
    folder_service = _get_folder_service(db)

    # Check if document already exists
    existing_docs = await service.list(limit=500)
    url_path = urlparse(cat_item["url"]).path.split("/")[-1]
    existing_doc = next(
        (d for d in existing_docs if d.get("file_name") == url_path),
        None,
    )

    if existing_doc and existing_doc.get("status") not in ("failed", None):
        return ApiResponse.ok({
            "id": catalog_id,
            "document_id": existing_doc["id"],
            "status": "already_processed",
            "message": f"Document is already in '{existing_doc.get('status')}' state",
        })

    # Download the PDF
    try:
        async with httpx.AsyncClient(
            timeout=60.0,
            follow_redirects=True,
            headers={"User-Agent": "Ottawa-GenAI-Research-Assistant/1.0"},
        ) as client:
            resp = await client.get(cat_item["url"])
            resp.raise_for_status()
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=status.HTTP_BAD_GATEWAY,
            detail=f"Failed to download PDF: HTTP {e.response.status_code}",
        )

    content = resp.content
    if not content[:5].startswith(b"%PDF-"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Downloaded file is not a valid PDF",
        )

    filename = unquote(url_path) if url_path else "document.pdf"

    if existing_doc:
        document_id = existing_doc["id"]
        # Reset status to processing
        await service.update_status(document_id, DocumentStatus.PROCESSING)
    else:
        # Upload to Blob Storage and create new record
        upload_result = await blob_storage.upload_file(
            file=BytesIO(content),
            filename=filename,
            content_type="application/pdf",
        )

        doc_data = DocumentCreate(
            title=cat_item["title"],
            description=f"Synced from {cat_item['source']} — {cat_item['quarter']} {cat_item['year']}",
            file_name=filename,
            mime_type="application/pdf",
            file_size=len(content),
            tags=["sync", "ed-update", cat_item["source"], f"{cat_item['quarter']}-{cat_item['year']}"],
        )

        result = await service.upload(doc_data, blob_info=upload_result)
        document_id = result["id"]

        # Move into year folder
        try:
            year_folder_map = await _ensure_folder_hierarchy(
                folder_service, [cat_item["year"]]
            )
            parent_id = year_folder_map.get(cat_item["year"])
            if parent_id:
                await folder_service.move_node(document_id, parent_id)
        except Exception as e:
            logger.warning(f"Failed to move to folder: {e}")

    # Trigger pipeline
    if pipeline:
        background_tasks.add_task(
            _run_sync_pipeline,
            pipeline=pipeline,
            service=service,
            document_id=document_id,
            pdf_bytes=content,
            metadata={
                "title": cat_item["title"],
                "source": cat_item["url"],
                "quarter": cat_item["quarter"],
                "year": cat_item["year"],
            },
        )

    return ApiResponse.ok({
        "id": catalog_id,
        "document_id": document_id,
        "status": "queued",
        "message": "Document re-queued for processing",
    })


@router.delete("/{catalog_id}", response_model=ApiResponse[dict])
async def delete_synced_document(
    catalog_id: str,
    db: AsyncSession = Depends(get_db),
    blob_storage: AzureBlobStorageService = Depends(get_blob_storage),
) -> ApiResponse[dict]:
    """
    Delete a synced document from the knowledge base.

    Removes the document record and its blob from storage.
    The catalog entry remains so the user can re-sync if needed.
    """
    # Find the catalog item
    cat_item = next((c for c in OTTAWA_ED_CATALOG if c["id"] == catalog_id), None)
    if not cat_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Catalog item '{catalog_id}' not found",
        )

    service = _get_document_service(db)

    # Find the imported document
    existing_docs = await service.list(limit=500)
    url_path = urlparse(cat_item["url"]).path.split("/")[-1]
    existing_doc = next(
        (d for d in existing_docs if d.get("file_name") == url_path),
        None,
    )

    if not existing_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found in knowledge base",
        )

    document_id = existing_doc["id"]
    blob_name = existing_doc.get("blob_name")

    # Delete from blob storage
    if blob_name:
        try:
            await blob_storage.delete_file(blob_name)
            logger.info(f"Deleted blob '{blob_name}'")
        except Exception as e:
            logger.warning(f"Failed to delete blob '{blob_name}': {e}")

    # Delete document record
    store = DocumentStore(db)
    await store.delete(document_id)

    return ApiResponse.ok({
        "id": catalog_id,
        "document_id": document_id,
        "status": "deleted",
        "message": f"Document '{cat_item['title']}' removed from knowledge base",
    })


@router.get("/check-urls", response_model=ApiResponse[dict])
async def check_catalog_urls() -> ApiResponse[dict]:
    """
    Check availability of all catalog URLs.

    Runs HEAD requests in parallel (~2s for 16 URLs).
    Returns a map of catalog_id -> available.
    """
    url_to_id = {cat["url"]: cat["id"] for cat in OTTAWA_ED_CATALOG}
    availability = await _check_urls_batch(list(url_to_id.keys()))

    result = {
        cat_id: availability.get(url, False)
        for url, cat_id in url_to_id.items()
    }
    available_count = sum(1 for v in result.values() if v)

    return ApiResponse.ok({
        "availability": result,
        "total": len(result),
        "available": available_count,
        "unavailable": len(result) - available_count,
    })


@router.get("/preview-proxy")
async def preview_proxy(url: str):
    """
    Proxy-fetch a PDF from an external URL for inline preview.

    This avoids CORS issues when the frontend tries to display
    PDFs from ottawa.ca in an iframe.
    """
    # Validate URL
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL must use http or https",
        )

    # Only allow known domains for security
    allowed_domains = [
        "documents.ottawa.ca",
        "ottawa.ca",
        "pub-ottawa.escribemeetings.com",
        "www.oreb.ca",
    ]
    if parsed.hostname not in allowed_domains:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Domain not allowed: {parsed.hostname}",
        )

    try:
        async with httpx.AsyncClient(
            timeout=30.0,
            follow_redirects=True,
            headers={"User-Agent": "Ottawa-GenAI-Research-Assistant/1.0"},
        ) as client:
            resp = await client.get(url)
            resp.raise_for_status()
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=status.HTTP_BAD_GATEWAY,
            detail=f"Failed to fetch PDF: HTTP {e.response.status_code}",
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_BAD_GATEWAY,
            detail=f"Failed to fetch PDF: {str(e)}",
        )

    content = resp.content

    # Validate it looks like a PDF
    if not content[:5].startswith(b"%PDF-"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL does not point to a valid PDF",
        )

    return StreamingResponse(
        iter([content]),
        media_type="application/pdf",
        headers={
            "Content-Disposition": "inline",
            "Cache-Control": "public, max-age=3600",
        },
    )


async def _run_sync_pipeline(
    pipeline,
    service: DocumentService,
    document_id: str,
    pdf_bytes: bytes,
    metadata: dict,
) -> None:
    """Run the RAG pipeline for a synced document (background task)."""
    try:
        result = await pipeline.process(
            document_id=document_id,
            pdf_bytes=pdf_bytes,
            metadata=metadata,
        )

        if result.status == "success":
            logger.info(
                f"Sync pipeline completed for {document_id}: "
                f"{result.indexed_chunks}/{result.total_chunks} chunks indexed"
            )
            await service.update_status(document_id, DocumentStatus.INDEXED)
        else:
            logger.error(f"Sync pipeline failed for {document_id}: {result.error}")
            await service.update_status(document_id, DocumentStatus.FAILED)
    except Exception as e:
        logger.error(f"Sync pipeline exception for {document_id}: {e}")
        try:
            await service.update_status(document_id, DocumentStatus.FAILED)
        except Exception:
            logger.error(f"Failed to update status for {document_id}")

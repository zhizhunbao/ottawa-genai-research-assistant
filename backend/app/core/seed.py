"""
Unified Seed Data Registry

All modules register their default data here.
On startup, seed_defaults() upserts everything into
universal_documents using "INSERT IF NOT EXISTS" semantics.

Each seed entry is identified by (type, seed_key) pair.
If the key already exists in DB, it is NOT overwritten
(preserving user modifications).
"""

import logging
from dataclasses import dataclass, field
from typing import Any

from app.core.enums import DocumentStatus, DocumentType

logger = logging.getLogger(__name__)


@dataclass
class SeedEntry:
    """A single piece of seed data."""

    type: DocumentType  # universal_documents.type
    seed_key: str  # unique key within type (stored in data.seed_key)
    data: dict[str, Any]  # JSON payload for universal_documents.data
    tags: list[str] = field(default_factory=list)
    owner_id: str | None = None
    status: DocumentStatus = DocumentStatus.ACTIVE


class SeedRegistry:
    """Central registry for all module seed data."""

    _entries: list[SeedEntry] = []

    @classmethod
    def register(cls, entry: SeedEntry) -> None:
        """Register a single seed entry."""
        cls._entries.append(entry)

    @classmethod
    def register_many(cls, entries: list[SeedEntry]) -> None:
        """Register multiple seed entries at once."""
        cls._entries.extend(entries)

    @classmethod
    def all_entries(cls) -> list[SeedEntry]:
        """Return all registered seed entries."""
        return list(cls._entries)

    @classmethod
    def count(cls) -> int:
        """Return the number of registered entries."""
        return len(cls._entries)

    @classmethod
    def clear(cls) -> None:
        """Clear all registered entries. For testing only."""
        cls._entries.clear()


async def seed_defaults(db_session: Any) -> dict[str, int]:
    """
    Upsert all registered seed entries into universal_documents.

    For each entry, checks if a document with the same (type, seed_key)
    already exists. If it does, the entry is skipped (preserving user
    modifications). If not, a new document is inserted.

    Args:
        db_session: SQLAlchemy AsyncSession

    Returns:
        {"inserted": N, "skipped": M} counts
    """
    from sqlalchemy import select, text

    from app.core.models import UniversalDocument

    inserted = 0
    skipped = 0

    for entry in SeedRegistry.all_entries():
        # Check if this seed already exists by (type, seed_key)
        # Use json_extract for SQLite compatibility
        stmt = (
            select(UniversalDocument)
            .where(
                UniversalDocument.type == entry.type,
                text("json_extract(data, '$.seed_key') = :seed_key"),
            )
            .params(seed_key=entry.seed_key)
        )
        result = await db_session.execute(stmt)
        existing = result.scalar_one_or_none()

        if existing:
            skipped += 1
            continue

        # Inject seed_key into data for future lookups
        data_with_key = {**entry.data, "seed_key": entry.seed_key}

        doc = UniversalDocument(
            type=entry.type,
            data=data_with_key,
            owner_id=entry.owner_id,
            status=entry.status,
            tags=entry.tags,
        )
        db_session.add(doc)
        inserted += 1

    if inserted > 0:
        await db_session.commit()

    logger.info(f"Seed data: {inserted} inserted, {skipped} skipped")
    return {"inserted": inserted, "skipped": skipped}

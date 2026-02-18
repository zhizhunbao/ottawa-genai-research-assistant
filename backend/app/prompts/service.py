"""
Prompt Service

Business logic for prompt template management.
Uses UniversalDocument storage with PROMPT_TEMPLATE type.

All default prompts are seeded into DB on startup via the
unified SeedRegistry. This service is purely DB-driven.

@template A8 backend/domain/service.py — Business Logic Service
"""

import logging
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import DocumentStatus, DocumentType
from app.core.models import UniversalDocument
from app.core.utils import generate_uuid
from app.prompts.schemas import (
    PromptCategory,
    PromptCreate,
    PromptInfo,
    PromptListResponse,
    PromptStatus,
    PromptUpdate,
    PromptVersion,
)

logger = logging.getLogger(__name__)


class PromptService:
    """Service for managing prompt templates."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    # ── List Prompts ─────────────────────────────────────────────────

    async def list_prompts(
        self, category: PromptCategory | None = None
    ) -> PromptListResponse:
        """
        List all prompts, optionally filtered by category.

        All prompts (including seed defaults) are read from the DB.
        Seed entries are identified by the presence of 'seed_key' in data.
        """
        stmt = select(UniversalDocument).where(
            UniversalDocument.type == DocumentType.PROMPT_TEMPLATE,
            UniversalDocument.status != DocumentStatus.ARCHIVED,
        )
        result = await self.db.execute(stmt)
        db_docs = result.scalars().all()

        prompts: list[PromptInfo] = []
        by_category: dict[str, int] = {}

        for doc in db_docs:
            cat = doc.data.get("category", PromptCategory.CUSTOM)
            if category and cat != category:
                continue

            is_seed = "seed_key" in doc.data
            prompt = self._doc_to_prompt_info(doc, is_default=is_seed)
            prompts.append(prompt)
            by_category[cat] = by_category.get(cat, 0) + 1

        return PromptListResponse(
            prompts=prompts,
            total=len(prompts),
            by_category=by_category,
        )

    # ── Get Prompt ───────────────────────────────────────────────────

    async def get_prompt(self, prompt_id: str) -> PromptInfo | None:
        """Get a specific prompt by ID."""
        doc = await self.db.get(UniversalDocument, prompt_id)
        if not doc or doc.type != DocumentType.PROMPT_TEMPLATE:
            return None
        is_seed = "seed_key" in doc.data
        return self._doc_to_prompt_info(doc, is_default=is_seed)

    async def get_prompt_by_name(self, name: str) -> PromptInfo | None:
        """Get a prompt by name (for use in RAG pipeline)."""
        stmt = select(UniversalDocument).where(
            UniversalDocument.type == DocumentType.PROMPT_TEMPLATE,
            UniversalDocument.status == DocumentStatus.ACTIVE,
        )
        result = await self.db.execute(stmt)
        for doc in result.scalars():
            if doc.data.get("name") == name:
                is_seed = "seed_key" in doc.data
                return self._doc_to_prompt_info(doc, is_default=is_seed)

        return None

    # ── Create Prompt ────────────────────────────────────────────────

    async def create_prompt(self, data: PromptCreate) -> PromptInfo:
        """Create a new prompt."""
        doc = UniversalDocument(
            id=generate_uuid(),
            type=DocumentType.PROMPT_TEMPLATE,
            status=DocumentStatus.ACTIVE,
            data={
                "name": data.name,
                "category": data.category,
                "template": data.template,
                "description": data.description,
                "variables": data.variables,
                "version": 1,
                "versions": [
                    {
                        "version": 1,
                        "template": data.template,
                        "description": data.description,
                        "created_at": datetime.now(UTC).isoformat(),
                    }
                ],
            },
            tags=[data.category],
        )
        self.db.add(doc)
        await self.db.commit()
        await self.db.refresh(doc)

        return self._doc_to_prompt_info(doc, is_default=False)

    # ── Update Prompt ────────────────────────────────────────────────

    async def update_prompt(
        self, prompt_id: str, data: PromptUpdate
    ) -> PromptInfo | None:
        """Update a prompt (creates new version)."""
        # Update existing DB prompt
        doc = await self.db.get(UniversalDocument, prompt_id)
        if not doc or doc.type != DocumentType.PROMPT_TEMPLATE:
            return None

        # Increment version
        current_version = doc.data.get("version", 1)
        new_version = current_version + 1

        # Add to version history
        versions = doc.data.get("versions", [])
        versions.append({
            "version": new_version,
            "template": data.template,
            "description": data.description,
            "created_at": datetime.now(UTC).isoformat(),
        })

        # Update data
        doc.data = {
            **doc.data,
            "template": data.template,
            "description": data.description or doc.data.get("description"),
            "variables": data.variables or doc.data.get("variables", []),
            "version": new_version,
            "versions": versions,
        }
        doc.updated_at = datetime.now(UTC)

        await self.db.commit()
        await self.db.refresh(doc)

        return self._doc_to_prompt_info(doc, is_default=False)

    # ── Delete Prompt ────────────────────────────────────────────────

    async def delete_prompt(self, prompt_id: str) -> bool:
        """Delete a prompt (archives it, can be restored)."""
        doc = await self.db.get(UniversalDocument, prompt_id)
        if not doc or doc.type != DocumentType.PROMPT_TEMPLATE:
            return False

        doc.status = DocumentStatus.ARCHIVED
        doc.updated_at = datetime.now(UTC)
        await self.db.commit()

        return True

    # ── Get Versions ─────────────────────────────────────────────────

    async def get_versions(self, prompt_id: str) -> list[PromptVersion]:
        """Get version history for a prompt."""
        doc = await self.db.get(UniversalDocument, prompt_id)
        if not doc or doc.type != DocumentType.PROMPT_TEMPLATE:
            return []

        versions = doc.data.get("versions", [])
        return [
            PromptVersion(
                version=v["version"],
                template=v["template"],
                description=v.get("description"),
                created_at=datetime.fromisoformat(v["created_at"]),
                created_by=v.get("created_by"),
            )
            for v in versions
        ]

    # ── Render Prompt ────────────────────────────────────────────────

    async def render_prompt(
        self, prompt_id: str, variables: dict[str, str]
    ) -> str | None:
        """Render a prompt with variables substituted."""
        prompt = await self.get_prompt(prompt_id)
        if not prompt:
            return None

        try:
            return prompt.template.format(**variables)
        except KeyError as e:
            logger.warning(f"Missing variable in prompt {prompt_id}: {e}")
            return prompt.template

    # ── Helper Methods ───────────────────────────────────────────────

    def _doc_to_prompt_info(
        self, doc: UniversalDocument, is_default: bool
    ) -> PromptInfo:
        """Convert UniversalDocument to PromptInfo."""
        data = doc.data
        return PromptInfo(
            id=doc.id,
            name=data.get("name", ""),
            category=data.get("category", PromptCategory.CUSTOM),
            template=data.get("template", ""),
            description=data.get("description"),
            variables=data.get("variables", []),
            version=data.get("version", 1),
            status=PromptStatus.ACTIVE if doc.status == DocumentStatus.ACTIVE else PromptStatus.ARCHIVED,
            is_default=is_default,
            created_at=doc.created_at,
            updated_at=doc.updated_at,
        )

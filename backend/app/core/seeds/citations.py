"""
Seed Data: Default Citation Configuration

Provides default citation format, display fields, and thresholds.
"""

from app.core.enums import DocumentType
from app.core.seed import SeedEntry, SeedRegistry

_SEEDS = [
    SeedEntry(
        type=DocumentType.SYSTEM_CONFIG,
        seed_key="config:citation",
        tags=["seed", "system_config", "citation"],
        data={
            "name": "citation_config",
            "active_format": "inline",
            "formats": [
                {
                    "id": "inline",
                    "name": "Inline Numbers",
                    "description": "Citations appear as [1], [2] inline with text",
                    "active": True,
                },
                {
                    "id": "footnote",
                    "name": "Footnotes",
                    "description": "Citations appear as superscript with footnotes at bottom",
                    "active": False,
                },
                {
                    "id": "endnotes",
                    "name": "End Sources List",
                    "description": "All sources listed at the end of the response",
                    "active": False,
                },
            ],
            "display_fields": [
                {"id": "title", "name": "Document Title", "enabled": True},
                {"id": "page", "name": "Page Number", "enabled": True},
                {"id": "source", "name": "Source Name", "enabled": True},
                {"id": "score", "name": "Relevance Score", "enabled": False},
                {"id": "date", "name": "Document Date", "enabled": False},
            ],
            "min_relevance_score": 0.5,
            "max_citations": 5,
        },
    ),
]

SeedRegistry.register_many(_SEEDS)

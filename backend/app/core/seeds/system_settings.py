"""
Seed Data: Default System Settings

Provides default application-level settings that can be modified
by administrators through the admin console.
"""

from app.core.enums import DocumentType
from app.core.seed import SeedEntry, SeedRegistry

_SEEDS = [
    SeedEntry(
        type=DocumentType.SYSTEM_CONFIG,
        seed_key="config:system_settings",
        tags=["seed", "system_config", "settings"],
        data={
            "name": "system_settings",
            "default_language": "en",
            "max_upload_size_mb": 50,
            "session_timeout_hours": 24,
            "rate_limiting_enabled": False,
            "max_search_results": 10,
            "default_search_engine": "sqlite_fts",
            "enable_chart_extraction": True,
            "enable_citation_display": True,
        },
    ),
]

SeedRegistry.register_many(_SEEDS)

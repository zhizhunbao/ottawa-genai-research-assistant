"""
Seed Data Auto-Registration

Simply importing this package triggers all seed module registrations
with the SeedRegistry. Each module file calls SeedRegistry.register_many()
at module load time.
"""

from app.core.seeds import (  # noqa: F401
    benchmark_queries,
    chart_templates,
    citations,
    knowledge_bases,
    prompts,
    system_settings,
)

__all__ = [
    "prompts",
    "citations",
    "chart_templates",
    "system_settings",
    "benchmark_queries",
    "knowledge_bases",
]

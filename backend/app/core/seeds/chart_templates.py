"""
Seed Data: Default Chart Template Configuration

Provides default chart types with descriptions and trigger keywords.
"""

from app.core.enums import DocumentType
from app.core.seed import SeedEntry, SeedRegistry

_SEEDS = [
    SeedEntry(
        type=DocumentType.SYSTEM_CONFIG,
        seed_key="config:chart_templates",
        tags=["seed", "system_config", "chart_template"],
        data={
            "name": "chart_templates",
            "types": [
                {
                    "type": "line",
                    "name": "Line Chart",
                    "description": "Best for showing trends over time (quarters, years, months)",
                    "keywords": [
                        "trend", "growth", "over time", "quarterly",
                        "monthly", "yearly", "progression", "timeline",
                    ],
                    "enabled": True,
                },
                {
                    "type": "bar",
                    "name": "Bar Chart",
                    "description": "Best for comparing values across categories or groups",
                    "keywords": [
                        "compare", "comparison", "versus", "breakdown",
                        "ranking", "top", "distribution", "by category",
                    ],
                    "enabled": True,
                },
                {
                    "type": "pie",
                    "name": "Pie Chart",
                    "description": "Best for showing proportions or parts of a whole",
                    "keywords": [
                        "percentage", "share", "distribution", "proportion",
                        "composition", "makeup", "split", "ratio",
                    ],
                    "enabled": True,
                },
            ],
            "output_format": {
                "type": "string (line | bar | pie)",
                "title": "string",
                "x_key": "string",
                "y_keys": "string[]",
                "data": "object[]",
            },
        },
    ),
]

SeedRegistry.register_many(_SEEDS)

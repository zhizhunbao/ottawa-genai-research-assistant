"""
Knowledge Base Seed Data

Initializes default knowledge bases based on the project brief documentation.
"""

from app.core.enums import DocumentType
from app.core.seed import SeedEntry, SeedRegistry

KNOWLEDGE_BASE_SEEDS = [
    SeedEntry(
        type=DocumentType.KNOWLEDGE_BASE,
        seed_key="kb_ottawa_ed_updates",
        data={
            "name": "Ottawa ED Updates (Official)",
            "description": "Primary corpus of Economic Development Update reports from ottawa.ca (Q1 2022 – Q4 2025).",
            "kb_type": "url_catalog",
            "config": {
                "source_page": "https://ottawa.ca/en/planning-development-and-construction/housing-and-development-reports/local-economic-development-information/economic-development-update"
            },
            "search_engines": ["sqlite_fts", "page_index"],
            "doc_count": 0,
            "indexed_count": 0,
        },
        tags=["official", "ottawa", "economic-development"],
    ),
    SeedEntry(
        type=DocumentType.KNOWLEDGE_BASE,
        seed_key="kb_city_newsroom",
        data={
            "name": "City Newsroom - Business & Economy",
            "description": "Latest news and announcements regarding business, economy, and innovation in Ottawa.",
            "kb_type": "web_link",
            "config": {"url": "https://ottawa.ca/en/news/business-and-economy"},
            "search_engines": ["sqlite_fts", "page_index"],
            "doc_count": 0,
            "indexed_count": 0,
        },
        tags=["news", "ottawa", "business"],
    ),
    SeedEntry(
        type=DocumentType.KNOWLEDGE_BASE,
        seed_key="kb_invest_ottawa",
        data={
            "name": "Invest Ottawa Research",
            "description": "Research reports, market analysis, and economic development strategies from Invest Ottawa.",
            "kb_type": "manual_upload",
            "config": {},
            "search_engines": ["sqlite_fts", "page_index"],
            "doc_count": 0,
            "indexed_count": 0,
        },
        tags=["partner", "research", "invest-ottawa"],
    ),
    SeedEntry(
        type=DocumentType.KNOWLEDGE_BASE,
        seed_key="kb_ottawa_board_of_trade",
        data={
            "name": "Ottawa Board of Trade",
            "description": "Reports and policy documents from the Ottawa Board of Trade (OBOT).",
            "kb_type": "manual_upload",
            "config": {},
            "search_engines": ["sqlite_fts", "page_index"],
            "doc_count": 0,
            "indexed_count": 0,
        },
        tags=["partner", "policy", "obot"],
    ),
    SeedEntry(
        type=DocumentType.KNOWLEDGE_BASE,
        seed_key="kb_oreb_updates",
        data={
            "name": "OREB Real Estate Updates",
            "description": "Monthly and quarterly real estate market updates from the Ottawa Real Estate Board.",
            "kb_type": "web_link",
            "config": {"url": "https://www.oreb.ca/market-statistics/"},
            "search_engines": ["sqlite_fts", "page_index"],
            "doc_count": 0,
            "indexed_count": 0,
        },
        tags=["real-estate", "stats", "oreb"],
    ),
    SeedEntry(
        type=DocumentType.KNOWLEDGE_BASE,
        seed_key="kb_obj",
        data={
            "name": "Ottawa Business Journal (OBJ)",
            "description": "Local business news and economic trends from the Ottawa Business Journal.",
            "kb_type": "web_link",
            "config": {"url": "https://obj.ca/"},
            "search_engines": ["sqlite_fts", "page_index"],
            "doc_count": 0,
            "indexed_count": 0,
        },
        tags=["news", "business", "obj"],
    ),
    SeedEntry(
        type=DocumentType.KNOWLEDGE_BASE,
        seed_key="kb_cmhc",
        data={
            "name": "CMHC Housing Market Reports",
            "description": "Housing market insights and data for the Ottawa region from CMHC.",
            "kb_type": "manual_upload",
            "config": {},
            "search_engines": ["sqlite_fts", "page_index"],
            "doc_count": 0,
            "indexed_count": 0,
        },
        tags=["housing", "stats", "cmhc"],
    ),
]

SeedRegistry.register_many(KNOWLEDGE_BASE_SEEDS)

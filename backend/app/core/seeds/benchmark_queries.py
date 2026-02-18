"""
Seed Data: Default Benchmark Test Queries

Provides default test queries for the benchmark orchestrator.
Migrated from benchmark/service.py DEFAULT_TEST_QUERIES.
"""

from app.core.enums import DocumentType
from app.core.seed import SeedEntry, SeedRegistry

_SEEDS = [
    SeedEntry(
        type=DocumentType.BENCHMARK_QUERY,
        seed_key="benchmark:q-trends",
        tags=["seed", "benchmark", "healthcare"],
        data={
            "name": "ED Wait Time Trends",
            "query_id": "q-trends",
            "query": "What are the main trends in Ottawa ED wait times?",
            "expected_topics": ["wait times", "ED", "trends"],
            "category": "healthcare",
            "difficulty": "medium",
        },
    ),
    SeedEntry(
        type=DocumentType.BENCHMARK_QUERY,
        seed_key="benchmark:q-paramedicine",
        tags=["seed", "benchmark", "healthcare"],
        data={
            "name": "Community Paramedicine Impact",
            "query_id": "q-paramedicine",
            "query": "How has community paramedicine impacted hospital admissions?",
            "expected_topics": ["paramedicine", "admissions", "impact"],
            "category": "healthcare",
            "difficulty": "medium",
        },
    ),
    SeedEntry(
        type=DocumentType.BENCHMARK_QUERY,
        seed_key="benchmark:q-budget",
        tags=["seed", "benchmark", "finance"],
        data={
            "name": "Public Health Budget 2024",
            "query_id": "q-budget",
            "query": "What are the budget allocations for Ottawa public health in 2024?",
            "expected_topics": ["budget", "public health", "2024"],
            "category": "finance",
            "difficulty": "medium",
        },
    ),
    SeedEntry(
        type=DocumentType.BENCHMARK_QUERY,
        seed_key="benchmark:q-compare",
        tags=["seed", "benchmark", "analytics"],
        data={
            "name": "Hospital Performance Comparison",
            "query_id": "q-compare",
            "query": "Compare the performance metrics across different Ottawa hospitals.",
            "expected_topics": ["hospitals", "performance", "comparison"],
            "category": "analytics",
            "difficulty": "hard",
        },
    ),
    SeedEntry(
        type=DocumentType.BENCHMARK_QUERY,
        seed_key="benchmark:q-summary",
        tags=["seed", "benchmark", "summary"],
        data={
            "name": "ED Quarterly Report Summary",
            "query_id": "q-summary",
            "query": "Summarize the key findings from the latest ED quarterly report.",
            "expected_topics": ["ED", "quarterly", "findings"],
            "category": "summary",
            "difficulty": "easy",
        },
    ),
]

SeedRegistry.register_many(_SEEDS)

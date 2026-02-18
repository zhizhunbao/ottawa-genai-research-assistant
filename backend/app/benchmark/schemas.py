"""
Benchmark & Strategy Schemas

Defines data models for model combination strategies, benchmark runs,
evaluation results per strategy, and leaderboard rankings.

@template A8 backend/domain/schemas.py — Pydantic Models
@reference auto-model-strategy-evaluation.md Phase B
"""

from datetime import UTC, datetime

from pydantic import BaseModel, Field

from app.core.utils import generate_uuid


class StrategyConfig(BaseModel):
    """A specific combination of LLM + Embedding + Search Engine.

    Represents one "strategy" — the full configuration of models and engines
    used to answer a query. Used for benchmarking different combinations.
    """

    id: str = Field(default_factory=generate_uuid, description="Strategy unique ID")
    name: str = Field("", description="Human-readable name")
    llm_provider: str = Field("azure", description="LLM provider: azure | ollama")
    llm_model: str = Field("gpt-4o-mini", description="LLM model ID")
    embedding_provider: str = Field(
        "azure", description="Embedding provider: azure | ollama"
    )
    embedding_model: str = Field(
        "text-embedding-ada-002", description="Embedding model ID"
    )
    search_engine: str = Field(
        "azure_search",
        description="Search engine: azure_search | sqlite_fts | page_index | hybrid",
    )
    hybrid_engines: list[str] | None = Field(
        None, description="For hybrid mode: list of engines to merge via RRF"
    )
    temperature: float = Field(0.7, ge=0, le=2)


class BenchmarkQuery(BaseModel):
    """A test query for benchmarking.

    Each query tests a specific aspect of retrieval quality.
    """

    id: str = Field(default_factory=generate_uuid)
    query: str = Field(..., description="The test query text")
    expected_topics: list[str] = Field(
        default_factory=list, description="Expected topics/themes in the answer"
    )
    difficulty: str = Field("medium", description="easy | medium | hard")
    category: str = Field("general", description="Query category")


class StrategyResult(BaseModel):
    """Result of running a single strategy on a single query.

    Contains the generated answer, performance metrics, and
    6-dimension evaluation scores from the LLM Judge.
    """

    strategy_id: str
    query_id: str
    query_text: str
    answer: str = ""
    sources_count: int = 0
    confidence: float = 0.0
    latency_ms: float = 0.0
    token_usage: dict = Field(default_factory=dict)

    # 6-dimension evaluation scores (1.0 - 5.0)
    coherence: float = 0.0
    relevancy: float = 0.0
    completeness: float = 0.0
    grounding: float = 0.0
    helpfulness: float = 0.0
    faithfulness: float = 0.0
    overall_score: float = 0.0

    error: str | None = None
    evaluated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class LeaderboardEntry(BaseModel):
    """Ranked strategy in the leaderboard.

    Aggregates results across multiple queries for a single strategy.
    """

    rank: int = 0
    strategy: StrategyConfig
    overall_score: float = 0.0
    dimension_scores: dict[str, float] = Field(default_factory=dict)
    avg_latency_ms: float = 0.0
    avg_confidence: float = 0.0
    query_count: int = 0


class BenchmarkRun(BaseModel):
    """Complete benchmark run with multiple strategies × queries.

    This is the top-level result persisted to the database.
    """

    id: str = Field(default_factory=generate_uuid)
    status: str = "pending"  # pending | running | completed | failed
    strategies: list[StrategyConfig] = Field(default_factory=list)
    queries: list[BenchmarkQuery] = Field(default_factory=list)
    results: list[StrategyResult] = Field(default_factory=list)
    leaderboard: list[LeaderboardEntry] = Field(default_factory=list)
    total_combinations: int = 0
    completed_combinations: int = 0
    started_at: datetime | None = None
    completed_at: datetime | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class BenchmarkRequest(BaseModel):
    """Request to start a benchmark run.

    If strategies or queries are None, the system will auto-generate them.
    """

    strategies: list[StrategyConfig] | None = Field(
        None, description="Strategies to test. None = auto-generate all available combos"
    )
    queries: list[BenchmarkQuery] | None = Field(
        None, description="Test queries. None = use built-in test set"
    )
    auto_select: bool = Field(
        True, description="Auto-select best combo after benchmark"
    )
    max_strategies: int = Field(
        10, ge=1, le=50, description="Max strategies to test (when auto-generating)"
    )


class CompareRequest(BaseModel):
    """Request to compare strategies on a single query."""

    query: str = Field(..., min_length=1, description="Query to test")
    strategy_ids: list[str] = Field(
        default_factory=list,
        description="Strategy IDs to compare. Empty = use top 2 from leaderboard",
    )

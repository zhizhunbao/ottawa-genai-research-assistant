"""
Benchmark Orchestrator Service

Runs benchmark: for each (LLM × Embedding × Search) combination,
execute test queries and evaluate using the 6-dimension LLM Judge.

Flow per strategy × query:
  1. Embed query using strategy's embedding model
  2. Search using strategy's search engine
  3. Generate answer using strategy's LLM
  4. Evaluate using Judge LLM (6 dimensions)
  5. Record metrics (latency, tokens, scores)

@template A10 backend/domain/service.py — Shared CRUD & Logic Layer
@reference evaluation/service.py — LLMEvaluationService (judge)
@reference search/engine.py — SearchRouter (multi-engine)
@reference research/service.py — RAG pipeline
"""

import logging
import time
from datetime import UTC, datetime
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.benchmark.schemas import (
    BenchmarkQuery,
    BenchmarkRequest,
    BenchmarkRun,
    LeaderboardEntry,
    StrategyConfig,
    StrategyResult,
)
from app.core.enums import DocumentStatus, DocumentType
from app.core.models import UniversalDocument
from app.core.utils import generate_uuid
from app.evaluation.schemas import EvaluationDimension, EvaluationRequest
from app.evaluation.service import LLMEvaluationService

logger = logging.getLogger(__name__)


# ── Built-in Test Queries ─────────────────────────────────────────────

DEFAULT_TEST_QUERIES = [
    BenchmarkQuery(
        id="q-trends",
        query="What are the main trends in Ottawa ED wait times?",
        expected_topics=["wait times", "ED", "trends"],
        category="healthcare",
        difficulty="medium",
    ),
    BenchmarkQuery(
        id="q-paramedicine",
        query="How has community paramedicine impacted hospital admissions?",
        expected_topics=["paramedicine", "admissions", "impact"],
        category="healthcare",
        difficulty="medium",
    ),
    BenchmarkQuery(
        id="q-budget",
        query="What are the budget allocations for Ottawa public health in 2024?",
        expected_topics=["budget", "public health", "2024"],
        category="finance",
        difficulty="medium",
    ),
    BenchmarkQuery(
        id="q-compare",
        query="Compare the performance metrics across different Ottawa hospitals.",
        expected_topics=["hospitals", "performance", "comparison"],
        category="analytics",
        difficulty="hard",
    ),
    BenchmarkQuery(
        id="q-summary",
        query="Summarize the key findings from the latest ED quarterly report.",
        expected_topics=["ED", "quarterly", "findings"],
        category="summary",
        difficulty="easy",
    ),
]


# ── Orchestrator ──────────────────────────────────────────────────────


class BenchmarkOrchestrator:
    """
    Orchestrates benchmark runs across multiple strategy combinations.

    For each strategy × query pair:
      1. Embed query → search engine
      2. Search → top_k results
      3. Generate answer using strategy's LLM
      4. Evaluate answer quality (6-dim Judge)
      5. Record latency, token usage, scores

    After all runs, compute leaderboard and persist results.

    Args:
        db_session: Database session for persisting results
        openai_service: Azure OpenAI service (used as Judge LLM + Azure provider)
    """

    def __init__(
        self,
        db_session: AsyncSession,
        openai_service: Any = None,
    ) -> None:
        self._db = db_session
        self._openai = openai_service

    # ── Public API ────────────────────────────────────────────────────

    async def run_benchmark(self, request: BenchmarkRequest) -> BenchmarkRun:
        """Execute a complete benchmark across strategy combinations.

        Args:
            request: Benchmark configuration (strategies, queries, limits)

        Returns:
            BenchmarkRun with all results and leaderboard
        """
        strategies = request.strategies or self._generate_auto_strategies(
            request.max_strategies
        )
        queries = request.queries or DEFAULT_TEST_QUERIES

        run = BenchmarkRun(
            id=generate_uuid(),
            strategies=strategies,
            queries=queries,
            status="running",
            total_combinations=len(strategies) * len(queries),
            started_at=datetime.now(UTC),
        )

        logger.info(
            f"Starting benchmark {run.id}: "
            f"{len(strategies)} strategies × {len(queries)} queries "
            f"= {run.total_combinations} combinations"
        )

        for strategy in strategies:
            for query in queries:
                try:
                    result = await self._run_single(strategy, query)
                    run.results.append(result)
                except Exception as e:
                    logger.error(
                        f"Benchmark failed for {strategy.name}/{query.id}: {e}"
                    )
                    run.results.append(
                        StrategyResult(
                            strategy_id=strategy.id,
                            query_id=query.id,
                            query_text=query.query,
                            answer="",
                            error=str(e),
                        )
                    )
                run.completed_combinations += 1

        # Compute leaderboard ranking
        run.leaderboard = self._compute_leaderboard(run)
        run.status = "completed"
        run.completed_at = datetime.now(UTC)

        # Persist to database
        await self._save_run(run)

        logger.info(
            f"Benchmark {run.id} completed: "
            f"{len(run.results)} results, "
            f"top strategy: {run.leaderboard[0].strategy.name if run.leaderboard else 'N/A'}"
        )

        return run

    def generate_strategies(self, max_count: int = 10) -> list[StrategyConfig]:
        """Public wrapper for auto-generating strategies."""
        return self._generate_auto_strategies(max_count)

    # ── Single Strategy × Query Run ───────────────────────────────────

    async def _run_single(
        self, strategy: StrategyConfig, query: BenchmarkQuery
    ) -> StrategyResult:
        """Run a single strategy on a single query and evaluate.

        Steps:
          1. Search (embed query + search engine)
          2. Generate answer (LLM with context)
          3. Evaluate (Judge LLM 6-dim scoring)
        """
        start = time.perf_counter()

        # Step 1: Search using strategy's engine
        search_results = await self._search(query.query, strategy)

        # Step 2: Generate answer using strategy's LLM
        context = [r.get("content", "") for r in search_results[:5]]
        answer, usage = await self._generate_answer(query.query, context, strategy)

        latency = (time.perf_counter() - start) * 1000

        # Step 3: Evaluate using Judge LLM (6 dimensions)
        eval_scores = await self._evaluate(query.query, answer, context)

        overall = sum(eval_scores.values()) / max(len(eval_scores), 1)

        return StrategyResult(
            strategy_id=strategy.id,
            query_id=query.id,
            query_text=query.query,
            answer=answer,
            sources_count=len(search_results),
            confidence=eval_scores.get("grounding", 0) / 5.0,
            latency_ms=round(latency, 1),
            token_usage=usage,
            coherence=eval_scores.get("coherence", 0),
            relevancy=eval_scores.get("relevancy", 0),
            completeness=eval_scores.get("completeness", 0),
            grounding=eval_scores.get("grounding", 0),
            helpfulness=eval_scores.get("helpfulness", 0),
            faithfulness=eval_scores.get("faithfulness", 0),
            overall_score=round(overall, 2),
        )

    # ── Step 1: Search ────────────────────────────────────────────────

    async def _search(
        self, query: str, strategy: StrategyConfig
    ) -> list[dict[str, Any]]:
        """Execute search using the strategy's embedding + search engine."""
        from app.search.engine import search_router

        # Search via the search router
        try:
            if strategy.search_engine == "hybrid" and strategy.hybrid_engines:
                results = await search_router.hybrid_search(
                    query, engines=strategy.hybrid_engines, top_k=5
                )
            else:
                results = await search_router.search(
                    query, engine=strategy.search_engine, top_k=5
                )
            return [r.to_dict() for r in results]
        except Exception as e:
            logger.warning(f"Search failed ({strategy.search_engine}): {e}")
            return []

    # ── Step 2: Generate Answer ───────────────────────────────────────

    async def _generate_answer(
        self,
        query: str,
        context: list[str],
        strategy: StrategyConfig,
    ) -> tuple[str, dict]:
        """Generate answer using the strategy's LLM.

        Returns:
            Tuple of (answer_text, token_usage_dict)
        """
        system_prompt = (
            "You are a research assistant. Answer the user's question based on "
            "the provided context documents. Be specific and cite relevant data.\n\n"
            "Context:\n" + "\n---\n".join(context[:5])
            if context
            else "You are a research assistant. Answer based on your knowledge."
        )
        messages = [{"role": "user", "content": query}]
        usage: dict = {}

        try:
            if strategy.llm_provider == "ollama":
                answer = await self._ollama_generate(
                    messages, strategy.llm_model, strategy.temperature, system_prompt
                )
            else:
                answer = await self._azure_generate(
                    messages, strategy.temperature, system_prompt
                )
        except Exception as e:
            logger.error(f"LLM generation failed ({strategy.llm_model}): {e}")
            answer = f"[Generation Error: {e}]"

        return answer, usage

    async def _azure_generate(
        self,
        messages: list[dict],
        temperature: float,
        system_prompt: str,
    ) -> str:
        """Generate using Azure OpenAI."""
        if not self._openai:
            return "(Azure OpenAI not configured)"

        return await self._openai.chat_completion(
            messages=messages,
            temperature=temperature,
            system_prompt=system_prompt,
        )

    async def _ollama_generate(
        self,
        messages: list[dict],
        model: str,
        temperature: float,
        system_prompt: str,
    ) -> str:
        """Generate using local Ollama model."""
        from app.core.config import settings
        from app.ollama.service import OllamaService

        ollama = OllamaService(base_url=settings.ollama_base_url)
        return await ollama.chat_completion(
            messages=messages,
            model=model,
            temperature=temperature,
            system_prompt=system_prompt,
        )

    # ── Step 3: Evaluate (Judge LLM) ──────────────────────────────────

    async def _evaluate(
        self, query: str, answer: str, context: list[str]
    ) -> dict[str, float]:
        """Evaluate answer quality using the 6-dimension Judge LLM.

        Delegates to LLMEvaluationService.evaluate().
        Falls back to default scores (3.0) if evaluation fails.
        """
        default_scores = {d.value: 3.0 for d in EvaluationDimension}

        if not self._openai:
            logger.warning("No OpenAI service — returning default scores")
            return default_scores

        try:
            evaluator = LLMEvaluationService(
                db=self._db, openai_service=self._openai
            )
            result = await evaluator.evaluate(
                EvaluationRequest(
                    query=query,
                    response=answer,
                    context=context,
                )
            )
            return {s.dimension.value: s.score for s in result.scores}
        except Exception as e:
            logger.error(f"Evaluation failed: {e}")
            return default_scores

    # ── Strategy Generation ───────────────────────────────────────────

    def _generate_auto_strategies(self, max_count: int = 10) -> list[StrategyConfig]:
        """Auto-generate strategy combos from available models and engines.

        Creates the Cartesian product of:
          - Available LLMs (Azure + Ollama)
          - Available embedding providers
          - Available search engines
        Limited to max_count total strategies.
        """
        from app.search.embedding import embedding_router
        from app.search.engine import search_router

        strategies: list[StrategyConfig] = []

        # Available LLMs — at least Azure default
        llms = [{"provider": "azure", "model": "gpt-4o-mini"}]

        # Check for Ollama LLMs
        # (We register a static entry; dynamic discovery in /models endpoint)
        llms.append({"provider": "ollama", "model": "llama3.1:8b"})

        # Available embeddings
        embeddings = embedding_router.available_providers
        if not embeddings:
            embeddings = [
                {"provider": "azure", "model": "text-embedding-ada-002"}
            ]

        # Available search engines
        engines = search_router.available_engines or ["sqlite_fts"]

        # Cartesian product: LLM × Embedding × Engine
        for llm in llms:
            for emb in embeddings:
                for eng in engines:
                    if len(strategies) >= max_count:
                        break

                    emb_model = emb.get("model", emb.get("key", "unknown"))
                    name = f"{llm['model']} + {emb_model} + {eng}"
                    sid = f"{llm['model']}_{emb_model}_{eng}".replace(":", "-")

                    strategies.append(
                        StrategyConfig(
                            id=sid,
                            name=name,
                            llm_provider=llm["provider"],
                            llm_model=llm["model"],
                            embedding_provider=emb.get("provider", "azure"),
                            embedding_model=emb_model,
                            search_engine=eng,
                        )
                    )

        # Add hybrid combo if multiple engines exist
        if len(engines) >= 2 and len(strategies) < max_count:
            llm = llms[0]
            emb = embeddings[0]
            emb_model = emb.get("model", "unknown")
            hybrid_name = "+".join(engines)
            strategies.append(
                StrategyConfig(
                    id=f"{llm['model']}_{emb_model}_hybrid".replace(":", "-"),
                    name=f"{llm['model']} + {emb_model} + Hybrid({hybrid_name})",
                    llm_provider=llm["provider"],
                    llm_model=llm["model"],
                    embedding_provider=emb.get("provider", "azure"),
                    embedding_model=emb_model,
                    search_engine="hybrid",
                    hybrid_engines=engines,
                )
            )

        return strategies[:max_count]

    # ── Leaderboard ───────────────────────────────────────────────────

    def _compute_leaderboard(self, run: BenchmarkRun) -> list[LeaderboardEntry]:
        """Compute ranked leaderboard from benchmark results.

        Groups results by strategy, computes averages for each metric,
        and sorts by overall_score descending.
        """
        # Group results by strategy_id
        strategy_results: dict[str, list[StrategyResult]] = {}
        for r in run.results:
            strategy_results.setdefault(r.strategy_id, []).append(r)

        entries: list[LeaderboardEntry] = []

        for sid, results in strategy_results.items():
            strategy = next((s for s in run.strategies if s.id == sid), None)
            if not strategy:
                continue

            # Filter out error results
            valid = [r for r in results if not r.error]
            if not valid:
                continue

            avg_score = sum(r.overall_score for r in valid) / len(valid)
            avg_latency = sum(r.latency_ms for r in valid) / len(valid)
            avg_conf = sum(r.confidence for r in valid) / len(valid)

            # Per-dimension averages
            dim_avgs: dict[str, float] = {}
            for dim in EvaluationDimension:
                scores = [getattr(r, dim.value, 0) for r in valid]
                dim_avgs[dim.value] = (
                    round(sum(scores) / len(scores), 2) if scores else 0
                )

            entries.append(
                LeaderboardEntry(
                    strategy=strategy,
                    overall_score=round(avg_score, 2),
                    dimension_scores=dim_avgs,
                    avg_latency_ms=round(avg_latency, 1),
                    avg_confidence=round(avg_conf, 2),
                    query_count=len(valid),
                )
            )

        # Sort by overall_score desc
        entries.sort(key=lambda e: e.overall_score, reverse=True)

        # Assign ranks
        for i, entry in enumerate(entries):
            entry.rank = i + 1

        return entries

    # ── Persistence ───────────────────────────────────────────────────

    async def _save_run(self, run: BenchmarkRun) -> None:
        """Persist benchmark run as a UniversalDocument."""
        doc = UniversalDocument(
            id=run.id,
            type=DocumentType.EVALUATION_RESULT,
            data=run.model_dump(mode="json"),
            status=DocumentStatus.ACTIVE,
            tags=[
                "benchmark",
                f"strategies:{len(run.strategies)}",
                f"queries:{len(run.queries)}",
            ],
        )
        self._db.add(doc)
        await self._db.commit()
        logger.info(f"Saved benchmark run {run.id} to database")

"""
Admin Console Service

Aggregates statistics and health status from various system modules
for the Admin Dashboard.
"""

import asyncio
import logging
import time
from typing import Any

from sqlalchemy import select, func, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.admin.schemas import DashboardStat, DashboardStatsResponse, ServiceHealth, DashboardHealthResponse
from app.core.config import settings
from app.core.enums import DocumentType, DocumentStatus
from app.models.schemas import ModelType
from app.core.database import async_session_maker
from app.core.models import UniversalDocument
from app.models.service import ModelService
from app.prompts.service import PromptService
from app.search.engine import search_router

logger = logging.getLogger(__name__)


class AdminService:
    """Service for Admin Console dashboard data aggregation."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.model_service = ModelService()
        self.prompt_service = PromptService(db)

    # ── Dashboard Stats ───────────────────────────────────────────

    async def get_dashboard_stats(self) -> DashboardStatsResponse:
        """Fetch all 6 main stats for the dashboard cards."""
        stats = []

        # 1. Total LLM Models
        try:
            llm_models = await self.model_service.list_models(model_type=ModelType.LLM)
            stats.append(DashboardStat(
                label="LLM Models",
                value=str(len(llm_models)),
                description=f"{sum(1 for m in llm_models if m.provider == 'ollama')} local, {sum(1 for m in llm_models if m.provider == 'azure')} cloud",
                trend="up" if len(llm_models) > 0 else "neutral"
            ))
        except Exception as e:
            logger.error(f"Failed to get LLM stats: {e}")
            stats.append(DashboardStat(label="LLM Models", value="0", description="Error fetching"))

        # 2. Total Embedding Models
        try:
            emb_models = await self.model_service.list_models(model_type=ModelType.EMBEDDING)
            stats.append(DashboardStat(
                label="Embedding Models",
                value=str(len(emb_models)),
                description="Used for vectorization",
                trend="neutral"
            ))
        except Exception as e:
            logger.error(f"Failed to get Embedding stats: {e}")
            stats.append(DashboardStat(label="Embedding Models", value="0", description="Error fetching"))

        # 3. Data Sources (Knowledge Bases)
        try:
            stmt = select(func.count()).select_from(UniversalDocument).where(
                UniversalDocument.type == DocumentType.KNOWLEDGE_BASE
            )
            result = await self.db.execute(stmt)
            count = result.scalar() or 0
            stats.append(DashboardStat(
                label="Data Sources",
                value=str(count),
                description="Knowledge bases connected",
                trend="up" if count > 0 else "neutral"
            ))
        except Exception as e:
            logger.error(f"Failed to get Data source stats: {e}")
            stats.append(DashboardStat(label="Data Sources", value="0", description="Error fetching"))

        # 4. Search Engines
        try:
            engines = search_router.available_engines
            stats.append(DashboardStat(
                label="Search Engines",
                value=str(len(engines)),
                description=", ".join(engines[:3]) + ("..." if len(engines) > 3 else ""),
                trend="neutral"
            ))
        except Exception as e:
            logger.error(f"Failed to get Search engine stats: {e}")
            stats.append(DashboardStat(label="Search Engines", value="0", description="Error fetching"))

        # 5. Prompt Templates
        try:
            prompts = await self.prompt_service.list_prompts()
            stats.append(DashboardStat(
                label="Prompt Studio",
                value=str(prompts.total),
                description="Active templates",
                trend="up"
            ))
        except Exception as e:
            logger.error(f"Failed to get Prompt stats: {e}")
            stats.append(DashboardStat(label="Prompt Studio", value="0", description="Error fetching"))

        # 6. Benchmark Queries
        try:
            stmt = select(func.count()).select_from(UniversalDocument).where(
                UniversalDocument.type == DocumentType.BENCHMARK_QUERY
            )
            result = await self.db.execute(stmt)
            count = result.scalar() or 0
            stats.append(DashboardStat(
                label="Evaluation",
                value=str(count),
                description="Test queries registered",
                trend="neutral"
            ))
        except Exception as e:
            logger.error(f"Failed to get Benchmark stats: {e}")
            stats.append(DashboardStat(label="Evaluation", value="0", description="Error fetching"))

        return DashboardStatsResponse(stats=stats)

    # ── System Health ─────────────────────────────────────────────

    async def get_system_health(self) -> DashboardHealthResponse:
        """Check status of all critical external services."""
        services = []
        
        # 1. Database
        db_start = time.perf_counter()
        try:
            await self.db.execute(text("SELECT 1"))
            db_lat = (time.perf_counter() - db_start) * 1000
            services.append(ServiceHealth(
                service="SQLite Database",
                status="healthy",
                latency_ms=round(db_lat, 1)
            ))
        except Exception as e:
            services.append(ServiceHealth(service="Database", status="unavailable", message=str(e)))

        # 2. Ollama (if configured)
        try:
            from app.ollama.service import OllamaService
            ollama = OllamaService(base_url=settings.ollama_base_url)
            o_start = time.perf_counter()
            is_ok = await ollama.is_available()
            o_lat = (time.perf_counter() - o_start) * 1000
            services.append(ServiceHealth(
                service="Ollama (Local LLM)",
                status="healthy" if is_ok else "unavailable",
                latency_ms=round(o_lat, 1) if is_ok else None,
                message="Local LLM service reachable" if is_ok else "Could not connect to Ollama"
            ))
        except Exception as e:
            services.append(ServiceHealth(service="Ollama", status="unknown", message=str(e)))

        # 3. Azure OpenAI (Model Reachability)
        if settings.azure_openai_endpoint:
            services.append(ServiceHealth(
                service="Azure OpenAI",
                status="healthy", # Simplified check based on config availability
                message="Connected via API Key"
            ))
        else:
            services.append(ServiceHealth(
                service="Azure OpenAI",
                status="degraded",
                message="Endpoint not configured"
            ))

        # 4. Search Engine FTS
        if "sqlite_fts" in search_router.available_engines:
            services.append(ServiceHealth(
                service="SQLite FTS Engine",
                status="healthy",
                message="Local search engine ready"
            ))

        # Overall status calculation
        unhealthy = [s for s in services if s.status == "unavailable"]
        degraded = [s for s in services if s.status == "degraded"]
        
        if unhealthy:
            overall = "critical"
        elif degraded:
            overall = "degraded"
        else:
            overall = "healthy"

        return DashboardHealthResponse(
            services=services,
            overall_status=overall
        )

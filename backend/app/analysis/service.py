"""
Analysis Service Layer

Business logic for chart generation, speaking notes, and summary analysis.
Leverages ChartDataExtractor for LLM-powered chart data extraction.

@template A10 backend/domain/service.py — Shared CRUD & Logic Layer
"""

import logging
from typing import Any

from app.analysis.schemas import AnalysisRequest, ChartData, SpeakingNotes
from app.core.document_store import DocumentStore
from app.core.enums import AnalysisType, DocumentType
from app.research.service import ChartDataExtractor

logger = logging.getLogger(__name__)


class AnalysisService:
    """分析服务类"""

    def __init__(
        self,
        document_store: DocumentStore,
        openai_service: Any = None,
    ):
        self.doc_store = document_store
        self._openai_service = openai_service
        self._chart_extractor = ChartDataExtractor(openai_service=openai_service)

    async def generate_chart(
        self, request: AnalysisRequest, user_id: str | None = None
    ) -> ChartData:
        """Generate chart data from documents using LLM extraction."""
        # 1. Gather document content for context
        content = await self._gather_content(request.document_ids)

        # 2. Use LLM-powered chart extraction if OpenAI service is available
        if self._openai_service and content:
            extracted = await self._chart_extractor.extract_chart_data_llm(
                content, request.query
            )
            if extracted:
                # Convert research ChartData to analysis ChartData
                x_key = extracted.x_key or "name"
                chart_data = ChartData(
                    labels=[str(d.get(x_key, "")) for d in extracted.data],
                    datasets=[
                        {
                            "label": key,
                            "data": [d.get(key, 0) for d in extracted.data],
                        }
                        for key in (extracted.y_keys or ["value"])
                    ],
                    title=extracted.title or f"Analysis for: {request.query}",
                    chart_type=extracted.type,
                )

                # Save result via DocumentStore
                await self.doc_store.create(
                    doc_type=DocumentType.CHART_RESULT,
                    data=chart_data.model_dump(),
                    owner_id=user_id,
                    tags=["automated-analysis", "chart", "llm-extracted"],
                )
                return chart_data

        # 3. Fallback: try regex-based extraction
        if content:
            extracted = self._chart_extractor.extract_chart_data(content, request.query)
            if extracted:
                x_key = extracted.x_key or "name"
                chart_data = ChartData(
                    labels=[str(d.get(x_key, "")) for d in extracted.data],
                    datasets=[
                        {
                            "label": key,
                            "data": [d.get(key, 0) for d in extracted.data],
                        }
                        for key in (extracted.y_keys or ["value"])
                    ],
                    title=extracted.title or f"Analysis for: {request.query}",
                    chart_type=extracted.type,
                )

                await self.doc_store.create(
                    doc_type=DocumentType.CHART_RESULT,
                    data=chart_data.model_dump(),
                    owner_id=user_id,
                    tags=["automated-analysis", "chart", "regex-extracted"],
                )
                return chart_data

        # 4. Last resort: placeholder data
        logger.warning("No chart data extracted, returning placeholder")
        chart_data = ChartData(
            labels=["Q1", "Q2", "Q3", "Q4"],
            datasets=[{"label": "Value", "data": [0, 0, 0, 0]}],
            title=f"Analysis for: {request.query}",
        )

        await self.doc_store.create(
            doc_type=DocumentType.CHART_RESULT,
            data=chart_data.model_dump(),
            owner_id=user_id,
            tags=["automated-analysis", "chart", "placeholder"],
        )

        return chart_data

    async def generate_speaking_notes(
        self, request: AnalysisRequest, user_id: str | None = None
    ) -> SpeakingNotes:
        """Generate speaking notes from document content using LLM."""
        content = await self._gather_content(request.document_ids)

        if self._openai_service and content:
            try:
                prompt = (
                    f"Based on the following content, generate speaking notes for: {request.query}\n\n"
                    f"Content: {content[:6000]}\n\n"
                    "Provide a JSON response with:\n"
                    '- "title": A concise title\n'
                    '- "key_points": List of 3-5 main discussion points\n'
                    '- "statistics": List of relevant data points and statistics\n'
                    '- "conclusion": A closing summary statement\n\n'
                    "Return ONLY valid JSON."
                )
                import json

                response_text = await self._openai_service.chat_completion(
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.3,
                    system_prompt="You are an expert analyst. Respond ONLY with valid JSON.",
                )

                # Clean markdown code blocks
                cleaned = response_text.strip()
                if cleaned.startswith("```json"):
                    cleaned = cleaned.replace("```json", "", 1)
                if cleaned.endswith("```"):
                    cleaned = cleaned.rsplit("```", 1)[0]
                cleaned = cleaned.strip()

                data = json.loads(cleaned)
                notes = SpeakingNotes(**data)

                await self.doc_store.create(
                    doc_type=DocumentType.SPEAKING_NOTE,
                    data=notes.model_dump(),
                    owner_id=user_id,
                    tags=["automated-analysis", "notes", "llm-generated"],
                )
                return notes

            except Exception as e:
                logger.error(f"LLM speaking notes generation failed: {e}")

        # Fallback: static placeholder
        notes = SpeakingNotes(
            title=f"Notes: {request.query}",
            key_points=["No document content available for analysis"],
            statistics=["No statistics available"],
            conclusion="Please upload relevant documents and try again.",
        )

        await self.doc_store.create(
            doc_type=DocumentType.SPEAKING_NOTE,
            data=notes.model_dump(),
            owner_id=user_id,
            tags=["automated-analysis", "notes", "fallback"],
        )
        return notes

    async def _gather_content(self, document_ids: list[str] | None) -> str:
        """Gather content from specified documents."""
        if not document_ids:
            return ""

        content_parts = []
        for doc_id in document_ids:
            doc = await self.doc_store.get_by_id(doc_id)
            if doc and doc.get("data"):
                data = doc["data"]
                if isinstance(data, dict):
                    text = data.get("content", data.get("text", ""))
                    if text:
                        content_parts.append(str(text))
                elif isinstance(data, str):
                    content_parts.append(data)

        return "\n\n---\n\n".join(content_parts)

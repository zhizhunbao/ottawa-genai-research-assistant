"""
Analysis Routes

API endpoints for chart visualization and speaking notes generation.

@template A7 backend/domain/router.py — API Routes
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.analysis.schemas import AnalysisRequest, ChartData, SpeakingNotes
from app.analysis.service import AnalysisService
from app.core.database import get_db
from app.core.dependencies import OptionalOpenAIService
from app.core.document_store import DocumentStore
from app.core.schemas import ApiResponse

router = APIRouter(prefix="/api/v1/analysis", tags=["analysis"])


def get_analysis_service(
    db: AsyncSession = Depends(get_db),
    openai_service: OptionalOpenAIService = None,
) -> AnalysisService:
    store = DocumentStore(db)
    return AnalysisService(store, openai_service=openai_service)


@router.post("/visualize", response_model=ApiResponse[ChartData])
async def visualize(
    request: AnalysisRequest,
    service: AnalysisService = Depends(get_analysis_service),
):
    """Request chart visualization from document data."""
    result = await service.generate_chart(request)
    return ApiResponse.ok(result)


@router.post("/speaking-notes", response_model=ApiResponse[SpeakingNotes])
async def speaking_notes(
    request: AnalysisRequest,
    service: AnalysisService = Depends(get_analysis_service),
):
    """Generate speaking notes from document analysis."""
    result = await service.generate_speaking_notes(request)
    return ApiResponse.ok(result)

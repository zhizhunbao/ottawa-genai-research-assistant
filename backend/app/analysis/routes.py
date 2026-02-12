"""
Analysis Routes

API endpoints for chart visualization and reporting.

@template A7 backend/domain/router.py — API Routes
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.analysis.schemas import AnalysisRequest, ChartData, SpeakingNotes
from app.analysis.service import AnalysisService
from app.core.database import get_db
from app.core.document_store import DocumentStore
from app.core.schemas import ApiResponse

router = APIRouter(prefix="/api/v1/analysis", tags=["analysis"])

def get_analysis_service(db: AsyncSession = Depends(get_db)) -> AnalysisService:
    store = DocumentStore(db)
    return AnalysisService(store)

@router.post("/visualize", response_model=ApiResponse[ChartData])
async def visualize(
    request: AnalysisRequest,
    service: AnalysisService = Depends(get_analysis_service)
):
    """请求生成可视化图表"""
    result = await service.generate_chart(request)
    return ApiResponse.ok(result)

@router.post("/speaking-notes", response_model=ApiResponse[SpeakingNotes])
async def speaking_notes(
    request: AnalysisRequest,
    service: AnalysisService = Depends(get_analysis_service)
):
    """请求生成发言稿"""
    result = await service.generate_speaking_notes(request)
    return ApiResponse.ok(result)

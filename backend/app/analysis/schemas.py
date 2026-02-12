"""
Analysis Module Schemas

Pydantic models for analysis requests and responses.

@template A8 backend/domain/schemas.py — Pydantic Models
"""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.core.enums import AnalysisType, ChartType


class ChartData(BaseModel):
    """图表数据模型"""
    labels: list[str] = Field(..., description="Labels for the chart axes")
    datasets: list[dict[str, Any]] = Field(..., description="Data series for the chart")
    title: str | None = Field(None, description="The chart title")
    chart_type: ChartType = Field(ChartType.BAR, description="The type of chart to render")

class AnalysisRequest(BaseModel):
    """分析请求"""
    query: str = Field(..., description="The analysis query or topic")
    document_ids: list[str] | None = Field(None, description="Target document IDs for analysis")
    analysis_type: AnalysisType = Field(..., description="The type of analysis to perform")

class AnalysisResponse(BaseModel):
    """分析响应"""
    id: str = Field(..., description="The unique identity of the analysis result")
    type: str = Field(..., description="The type of result")
    content: dict[str, Any] = Field(..., description="The analysis content payload")
    created_at: datetime = Field(..., description="Creation timestamp")

class SpeakingNotes(BaseModel):
    """发言稿模型"""
    title: str = Field(..., description="The title of the speaking notes")
    key_points: list[str] = Field(..., description="Summary of key discussion points")
    statistics: list[str] = Field(..., description="Supporting data and statistics")
    conclusion: str = Field(..., description="Closing statements and recommendations")

"""
分析模块 Schema

定义分析相关的 Pydantic 模型。
遵循 dev-backend_patterns skill 规范。
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from app.core.enums import AnalysisType, ChartType

class ChartData(BaseModel):
    """图表数据模型"""
    labels: List[str] = Field(..., description="Labels for the chart axes")
    datasets: List[Dict[str, Any]] = Field(..., description="Data series for the chart")
    title: Optional[str] = Field(None, description="The chart title")
    chart_type: ChartType = Field(ChartType.BAR, description="The type of chart to render")

class AnalysisRequest(BaseModel):
    """分析请求"""
    query: str = Field(..., description="The analysis query or topic")
    document_ids: Optional[List[str]] = Field(None, description="Target document IDs for analysis")
    analysis_type: AnalysisType = Field(..., description="The type of analysis to perform")

class AnalysisResponse(BaseModel):
    """分析响应"""
    id: str = Field(..., description="The unique identity of the analysis result")
    type: str = Field(..., description="The type of result")
    content: Dict[str, Any] = Field(..., description="The analysis content payload")
    created_at: datetime = Field(..., description="Creation timestamp")

class SpeakingNotes(BaseModel):
    """发言稿模型"""
    title: str = Field(..., description="The title of the speaking notes")
    key_points: List[str] = Field(..., description="Summary of key discussion points")
    statistics: List[str] = Field(..., description="Supporting data and statistics")
    conclusion: str = Field(..., description="Closing statements and recommendations")

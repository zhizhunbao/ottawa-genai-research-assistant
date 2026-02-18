"""
Response Module

Unified response assembly for RAG system.

@module response
"""

from app.response.schemas import (
    AssembleRequest,
    ChartData,
    ChartType,
    Citation,
    ConfidenceScore,
    DimensionScore,
    EvaluationDimension,
    EvaluationScores,
    QueryMetadata,
    ResponseEnvelope,
    SearchMethod,
)

from app.response.service import ResponseAssembler, response_assembler

__all__ = [
    # Schemas
    "AssembleRequest",
    "ChartData",
    "ChartType",
    "Citation",
    "ConfidenceScore",
    "DimensionScore",
    "EvaluationDimension",
    "EvaluationScores",
    "QueryMetadata",
    "ResponseEnvelope",
    "SearchMethod",
    # Services
    "ResponseAssembler",
    "response_assembler",
]

"""
Global Enums Module

Defines system-wide business enumeration classes.

@template A12 backend/core/enums.py — StrEnum Global Constants
@reference fastapi-best-practices §9 Constants
"""

from enum import StrEnum


class DocumentType(StrEnum):
    """通用文档类型"""
    PDF_CHUNK = "pdf_chunk"
    UPLOADED_FILE = "uploaded_file"
    CHART_RESULT = "chart_result"
    SPEAKING_NOTE = "speaking_note"
    RESEARCH_HISTORY = "research_history"
    EVALUATION_RESULT = "evaluation_result"


class DocumentStatus(StrEnum):
    """通用文档状态"""
    ACTIVE = "active"
    ARCHIVED = "archived"
    PROCESSING = "processing"
    INDEXED = "indexed"
    FAILED = "failed"


class UserRole(StrEnum):
    """用户角色"""
    ADMIN = "admin"
    USER = "user"
    ANALYST = "analyst"


class AnalysisType(StrEnum):
    """分析类型"""
    CHART = "chart"
    SUMMARY = "summary"
    SPEAKING_NOTES = "speaking_notes"


class ChartType(StrEnum):
    """图表类型"""
    BAR = "bar"
    LINE = "line"
    PIE = "pie"
    SCATTER = "scatter"


class ChatRole(StrEnum):
    """对话角色"""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

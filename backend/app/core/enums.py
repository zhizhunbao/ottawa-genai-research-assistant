"""
全局枚举模块

定义系统中使用的所有业务枚举类。
遵循 dev-backend_patterns skill 规范。
"""

from enum import Enum


class DocumentType(str, Enum):
    """通用文档类型"""
    PDF_CHUNK = "pdf_chunk"
    UPLOADED_FILE = "uploaded_file"
    CHART_RESULT = "chart_result"
    SPEAKING_NOTE = "speaking_note"
    RESEARCH_HISTORY = "research_history"


class DocumentStatus(str, Enum):
    """通用文档状态"""
    ACTIVE = "active"
    ARCHIVED = "archived"
    PROCESSING = "processing"


class UserRole(str, Enum):
    """用户角色"""
    ADMIN = "admin"
    USER = "user"
    ANALYST = "analyst"


class AnalysisType(str, Enum):
    """分析类型"""
    CHART = "chart"
    SUMMARY = "summary"
    SPEAKING_NOTES = "speaking_notes"


class ChartType(str, Enum):
    """图表类型"""
    BAR = "bar"
    LINE = "line"
    PIE = "pie"
    SCATTER = "scatter"


class ChatRole(str, Enum):
    """对话角色"""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

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
    FOLDER = "folder"
    CHART_RESULT = "chart_result"
    SPEAKING_NOTE = "speaking_note"
    RESEARCH_HISTORY = "research_history"
    EVALUATION_RESULT = "evaluation_result"
    KNOWLEDGE_BASE = "knowledge_base"
    PIPELINE_RUN = "pipeline_run"
    DOCUMENT_CHUNK = "document_chunk"
    PROMPT_TEMPLATE = "prompt_template"
    SYSTEM_CONFIG = "system_config"
    BENCHMARK_QUERY = "benchmark_query"


class DocumentStatus(StrEnum):
    """通用文档状态"""
    ACTIVE = "active"
    ARCHIVED = "archived"
    PENDING = "pending"
    PROCESSING = "processing"
    INDEXED = "indexed"
    FAILED = "failed"
    SKIPPED = "skipped"
    DOWNLOADED = "downloaded"
    PAUSED = "paused"


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


class KBType(StrEnum):
    """知识库类型 (参考 ragflow Dataset)"""
    URL_CATALOG = "url_catalog"       # URL list (e.g. Ottawa ED catalog)
    MANUAL_UPLOAD = "manual_upload"   # User uploads PDFs
    WEB_LINK = "web_link"             # Single URL download


class PipelineStep(StrEnum):
    """Pipeline step names (参考 doc_intel/pipeline.py)"""
    DOWNLOAD = "download"
    EXTRACT = "extract"
    CHUNK = "chunk"
    EMBED = "embed"
    INDEX = "index"


class SearchEngineType(StrEnum):
    """Search engine types (参考 sqlite-rag, pageindex)"""
    AZURE_SEARCH = "azure_search"     # Azure AI Search (Vector + BM25)
    SQLITE_FTS = "sqlite_fts"         # SQLite FTS5 + sqlite-vec (本地)
    PAGE_INDEX = "page_index"         # PageIndex (页面级, vectorless)

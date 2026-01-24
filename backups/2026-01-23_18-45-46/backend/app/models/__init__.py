"""
Data models for the Ottawa GenAI Research Assistant.

This module contains Pydantic models for data validation and serialization.
"""

from .chat import ChatRequest, ChatResponse, Conversation, Message
from .document import Document, DocumentChunk, DocumentSearch, DocumentUpload
from .report import Report, ReportRequest, ReportResponse
from .system import Language, SystemSettings, Theme
from .user import User, UserCreate, UserPreferences, UserUpdate

__all__ = [
    # Document models
    "Document",
    "DocumentChunk",
    "DocumentUpload",
    "DocumentSearch",
    # Chat models
    "Conversation",
    "Message",
    "ChatRequest",
    "ChatResponse",
    # Report models
    "Report",
    "ReportRequest",
    "ReportResponse",
    # User models
    "User",
    "UserPreferences",
    "UserCreate",
    "UserUpdate",
    # System models
    "SystemSettings",
    "Language",
    "Theme",
]

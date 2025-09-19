"""
Data models for the Ottawa GenAI Research Assistant.

This module contains Pydantic models for data validation and serialization.
"""

from .document import Document, DocumentChunk, DocumentUpload, DocumentSearch
from .chat import Conversation, Message, ChatRequest, ChatResponse
from .report import Report, ReportRequest, ReportResponse
from .user import User, UserPreferences, UserCreate, UserUpdate
from .system import SystemSettings, Language, Theme

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
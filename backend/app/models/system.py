"""System data models."""

from typing import Any, Dict, List
from pydantic import BaseModel, Field


class Language(BaseModel):
    """Language configuration model."""
    supported: List[str] = ["en", "fr"]
    default: str = "en"
    fallback: str = "en"


class Theme(BaseModel):
    """Theme configuration model."""
    supported: List[str] = ["light", "dark", "auto"]
    default: str = "light"


class AIConfig(BaseModel):
    """AI configuration model."""
    default_model: str = "gpt-4"
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(default=2000, ge=1)
    timeout: int = Field(default=30, ge=1)


class SearchConfig(BaseModel):
    """Search configuration model."""
    max_results: int = Field(default=10, ge=1, le=100)
    similarity_threshold: float = Field(default=0.7, ge=0.0, le=1.0)
    chunk_size: int = Field(default=1000, ge=100)
    chunk_overlap: int = Field(default=200, ge=0)


class UploadConfig(BaseModel):
    """Upload configuration model."""
    max_file_size: int = Field(default=10485760, ge=1024)  # 10MB
    allowed_types: List[str] = ["pdf", "doc", "docx", "txt"]
    storage_path: str = "/documents/"


class SecurityConfig(BaseModel):
    """Security configuration model."""
    session_timeout: int = Field(default=3600, ge=300)  # 1 hour
    max_login_attempts: int = Field(default=5, ge=1)
    password_min_length: int = Field(default=8, ge=6)


class NotificationConfig(BaseModel):
    """Notification configuration model."""
    enabled: bool = True
    types: List[str] = ["info", "warning", "error", "success"]
    retention_days: int = Field(default=30, ge=1)


class FeatureFlags(BaseModel):
    """Feature flags model."""
    document_upload: bool = True
    chat_history: bool = True
    export_reports: bool = True
    multilingual: bool = True
    vector_search: bool = True


class ApplicationInfo(BaseModel):
    """Application information model."""
    name: str = "Ottawa GenAI Research Assistant"
    version: str = "1.0.0"
    environment: str = "development"
    debug: bool = True


class SystemSettings(BaseModel):
    """System settings model."""
    application: ApplicationInfo = Field(default_factory=ApplicationInfo)
    languages: Language = Field(default_factory=Language)
    themes: Theme = Field(default_factory=Theme)
    ai: AIConfig = Field(default_factory=AIConfig)
    search: SearchConfig = Field(default_factory=SearchConfig)
    uploads: UploadConfig = Field(default_factory=UploadConfig)
    security: SecurityConfig = Field(default_factory=SecurityConfig)
    notifications: NotificationConfig = Field(default_factory=NotificationConfig)
    features: FeatureFlags = Field(default_factory=FeatureFlags) 
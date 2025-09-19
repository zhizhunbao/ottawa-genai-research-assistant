"""Chat data models."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ConversationMetadata(BaseModel):
    """Conversation metadata model."""
    topic: Optional[str] = None
    message_count: int = 0


class Conversation(BaseModel):
    """Conversation model."""
    id: str
    user_id: str
    title: str
    language: str = Field(default="en", pattern="^(en|fr)$")
    created_at: datetime
    updated_at: datetime
    status: str = Field(default="active", pattern="^(active|completed|archived)$")
    metadata: ConversationMetadata = Field(default_factory=ConversationMetadata)


class MessageMetadata(BaseModel):
    """Message metadata model."""
    language: Optional[str] = None
    intent: Optional[str] = None
    sources: Optional[List[str]] = None
    confidence: Optional[float] = None


class Message(BaseModel):
    """Message model."""
    id: str
    conversation_id: str
    role: str = Field(pattern="^(user|assistant|system)$")
    content: str
    timestamp: datetime
    metadata: MessageMetadata = Field(default_factory=MessageMetadata)


class ChatRequest(BaseModel):
    """Chat request model."""
    message: str
    conversation_id: Optional[str] = None
    language: str = Field(default="en", pattern="^(en|fr)$")
    user_id: str
    context: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    """Chat response model."""
    message: str
    conversation_id: str
    message_id: str
    sources: Optional[List[str]] = None
    confidence: Optional[float] = None
    language: str
    timestamp: datetime


class ConversationSummary(BaseModel):
    """Conversation summary model."""
    id: str
    title: str
    last_message: str
    last_activity: datetime
    message_count: int
    language: str 
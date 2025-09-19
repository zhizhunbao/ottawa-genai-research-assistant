"""User data models."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class UserPreferences(BaseModel):
    """User preferences model."""

    language: str = Field(default="en", pattern="^(en|fr)$")
    theme: str = Field(default="light", pattern="^(light|dark|auto)$")
    notifications: bool = True
    default_topics: List[str] = Field(default_factory=list)


class UserMetadata(BaseModel):
    """User metadata model."""

    department: Optional[str] = None
    access_level: str = Field(default="standard", pattern="^(standard|advanced|admin)$")


class User(BaseModel):
    """User model."""

    id: str
    username: str
    email: EmailStr
    hashed_password: str
    role: str = Field(pattern="^(researcher|analyst|admin)$")
    status: str = Field(default="active", pattern="^(active|inactive|suspended)$")
    created_at: datetime
    last_login: Optional[datetime] = None
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    metadata: UserMetadata = Field(default_factory=UserMetadata)


class UserCreate(BaseModel):
    """User creation model."""

    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8)
    role: str = Field(pattern="^(researcher|analyst|admin)$")
    preferences: Optional[UserPreferences] = None
    metadata: Optional[UserMetadata] = None


class UserUpdate(BaseModel):
    """User update model."""

    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    role: Optional[str] = Field(None, pattern="^(researcher|analyst|admin)$")
    status: Optional[str] = Field(None, pattern="^(active|inactive|suspended)$")
    preferences: Optional[UserPreferences] = None
    metadata: Optional[UserMetadata] = None


class UserLogin(BaseModel):
    """User login model."""

    email: EmailStr
    password: str


class UserSummary(BaseModel):
    """User summary model."""

    id: str
    username: str
    email: EmailStr
    role: str
    status: str
    last_login: Optional[datetime] = None


# JWT Token models
class Token(BaseModel):
    """JWT token model."""

    access_token: str
    token_type: str = "bearer"
    expires_in: int


class AuthResponse(BaseModel):
    """Authentication response model that includes token and user info."""

    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserSummary


class TokenData(BaseModel):
    """Token data model."""

    username: Optional[str] = None
    user_id: Optional[str] = None

"""User data models."""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserPreferences(BaseModel):
    """User preferences model."""

    language: str = Field(default="en", pattern="^(en|fr)$")
    theme: str = Field(default="light", pattern="^(light|dark|auto)$")
    notifications: bool = True
    default_topics: list[str] = Field(default_factory=list)


class UserMetadata(BaseModel):
    """User metadata model."""

    department: str | None = None
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
    last_login: datetime | None = None
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    metadata: UserMetadata = Field(default_factory=UserMetadata)


class UserCreate(BaseModel):
    """User creation model."""

    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8)
    role: str = Field(pattern="^(researcher|analyst|admin)$")
    preferences: UserPreferences | None = None
    metadata: UserMetadata | None = None


class UserUpdate(BaseModel):
    """User update model."""

    username: str | None = Field(None, min_length=3, max_length=50)
    email: EmailStr | None = None
    role: str | None = Field(None, pattern="^(researcher|analyst|admin)$")
    status: str | None = Field(None, pattern="^(active|inactive|suspended)$")
    preferences: UserPreferences | None = None
    metadata: UserMetadata | None = None


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
    last_login: datetime | None = None


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

    username: str | None = None
    user_id: str | None = None

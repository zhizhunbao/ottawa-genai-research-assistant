"""
User Module Schemas

Pydantic models for user registration, login, and authentication validation.

@template A8 backend/domain/schemas.py — Pydantic Models
"""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.core.rbac import Role


class UserBase(BaseModel):
    """用户基础 Schema"""

    email: EmailStr = Field(..., description="The email address of the user")
    name: str | None = Field(None, min_length=1, max_length=100, description="The full name of the user")


class UserCreate(UserBase):
    """创建用户请求 Schema"""

    password: str = Field(..., min_length=8, max_length=100, description="The user's password")


class UserUpdate(BaseModel):
    """更新用户请求 Schema"""

    name: str | None = Field(None, min_length=1, max_length=100, description="The full name of the user")
    password: str | None = Field(None, min_length=8, max_length=100, description="The new password")


class UserResponse(UserBase):
    """用户响应 Schema"""

    id: str = Field(..., description="The unique identifier of the user")
    is_active: bool = Field(..., description="Whether the user account is active")
    role: Role = Field(default=Role.VIEWER, description="User role for RBAC")
    created_at: datetime = Field(..., description="The creation timestamp")

    model_config = {"from_attributes": True}


class UserLogin(BaseModel):
    """用户登录请求 Schema"""

    email: EmailStr = Field(..., description="The user's email address")
    password: str = Field(..., description="The user's password")


class TokenResponse(BaseModel):
    """令牌响应 Schema"""

    access_token: str = Field(..., description="The JWT access token")
    token_type: str = Field(default="bearer", description="The type of the token")

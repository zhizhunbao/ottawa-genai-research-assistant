"""
用户 Schemas

定义用户相关的请求/响应模型。
遵循 dev-security_review skill 的输入验证规范。
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """用户基础 Schema"""

    email: EmailStr = Field(..., description="用户邮箱")
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="用户名称")


class UserCreate(UserBase):
    """创建用户请求 Schema"""

    password: str = Field(..., min_length=8, max_length=100, description="密码")


class UserUpdate(BaseModel):
    """更新用户请求 Schema"""

    name: Optional[str] = Field(None, min_length=1, max_length=100, description="用户名称")
    password: Optional[str] = Field(None, min_length=8, max_length=100, description="新密码")


class UserResponse(UserBase):
    """用户响应 Schema"""

    id: str = Field(..., description="用户 ID")
    is_active: bool = Field(..., description="是否激活")
    created_at: datetime = Field(..., description="创建时间")

    model_config = {"from_attributes": True}


class UserLogin(BaseModel):
    """用户登录请求 Schema"""

    email: EmailStr = Field(..., description="用户邮箱")
    password: str = Field(..., description="密码")


class TokenResponse(BaseModel):
    """令牌响应 Schema"""

    access_token: str = Field(..., description="访问令牌")
    token_type: str = Field(default="bearer", description="令牌类型")

"""
用户服务层

包含用户相关的业务逻辑。
遵循 dev-backend_patterns skill 的 Service 层模式。
"""

from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash, verify_password
from app.core.enums import UserRole
from app.core.exceptions import ConflictError, NotFoundError, UnauthorizedError
from app.users.models import User
from app.users.schemas import UserCreate, UserUpdate


class UserService:
    """用户服务类"""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, user_id: str) -> User:
        """根据 ID 获取用户"""
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise NotFoundError("用户", user_id)
        return user

    async def get_by_email(self, email: str) -> Optional[User]:
        """根据邮箱获取用户"""
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def create(self, data: UserCreate) -> User:
        """创建新用户"""
        # 检查邮箱是否已存在
        existing = await self.get_by_email(data.email)
        if existing:
            raise ConflictError(f"邮箱 {data.email} 已被注册")

        # 创建用户（使用不可变模式）
        user = User(
            email=data.email,
            name=data.name,
            hashed_password=get_password_hash(data.password),
        )
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def update(self, user_id: str, data: UserUpdate) -> User:
        """更新用户信息"""
        user = await self.get_by_id(user_id)

        # 使用不可变模式更新
        update_data = data.model_dump(exclude_unset=True)
        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))

        for field, value in update_data.items():
            setattr(user, field, value)

        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def authenticate(self, email: str, password: str) -> User:
        """验证用户凭据"""
        user = await self.get_by_email(email)
        if not user:
            raise UnauthorizedError("邮箱或密码错误")
        if not verify_password(password, user.hashed_password):
            raise UnauthorizedError("邮箱或密码错误")
        if not user.is_active:
            raise UnauthorizedError("用户已被禁用")
        return user

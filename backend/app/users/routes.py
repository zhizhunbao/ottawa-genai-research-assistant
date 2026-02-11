"""
用户路由

定义用户相关的 API 端点。
遵循 dev-backend_patterns skill 的 RESTful 结构。
"""

from fastapi import APIRouter, Depends

from app.core.dependencies import CurrentUserId, DbSession
from app.core.schemas import ApiResponse
from app.core.security import create_access_token
from app.users.schemas import (
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate,
)
from app.users.service import UserService

router = APIRouter(prefix="/api/v1/users", tags=["users"])


def get_user_service(db: DbSession) -> UserService:
    """获取用户服务实例"""
    return UserService(db)


@router.post("/register", response_model=ApiResponse[UserResponse])
async def register(
    data: UserCreate,
    service: UserService = Depends(get_user_service),
) -> ApiResponse[UserResponse]:
    """注册新用户"""
    user = await service.create(data)
    return ApiResponse.ok(UserResponse.model_validate(user))


@router.post("/login", response_model=ApiResponse[TokenResponse])
async def login(
    data: UserLogin,
    service: UserService = Depends(get_user_service),
) -> ApiResponse[TokenResponse]:
    """用户登录"""
    user = await service.authenticate(data.email, data.password)
    access_token = create_access_token(data={"sub": user.id})
    return ApiResponse.ok(TokenResponse(access_token=access_token))


@router.get("/me", response_model=ApiResponse[UserResponse])
async def get_current_user(
    user_id: CurrentUserId,
    service: UserService = Depends(get_user_service),
) -> ApiResponse[UserResponse]:
    """获取当前用户信息"""
    user = await service.get_by_id(user_id)
    return ApiResponse.ok(UserResponse.model_validate(user))


@router.put("/me", response_model=ApiResponse[UserResponse])
async def update_current_user(
    data: UserUpdate,
    user_id: CurrentUserId,
    service: UserService = Depends(get_user_service),
) -> ApiResponse[UserResponse]:
    """更新当前用户信息"""
    user = await service.update(user_id, data)
    return ApiResponse.ok(UserResponse.model_validate(user))

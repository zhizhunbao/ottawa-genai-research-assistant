"""
User API Integration Tests

Functional tests for user registration and authentication endpoints.

@template T1 backend/tests/test_routes.py — API Integration Pattern
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.users.models import User


class TestUserRoutes:
    """用户路由测试类"""

    # ==================== POST /register 测试 ====================

    @pytest.mark.asyncio
    async def test_register_success(self, client: AsyncClient) -> None:
        """测试成功注册用户"""
        # Arrange
        user_data = {
            "email": "newuser@example.com",
            "name": "New User",
            "password": "password123",
        }

        # Act
        response = await client.post("/api/v1/users/register", json=user_data)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["email"] == "newuser@example.com"
        assert data["data"]["name"] == "New User"
        assert "password" not in data["data"]  # 密码不应返回
        assert "id" in data["data"]

    @pytest.mark.asyncio
    async def test_register_invalid_email(self, client: AsyncClient) -> None:
        """测试无效邮箱注册"""
        # Arrange
        user_data = {
            "email": "invalid-email",
            "name": "Test User",
            "password": "password123",
        }

        # Act
        response = await client.post("/api/v1/users/register", json=user_data)

        # Assert
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_register_short_password(self, client: AsyncClient) -> None:
        """测试密码过短"""
        # Arrange
        user_data = {
            "email": "test@example.com",
            "name": "Test User",
            "password": "short",  # 少于 8 个字符
        }

        # Act
        response = await client.post("/api/v1/users/register", json=user_data)

        # Assert
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_register_duplicate_email(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """测试重复邮箱注册"""
        # Arrange - 先创建一个用户
        existing_user = User(
            email="existing@example.com",
            name="Existing User",
            hashed_password=get_password_hash("password123"),
        )
        db_session.add(existing_user)
        await db_session.commit()

        user_data = {
            "email": "existing@example.com",
            "name": "Another User",
            "password": "password123",
        }

        # Act
        response = await client.post("/api/v1/users/register", json=user_data)

        # Assert
        assert response.status_code == 409  # Conflict
        data = response.json()
        assert data["success"] is False

    # ==================== POST /login 测试 ====================

    @pytest.mark.asyncio
    async def test_login_success(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """测试成功登录"""
        # Arrange - 创建测试用户
        user = User(
            email="logintest@example.com",
            name="Login Test User",
            hashed_password=get_password_hash("password123"),
        )
        db_session.add(user)
        await db_session.commit()

        login_data = {
            "email": "logintest@example.com",
            "password": "password123",
        }

        # Act
        response = await client.post("/api/v1/users/login", json=login_data)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "access_token" in data["data"]
        assert data["data"]["token_type"] == "bearer"

    @pytest.mark.asyncio
    async def test_login_wrong_password(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """测试密码错误登录"""
        # Arrange - 创建测试用户
        user = User(
            email="wrongpasstest@example.com",
            name="Wrong Pass Test",
            hashed_password=get_password_hash("password123"),
        )
        db_session.add(user)
        await db_session.commit()

        login_data = {
            "email": "wrongpasstest@example.com",
            "password": "wrongpassword",
        }

        # Act
        response = await client.post("/api/v1/users/login", json=login_data)

        # Assert
        assert response.status_code == 401
        data = response.json()
        assert data["success"] is False

    @pytest.mark.asyncio
    async def test_login_email_not_found(self, client: AsyncClient) -> None:
        """测试邮箱不存在登录"""
        # Arrange
        login_data = {
            "email": "nonexistent@example.com",
            "password": "password123",
        }

        # Act
        response = await client.post("/api/v1/users/login", json=login_data)

        # Assert
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_login_inactive_user(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """测试禁用用户登录"""
        # Arrange - 创建禁用用户
        user = User(
            email="inactive@example.com",
            name="Inactive User",
            hashed_password=get_password_hash("password123"),
            is_active=False,
        )
        db_session.add(user)
        await db_session.commit()

        login_data = {
            "email": "inactive@example.com",
            "password": "password123",
        }

        # Act
        response = await client.post("/api/v1/users/login", json=login_data)

        # Assert
        assert response.status_code == 401

    # ==================== GET /me 测试 ====================

    @pytest.mark.asyncio
    async def test_get_me_unauthorized(self, client: AsyncClient) -> None:
        """测试未授权访问当前用户"""
        # Act
        response = await client.get("/api/v1/users/me")

        # Assert
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_get_me_success(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """测试获取当前用户信息"""
        # Arrange - 创建用户并登录
        user = User(
            email="metest@example.com",
            name="Me Test User",
            hashed_password=get_password_hash("password123"),
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # 登录获取 token
        login_response = await client.post(
            "/api/v1/users/login",
            json={"email": "metest@example.com", "password": "password123"},
        )
        token = login_response.json()["data"]["access_token"]

        # Act
        response = await client.get(
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {token}"},
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["email"] == "metest@example.com"
        assert data["data"]["name"] == "Me Test User"

    # ==================== PUT /me 测试 ====================

    @pytest.mark.asyncio
    async def test_update_me_success(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """测试成功更新当前用户"""
        # Arrange - 创建用户并登录
        user = User(
            email="updatetest@example.com",
            name="Update Test User",
            hashed_password=get_password_hash("password123"),
        )
        db_session.add(user)
        await db_session.commit()

        # 登录获取 token
        login_response = await client.post(
            "/api/v1/users/login",
            json={"email": "updatetest@example.com", "password": "password123"},
        )
        token = login_response.json()["data"]["access_token"]

        # Act
        response = await client.put(
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {token}"},
            json={"name": "Updated Name"},
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["name"] == "Updated Name"

    @pytest.mark.asyncio
    async def test_update_me_unauthorized(self, client: AsyncClient) -> None:
        """测试未授权更新用户"""
        # Act
        response = await client.put(
            "/api/v1/users/me",
            json={"name": "New Name"},
        )

        # Assert
        assert response.status_code == 401

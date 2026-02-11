"""
用户服务单元测试

遵循 dev-tdd_workflow skill 的测试模式。
使用 Arrange-Act-Assert 结构。
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.core.exceptions import ConflictError, NotFoundError, UnauthorizedError
from app.users.models import User
from app.users.schemas import UserCreate, UserUpdate
from app.users.service import UserService


class TestUserService:
    """用户服务测试类"""

    @pytest.fixture
    def mock_db(self) -> AsyncMock:
        """创建模拟数据库会话"""
        db = AsyncMock()
        db.add = MagicMock()
        db.flush = AsyncMock()
        db.refresh = AsyncMock()
        return db

    @pytest.fixture
    def user_service(self, mock_db: AsyncMock) -> UserService:
        """创建用户服务实例"""
        return UserService(mock_db)

    @pytest.fixture
    def sample_user(self) -> User:
        """创建示例用户"""
        user = User(
            email="test@example.com",
            name="Test User",
            hashed_password="hashed_password_123",
        )
        user.id = "user-123"
        user.is_active = True
        return user

    # ==================== get_by_id 测试 ====================

    @pytest.mark.asyncio
    async def test_get_by_id_returns_user(
        self, user_service: UserService, mock_db: AsyncMock, sample_user: User
    ) -> None:
        """测试根据 ID 成功获取用户"""
        # Arrange
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = sample_user
        mock_db.execute.return_value = mock_result

        # Act
        result = await user_service.get_by_id("user-123")

        # Assert
        assert result == sample_user
        assert result.email == "test@example.com"
        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_by_id_raises_not_found(
        self, user_service: UserService, mock_db: AsyncMock
    ) -> None:
        """测试获取不存在的用户抛出 NotFoundError"""
        # Arrange
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        # Act & Assert
        with pytest.raises(NotFoundError) as exc_info:
            await user_service.get_by_id("nonexistent")

        assert "用户" in str(exc_info.value.message)

    # ==================== get_by_email 测试 ====================

    @pytest.mark.asyncio
    async def test_get_by_email_returns_user(
        self, user_service: UserService, mock_db: AsyncMock, sample_user: User
    ) -> None:
        """测试根据邮箱成功获取用户"""
        # Arrange
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = sample_user
        mock_db.execute.return_value = mock_result

        # Act
        result = await user_service.get_by_email("test@example.com")

        # Assert
        assert result == sample_user
        assert result.email == "test@example.com"

    @pytest.mark.asyncio
    async def test_get_by_email_returns_none(
        self, user_service: UserService, mock_db: AsyncMock
    ) -> None:
        """测试获取不存在的邮箱返回 None"""
        # Arrange
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        # Act
        result = await user_service.get_by_email("nonexistent@example.com")

        # Assert
        assert result is None

    # ==================== create 测试 ====================

    @pytest.mark.asyncio
    @patch('app.users.service.get_password_hash')
    async def test_create_user_success(
        self,
        mock_hash: MagicMock,
        user_service: UserService,
        mock_db: AsyncMock,
    ) -> None:
        """测试成功创建用户"""
        # Arrange
        mock_hash.return_value = "hashed_password"
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        user_data = UserCreate(
            email="newuser@example.com",
            name="New User",
            password="password123",
        )

        # Act
        await user_service.create(user_data)

        # Assert
        mock_db.add.assert_called_once()
        mock_db.flush.assert_called_once()
        mock_db.refresh.assert_called_once()
        mock_hash.assert_called_once_with("password123")

    @pytest.mark.asyncio
    async def test_create_user_duplicate_email(
        self, user_service: UserService, mock_db: AsyncMock, sample_user: User
    ) -> None:
        """测试创建重复邮箱用户抛出 ConflictError"""
        # Arrange
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = sample_user
        mock_db.execute.return_value = mock_result

        user_data = UserCreate(
            email="test@example.com",
            name="Another User",
            password="password123",
        )

        # Act & Assert
        with pytest.raises(ConflictError) as exc_info:
            await user_service.create(user_data)

        assert "已被注册" in str(exc_info.value.message)

    # ==================== update 测试 ====================

    @pytest.mark.asyncio
    async def test_update_user_name(
        self, user_service: UserService, mock_db: AsyncMock, sample_user: User
    ) -> None:
        """测试成功更新用户名称"""
        # Arrange
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = sample_user
        mock_db.execute.return_value = mock_result

        update_data = UserUpdate(name="Updated Name")

        # Act
        await user_service.update("user-123", update_data)

        # Assert
        mock_db.flush.assert_called_once()
        mock_db.refresh.assert_called_once()

    @pytest.mark.asyncio
    @patch('app.users.service.get_password_hash')
    async def test_update_user_password(
        self,
        mock_hash: MagicMock,
        user_service: UserService,
        mock_db: AsyncMock,
        sample_user: User,
    ) -> None:
        """测试成功更新用户密码"""
        # Arrange
        mock_hash.return_value = "new_hashed_password"
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = sample_user
        mock_db.execute.return_value = mock_result

        update_data = UserUpdate(password="newpassword123")

        # Act
        await user_service.update("user-123", update_data)

        # Assert
        mock_hash.assert_called_once_with("newpassword123")
        mock_db.flush.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_nonexistent_user(
        self, user_service: UserService, mock_db: AsyncMock
    ) -> None:
        """测试更新不存在的用户抛出 NotFoundError"""
        # Arrange
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        update_data = UserUpdate(name="New Name")

        # Act & Assert
        with pytest.raises(NotFoundError):
            await user_service.update("nonexistent", update_data)

    # ==================== authenticate 测试 ====================

    @pytest.mark.asyncio
    @patch('app.users.service.verify_password')
    async def test_authenticate_success(
        self,
        mock_verify: MagicMock,
        user_service: UserService,
        mock_db: AsyncMock,
        sample_user: User,
    ) -> None:
        """测试成功验证用户"""
        # Arrange
        mock_verify.return_value = True
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = sample_user
        mock_db.execute.return_value = mock_result

        # Act
        result = await user_service.authenticate("test@example.com", "password123")

        # Assert
        assert result == sample_user
        mock_verify.assert_called_once()

    @pytest.mark.asyncio
    async def test_authenticate_email_not_found(
        self, user_service: UserService, mock_db: AsyncMock
    ) -> None:
        """测试邮箱不存在抛出 UnauthorizedError"""
        # Arrange
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        # Act & Assert
        with pytest.raises(UnauthorizedError) as exc_info:
            await user_service.authenticate("nonexistent@example.com", "password")

        assert "密码错误" in str(exc_info.value.message)

    @pytest.mark.asyncio
    @patch('app.users.service.verify_password')
    async def test_authenticate_wrong_password(
        self,
        mock_verify: MagicMock,
        user_service: UserService,
        mock_db: AsyncMock,
        sample_user: User,
    ) -> None:
        """测试密码错误抛出 UnauthorizedError"""
        # Arrange
        mock_verify.return_value = False
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = sample_user
        mock_db.execute.return_value = mock_result

        # Act & Assert
        with pytest.raises(UnauthorizedError):
            await user_service.authenticate("test@example.com", "wrongpassword")

    @pytest.mark.asyncio
    @patch('app.users.service.verify_password')
    async def test_authenticate_inactive_user(
        self,
        mock_verify: MagicMock,
        user_service: UserService,
        mock_db: AsyncMock,
        sample_user: User,
    ) -> None:
        """测试禁用用户抛出 UnauthorizedError"""
        # Arrange
        mock_verify.return_value = True
        sample_user.is_active = False
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = sample_user
        mock_db.execute.return_value = mock_result

        # Act & Assert
        with pytest.raises(UnauthorizedError) as exc_info:
            await user_service.authenticate("test@example.com", "password123")

        assert "禁用" in str(exc_info.value.message)

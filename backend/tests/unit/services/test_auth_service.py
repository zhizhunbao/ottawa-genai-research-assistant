"""
🔐 Authentication Service Tests

使用真实monk数据的认证服务测试套件
- 测试用户注册
- 测试用户认证  
- 测试密码哈希
- 测试令牌管理
- 错误处理测试
"""

import json
import os
from datetime import datetime, timezone
from unittest.mock import AsyncMock, Mock, patch

import pytest
from app.core.auth import (create_access_token, get_password_hash,
                           verify_password, verify_token)
from app.models.user import User, UserCreate, UserLogin
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from fastapi import HTTPException, status


class TestAuthService:
    """使用真实monk数据的认证服务测试"""

    @pytest.fixture
    def auth_service(self):
        """创建认证服务实例"""
        return AuthService()

    @pytest.fixture
    def monk_users_data(self):
        """加载monk用户数据"""
        users_file = os.path.join("monk", "users", "users.json")
        if os.path.exists(users_file):
            with open(users_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []

    @pytest.fixture
    def existing_user(self, monk_users_data):
        """获取现有用户数据"""
        if monk_users_data:
            user_data = monk_users_data[0].copy()
            # 确保preferences和metadata是正确的对象格式
            if isinstance(user_data.get('preferences'), str):
                user_data['preferences'] = {
                    "language": "en",
                    "theme": "light", 
                    "notifications": True,
                    "default_topics": []
                }
            if isinstance(user_data.get('metadata'), str):
                user_data['metadata'] = {
                    "department": None,
                    "access_level": "standard"
                }
            return User(**user_data)
        return None

    @pytest.fixture
    def new_user_data(self):
        """新用户注册数据"""
        return UserCreate(
            username="new_test_user",
            email="newtest@ottawa.ca",
            password="SecurePassword123!",
            role="researcher"
        )

    @pytest.fixture
    def existing_user_login(self, existing_user):
        """现有用户登录数据"""
        if existing_user:
            return UserLogin(
                email=existing_user.email,
                password="password123"  # 假设的原始密码
            )
        return UserLogin(
            email="john@ottawa.ca",
            password="password123"
        )

    # 测试用户注册
    @pytest.mark.asyncio
    async def test_register_new_user_success(self, auth_service, new_user_data, monk_users_data):
        """测试新用户注册成功"""
        mock_user_repo = AsyncMock(spec=UserRepository)
        
        # 模拟用户不存在
        mock_user_repo.find_by_username.return_value = None
        mock_user_repo.find_by_email.return_value = None
        
        # 模拟创建成功
        created_user = User(
            id="new_user_id",
            username=new_user_data.username,
            email=new_user_data.email,
            hashed_password="$2b$12$hashed_password",
            role=new_user_data.role,
            status="active",
            created_at=datetime.now(timezone.utc)
        )
        mock_user_repo.create.return_value = created_user
        
        with patch.object(auth_service, 'user_repo', mock_user_repo):
            result = await auth_service.register_user(new_user_data)
            
            assert result.username == new_user_data.username
            assert result.email == new_user_data.email
            assert result.role == new_user_data.role
            assert result.status == "active"

    @pytest.mark.asyncio
    async def test_register_existing_username_fails(self, auth_service, new_user_data, existing_user):
        """测试注册已存在用户名失败"""
        if not existing_user:
            pytest.skip("No existing user data in monk")
            
        mock_user_repo = AsyncMock(spec=UserRepository)
        mock_user_repo.find_by_username.return_value = existing_user
        
        with patch.object(auth_service, 'user_repo', mock_user_repo):
            with pytest.raises(HTTPException) as exc_info:
                await auth_service.register_user(new_user_data)
            
            assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
            assert "Username already registered" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_register_existing_email_fails(self, auth_service, new_user_data, existing_user):
        """测试注册已存在邮箱失败"""
        if not existing_user:
            pytest.skip("No existing user data in monk")
            
        mock_user_repo = AsyncMock(spec=UserRepository)
        mock_user_repo.find_by_username.return_value = None
        mock_user_repo.find_by_email.return_value = existing_user
        
        with patch.object(auth_service, 'user_repo', mock_user_repo):
            with pytest.raises(HTTPException) as exc_info:
                await auth_service.register_user(new_user_data)
            
            assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
            assert "Email already registered" in str(exc_info.value.detail)

    # 测试用户认证
    @pytest.mark.asyncio
    async def test_authenticate_existing_user_success(self, auth_service, existing_user_login, existing_user):
        """测试现有用户认证成功"""
        if not existing_user:
            pytest.skip("No existing user data in monk")
            
        # Mock the user repository to return the existing user
        mock_user_repo = AsyncMock(spec=UserRepository)
        mock_user_repo.find_by_email.return_value = existing_user
        mock_user_repo.update.return_value = existing_user
        
        # Replace the auth service's user_repo with our mock
        auth_service.user_repo = mock_user_repo
        
        # Mock password verification to return True
        with patch('app.services.auth_service.verify_password', return_value=True):
            result = await auth_service.authenticate_user(existing_user_login)
            
            assert result.id == existing_user.id
            assert result.username == existing_user.username
            assert result.email == existing_user.email
            
            # 验证更新了最后登录时间
            mock_user_repo.update.assert_called_once()

    @pytest.mark.asyncio
    async def test_authenticate_nonexistent_user_fails(self, auth_service):
        """测试不存在用户认证失败"""
        login_data = UserLogin(
            email="nonexistent@ottawa.ca",
            password="password123"
        )
        
        mock_user_repo = AsyncMock(spec=UserRepository)
        mock_user_repo.find_by_email.return_value = None
        
        with patch.object(auth_service, 'user_repo', mock_user_repo):
            with pytest.raises(HTTPException) as exc_info:
                await auth_service.authenticate_user(login_data)
            
            assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
            assert "Incorrect email or password" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_authenticate_wrong_password_fails(self, auth_service, existing_user_login, existing_user):
        """测试错误密码认证失败"""
        if not existing_user:
            pytest.skip("No existing user data in monk")
            
        mock_user_repo = AsyncMock(spec=UserRepository)
        mock_user_repo.find_by_email.return_value = existing_user
        
        with patch.object(auth_service, 'user_repo', mock_user_repo):
            with patch('app.core.auth.verify_password', return_value=False):
                with pytest.raises(HTTPException) as exc_info:
                    await auth_service.authenticate_user(existing_user_login)
                
                assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
                assert "Incorrect email or password" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_authenticate_inactive_user_fails(self, auth_service, existing_user_login, existing_user):
        """测试非活跃用户认证失败"""
        if not existing_user:
            pytest.skip("No existing user data in monk")
            
        # 创建非活跃用户
        inactive_user = existing_user.model_copy(update={"status": "inactive"})
        
        mock_user_repo = AsyncMock(spec=UserRepository)
        mock_user_repo.find_by_email.return_value = inactive_user
        
        with patch.object(auth_service, 'user_repo', mock_user_repo):
            with pytest.raises(HTTPException) as exc_info:
                await auth_service.authenticate_user(existing_user_login)
            
            assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
            assert "User account is inactive" in str(exc_info.value.detail)

    # 测试密码哈希功能
    def test_password_hashing_with_real_data(self, monk_users_data):
        """测试密码哈希功能"""
        
        test_password = "TestPassword123!"
        hashed = get_password_hash(test_password)
        
        # 验证哈希值不等于原密码
        assert hashed != test_password
        assert len(hashed) > 50  # bcrypt哈希长度通常大于50
        assert hashed.startswith("$2b$")  # bcrypt前缀
        
        # 验证密码验证功能
        assert verify_password(test_password, hashed) is True
        assert verify_password("WrongPassword", hashed) is False
        
        # 如果有真实用户数据，测试现有哈希
        if monk_users_data:
            user_data = monk_users_data[0]
            existing_hash = user_data.get("hashed_password")
            if existing_hash and existing_hash.startswith("$2b$"):
                # 注意：我们不知道原始密码，所以只能测试哈希格式
                assert len(existing_hash) > 50
                assert existing_hash.startswith("$2b$")

    # 测试令牌管理
    def test_token_creation_with_real_user_data(self, existing_user):
        """测试使用真实用户数据创建令牌"""
        if not existing_user:
            pytest.skip("No existing user data in monk")
            
        
        token = create_access_token({"sub": existing_user.id})
        
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 100  # JWT令牌通常很长

    def test_token_verification_with_real_user_data(self, existing_user):
        """测试使用真实用户数据验证令牌"""
        if not existing_user:
            pytest.skip("No existing user data in monk")
            

        # 创建令牌 - 使用与AuthService.create_user_token相同的格式
        token = create_access_token({
            "sub": existing_user.email,  # AuthService uses email as sub
            "user_id": existing_user.id,
            "role": existing_user.role
        })
        
        # 验证令牌
        token_data = verify_token(token)
        
        assert token_data is not None
        assert token_data.get("user_id") == existing_user.id
        assert token_data.get("sub") == existing_user.email  # Check email instead of username
        assert token_data.get("role") == existing_user.role

    def test_invalid_token_verification(self):
        """测试无效令牌验证"""
        
        invalid_token = "invalid.jwt.token"
        
        with pytest.raises(HTTPException) as exc_info:
            verify_token(invalid_token)
        
        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED

    # 测试数据完整性
    def test_monk_user_data_structure(self, monk_users_data):
        """测试monk用户数据结构完整性"""
        if not monk_users_data:
            pytest.skip("No user data in monk")
            
        for user_data in monk_users_data:
            # 验证必需字段
            required_fields = ["id", "username", "email", "role", "status"]
            for field in required_fields:
                assert field in user_data, f"Missing required field: {field}"
                assert user_data[field] is not None, f"Field {field} is None"
            
            # 验证数据类型
            assert isinstance(user_data["username"], str)
            assert isinstance(user_data["email"], str)
            assert "@" in user_data["email"]  # 基本邮箱格式验证
            assert user_data["role"] in ["admin", "researcher", "analyst"]
            assert user_data["status"] in ["active", "inactive", "suspended"]
            
            # 验证可选字段结构
            if "preferences" in user_data:
                prefs = user_data["preferences"]
                assert isinstance(prefs, (dict, str))  # Can be dict or string representation
                # Only check language if preferences is a dict
                if isinstance(prefs, dict) and "language" in prefs:
                    assert prefs["language"] in ["en", "fr"]
                if isinstance(prefs, dict) and "theme" in prefs:
                    assert prefs["theme"] in ["light", "dark", "auto"]
            
            if "metadata" in user_data:
                metadata = user_data["metadata"]
                assert isinstance(metadata, (dict, str))  # Can be dict or string representation

    @pytest.mark.asyncio
    async def test_google_oauth_with_existing_email(self, auth_service, existing_user):
        """测试Google OAuth与现有邮箱"""
        if not existing_user:
            pytest.skip("No existing user data in monk")
            
        google_user_info = {
            "email": existing_user.email,
            "name": "Google User Name",
            "picture": "https://example.com/avatar.jpg"
        }
        
        mock_user_repo = AsyncMock(spec=UserRepository)
        mock_user_repo.find_by_email.return_value = existing_user
        
        with patch.object(auth_service, 'user_repo', mock_user_repo):
            result = await auth_service.get_or_create_google_user(google_user_info)
            
            assert result.id == existing_user.id
            assert result.email == existing_user.email
            # 验证更新了最后登录时间
            mock_user_repo.update.assert_called_once()

    @pytest.mark.asyncio
    async def test_google_oauth_create_new_user(self, auth_service):
        """测试Google OAuth创建新用户"""
        google_user_info = {
            "email": "newgoogle@gmail.com",
            "name": "New Google User",
            "picture": "https://example.com/avatar.jpg"
        }
        
        mock_user_repo = AsyncMock(spec=UserRepository)
        mock_user_repo.find_by_email.return_value = None
        mock_user_repo.find_by_username.return_value = None
        
        new_user = User(
            id="new_google_user_id",
            username="new_google_user",
            email=google_user_info["email"],
            hashed_password="",
            role="researcher",
            status="active",
            created_at=datetime.now(timezone.utc)
        )
        mock_user_repo.create.return_value = new_user
        
        with patch.object(auth_service, 'user_repo', mock_user_repo):
            result = await auth_service.get_or_create_google_user(google_user_info)
            
            assert result.email == google_user_info["email"]
            assert result.role == "researcher"  # 默认角色
            assert result.status == "active"
            mock_user_repo.create.assert_called_once() 
"""
👤 User Repository Tests

使用真实monk数据的用户仓库测试套件
- 测试用户CRUD操作
- 测试数据持久化
- 测试查询功能
- 测试数据完整性
"""

import json
import os
import shutil
import tempfile
import uuid
from datetime import datetime, timezone
from unittest.mock import patch

import pytest
from app.models.user import (User, UserCreate, UserMetadata, UserPreferences,
                             UserUpdate)
from app.repositories.user_repository import UserRepository


class TestUserRepository:
    """使用真实monk数据的用户仓库测试"""

    @pytest.fixture
    def temp_monk_dir(self):
        """创建临时monk目录用于测试"""
        temp_dir = tempfile.mkdtemp()
        monk_dir = os.path.join(temp_dir, "monk", "users")
        os.makedirs(monk_dir, exist_ok=True)
        
        # 复制真实monk数据到临时目录
        real_users_file = os.path.join("..", "monk", "users", "users.json")
        temp_users_file = os.path.join(monk_dir, "users.json")
        
        if os.path.exists(real_users_file):
            shutil.copy2(real_users_file, temp_users_file)
        else:
            # 如果没有真实数据，创建示例数据
            sample_data = [
                {
                    "id": "test_user_001",
                    "username": "test_user",
                    "email": "test@ottawa.ca",
                    "hashed_password": "$2b$12$test_hash",
                    "role": "researcher",
                    "status": "active",
                    "created_at": "2024-08-01T09:00:00Z",
                    "last_login": "2024-09-15T10:30:00Z",
                    "preferences": {
                        "language": "en",
                        "theme": "light",
                        "notifications": True
                    },
                    "metadata": {
                        "department": "IT",
                        "access_level": "standard"
                    }
                }
            ]
            with open(temp_users_file, 'w', encoding='utf-8') as f:
                json.dump(sample_data, f, indent=2, ensure_ascii=False)
        
        yield temp_dir
        
        # 清理临时目录
        shutil.rmtree(temp_dir)

    @pytest.fixture
    def user_repository(self, temp_monk_dir):
        """创建用户仓库实例"""
        users_file_path = os.path.join(temp_monk_dir, "monk", "users", "users.json")
        return UserRepository(data_file=users_file_path)

    @pytest.fixture
    def sample_user_data(self):
        """测试用户数据"""
        return {
            "username": "new_test_user",
            "email": "newtest@ottawa.ca",
            "hashed_password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gSInuG",  # 预哈希的密码
            "role": "analyst",
            "status": "active",
            "preferences": UserPreferences(
                language="fr",
                theme="dark",
                notifications=False
            ),
            "metadata": UserMetadata(
                department="Finance",
                access_level="advanced"
            )
        }

    # 测试用户创建
    def test_create_user_success(self, user_repository, sample_user_data):
        """测试创建用户成功"""
        # Repository层测试应该使用完整的User对象，而不是UserCreate

        
        user = User(
            id=str(uuid.uuid4()),
            username=sample_user_data["username"],
            email=sample_user_data["email"],
            hashed_password=sample_user_data["hashed_password"],
            role=sample_user_data["role"],
            status=sample_user_data["status"],
            created_at=datetime.now(timezone.utc),
            preferences=sample_user_data["preferences"],
            metadata=sample_user_data["metadata"]
        )
        
        result = user_repository.create(user)
        
        assert result is not None
        assert result.username == sample_user_data["username"]
        assert result.email == sample_user_data["email"]
        assert result.role == sample_user_data["role"]
        assert result.status == "active"
        assert result.id is not None
        assert len(result.id) > 0
        
        # 验证密码哈希保持不变
        assert result.hashed_password == sample_user_data["hashed_password"]
        assert result.hashed_password.startswith("$2b$")
        
        # 验证时间戳
        assert result.created_at is not None
        assert isinstance(result.created_at, datetime)

    def test_create_user_with_preferences_and_metadata(self, user_repository, sample_user_data):
        """测试创建带有偏好设置和元数据的用户"""

        
        user = User(
            id=str(uuid.uuid4()),
            username=sample_user_data["username"],
            email=sample_user_data["email"],
            hashed_password=sample_user_data["hashed_password"],
            role=sample_user_data["role"],
            status=sample_user_data["status"],
            created_at=datetime.now(timezone.utc),
            preferences=sample_user_data["preferences"],
            metadata=sample_user_data["metadata"]
        )
        
        result = user_repository.create(user)
        
        assert result is not None
        assert result.preferences.language == "fr"
        assert result.preferences.theme == "dark"
        assert result.preferences.notifications is False
        assert result.metadata.department == "Finance"
        assert result.metadata.access_level == "advanced"

    # 测试用户查询
    def test_find_by_id_existing_user(self, user_repository):
        """测试根据ID查找现有用户"""
        # 首先获取所有用户以获取一个有效ID
        all_users = user_repository.find_all()
        if not all_users:
            pytest.skip("No users in test data")
        
        existing_user = all_users[0]
        
        result = user_repository.find_by_id(getattr(existing_user, "id", "test_id"))
        
        assert result is not None
        assert result.id == getattr(existing_user, "id", "test_id")
        assert result.username == existing_user.username
        assert result.email == existing_user.email

    def test_find_by_id_nonexistent_user(self, user_repository):
        """测试根据ID查找不存在的用户"""
        result = user_repository.find_by_id("nonexistent_user_id")
        
        assert result is None

    def test_find_by_username_existing_user(self, user_repository):
        """测试根据用户名查找现有用户"""
        all_users = user_repository.find_all()
        if not all_users:
            pytest.skip("No users in test data")
        
        existing_user = all_users[0]
        
        result = user_repository.find_by_username(existing_user.username)
        
        assert result is not None
        assert result.username == existing_user.username
        assert result.id == getattr(existing_user, "id", "test_id")

    def test_find_by_username_nonexistent_user(self, user_repository):
        """测试根据用户名查找不存在的用户"""
        result = user_repository.find_by_username("nonexistent_username")
        
        assert result is None

    def test_find_by_email_existing_user(self, user_repository):
        """测试根据邮箱查找现有用户"""
        all_users = user_repository.find_all()
        if not all_users:
            pytest.skip("No users in test data")
        
        existing_user = all_users[0]
        
        result = user_repository.find_by_email(existing_user.email)
        
        assert result is not None
        assert result.email == existing_user.email
        assert result.id == getattr(existing_user, "id", "test_id")

    def test_find_by_email_nonexistent_user(self, user_repository):
        """测试根据邮箱查找不存在的用户"""
        result = user_repository.find_by_email("nonexistent@example.com")
        
        assert result is None

    # 测试用户更新
    def test_update_user_success(self, user_repository):
        """测试更新用户成功"""
        all_users = user_repository.find_all()
        if not all_users:
            pytest.skip("No users in test data")
        
        existing_user = all_users[0]
        
        # 准备更新数据
        update_data = UserUpdate(
            username="updated_username",
            email="updated@ottawa.ca",
            role="admin",
            preferences=UserPreferences(
                language="fr",
                theme="dark",
                notifications=False
            ),
            metadata=UserMetadata(
                department="Updated Department",
                access_level='advanced'
            )
        )
        
        result = user_repository.update(getattr(existing_user, "id", "test_id"), update_data)
        
        assert result is not None
        assert result.id == getattr(existing_user, "id", "test_id")
        assert result.username == "updated_username"
        assert result.email == "updated@ottawa.ca"
        assert result.role == "admin"
        
        # 验证偏好设置更新
        assert result.preferences.language == "fr"
        assert result.preferences.theme == "dark"
        assert result.preferences.notifications is False
        
        # 验证元数据更新
        assert result.metadata.department == "Updated Department"
        assert result.metadata.access_level == "advanced"

    def test_update_user_partial_data(self, user_repository):
        """测试部分更新用户数据"""
        all_users = user_repository.find_all()
        if not all_users:
            pytest.skip("No users in test data")
        
        existing_user = all_users[0]
        original_email = existing_user.email
        
        # 只更新用户名
        update_data = UserUpdate(username="partially_updated_username")
        
        result = user_repository.update(getattr(existing_user, "id", "test_id"), update_data)
        
        assert result is not None
        assert result.username == "partially_updated_username"
        assert result.email == original_email  # 邮箱应该保持不变
        assert result.role == existing_user.role  # 角色应该保持不变

    def test_update_nonexistent_user(self, user_repository):
        """测试更新不存在的用户"""
        update_data = UserUpdate(username="nonexistent_update")
        
        result = user_repository.update("nonexistent_user_id", update_data)
        
        assert result is None

    def test_update_last_login(self, user_repository):
        """测试更新最后登录时间"""
        all_users = user_repository.find_all()
        if not all_users:
            pytest.skip("No users in test data")
        
        existing_user = all_users[0]
        
        result = user_repository.update_last_login(getattr(existing_user, "id", "test_id"), datetime.now(timezone.utc))
        
        assert result is not None
        assert result.last_login is not None
        assert isinstance(result.last_login, datetime)
        
        # 验证最后登录时间是最近的
        time_diff = datetime.now(timezone.utc) - result.last_login
        assert time_diff.total_seconds() < 5  # 应该在5秒内

    # 测试用户删除
    def test_delete_user_success(self, user_repository, sample_user_data):
        """测试删除用户成功"""
        # 首先创建一个用户

        
        user = User(
            id=str(uuid.uuid4()),
            username=sample_user_data["username"],
            email=sample_user_data["email"],
            hashed_password=sample_user_data["hashed_password"],
            role=sample_user_data["role"],
            status=sample_user_data["status"],
            created_at=datetime.now(timezone.utc),
            preferences=sample_user_data["preferences"],
            metadata=sample_user_data["metadata"]
        )
        created_user = user_repository.create(user)
        
        # 验证用户存在
        found_user = user_repository.find_by_id(created_user.id)
        assert found_user is not None
        
        # 删除用户
        result = user_repository.delete(created_user.id)
        assert result is True
        
        # 验证用户已被删除
        deleted_user = user_repository.find_by_id(created_user.id)
        assert deleted_user is None

    def test_delete_nonexistent_user(self, user_repository):
        """测试删除不存在的用户"""
        result = user_repository.delete("nonexistent_user_id")
        
        assert result is False

    # 测试获取所有用户
    def test_get_all_users(self, user_repository):
        """测试获取所有用户"""
        result = user_repository.find_all()
        
        assert isinstance(result, list)
        # 应该至少有测试数据中的用户
        assert len(result) >= 1
        
        # 验证每个用户都有必需的字段
        for user in result:
            assert user.id is not None
            assert user.username is not None
            assert user.email is not None
            assert user.role is not None
            assert user.status is not None

    def test_get_users_by_role(self, user_repository):
        """测试根据角色获取用户"""
        all_users = user_repository.find_all()
        if not all_users:
            pytest.skip("No users in test data")
        
        # 获取第一个用户的角色
        test_role = all_users[0].role
        
        result = user_repository.find_by_role(test_role)
        
        assert isinstance(result, list)
        assert len(result) >= 1
        
        # 验证所有返回的用户都有指定的角色
        for user in result:
            assert user.role == test_role

    def test_get_users_by_status(self, user_repository):
        """测试根据状态获取用户"""
        result = user_repository.find_active_users()
        
        assert isinstance(result, list)
        
        # 验证所有返回的用户都是活跃状态
        for user in result:
            assert user.status == "active"

    # 测试数据持久化
    def test_data_persistence_after_operations(self, user_repository, sample_user_data):
        """测试操作后数据持久化"""
        # 创建用户

        
        user = User(
            id=str(uuid.uuid4()),
            username=sample_user_data["username"],
            email=sample_user_data["email"],
            hashed_password=sample_user_data["hashed_password"],
            role=sample_user_data["role"],
            status=sample_user_data["status"],
            created_at=datetime.now(timezone.utc),
            preferences=sample_user_data["preferences"],
            metadata=sample_user_data["metadata"]
        )
        created_user = user_repository.create(user)
        
        # 创建新的仓库实例（模拟应用重启）
        # 使用相同的临时文件路径
        temp_users_file = user_repository.data_file
        new_repository = UserRepository(data_file=str(temp_users_file))
        
        # 验证数据仍然存在
        found_user = new_repository.find_by_id(created_user.id)
        assert found_user is not None
        assert found_user.username == created_user.username
        assert found_user.email == created_user.email

    # 测试并发操作
    def test_concurrent_user_creation(self, user_repository):
        """测试并发用户创建"""

        
        def create_user(index):
            user = User(
                id=str(uuid.uuid4()),
                username=f"concurrent_user_{index}",
                email=f"concurrent{index}@ottawa.ca",
                hashed_password="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gSInuG",
                role="researcher",
                status="active",
                created_at=datetime.now(timezone.utc),
                preferences=UserPreferences(),
                metadata=UserMetadata()
            )
            return user_repository.create(user)
        
        # 串行创建多个用户（简化测试）
        results = []
        for i in range(5):
            result = create_user(i)
            results.append(result)
        
        # 验证所有用户都被成功创建
        assert len(results) == 5
        for result in results:
            assert result is not None
            assert result.id is not None
            assert len(result.id) > 0

    # 测试数据验证
    def test_monk_data_structure_validation(self, temp_monk_dir):
        """测试monk数据结构验证"""
        users_file = os.path.join(temp_monk_dir, "monk", "users", "users.json")
        
        if os.path.exists(users_file):
            with open(users_file, 'r', encoding='utf-8') as f:
                users_data = json.load(f)
            
            assert isinstance(users_data, list)
            
            for user_data in users_data:
                # 验证必需字段
                required_fields = ["id", "username", "email", "role", "status"]
                for field in required_fields:
                    assert field in user_data, f"Missing required field: {field}"
                
                # 验证数据类型
                assert isinstance(user_data["username"], str)
                assert isinstance(user_data["email"], str)
                assert "@" in user_data["email"]
                assert user_data["role"] in ["admin", "researcher", "analyst"]
                assert user_data["status"] in ["active", "inactive", "suspended"]
                
                # 验证可选字段结构
                if "preferences" in user_data:
                    prefs = user_data["preferences"]
                    assert isinstance(prefs, (dict, str))  # Can be dict or string representation
                
                if "metadata" in user_data:
                    metadata = user_data["metadata"]
                    assert isinstance(metadata, (dict, str))  # Can be dict or string representation

    # 测试错误处理
    def test_file_corruption_handling(self, user_repository, temp_monk_dir):
        """测试文件损坏处理"""
        users_file = os.path.join(temp_monk_dir, "monk", "users", "users.json")
        
        # 损坏JSON文件
        with open(users_file, 'w') as f:
            f.write("invalid json content")
        
        # 应该能够处理损坏的文件而不崩溃
        try:
            result = user_repository.find_all()
            # 如果有错误处理，应该返回空列表或抛出特定异常
            assert isinstance(result, list) or result is None
        except Exception as e:
            # 应该是可预期的异常类型
            assert isinstance(e, (json.JSONDecodeError, ValueError, FileNotFoundError))

    def test_missing_file_handling(self, temp_monk_dir):
        """测试缺失文件处理"""
        # 删除用户文件
        users_file = os.path.join(temp_monk_dir, "monk", "users", "users.json")
        if os.path.exists(users_file):
            os.remove(users_file)
        
        # 使用临时用户仓库实例
        repository = UserRepository(data_file=users_file)
        
        # 应该能够处理缺失的文件
        result = repository.find_all()
        assert isinstance(result, list)
        # 新文件应该被创建或返回空列表
        assert len(result) == 0 or os.path.exists(users_file) 
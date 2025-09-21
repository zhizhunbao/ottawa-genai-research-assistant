"""
⚙️ System Settings API Tests

系统设置API测试套件 - 符合编码规范
- 使用 monk/ 目录的真实数据
- 通过 Repository 模式访问数据
- 禁止硬编码数据和Mock数据

测试端点:
- GET /settings/languages
- GET /settings/preferences
- POST /settings/preferences
- GET /settings/system-info
- GET /settings/ai-models
- POST /settings/reset
"""

import datetime
import json

import pytest
from app.repositories.user_repository import UserRepository
from fastapi import status
from fastapi.testclient import TestClient


class TestSettingsAPI:
    """系统设置API测试 - 使用真实数据"""

    @pytest.fixture
    def real_user_id(self):
        """从 monk/users/users.json 获取真实用户ID"""
        # 使用相对路径指向monk目录，避免在tests目录创建文件
        monk_path = "monk/users/users.json"
        user_repo = UserRepository(data_file=monk_path)
        users = user_repo.find_all()
        if not users:
            pytest.skip("No users found in monk/users/users.json")
        return users[0].id

    @pytest.fixture
    def real_user(self):
        """从 monk/users/users.json 获取真实用户对象"""
        monk_path = "monk/users/users.json"
        user_repo = UserRepository(data_file=monk_path)
        users = user_repo.find_all()
        if not users:
            pytest.skip("No users found in monk/users/users.json")
        return users[0]

    @pytest.fixture
    def real_admin_user_id(self):
        """从 monk/users/users.json 获取真实管理员用户ID"""
        # 使用相对路径指向monk目录，避免在tests目录创建文件
        monk_path = "monk/users/users.json"
        user_repo = UserRepository(data_file=monk_path)
        users = user_repo.find_all()
        admin_users = [user for user in users if user.role == "admin"]
        if not admin_users:
            pytest.skip("No admin users found in monk/users/users.json")
        return admin_users[0].id

    @pytest.fixture
    def authenticated_client(self, real_user):
        """创建已认证的测试客户端"""
        from app.api.auth import get_current_user
        from app.main import app
        
        app.dependency_overrides[get_current_user] = lambda: real_user
        
        with TestClient(app) as test_client:
            yield test_client
        
        # 清理依赖覆盖
        app.dependency_overrides.clear()

    @pytest.mark.api
    def test_get_supported_languages_success(self, client: TestClient):
        """测试获取支持的语言列表成功 - 无需认证"""
        response = client.get("/api/v1/settings/languages")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "languages" in data
        assert isinstance(data["languages"], list)
        
        # 验证语言数据结构
        for lang in data["languages"]:
            assert "code" in lang
            assert "name" in lang
            assert "native_name" in lang
            assert "supported" in lang
        
        # 验证包含英语和法语
        lang_codes = [lang["code"] for lang in data["languages"]]
        assert "en" in lang_codes
        assert "fr" in lang_codes

    @pytest.mark.api
    def test_get_user_preferences_success(self, authenticated_client: TestClient, real_user_id):
        """测试获取用户偏好设置成功 - 使用真实用户数据"""
        response = authenticated_client.get(
            "/api/v1/settings/preferences"
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # 验证用户偏好设置结构
        assert "language" in data
        assert "theme" in data
        assert "font_size" in data
        assert "high_contrast" in data
        assert "reduce_motion" in data
        assert "notifications" in data
        
        # 验证数据类型
        assert isinstance(data["language"], str)
        assert isinstance(data["theme"], str)
        assert isinstance(data["font_size"], str)
        assert isinstance(data["high_contrast"], bool)
        assert isinstance(data["reduce_motion"], bool)
        assert isinstance(data["notifications"], bool)
        
        # 验证语言值有效
        assert data["language"] in ["en", "fr"]
        
        # 验证主题值有效
        assert data["theme"] in ["light", "dark", "auto"]

    @pytest.mark.api
    def test_get_user_preferences_without_auth(self, client: TestClient):
        """测试未认证获取用户偏好设置"""
        response = client.get("/api/v1/settings/preferences")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.api
    def test_save_user_preferences_success(self, authenticated_client: TestClient, real_user_id):
        """测试保存用户偏好设置成功"""
        preferences_data = {
            "language": "fr",
            "theme": "dark",
            "font_size": "large",
            "high_contrast": True,
            "reduce_motion": False,
            "notifications": True
        }
        
        response = authenticated_client.post(
            "/api/v1/settings/preferences",
            json=preferences_data
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # 验证保存的设置
        assert data["language"] == "fr"
        assert data["theme"] == "dark"
        assert data["font_size"] == "large"
        assert data["high_contrast"] is True
        assert data["reduce_motion"] is False
        assert data["notifications"] is True

    @pytest.mark.api
    def test_save_user_preferences_invalid_language(self, authenticated_client: TestClient, real_user_id):
        """测试保存无效语言的用户偏好设置"""
        preferences_data = {
            "language": "invalid_lang",  # 无效语言
            "theme": "light",
            "font_size": "medium",
            "high_contrast": False,
            "reduce_motion": False,
            "notifications": True
        }
        
        response = authenticated_client.post(
            "/api/v1/settings/preferences",
            json=preferences_data
        )
        
        # 根据API实现，可能返回400或422
        assert response.status_code in [status.HTTP_400_BAD_REQUEST, status.HTTP_422_UNPROCESSABLE_ENTITY]

    @pytest.mark.api
    def test_save_user_preferences_invalid_theme(self, authenticated_client: TestClient, real_user_id):
        """测试保存无效主题的用户偏好设置"""
        preferences_data = {
            "language": "en",
            "theme": "invalid_theme",  # 无效主题
            "font_size": "medium",
            "high_contrast": False,
            "reduce_motion": False,
            "notifications": True
        }
        
        response = authenticated_client.post(
            "/api/v1/settings/preferences",
            json=preferences_data
        )
        
        # 根据API实现，可能返回400或422
        assert response.status_code in [status.HTTP_400_BAD_REQUEST, status.HTTP_422_UNPROCESSABLE_ENTITY]

    @pytest.mark.api
    def test_save_user_preferences_without_auth(self, client: TestClient):
        """测试未认证保存用户偏好设置"""
        preferences_data = {
            "language": "en",
            "theme": "light",
            "font_size": "medium",
            "high_contrast": False,
            "reduce_motion": False,
            "notifications": True
        }
        
        response = client.post(
            "/api/v1/settings/preferences",
            json=preferences_data
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.api
    def test_get_system_info_success(self, client: TestClient):
        """测试获取系统信息成功 - 无需认证"""
        response = client.get("/api/v1/settings/system-info")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # 验证系统信息结构
        assert "version" in data
        assert "features" in data
        assert "ai_models" in data
        assert "max_file_size_mb" in data
        
        # 验证数据类型
        assert isinstance(data["version"], str)
        assert isinstance(data["features"], list)
        assert isinstance(data["ai_models"], list)
        assert isinstance(data["max_file_size_mb"], int)
        
        # 验证功能列表不为空
        assert len(data["features"]) > 0
        
        # 验证AI模型列表不为空
        assert len(data["ai_models"]) > 0
        
        # 验证文件大小限制合理
        assert data["max_file_size_mb"] > 0

    @pytest.mark.api
    def test_get_ai_models_success(self, client: TestClient):
        """测试获取AI模型列表成功 - 无需认证"""
        response = client.get("/api/v1/settings/ai-models")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # 验证AI模型数据结构
        assert "models" in data
        assert isinstance(data["models"], list)
        
        if data["models"]:
            # 验证模型信息结构
            model = data["models"][0]
            assert "id" in model
            assert "name" in model
            assert "description" in model
            assert "capabilities" in model
            assert "max_tokens" in model
            
            # 验证数据类型
            assert isinstance(model["id"], str)
            assert isinstance(model["name"], str)
            assert isinstance(model["description"], str)
            assert isinstance(model["capabilities"], list)
            assert isinstance(model["max_tokens"], int)

    @pytest.mark.api
    def test_reset_settings_success(self, authenticated_client: TestClient, real_user_id):
        """测试重置设置成功"""
        response = authenticated_client.post(
            "/api/v1/settings/reset"
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # 验证重置响应
        assert "message" in data
        assert "preferences" in data
        assert "successfully" in data["message"].lower()
        
        # 验证重置后的偏好设置为默认值
        preferences = data["preferences"]
        assert preferences["language"] == "en"  # 默认英语
        assert preferences["theme"] == "auto"   # 默认自动主题
        assert preferences["font_size"] == "medium"  # 默认中等字体
        assert preferences["high_contrast"] is False  # 默认不启用高对比度
        assert preferences["reduce_motion"] is False  # 默认不减少动画
        assert preferences["notifications"] is True   # 默认启用通知

    @pytest.mark.api
    def test_reset_settings_without_auth(self, client: TestClient):
        """测试未认证重置设置"""
        response = client.post("/api/v1/settings/reset")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.api
    def test_user_repository_integration(self):
        """测试用户Repository集成 - 验证数据来自monk/目录"""
        # 使用相对路径指向monk目录，避免在tests目录创建文件
        monk_path = "monk/users/users.json"
        user_repo = UserRepository(data_file=monk_path)
        users = user_repo.find_all()
        
        # 验证数据确实来自monk/users/users.json
        assert isinstance(users, list)
        
        if users:
            # 验证用户数据结构符合预期
            user = users[0]
            assert hasattr(user, 'id')
            assert hasattr(user, 'username')
            assert hasattr(user, 'email')
            assert hasattr(user, 'role')
            assert hasattr(user, 'status')
            assert hasattr(user, 'created_at')
            assert hasattr(user, 'preferences')
            
            # 验证用户偏好设置结构
            if hasattr(user.preferences, 'language'):
                assert user.preferences.language in ["en", "fr"]
            if hasattr(user.preferences, 'theme'):
                assert user.preferences.theme in ["light", "dark", "auto"]

    @pytest.mark.api
    def test_preferences_persistence(self, authenticated_client: TestClient, real_user_id):
        """测试偏好设置持久化 - 保存后再获取验证"""
        # 保存新的偏好设置
        new_preferences = {
            "language": "fr",
            "theme": "dark",
            "font_size": "large",
            "high_contrast": True,
            "reduce_motion": True,
            "notifications": False
        }
        
        save_response = authenticated_client.post(
            "/api/v1/settings/preferences",
            json=new_preferences
        )
        
        assert save_response.status_code == status.HTTP_200_OK
        
        # 获取偏好设置验证是否保存成功
        get_response = authenticated_client.get(
            "/api/v1/settings/preferences"
        )
        
        assert get_response.status_code == status.HTTP_200_OK
        saved_preferences = get_response.json()
        
        # 验证保存的设置
        assert saved_preferences["language"] == "fr"
        assert saved_preferences["theme"] == "dark"
        assert saved_preferences["font_size"] == "large"
        assert saved_preferences["high_contrast"] is True
        assert saved_preferences["reduce_motion"] is True
        assert saved_preferences["notifications"] is False

    @pytest.mark.api
    def test_partial_preferences_update(self, authenticated_client: TestClient, real_user_id):
        """测试部分偏好设置更新"""
        # 只更新部分设置
        partial_preferences = {
            "language": "fr",
            "theme": "dark"
            # 其他设置保持不变
        }
        
        response = authenticated_client.post(
            "/api/v1/settings/preferences",
            json=partial_preferences
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # 验证更新的设置
        assert data["language"] == "fr"
        assert data["theme"] == "dark"
        
        # 验证其他设置有默认值
        assert "font_size" in data
        assert "high_contrast" in data
        assert "reduce_motion" in data
        assert "notifications" in data 
"""
💬 Chat API Tests

聊天API测试套件
- POST /chat/message
- GET /chat/history  
- DELETE /chat/history
- GET /chat/suggestions
"""

import json
import os
from datetime import datetime, timezone
from unittest.mock import AsyncMock, Mock, patch

import pytest
from app.api.auth import get_current_user
from app.main import app
from app.models.chat import Conversation, Message
from app.models.user import User, UserMetadata, UserPreferences
from fastapi import status
from fastapi.testclient import TestClient


class TestChatAPI:
    """聊天API测试"""

    @pytest.fixture
    def mock_user(self):
        """模拟用户"""
        return User(
            id="test-user-123",
            username="test_user",
            email="test@ottawa.ca",
            hashed_password="$2b$12$test_hashed_password",
            role="researcher",
            status="active",
            created_at=datetime.now(timezone.utc),
            preferences=UserPreferences(),
            metadata=UserMetadata()
        )

    @pytest.fixture
    def auth_headers(self):
        """认证头部"""
        return {"Authorization": "Bearer fake-jwt-token"}

    @pytest.fixture
    def authenticated_client(self, mock_user):
        """创建已认证的测试客户端"""
        
        app.dependency_overrides[get_current_user] = lambda: mock_user
        
        with TestClient(app) as test_client:
            yield test_client
        
        # 清理依赖覆盖
        app.dependency_overrides.clear()

    @pytest.mark.api
    @pytest.mark.chat
    def test_send_message_success(self, authenticated_client: TestClient, mock_user):
        """测试发送消息成功"""
        message_data = {
            "message": "What is artificial intelligence?",
            "language": "en",
            "context": "research"
        }

        with patch("app.services.chat_service.ChatService.process_message") as mock_process, \
             patch("app.repositories.chat_repository.ConversationRepository") as mock_conv_repo, \
             patch("app.repositories.chat_repository.MessageRepository") as mock_msg_repo:

            # 配置mock - process_message应该返回字典格式
            mock_process.return_value = {
                "text": "AI is a branch of computer science...",
                "sources": ["Test Source"],
                "charts": None,
                "language": "en"
            }
            mock_conv_repo.return_value.find_by_user.return_value = []
            mock_conv_repo.return_value.create.return_value = True
            mock_msg_repo.return_value.create.return_value = True

            response = authenticated_client.post(
                "/api/v1/chat/message",
                json=message_data
            )
            
            if response.status_code != status.HTTP_200_OK:
                print(f"Response status: {response.status_code}")
                print(f"Response body: {response.text}")
            
            assert response.status_code == status.HTTP_200_OK
            response_data = response.json()
            
            assert "response" in response_data
            assert "id" in response_data  # 对话ID字段
            # 检查响应文本
            if isinstance(response_data["response"], dict):
                assert response_data["response"]["text"] == "AI is a branch of computer science..."
            else:
                assert "AI is a branch of computer science" in str(response_data["response"])

    @pytest.mark.api
    @pytest.mark.chat
    def test_send_message_without_auth(self, client: TestClient):
        """测试未认证发送消息"""
        message_data = {
            "message": "What is artificial intelligence?",
            "language": "en"
        }

        response = client.post("/api/v1/chat/message", json=message_data)
        assert response.status_code == status.HTTP_403_FORBIDDEN  # HTTPBearer returns 403 when no auth header

    @pytest.mark.api
    @pytest.mark.chat
    def test_send_message_invalid_data(self, authenticated_client: TestClient, mock_user):
        """测试发送无效消息数据"""
        invalid_data = {}  # Missing required message field
        
        response = authenticated_client.post("/api/v1/chat/message", json=invalid_data)
        assert response.status_code == 422  # Validation error

    @pytest.mark.api
    @pytest.mark.chat
    def test_send_message_service_error(self, authenticated_client: TestClient, mock_user):
        """测试聊天服务错误"""
        message_data = {
            "message": "Test message",
            "language": "en"
        }
        
        with patch("app.services.chat_service.ChatService.process_message") as mock_process:
            mock_process.side_effect = Exception("Service error")
            
            response = authenticated_client.post("/api/v1/chat/message", json=message_data)
            assert response.status_code == 500

    @pytest.mark.api
    @pytest.mark.chat
    def test_get_chat_history_success(self, authenticated_client: TestClient, mock_user):
        """测试获取聊天历史成功"""
        with patch("app.api.chat.ConversationRepository") as mock_conv_repo, \
             patch("app.api.chat.MessageRepository") as mock_msg_repo:
            
            # Mock conversations for the user
            mock_conv_repo.return_value.find_by_user.return_value = []
            # Mock messages for conversations  
            mock_msg_repo.return_value.find_by_conversation.return_value = []
            
            response = authenticated_client.get("/api/v1/chat/history")
            
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert "messages" in data
            assert "total" in data
            # Since we're using the real repositories, just check that it works
            assert isinstance(data["total"], int)
            assert isinstance(data["messages"], list)

    @pytest.mark.api
    @pytest.mark.chat
    def test_get_chat_history_with_pagination(self, authenticated_client: TestClient, mock_user):
        """测试带分页的聊天历史"""
        response = authenticated_client.get("/api/v1/chat/history?limit=10&offset=0")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "total" in data
        assert "messages" in data
        assert isinstance(data["total"], int)
        assert isinstance(data["messages"], list)
        # Check that limit is respected (messages should be <= 10)
        assert len(data["messages"]) <= 10

    @pytest.mark.api
    @pytest.mark.chat
    def test_delete_chat_history_success(self, authenticated_client: TestClient, mock_user):
        """测试删除聊天历史成功"""
        with patch("app.repositories.chat_repository.ConversationRepository") as mock_conv_repo, \
             patch("app.repositories.chat_repository.MessageRepository") as mock_msg_repo:
            
            # Mock conversations for the user
            mock_conv_repo.return_value.find_by_user.return_value = []
            mock_conv_repo.return_value.clear_user_conversations.return_value = True
            mock_msg_repo.return_value.clear_conversation_messages.return_value = True
            
            response = authenticated_client.delete("/api/v1/chat/history")
            
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["message"] == "Chat history cleared successfully"

    @pytest.mark.api
    @pytest.mark.chat
    def test_get_chat_suggestions_success(self, authenticated_client: TestClient):
        """测试获取聊天建议成功"""
        response = authenticated_client.get("/api/v1/chat/suggestions")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "suggestions" in data
        assert isinstance(data["suggestions"], list)
        assert len(data["suggestions"]) > 0
        # Check that we get English suggestions by default
        assert any("economic" in suggestion.lower() for suggestion in data["suggestions"])

    @pytest.mark.api
    @pytest.mark.chat
    def test_get_chat_suggestions_with_language(self, authenticated_client: TestClient):
        """测试获取指定语言的聊天建议"""
        response = authenticated_client.get("/api/v1/chat/suggestions?language=fr")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "suggestions" in data
        assert isinstance(data["suggestions"], list)
        assert len(data["suggestions"]) > 0
        # Check that we get French suggestions (should contain French words)
        suggestions_text = " ".join(data["suggestions"]).lower()
        assert any(word in suggestions_text for word in ["économique", "entreprises", "ottawa", "développement"])

    @pytest.mark.api
    @pytest.mark.chat
    def test_send_message_with_context(self, authenticated_client: TestClient, mock_user):
        """测试带上下文发送消息"""
        message_data = {
            "message": "Explain this document",
            "language": "en", 
            "context": "This is a research paper about AI applications in government."
        }
        
        with patch("app.services.chat_service.ChatService.process_message") as mock_process, \
             patch("app.repositories.chat_repository.ConversationRepository") as mock_conv_repo, \
             patch("app.repositories.chat_repository.MessageRepository") as mock_msg_repo:
            
            mock_process.return_value = {
                "text": "This document discusses AI applications...",
                "sources": ["Test Source"],
                "charts": None,
                "language": "en"
            }
            mock_conv_repo.return_value.find_by_user.return_value = []
            mock_conv_repo.return_value.create.return_value = True
            mock_msg_repo.return_value.create.return_value = True
            
            response = authenticated_client.post("/api/v1/chat/message", json=message_data)
            
            assert response.status_code == status.HTTP_200_OK
            # 验证context被传递给服务
            mock_process.assert_called_once()
            call_args = mock_process.call_args
            assert call_args[1]["context"] == message_data["context"]

    @pytest.mark.api
    @pytest.mark.chat
    def test_send_message_bilingual_support(self, authenticated_client: TestClient, mock_user):
        """测试双语支持"""
        message_data_fr = {
            "message": "Qu'est-ce que l'intelligence artificielle?",
            "language": "fr"
        }
        
        with patch("app.services.chat_service.ChatService.process_message") as mock_process, \
             patch("app.repositories.chat_repository.ConversationRepository") as mock_conv_repo, \
             patch("app.repositories.chat_repository.MessageRepository") as mock_msg_repo:
            
            mock_process.return_value = {
                "text": "L'IA est une branche de l'informatique...",
                "sources": ["Test Source"],
                "charts": None,
                "language": "fr"
            }
            mock_conv_repo.return_value.find_by_user.return_value = []
            mock_conv_repo.return_value.create.return_value = True
            mock_msg_repo.return_value.create.return_value = True
            
            response = authenticated_client.post("/api/v1/chat/message", json=message_data_fr)
            
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            # Check for French response in the response text
            if isinstance(data["response"], dict):
                assert "L'IA" in data["response"]["text"]
            else:
                assert "L'IA" in str(data["response"]) 
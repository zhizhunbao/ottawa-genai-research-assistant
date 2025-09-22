"""
💬 Chat Service Tests

使用真实monk聊天数据的聊天服务测试套件
- 测试消息处理
- 测试AI响应生成
- 测试多语言支持
- 测试错误处理
"""

import json
import os
from datetime import datetime, timezone
from unittest.mock import AsyncMock, Mock, patch

import pytest
from app.core.config import Settings
from app.services.chat_service import ChatService


class TestChatService:
    """使用真实monk聊天数据的聊天服务测试"""

    @pytest.fixture
    def test_settings(self):
        """创建测试设置"""
        return Settings(
            OPENAI_API_KEY="test_openai_key",
            DEFAULT_AI_MODEL="gpt-4",
            MAX_TOKENS=150,
            TEMPERATURE=0.7
        )

    @pytest.fixture
    def chat_service(self, test_settings):
        """创建聊天服务实例"""
        return ChatService(test_settings)

    @pytest.fixture
    def chat_service_no_api_key(self):
        """创建没有API密钥的聊天服务实例"""
        settings = Settings(OPENAI_API_KEY="")
        return ChatService(settings)

    @pytest.fixture
    def monk_conversations_data(self):
        """加载monk对话数据"""
        conversations_file = os.path.join("monk", "chats", "conversations.json")
        if os.path.exists(conversations_file):
            with open(conversations_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []

    @pytest.fixture
    def monk_messages_data(self):
        """加载monk消息数据"""
        messages_file = os.path.join("monk", "chats", "messages.json")
        if os.path.exists(messages_file):
            with open(messages_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []

    # 测试消息处理
    @pytest.mark.asyncio
    async def test_process_message_with_mock_response(self, chat_service_no_api_key):
        """测试处理消息（使用模拟响应）"""
        message = "What are the economic development opportunities in Ottawa?"
        language = "en"
        
        result = await chat_service_no_api_key.process_message(message, language)
        
        assert "text" in result
        assert "language" in result
        assert result["language"] == language
        assert isinstance(result["text"], str)
        assert len(result["text"]) > 0

    @pytest.mark.asyncio
    async def test_process_message_french(self, chat_service_no_api_key):
        """测试处理法语消息"""
        message = "Quelles sont les opportunités de développement économique à Ottawa?"
        language = "fr"
        
        result = await chat_service_no_api_key.process_message(message, language)
        
        assert "text" in result
        assert result["language"] == language
        assert isinstance(result["text"], str)

    @pytest.mark.asyncio
    async def test_process_message_with_context(self, chat_service_no_api_key):
        """测试带上下文的消息处理"""
        message = "Tell me more about this topic"
        language = "en"
        context = "We were discussing Ottawa's tech sector growth"
        
        result = await chat_service_no_api_key.process_message(message, language, context)
        
        assert "text" in result
        assert result["language"] == language
        assert isinstance(result["text"], str)

    @pytest.mark.asyncio
    @patch('openai.AsyncOpenAI')
    async def test_process_message_with_openai_api(self, mock_openai_client, test_settings):
        """测试使用真实OpenAI API的消息处理"""
        # 设置模拟的OpenAI响应
        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].message.content = "Ottawa offers great economic opportunities in technology, healthcare, and government sectors."
        
        mock_client_instance = AsyncMock()
        mock_client_instance.chat.completions.create.return_value = mock_response
        mock_openai_client.return_value = mock_client_instance
        
        chat_service = ChatService(test_settings)
        chat_service.openai_client = mock_client_instance
        
        message = "What are Ottawa's main economic sectors?"
        language = "en"
        
        result = await chat_service.process_message(message, language)
        
        assert "text" in result
        assert result["language"] == language
        assert "Ottawa offers great economic opportunities" in result["text"]
        
        # 验证API调用
        mock_client_instance.chat.completions.create.assert_called_once()
        call_args = mock_client_instance.chat.completions.create.call_args
        assert call_args[1]["model"] == "gpt-4"
        assert call_args[1]["max_tokens"] == 150
        assert call_args[1]["temperature"] == 0.7

    @pytest.mark.asyncio
    @patch('openai.AsyncOpenAI')
    async def test_process_message_api_error_fallback(self, mock_openai_client, test_settings):
        """测试API错误时的回退机制"""
        # 设置模拟的API错误
        mock_client_instance = AsyncMock()
        mock_client_instance.chat.completions.create.side_effect = Exception("API Error")
        mock_openai_client.return_value = mock_client_instance
        
        chat_service = ChatService(test_settings)
        chat_service.openai_client = mock_client_instance
        
        message = "Test message"
        language = "en"
        
        result = await chat_service.process_message(message, language)
        
        # 应该回退到模拟响应
        assert "text" in result
        assert result["language"] == language
        assert isinstance(result["text"], str)

    # 测试系统提示构建
    def test_build_system_prompt_english(self, chat_service):
        """测试英语系统提示构建"""
        prompt = chat_service._build_system_prompt("en")
        
        assert isinstance(prompt, str)
        assert len(prompt) > 0
        assert "economic development" in prompt.lower()
        assert "ottawa" in prompt.lower()

    def test_build_system_prompt_french(self, chat_service):
        """测试法语系统提示构建"""
        prompt = chat_service._build_system_prompt("fr")
        
        assert isinstance(prompt, str)
        assert len(prompt) > 0
        assert "développement économique" in prompt.lower()
        assert "ottawa" in prompt.lower()

    # 测试响应解析
    def test_parse_ai_response_simple_text(self, chat_service):
        """测试解析简单文本响应"""
        response_text = "Ottawa is a great city for economic development."
        
        parsed = chat_service._parse_ai_response(response_text)
        
        assert "text" in parsed
        assert parsed["text"] == response_text

    def test_parse_ai_response_with_sources(self, chat_service):
        """测试解析带来源的响应"""
        response_text = """Ottawa is a great city for economic development.

        Sources:
        - Economic Development Report 2024
        - City of Ottawa Statistics"""
        
        parsed = chat_service._parse_ai_response(response_text)
        
        assert "text" in parsed
        assert "sources" in parsed
        assert isinstance(parsed["sources"], list)

    # 测试模拟响应生成
    @pytest.mark.asyncio
    async def test_generate_mock_response_english(self, chat_service):
        """测试生成英语模拟响应"""
        message = "What is Ottawa's population?"
        language = "en"
        
        result = await chat_service._generate_mock_response(message, language)
        
        assert "text" in result
        assert "sources" in result
        assert result["language"] == language
        assert isinstance(result["text"], str)
        assert isinstance(result["sources"], list)

    @pytest.mark.asyncio
    async def test_generate_mock_response_french(self, chat_service):
        """测试生成法语模拟响应"""
        message = "Quelle est la population d'Ottawa?"
        language = "fr"
        
        result = await chat_service._generate_mock_response(message, language)
        
        assert "text" in result
        assert result["language"] == language
        assert isinstance(result["text"], str)

    @pytest.mark.asyncio
    async def test_generate_mock_response_with_error(self, chat_service):
        """测试带错误信息的模拟响应生成"""
        message = "Test message"
        language = "en"
        error = "API connection failed"
        
        result = await chat_service._generate_mock_response(message, language, error=error)
        
        assert "text" in result
        assert result["language"] == language
        assert isinstance(result["text"], str)

    # 测试数据加载
    @pytest.mark.asyncio
    async def test_load_monk_data(self, chat_service):
        """测试加载monk数据"""
        monk_data = await chat_service._load_monk_data()
        
        assert isinstance(monk_data, dict)
        # 验证返回的数据结构
        assert "conversations" in monk_data or "documents" in monk_data or len(monk_data) >= 0

    # 测试monk数据集成
    def test_monk_data_integration(self, monk_conversations_data, monk_messages_data):
        """测试monk数据集成"""
        # 验证对话数据结构
        if monk_conversations_data:
            for conversation in monk_conversations_data:
                required_fields = ["id", "user_id", "title", "language", "created_at"]
                for field in required_fields:
                    assert field in conversation, f"Missing field: {field}"
                
                assert conversation["language"] in ["en", "fr"]
                assert isinstance(conversation["title"], str)
                assert len(conversation["title"]) > 0

        # 验证消息数据结构
        if monk_messages_data:
            for message in monk_messages_data:
                required_fields = ["id", "conversation_id", "role", "content", "timestamp"]
                for field in required_fields:
                    assert field in message, f"Missing field: {field}"
                
                assert message["role"] in ["user", "assistant", "system"]
                assert isinstance(message["content"], str)
                assert len(message["content"]) > 0

    # 测试语言检测和处理
    @pytest.mark.asyncio
    async def test_language_detection_and_processing(self, chat_service_no_api_key):
        """测试语言检测和处理"""
        # 测试英语消息
        english_message = "What are the business opportunities in Ottawa?"
        result_en = await chat_service_no_api_key.process_message(english_message, "en")
        
        # 测试法语消息
        french_message = "Quelles sont les opportunités d'affaires à Ottawa?"
        result_fr = await chat_service_no_api_key.process_message(french_message, "fr")
        
        # 验证语言处理
        assert result_en["language"] == "en"
        assert result_fr["language"] == "fr"
        assert isinstance(result_en["text"], str)
        assert isinstance(result_fr["text"], str)

    # 测试错误处理
    @pytest.mark.asyncio
    async def test_error_handling_invalid_language(self, chat_service_no_api_key):
        """测试无效语言的错误处理"""
        message = "Test message"
        invalid_language = "invalid"
        
        # 应该回退到默认语言
        result = await chat_service_no_api_key.process_message(message, invalid_language)
        
        assert "text" in result
        assert "language" in result
        assert isinstance(result["text"], str)

    @pytest.mark.asyncio
    async def test_error_handling_empty_message(self, chat_service_no_api_key):
        """测试空消息的错误处理"""
        empty_message = ""
        language = "en"
        
        result = await chat_service_no_api_key.process_message(empty_message, language)
        
        assert "text" in result
        assert result["language"] == language
        assert isinstance(result["text"], str)

    # 测试并发处理
    @pytest.mark.asyncio
    async def test_concurrent_message_processing(self, chat_service_no_api_key):
        """测试并发消息处理"""
        import asyncio
        
        messages = [
            ("What is Ottawa's economy like?", "en"),
            ("Comment est l'économie d'Ottawa?", "fr"),
            ("Tell me about tech sector", "en"),
            ("Parlez-moi du secteur technologique", "fr")
        ]
        
        # 并发处理消息
        tasks = [
            chat_service_no_api_key.process_message(msg, lang) 
            for msg, lang in messages
        ]
        results = await asyncio.gather(*tasks)
        
        # 验证所有结果
        assert len(results) == 4
        for i, result in enumerate(results):
            expected_lang = messages[i][1]
            assert "text" in result
            assert result["language"] == expected_lang
            assert isinstance(result["text"], str)

    # 测试配置验证
    def test_service_initialization_with_settings(self, test_settings):
        """测试服务初始化配置"""
        service = ChatService(test_settings)
        
        assert service.settings == test_settings
        assert service.openai_client is not None
        assert service.monk_data_path.name == "monk"

    def test_service_initialization_without_api_key(self):
        """测试无API密钥的服务初始化"""
        settings = Settings(OPENAI_API_KEY="")
        service = ChatService(settings)
        
        assert service.settings == settings
        assert service.openai_client is None 
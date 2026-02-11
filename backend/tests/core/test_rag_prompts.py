"""
RAG Prompts 单元测试

测试 prompt 模板的构建、格式化和消息列表生成。
"""


from app.core.rag_prompts import (
    NO_RESULTS_PROMPT,
    RAG_CONTEXT_PROMPT,
    SYSTEM_PROMPT,
    PromptTemplate,
    build_rag_context,
    build_system_messages,
)


class TestPromptTemplates:
    """Prompt 模板结构测试"""

    def test_system_prompt_has_required_fields(self):
        """系统 prompt 包含必要字段"""
        assert SYSTEM_PROMPT.name == "system_prompt"
        assert SYSTEM_PROMPT.version == "1.0"
        assert "Ottawa" in SYSTEM_PROMPT.template
        assert "economic development" in SYSTEM_PROMPT.template
        assert "cite" in SYSTEM_PROMPT.template.lower()

    def test_rag_context_prompt_has_placeholder(self):
        """RAG 上下文模板包含 {context} 占位符"""
        assert "{context}" in RAG_CONTEXT_PROMPT.template

    def test_no_results_prompt_exists(self):
        """无结果 prompt 存在且有建议"""
        assert NO_RESULTS_PROMPT.template
        assert "rephras" in NO_RESULTS_PROMPT.template.lower()

    def test_prompt_template_dataclass(self):
        """PromptTemplate dataclass 正常工作"""
        pt = PromptTemplate(name="test", version="2.0", template="Hello {name}")
        assert pt.name == "test"
        assert pt.version == "2.0"
        assert pt.template == "Hello {name}"


class TestBuildRagContext:
    """RAG 上下文构建测试"""

    def test_empty_sources_returns_empty(self):
        """空源列表返回空字符串"""
        result = build_rag_context([])
        assert result == ""

    def test_single_source(self):
        """单个源正确格式化"""
        sources = [
            {
                "title": "Q4 Report",
                "content": "GDP grew by 3.2%",
                "page_number": 5,
                "score": 0.95,
            }
        ]
        result = build_rag_context(sources)

        assert "Q4 Report" in result
        assert "GDP grew by 3.2%" in result
        assert "Page 5" in result
        assert "0.95" in result

    def test_multiple_sources(self):
        """多个源使用分隔符"""
        sources = [
            {"title": "Report A", "content": "Content A", "score": 0.9},
            {"title": "Report B", "content": "Content B", "score": 0.8},
        ]
        result = build_rag_context(sources)

        assert "Document 1" in result
        assert "Document 2" in result
        assert "Report A" in result
        assert "Report B" in result
        assert "---" in result

    def test_missing_fields_use_defaults(self):
        """缺失字段使用默认值"""
        sources = [{"content": "Some text"}]
        result = build_rag_context(sources)

        assert "Unknown" in result
        assert "N/A" in result
        assert "Some text" in result

    def test_score_formatting(self):
        """分数格式化为两位小数"""
        sources = [
            {"title": "T", "content": "C", "score": 0.87654}
        ]
        result = build_rag_context(sources)
        assert "0.88" in result


class TestBuildSystemMessages:
    """系统消息构建测试"""

    def test_basic_query_no_sources(self):
        """基本查询（无源）生成正确消息列表"""
        messages = build_system_messages(
            query="What is Ottawa's GDP?",
            sources=[],
        )

        # 至少两条消息: system + user
        assert len(messages) >= 2
        assert messages[0]["role"] == "system"
        assert messages[-1]["role"] == "user"
        assert messages[-1]["content"] == "What is Ottawa's GDP?"

    def test_query_with_sources(self):
        """带源的查询生成 RAG 上下文消息"""
        sources = [
            {"title": "Report", "content": "GDP is $100B", "score": 0.9}
        ]
        messages = build_system_messages(
            query="GDP?",
            sources=sources,
        )

        # system + rag_context + user = 3 条
        assert len(messages) == 3
        assert messages[0]["role"] == "system"
        assert messages[1]["role"] == "system"
        assert "Report" in messages[1]["content"]
        assert "GDP is $100B" in messages[1]["content"]
        assert messages[2]["role"] == "user"

    def test_query_with_chat_history(self):
        """带聊天历史的查询"""
        history = [
            {"role": "user", "content": "Hello"},
            {"role": "assistant", "content": "Hi there!"},
        ]
        messages = build_system_messages(
            query="Follow up question",
            sources=[],
            chat_history=history,
        )

        # system + history(2) + user = 4 条
        assert len(messages) == 4
        assert messages[0]["role"] == "system"
        assert messages[1]["content"] == "Hello"
        assert messages[2]["content"] == "Hi there!"
        assert messages[3]["content"] == "Follow up question"

    def test_full_rag_with_history_and_sources(self):
        """完整 RAG 场景: source + history + query"""
        sources = [
            {"title": "Doc", "content": "Info", "score": 0.8}
        ]
        history = [
            {"role": "user", "content": "Previous Q"},
            {"role": "assistant", "content": "Previous A"},
        ]
        messages = build_system_messages(
            query="Current question",
            sources=sources,
            chat_history=history,
        )

        # system + rag_context + history(2) + user = 5 条
        assert len(messages) == 5
        assert messages[0]["role"] == "system"
        assert "Ottawa" in messages[0]["content"]
        assert messages[1]["role"] == "system"  # RAG context
        assert messages[2]["content"] == "Previous Q"
        assert messages[3]["content"] == "Previous A"
        assert messages[4]["content"] == "Current question"

    def test_system_prompt_contains_citation_instructions(self):
        """系统 prompt 包含引用格式说明"""
        messages = build_system_messages(query="test", sources=[])
        system_content = messages[0]["content"]

        assert "cite" in system_content.lower() or "Source" in system_content

    def test_empty_query(self):
        """空查询也能正常生成消息"""
        messages = build_system_messages(query="", sources=[])
        assert len(messages) >= 2
        assert messages[-1]["content"] == ""

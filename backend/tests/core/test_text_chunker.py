"""
文档分块器测试

测试 TextChunker 的分块逻辑、重叠、边界条件、空文本。
遵循 step-06-backend.md 的检查项。
"""

import pytest

from app.core.text_chunker import TextChunk, TextChunker


class TestTextChunker:
    """TextChunker 测试类"""

    def setup_method(self):
        self.chunker = TextChunker(chunk_size=100, chunk_overlap=20, min_chunk_size=10)

    def test_empty_text_returns_empty(self):
        """测试空文本返回空列表"""
        assert self.chunker.chunk_text("") == []
        assert self.chunker.chunk_text("   ") == []
        assert self.chunker.chunk_text(None) == []

    def test_short_text_single_chunk(self):
        """测试短文本返回单个分块"""
        text = "This is a short paragraph."
        chunks = self.chunker.chunk_text(text)

        assert len(chunks) == 1
        assert chunks[0].text == text
        assert chunks[0].chunk_index == 0

    def test_text_within_chunk_size(self):
        """测试刚好不超过 chunk_size 的文本"""
        text = "A" * 100  # exactly chunk_size
        chunks = self.chunker.chunk_text(text)

        assert len(chunks) == 1
        assert chunks[0].char_count == 100

    def test_paragraph_splitting(self):
        """测试按段落分割"""
        # 创建两个段落，每个超过 chunk_size/2
        para1 = "First paragraph. " * 5  # ~85 chars
        para2 = "Second paragraph. " * 5  # ~90 chars
        text = f"{para1}\n\n{para2}"

        chunks = self.chunker.chunk_text(text)

        assert len(chunks) >= 2
        assert "First paragraph" in chunks[0].text
        assert "Second paragraph" in chunks[-1].text

    def test_chunk_has_metadata(self):
        """测试分块包含元数据"""
        chunks = self.chunker.chunk_text(
            "Some text content for this test.",
            page_number=3,
            start_chunk_index=5,
        )

        assert len(chunks) == 1
        assert chunks[0].page_number == 3
        assert chunks[0].chunk_index == 5
        assert chunks[0].char_count == len("Some text content for this test.")

    def test_chunk_pages_multiple_pages(self):
        """测试多页分块"""
        pages = [
            {"text": "Page one content that is sufficient.", "page_number": 1},
            {"text": "Page two content that is sufficient.", "page_number": 2},
        ]

        chunks = self.chunker.chunk_pages(pages)

        assert len(chunks) >= 2
        # 分块序号应该连续
        indices = [c.chunk_index for c in chunks]
        assert indices == list(range(len(chunks)))

    def test_chunk_pages_preserves_page_number(self):
        """测试多页分块保留页码"""
        pages = [
            {"text": "Content from page five is right here.", "page_number": 5},
            {"text": "Content from page ten is right here.", "page_number": 10},
        ]

        chunks = self.chunker.chunk_pages(pages)

        page_numbers = [c.page_number for c in chunks]
        assert 5 in page_numbers
        assert 10 in page_numbers

    def test_large_paragraph_gets_split(self):
        """测试超长段落被进一步分割"""
        # 创建一个超过 chunk_size 的单个段落
        text = "Word " * 50  # ~250 chars, well over 100 chunk_size
        chunks = self.chunker.chunk_text(text)

        assert len(chunks) > 1
        for chunk in chunks:
            # 每个分块不应该远超 chunk_size（允许一点弹性）
            assert chunk.char_count <= self.chunker.chunk_size * 1.5

    def test_min_chunk_size_merge(self):
        """测试小于 min_chunk_size 的块被合并"""
        chunker = TextChunker(chunk_size=100, chunk_overlap=20, min_chunk_size=50)

        # 第一段足够长，第二段太短
        text = "A long paragraph that definitely exceeds fifty characters for testing purposes.\n\nShort."
        chunks = chunker.chunk_text(text)

        # "Short." 应该被合并到前一个块，而不是独立成块
        for chunk in chunks:
            assert chunk.char_count >= 10  # at least min of something

    def test_invalid_overlap_raises(self):
        """测试 overlap >= chunk_size 抛出异常"""
        with pytest.raises(ValueError, match="chunk_overlap must be less than chunk_size"):
            TextChunker(chunk_size=100, chunk_overlap=100)

    def test_invalid_min_size_raises(self):
        """测试 min_chunk_size > chunk_size 抛出异常"""
        with pytest.raises(ValueError, match="min_chunk_size must be less than or equal"):
            TextChunker(chunk_size=100, chunk_overlap=20, min_chunk_size=200)

    def test_text_chunk_post_init(self):
        """测试 TextChunk dataclass 初始化"""
        chunk = TextChunk(text="Hello World", chunk_index=0, page_number=1)
        assert chunk.char_count == 11

    def test_default_chunker_settings(self):
        """测试默认分块器配置"""
        chunker = TextChunker()
        assert chunker.chunk_size == 1000
        assert chunker.chunk_overlap == 200
        assert chunker.min_chunk_size == 100

    def test_real_world_text(self):
        """测试真实世界文本样本"""
        chunker = TextChunker(chunk_size=200, chunk_overlap=40, min_chunk_size=20)

        text = """Ottawa's economy grew by 3.2% in Q3 2025, driven primarily by the technology sector.

The technology sector added 1,500 new jobs in the quarter, with major contributions from AI/ML startups and established firms.

Housing market activity showed mixed signals, with new housing starts up 15% year-over-year but average prices declining 2.3%.

The tourism sector recovered to 92% of pre-pandemic levels, supported by major events and international conferences in the National Capital Region."""

        chunks = chunker.chunk_text(text, page_number=1)

        assert len(chunks) >= 2
        # 确保所有文本都被覆盖
        full_text = " ".join(c.text for c in chunks)
        assert "Ottawa" in full_text
        assert "tourism" in full_text
        # 所有块都有页码
        assert all(c.page_number == 1 for c in chunks)

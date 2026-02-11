"""
PDF 文本提取器测试

测试 PdfExtractor 的文本提取、空 PDF 处理、多页处理。
遵循 step-06-backend.md 的检查项。
"""

import fitz  # PyMuPDF
import pytest

from app.core.pdf_extractor import ExtractionResult, PageContent, PdfExtractor, PdfExtractorError


def _create_test_pdf(pages: list[str]) -> bytes:
    """创建测试用 PDF bytes"""
    doc = fitz.open()
    for text in pages:
        page = doc.new_page()
        page.insert_text((72, 72), text, fontsize=12)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


class TestPdfExtractor:
    """PdfExtractor 测试类"""

    def setup_method(self):
        self.extractor = PdfExtractor()

    def test_extract_single_page(self):
        """测试单页 PDF 提取"""
        pdf = _create_test_pdf(["Hello, this is a test document."])
        result = self.extractor.extract(pdf)

        assert isinstance(result, ExtractionResult)
        assert result.total_pages == 1
        assert len(result.pages) == 1
        assert "Hello" in result.pages[0].text
        assert result.pages[0].page_number == 1
        assert result.total_chars > 0

    def test_extract_multi_page(self):
        """测试多页 PDF 提取"""
        pages = [
            "Page one content with sufficient text to pass the minimum threshold.",
            "Page two content with sufficient text to pass the minimum threshold.",
            "Page three content with sufficient text to pass the minimum threshold.",
        ]
        pdf = _create_test_pdf(pages)
        result = self.extractor.extract(pdf)

        assert result.total_pages == 3
        assert len(result.pages) == 3
        assert result.pages[0].page_number == 1
        assert result.pages[1].page_number == 2
        assert result.pages[2].page_number == 3

    def test_extract_full_text(self):
        """测试 full_text 属性"""
        pages = [
            "First page text with enough content for testing.",
            "Second page text with enough content for testing.",
        ]
        pdf = _create_test_pdf(pages)
        result = self.extractor.extract(pdf)

        full_text = result.full_text
        assert "First page" in full_text
        assert "Second page" in full_text

    def test_extract_metadata(self):
        """测试元数据提取"""
        pdf = _create_test_pdf(["Some test content for metadata extraction testing."])
        result = self.extractor.extract(pdf)

        assert "page_count" in result.metadata
        assert result.metadata["page_count"] == 1

    def test_extract_empty_bytes_raises(self):
        """测试空 bytes 抛出异常"""
        with pytest.raises(PdfExtractorError, match="Empty PDF bytes"):
            self.extractor.extract(b"")

    def test_extract_invalid_pdf_raises(self):
        """测试无效 PDF 抛出异常"""
        with pytest.raises(PdfExtractorError, match="Failed to open PDF"):
            self.extractor.extract(b"not a pdf file")

    def test_extract_skips_empty_pages(self):
        """测试跳过空页（少于 min_page_chars 的页面）"""
        extractor = PdfExtractor(min_page_chars=50)
        # 第一页有足够内容，第二页几乎为空
        doc = fitz.open()
        page1 = doc.new_page()
        page1.insert_text((72, 72), "This is a page with sufficient text content for testing the extraction.", fontsize=12)
        page2 = doc.new_page()
        page2.insert_text((72, 72), "Hi", fontsize=12)
        pdf_bytes = doc.tobytes()
        doc.close()

        result = extractor.extract(pdf_bytes)
        assert result.total_pages == 2
        # 第二页应该被跳过
        assert len(result.pages) == 1
        assert result.pages[0].page_number == 1

    def test_extract_pages_specific_pages(self):
        """测试提取指定页面"""
        pages = [
            "Page 1 content with enough text for the test to work properly.",
            "Page 2 content with enough text for the test to work properly.",
            "Page 3 content with enough text for the test to work properly.",
        ]
        pdf = _create_test_pdf(pages)
        result = self.extractor.extract_pages(pdf, page_numbers=[1, 3])

        assert result.total_pages == 3
        assert len(result.pages) == 2
        assert result.pages[0].page_number == 1
        assert result.pages[1].page_number == 3

    def test_extract_pages_out_of_range(self):
        """测试超出范围的页码被忽略"""
        pdf = _create_test_pdf(["Only page with sufficient content for testing extraction."])
        result = self.extractor.extract_pages(pdf, page_numbers=[1, 5, 10])

        assert result.total_pages == 1
        assert len(result.pages) == 1

    def test_extract_pages_none_returns_all(self):
        """测试 page_numbers=None 返回所有页"""
        pages = [
            "Page 1 with enough content to pass the test threshold check.",
            "Page 2 with enough content to pass the test threshold check.",
        ]
        pdf = _create_test_pdf(pages)
        result = self.extractor.extract_pages(pdf, page_numbers=None)

        assert len(result.pages) == 2

    def test_page_content_char_count(self):
        """测试 PageContent 字符计数"""
        page = PageContent(page_number=1, text="Hello World")
        assert page.char_count == 11

"""
PDF Text Extractor

Extracts text from PDF files page-by-page using PyMuPDF (fitz).
First step in the RAG pipeline.

@template H1 backend/doc_intel/document_parser.py — PDF Parser (PyMuPDF)
@reference ragflow/deepdoc/ (OCR, Layout, Table recognition)
"""

import logging
from dataclasses import dataclass, field

import fitz  # PyMuPDF

logger = logging.getLogger(__name__)


@dataclass
class PageContent:
    """单页提取结果"""
    page_number: int    # 1-indexed
    text: str
    char_count: int = 0

    def __post_init__(self) -> None:
        self.char_count = len(self.text)


@dataclass
class ExtractionResult:
    """PDF 提取结果"""
    total_pages: int
    pages: list[PageContent] = field(default_factory=list)
    total_chars: int = 0
    metadata: dict = field(default_factory=dict)

    def __post_init__(self) -> None:
        self.total_chars = sum(p.char_count for p in self.pages)

    @property
    def full_text(self) -> str:
        """获取完整文本（所有页合并）"""
        return "\n\n".join(p.text for p in self.pages if p.text.strip())


class PdfExtractorError(Exception):
    """PDF 提取异常"""
    pass


class PdfExtractor:
    """
    PDF 文本提取器

    从 PDF bytes 中按页提取文本内容。
    支持文本型 PDF，扫描型 PDF 需要 OCR（暂不支持）。
    """

    def __init__(self, min_page_chars: int = 10) -> None:
        """
        初始化提取器

        Args:
            min_page_chars: 页面最小字符数，低于此值视为空页
        """
        self.min_page_chars = min_page_chars

    def extract(self, pdf_bytes: bytes) -> ExtractionResult:
        """
        从 PDF bytes 中提取文本

        Args:
            pdf_bytes: PDF 文件的二进制内容

        Returns:
            ExtractionResult: 提取结果

        Raises:
            PdfExtractorError: 如果 PDF 无法解析
        """
        if not pdf_bytes:
            raise PdfExtractorError("Empty PDF bytes provided")

        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        except Exception as e:
            raise PdfExtractorError(f"Failed to open PDF: {str(e)}") from e

        try:
            pages: list[PageContent] = []
            total_pages = len(doc)

            for page_num in range(total_pages):
                page = doc[page_num]
                text = page.get_text("text").strip()

                page_content = PageContent(
                    page_number=page_num + 1,  # 1-indexed
                    text=text,
                )

                if page_content.char_count >= self.min_page_chars:
                    pages.append(page_content)
                else:
                    logger.debug(
                        f"Skipping page {page_num + 1}: "
                        f"only {page_content.char_count} chars (min: {self.min_page_chars})"
                    )

            # 提取元数据
            metadata = self._extract_metadata(doc)

            return ExtractionResult(
                total_pages=total_pages,
                pages=pages,
                metadata=metadata,
            )
        finally:
            doc.close()

    def _extract_metadata(self, doc: fitz.Document) -> dict:
        """
        提取 PDF 元数据

        Args:
            doc: PyMuPDF 文档对象

        Returns:
            元数据字典
        """
        meta = doc.metadata or {}
        return {
            "title": meta.get("title", ""),
            "author": meta.get("author", ""),
            "subject": meta.get("subject", ""),
            "creator": meta.get("creator", ""),
            "producer": meta.get("producer", ""),
            "page_count": len(doc),
        }

    def extract_pages(
        self,
        pdf_bytes: bytes,
        page_numbers: list[int] | None = None,
    ) -> ExtractionResult:
        """
        提取指定页面的文本

        Args:
            pdf_bytes: PDF 文件的二进制内容
            page_numbers: 要提取的页码列表 (1-indexed)，None 表示全部

        Returns:
            ExtractionResult: 提取结果
        """
        if page_numbers is None:
            return self.extract(pdf_bytes)

        if not pdf_bytes:
            raise PdfExtractorError("Empty PDF bytes provided")

        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        except Exception as e:
            raise PdfExtractorError(f"Failed to open PDF: {str(e)}") from e

        try:
            pages: list[PageContent] = []
            total_pages = len(doc)

            for page_num in page_numbers:
                if page_num < 1 or page_num > total_pages:
                    logger.warning(
                        f"Page number {page_num} out of range (1-{total_pages}), skipping"
                    )
                    continue

                page = doc[page_num - 1]  # 0-indexed internally
                text = page.get_text("text").strip()

                page_content = PageContent(
                    page_number=page_num,
                    text=text,
                )

                if page_content.char_count >= self.min_page_chars:
                    pages.append(page_content)

            metadata = self._extract_metadata(doc)

            return ExtractionResult(
                total_pages=total_pages,
                pages=pages,
                metadata=metadata,
            )
        finally:
            doc.close()

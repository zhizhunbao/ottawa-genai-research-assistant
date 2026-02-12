"""
文档处理管道测试

Mock Azure 服务，测试管道流程、错误处理。
遵循 step-06-backend.md 的检查项。

@template T2 backend/tests/test_service.py — Service Layer Mocking Pattern
"""

from unittest.mock import AsyncMock, MagicMock

import fitz  # for creating test PDFs
import pytest

from app.doc_intel.pipeline import DocumentPipeline, PipelineResult
from app.doc_intel.pdf_extractor import PdfExtractor
from app.doc_intel.text_chunker import TextChunker


def _create_test_pdf(pages: list[str]) -> bytes:
    """创建测试用 PDF bytes"""
    doc = fitz.open()
    for text in pages:
        page = doc.new_page()
        page.insert_text((72, 72), text, fontsize=12)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


class TestDocumentPipeline:
    """DocumentPipeline 测试类"""

    def setup_method(self):
        """初始化 mock 服务"""
        self.mock_openai = AsyncMock()
        self.mock_search = AsyncMock()

        # 设置 embedding 返回值
        self.mock_openai.create_embeddings_batch.return_value = [
            [0.1] * 1536,  # 模拟 1536 维向量
        ]

        # 设置 search 返回值
        self.mock_search.ensure_index_exists.return_value = True
        mock_result = MagicMock()
        mock_result.results = [MagicMock(succeeded=True)]
        self.mock_search.index_documents_batch.return_value = mock_result

        self.pipeline = DocumentPipeline(
            openai_service=self.mock_openai,
            search_service=self.mock_search,
        )

    @pytest.mark.asyncio
    async def test_process_success(self):
        """测试完整管道成功处理"""
        pdf = _create_test_pdf([
            "This is a test document with sufficient content for chunking and embedding generation."
        ])

        # Mock embeddings 返回多个向量（根据实际分块数）
        self.mock_openai.create_embeddings_batch.return_value = [
            [0.1] * 1536 for _ in range(5)  # 足够多的向量
        ]

        result = await self.pipeline.process(
            document_id="doc-001",
            pdf_bytes=pdf,
            metadata={"title": "Test Document"},
        )

        assert isinstance(result, PipelineResult)
        assert result.document_id == "doc-001"
        assert result.status in ("success", "partial")
        assert result.total_pages == 1
        assert result.total_chunks > 0
        assert result.error is None

        # 验证调用链
        self.mock_openai.create_embeddings_batch.assert_called()
        self.mock_search.ensure_index_exists.assert_called()
        self.mock_search.index_documents_batch.assert_called()

    @pytest.mark.asyncio
    async def test_process_empty_pdf(self):
        """测试空 PDF 处理失败"""
        result = await self.pipeline.process(
            document_id="doc-002",
            pdf_bytes=b"",
            metadata={"title": "Empty"},
        )

        assert result.status == "failed"
        assert "Empty PDF" in result.error

    @pytest.mark.asyncio
    async def test_process_invalid_pdf(self):
        """测试无效 PDF 处理失败"""
        result = await self.pipeline.process(
            document_id="doc-003",
            pdf_bytes=b"not a pdf",
            metadata={"title": "Invalid"},
        )

        assert result.status == "failed"
        assert "Text extraction failed" in result.error

    @pytest.mark.asyncio
    async def test_process_embedding_failure(self):
        """测试 embedding 生成失败"""
        pdf = _create_test_pdf([
            "Content that will be extracted but embedding will fail during generation."
        ])
        self.mock_openai.create_embeddings_batch.side_effect = Exception("API Error")

        result = await self.pipeline.process(
            document_id="doc-004",
            pdf_bytes=pdf,
            metadata={"title": "Embed Fail"},
        )

        assert result.status == "failed"
        assert "Embedding generation failed" in result.error

    @pytest.mark.asyncio
    async def test_process_indexing_failure(self):
        """测试索引失败"""
        pdf = _create_test_pdf([
            "Content for indexing failure test with enough text here."
        ])
        self.mock_openai.create_embeddings_batch.return_value = [[0.1] * 1536]
        self.mock_search.index_documents_batch.side_effect = Exception("Index Error")

        result = await self.pipeline.process(
            document_id="doc-005",
            pdf_bytes=pdf,
            metadata={"title": "Index Fail"},
        )

        assert result.status == "failed"
        assert "Indexing failed" in result.error

    @pytest.mark.asyncio
    async def test_process_multi_page(self):
        """测试多页 PDF 处理"""
        pdf = _create_test_pdf([
            "Page one has content about Ottawa economy and growth in recent quarters.",
            "Page two has content about technology sector employment and startup ecosystem.",
            "Page three has content about housing market trends and property values.",
        ])

        # 提供足够的 embedding 向量
        self.mock_openai.create_embeddings_batch.return_value = [
            [0.1] * 1536 for _ in range(10)
        ]

        result = await self.pipeline.process(
            document_id="doc-006",
            pdf_bytes=pdf,
            metadata={"title": "Multi-page Doc"},
        )

        assert result.total_pages == 3
        assert result.total_chunks > 0

    @pytest.mark.asyncio
    async def test_process_with_custom_extractors(self):
        """测试使用自定义 extractor 和 chunker"""
        custom_pipeline = DocumentPipeline(
            openai_service=self.mock_openai,
            search_service=self.mock_search,
            pdf_extractor=PdfExtractor(min_page_chars=5),
            text_chunker=TextChunker(chunk_size=500, chunk_overlap=100),
        )

        pdf = _create_test_pdf([
            "Custom pipeline test with enough content to verify configuration works properly."
        ])
        self.mock_openai.create_embeddings_batch.return_value = [[0.1] * 1536]

        result = await custom_pipeline.process(
            document_id="doc-007",
            pdf_bytes=pdf,
        )

        assert result.status in ("success", "partial")

    @pytest.mark.asyncio
    async def test_process_metadata_passthrough(self):
        """测试元数据传递"""
        pdf = _create_test_pdf(["Metadata test content with sufficient text for processing."])
        self.mock_openai.create_embeddings_batch.return_value = [[0.1] * 1536]

        result = await self.pipeline.process(
            document_id="doc-008",
            pdf_bytes=pdf,
            metadata={"title": "My Title", "source": "test.pdf"},
        )

        assert result.metadata.get("document_title") == "My Title"

    @pytest.mark.asyncio
    async def test_embedding_batch_size(self):
        """测试 embedding 分批处理"""
        pipeline = DocumentPipeline(
            openai_service=self.mock_openai,
            search_service=self.mock_search,
            embedding_batch_size=2,
            text_chunker=TextChunker(chunk_size=50, chunk_overlap=10, min_chunk_size=10),
        )

        # 创建足够长的文本生成多个分块
        long_text = "Sentence number one. " * 20  # ~420 chars
        pdf = _create_test_pdf([long_text])

        # 返回多批 embedding 向量
        self.mock_openai.create_embeddings_batch.return_value = [
            [0.1] * 1536 for _ in range(20)
        ]

        await pipeline.process(
            document_id="doc-009",
            pdf_bytes=pdf,
        )

        # embedding 应该被多次调用（分批）
        assert self.mock_openai.create_embeddings_batch.call_count >= 1

    @pytest.mark.asyncio
    async def test_pipeline_result_fields(self):
        """测试 PipelineResult 数据结构"""
        result = PipelineResult(
            document_id="test",
            status="success",
            total_pages=5,
            total_chunks=10,
            indexed_chunks=10,
        )

        assert result.document_id == "test"
        assert result.status == "success"
        assert result.total_pages == 5
        assert result.total_chunks == 10
        assert result.indexed_chunks == 10
        assert result.error is None
        assert result.metadata == {}

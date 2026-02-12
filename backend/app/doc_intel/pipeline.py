"""
Document Processing Pipeline

Orchestrates the full document ingestion flow:
Extract (PDF → Text) → Chunk (Text → Chunks) → Embed (Vectorization) → Index (Azure AI Search)

@template H1 backend/doc_intel/document_parser.py — Generic Document Ingestion Pipeline
@reference ragflow/rag/app/naive.py (Extract → Chunk → Index Pipeline)
@reference azure-search-openai-demo/app/backend/prepdocslib/ (Ingestion Pipeline)
"""

import logging
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Any

from app.doc_intel.pdf_extractor import ExtractionResult, PdfExtractor, PdfExtractorError
from app.doc_intel.text_chunker import TextChunk, TextChunker

if TYPE_CHECKING:
    from app.azure.openai import AzureOpenAIService
    from app.azure.search import AzureSearchService

logger = logging.getLogger(__name__)


@dataclass
class PipelineResult:
    """管道处理结果"""
    document_id: str
    status: str  # "success" | "partial" | "failed"
    total_pages: int = 0
    total_chunks: int = 0
    indexed_chunks: int = 0
    error: str | None = None
    metadata: dict = field(default_factory=dict)


class DocumentPipelineError(Exception):
    """管道处理异常"""
    pass


class DocumentPipeline:
    """
    文档处理管道

    完整流程:
    1. PDF 文本提取 (PdfExtractor)
    2. 文本分块 (TextChunker)
    3. 批量生成 embedding (AzureOpenAIService.create_embeddings_batch)
    4. 批量索引 (AzureSearchService.index_documents_batch)

    Args:
        openai_service: Azure OpenAI 服务实例（用于 embedding 生成）
        search_service: Azure Search 服务实例（用于索引）
        pdf_extractor: PDF 提取器实例（可选，默认创建）
        text_chunker: 文本分块器实例（可选，默认创建）
        embedding_batch_size: Embedding 批处理大小
    """

    DEFAULT_EMBEDDING_BATCH_SIZE = 16

    def __init__(
        self,
        openai_service: "AzureOpenAIService",
        search_service: "AzureSearchService",
        pdf_extractor: PdfExtractor | None = None,
        text_chunker: TextChunker | None = None,
        embedding_batch_size: int = DEFAULT_EMBEDDING_BATCH_SIZE,
    ) -> None:
        self._openai = openai_service
        self._search = search_service
        self._extractor = pdf_extractor or PdfExtractor()
        self._chunker = text_chunker or TextChunker()
        self._embedding_batch_size = embedding_batch_size

    async def process(
        self,
        document_id: str,
        pdf_bytes: bytes,
        metadata: dict[str, Any] | None = None,
    ) -> PipelineResult:
        """
        处理 PDF 文档完整管道

        Args:
            document_id: 文档唯一标识
            pdf_bytes: PDF 文件内容
            metadata: 附加元数据（title, source 等）

        Returns:
            PipelineResult: 处理结果
        """
        doc_metadata = metadata or {}
        title = doc_metadata.get("title", "Untitled")

        logger.info(f"Starting pipeline for document {document_id}: '{title}'")

        # Step 1: 提取文本
        try:
            extraction = self._extract_text(pdf_bytes)
            logger.info(
                f"Extracted {extraction.total_pages} pages, "
                f"{extraction.total_chars} chars from '{title}'"
            )
        except PdfExtractorError as e:
            logger.error(f"Text extraction failed for {document_id}: {e}")
            return PipelineResult(
                document_id=document_id,
                status="failed",
                error=f"Text extraction failed: {str(e)}",
            )

        if not extraction.pages:
            logger.warning(f"No text content extracted from {document_id}")
            return PipelineResult(
                document_id=document_id,
                status="failed",
                total_pages=extraction.total_pages,
                error="No text content could be extracted from the PDF",
            )

        # Step 2: 分块
        chunks = self._chunk_text(extraction)
        logger.info(f"Created {len(chunks)} chunks for document {document_id}")

        if not chunks:
            return PipelineResult(
                document_id=document_id,
                status="failed",
                total_pages=extraction.total_pages,
                error="Text chunking produced no chunks",
            )

        # Step 3: 生成 embeddings
        try:
            embeddings = await self._generate_embeddings(chunks)
            logger.info(f"Generated {len(embeddings)} embeddings for document {document_id}")
        except Exception as e:
            logger.error(f"Embedding generation failed for {document_id}: {e}")
            return PipelineResult(
                document_id=document_id,
                status="failed",
                total_pages=extraction.total_pages,
                total_chunks=len(chunks),
                error=f"Embedding generation failed: {str(e)}",
            )

        # Step 4: 索引到 Azure AI Search
        try:
            indexed_count = await self._index_chunks(
                document_id=document_id,
                chunks=chunks,
                embeddings=embeddings,
                metadata=doc_metadata,
                pdf_metadata=extraction.metadata,
            )
            logger.info(f"Indexed {indexed_count}/{len(chunks)} chunks for document {document_id}")
        except Exception as e:
            logger.error(f"Indexing failed for {document_id}: {e}")
            return PipelineResult(
                document_id=document_id,
                status="failed",
                total_pages=extraction.total_pages,
                total_chunks=len(chunks),
                error=f"Indexing failed: {str(e)}",
            )

        status = "success" if indexed_count == len(chunks) else "partial"

        return PipelineResult(
            document_id=document_id,
            status=status,
            total_pages=extraction.total_pages,
            total_chunks=len(chunks),
            indexed_chunks=indexed_count,
            metadata={
                **extraction.metadata,
                "document_title": title,
            },
        )

    def _extract_text(self, pdf_bytes: bytes) -> ExtractionResult:
        """Step 1: 提取 PDF 文本"""
        return self._extractor.extract(pdf_bytes)

    def _chunk_text(self, extraction: ExtractionResult) -> list[TextChunk]:
        """Step 2: 分块"""
        pages = [
            {"text": page.text, "page_number": page.page_number}
            for page in extraction.pages
        ]
        return self._chunker.chunk_pages(pages)

    async def _generate_embeddings(
        self, chunks: list[TextChunk]
    ) -> list[list[float]]:
        """
        Step 3: 批量生成 embeddings

        分批处理以避免 API 限制
        """
        all_embeddings: list[list[float]] = []

        for i in range(0, len(chunks), self._embedding_batch_size):
            batch = chunks[i:i + self._embedding_batch_size]
            texts = [chunk.text for chunk in batch]

            logger.debug(
                f"Generating embeddings for batch {i // self._embedding_batch_size + 1} "
                f"({len(texts)} texts)"
            )

            batch_embeddings = await self._openai.create_embeddings_batch(texts)
            all_embeddings.extend(batch_embeddings)

        return all_embeddings

    async def _index_chunks(
        self,
        document_id: str,
        chunks: list[TextChunk],
        embeddings: list[list[float]],
        metadata: dict[str, Any],
        pdf_metadata: dict,
    ) -> int:
        """
        Step 4: 批量索引到 Azure AI Search

        Returns:
            成功索引的文档数量
        """
        title = metadata.get("title", pdf_metadata.get("title", "Untitled"))
        source = metadata.get("source", metadata.get("blob_name", ""))

        documents: list[dict[str, Any]] = []

        for chunk, embedding in zip(chunks, embeddings):
            doc_id = f"{document_id}_chunk_{chunk.chunk_index}"

            documents.append({
                "id": doc_id,
                "title": title,
                "content": chunk.text,
                "content_vector": embedding,
                "source": source,
                "document_id": document_id,
                "page_number": chunk.page_number,
                "chunk_index": chunk.chunk_index,
                "created_at": None,  # 自动设置
                "metadata": str({
                    "start_char": chunk.start_char,
                    "end_char": chunk.end_char,
                    "char_count": chunk.char_count,
                }),
            })

        # 确保索引存在
        await self._search.ensure_index_exists()

        # 批量索引
        result = await self._search.index_documents_batch(documents)

        # 统计成功数量
        indexed_count = len(documents)
        if hasattr(result, "results"):
            indexed_count = sum(
                1 for r in result.results if r.succeeded
            )

        return indexed_count

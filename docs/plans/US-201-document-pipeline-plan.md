# US-201: Automatic Document Pipeline - Implementation Plan

## Overview

实现文档自动处理管道，包括 PDF 解析、文本分块、向量嵌入生成，以及索引到 Azure AI Search。

**User Story**: US-201
**Sprint**: 3
**Story Points**: 13
**Status**: ✅ Done

---

## 需求重述

- 文档存储在 Azure Blob Storage / Microsoft Fabric
- 新文档自动触发处理管道
- 管道执行：分块 → 嵌入生成 → 索引到 Azure AI Search
- 支持查看处理状态 (Pending → Processing → Indexed)

---

## 实现阶段

### 阶段 1: 架构设计 (Travis Yi - 4h)

#### 1.1 处理管道架构

```
Document Upload → Blob Storage → PDF Extraction → Text Chunking
    → Embedding Generation → Azure AI Search Indexing
```

#### 1.2 状态机设计

```
PENDING → PROCESSING → INDEXED
              ↓
           FAILED
```

**验收**:
- [x] 架构设计文档完成
- [x] 数据流明确

---

### 阶段 2: PDF 文本提取 (Peng Wang - 6h)

#### 2.1 创建 PDF 提取服务

**文件**: `backend/app/core/pdf_extractor.py`

```python
"""PDF 文本提取服务"""

import fitz  # PyMuPDF
from typing import List, Dict

class PDFExtractor:
    """PDF 文本提取器"""

    def extract_text(self, pdf_bytes: bytes) -> List[Dict]:
        """提取 PDF 文本，按页返回"""
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        pages = []
        for page_num, page in enumerate(doc, 1):
            text = page.get_text()
            pages.append({
                "page_number": page_num,
                "content": text,
                "char_count": len(text)
            })
        return pages

    def extract_metadata(self, pdf_bytes: bytes) -> Dict:
        """提取 PDF 元数据"""
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        return {
            "title": doc.metadata.get("title", ""),
            "author": doc.metadata.get("author", ""),
            "page_count": len(doc),
            "creation_date": doc.metadata.get("creationDate", "")
        }
```

**依赖**: PyMuPDF
**风险**: Medium (PDF 格式多样性)

---

### 阶段 3: 文本分块 (Peng Wang - 6h)

#### 3.1 创建分块服务

**文件**: `backend/app/core/text_chunker.py`

```python
"""文本分块服务"""

from typing import List, Dict
from langchain.text_splitter import RecursiveCharacterTextSplitter

class TextChunker:
    """文本分块器"""

    def __init__(
        self,
        chunk_size: int = 1000,
        chunk_overlap: int = 200
    ):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", "。", ".", " ", ""]
        )

    def chunk_pages(self, pages: List[Dict]) -> List[Dict]:
        """对多页文档进行分块"""
        chunks = []
        for page in pages:
            page_chunks = self.splitter.split_text(page["content"])
            for i, chunk_text in enumerate(page_chunks):
                chunks.append({
                    "page_number": page["page_number"],
                    "chunk_index": i,
                    "content": chunk_text,
                    "char_count": len(chunk_text)
                })
        return chunks
```

**技术参数**:
| 参数 | 值 |
|------|-----|
| chunk_size | 1000 字符 |
| chunk_overlap | 200 字符 |
| 分隔符优先级 | 段落 > 句子 > 空格 |

---

### 阶段 4: 嵌入生成与索引 (Peng Wang - 11h)

#### 4.1 更新 Azure OpenAI 服务

**文件**: `backend/app/core/azure_openai.py`

添加批量嵌入生成方法：

```python
async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
    """批量生成文本嵌入"""
    embeddings = []
    for text in texts:
        response = await self.client.embeddings.create(
            model=self.embedding_model,
            input=text
        )
        embeddings.append(response.data[0].embedding)
    return embeddings
```

#### 4.2 更新 Azure Search 服务

**文件**: `backend/app/core/azure_search.py`

添加文档索引方法：

```python
async def index_documents(self, documents: List[Dict]) -> int:
    """批量索引文档到 Azure AI Search"""
    batch = IndexDocumentsBatch()
    for doc in documents:
        batch.add_upload_actions([doc])
    result = await self.search_client.index_documents(batch)
    return len([r for r in result if r.succeeded])
```

---

### 阶段 5: 完整管道集成 (Peng Wang - 6h)

#### 5.1 创建文档处理管道

**文件**: `backend/app/core/document_pipeline.py`

```python
"""文档处理管道"""

class DocumentPipeline:
    """端到端文档处理管道"""

    def __init__(
        self,
        pdf_extractor: PDFExtractor,
        text_chunker: TextChunker,
        openai_service: AzureOpenAIService,
        search_service: AzureSearchService
    ):
        self.pdf_extractor = pdf_extractor
        self.text_chunker = text_chunker
        self.openai_service = openai_service
        self.search_service = search_service

    async def process_document(
        self,
        document_id: str,
        pdf_bytes: bytes,
        filename: str
    ) -> ProcessingResult:
        """处理单个文档"""
        # 1. 提取文本
        pages = self.pdf_extractor.extract_text(pdf_bytes)

        # 2. 分块
        chunks = self.text_chunker.chunk_pages(pages)

        # 3. 生成嵌入
        texts = [c["content"] for c in chunks]
        embeddings = await self.openai_service.generate_embeddings(texts)

        # 4. 准备索引文档
        search_docs = []
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            search_docs.append({
                "id": f"{document_id}_chunk_{i}",
                "document_id": document_id,
                "filename": filename,
                "page_number": chunk["page_number"],
                "chunk_index": chunk["chunk_index"],
                "content": chunk["content"],
                "content_vector": embedding
            })

        # 5. 索引到 Azure AI Search
        indexed_count = await self.search_service.index_documents(search_docs)

        return ProcessingResult(
            document_id=document_id,
            chunk_count=len(chunks),
            indexed_count=indexed_count
        )
```

---

### 阶段 6: 状态跟踪 API (Peng Wang - 4h)

#### 6.1 创建状态 Schema

**文件**: `backend/app/documents/schemas.py`

```python
class DocumentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    INDEXED = "indexed"
    FAILED = "failed"

class DocumentStatusResponse(BaseModel):
    id: str
    filename: str
    status: DocumentStatus
    chunk_count: Optional[int] = None
    indexed_at: Optional[datetime] = None
    error_message: Optional[str] = None
```

#### 6.2 创建状态 API

**文件**: `backend/app/documents/routes.py`

```python
@router.get("/{document_id}/status")
async def get_document_status(
    document_id: str,
    service: DocumentService = Depends(get_document_service)
) -> DocumentStatusResponse:
    """获取文档处理状态"""
    return await service.get_status(document_id)
```

---

### 阶段 7: 前端状态 UI (Hye Ran Yoo - 4h)

#### 7.1 创建状态组件

**文件**: `frontend/src/features/research/components/DocumentStatus.tsx`

- 显示文档列表
- 显示处理状态 (Pending/Processing/Indexed/Failed)
- 自动刷新状态

---

### 阶段 8: 端到端测试 (Hye Ran Yoo - 4h)

#### 8.1 单元测试

- PDF 提取测试
- 分块测试
- 嵌入生成测试

#### 8.2 集成测试

- 完整管道测试
- API 端点测试

---

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 新建 | `backend/app/core/pdf_extractor.py` | PDF 提取服务 |
| 新建 | `backend/app/core/text_chunker.py` | 文本分块服务 |
| 新建 | `backend/app/core/document_pipeline.py` | 处理管道 |
| 修改 | `backend/app/core/azure_openai.py` | 添加批量嵌入 |
| 修改 | `backend/app/core/azure_search.py` | 添加索引方法 |
| 修改 | `backend/app/documents/schemas.py` | 添加状态 Schema |
| 修改 | `backend/app/documents/routes.py` | 添加状态 API |
| 新建 | `frontend/src/features/research/components/DocumentStatus.tsx` | 状态 UI |
| 新建 | `backend/tests/core/test_document_pipeline.py` | 管道测试 |

---

## 技术规格

| 参数 | 规格 |
|------|------|
| PDF 库 | PyMuPDF (fitz) |
| 分块大小 | 1000 字符 |
| 分块重叠 | 200 字符 |
| 嵌入模型 | text-embedding-ada-002 |
| 嵌入维度 | 1536 |

---

## 成功标准

- [x] PDF 文档可被成功解析
- [x] 文本分块正确执行
- [x] 嵌入向量正确生成
- [x] 文档成功索引到 Azure AI Search
- [x] 状态 API 正常工作
- [x] 前端可查看处理状态

---

## 估算复杂度: HIGH

| 部分 | 时间估算 | 状态 |
|------|----------|------|
| 架构设计 | 4h | ✅ 完成 |
| PDF 提取 | 6h | ✅ 完成 |
| 文本分块 | 6h | ✅ 完成 |
| 嵌入与索引 | 11h | ✅ 完成 |
| 管道集成 | 6h | ✅ 完成 |
| 状态 API | 4h | ✅ 完成 |
| 前端 UI | 4h | ✅ 完成 |
| 测试 | 4h | ✅ 完成 |
| **总计** | **45h** | **100%** |

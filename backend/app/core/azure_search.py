"""
Azure AI Search 服务

提供向量搜索和混合搜索功能。
遵循 dev-backend_patterns skill 规范。
"""

from datetime import datetime
from typing import List, Optional, Dict, Any

from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    SearchIndex,
    SearchField,
    SearchFieldDataType,
    SimpleField,
    SearchableField,
    VectorSearch,
    HnswAlgorithmConfiguration,
    VectorSearchProfile,
    SearchIndex,
)
from azure.search.documents.models import VectorizedQuery
from azure.core.exceptions import ResourceNotFoundError

from app.core.config import settings


class AzureSearchError(Exception):
    """Azure Search 服务异常"""
    pass


class AzureSearchService:
    """Azure AI Search 服务类"""

    # 索引 Schema 定义
    INDEX_FIELDS = [
        SimpleField(
            name="id",
            type=SearchFieldDataType.String,
            key=True,
            filterable=True,
        ),
        SearchableField(
            name="title",
            type=SearchFieldDataType.String,
            analyzer_name="standard.lucene",
        ),
        SearchableField(
            name="content",
            type=SearchFieldDataType.String,
            analyzer_name="standard.lucene",
        ),
        SearchField(
            name="content_vector",
            type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
            searchable=True,
            vector_search_dimensions=1536,
            vector_search_profile_name="default-profile",
        ),
        SimpleField(
            name="source",
            type=SearchFieldDataType.String,
            filterable=True,
            facetable=True,
        ),
        SimpleField(
            name="document_id",
            type=SearchFieldDataType.String,
            filterable=True,
        ),
        SimpleField(
            name="page_number",
            type=SearchFieldDataType.Int32,
            filterable=True,
        ),
        SimpleField(
            name="chunk_index",
            type=SearchFieldDataType.Int32,
        ),
        SimpleField(
            name="created_at",
            type=SearchFieldDataType.DateTimeOffset,
            filterable=True,
            sortable=True,
        ),
    ]

    def __init__(
        self,
        endpoint: str,
        api_key: str,
        index_name: str,
    ):
        """
        初始化 Azure Search 服务

        Args:
            endpoint: Azure Search 服务 endpoint
            api_key: Admin API Key
            index_name: 索引名称
        """
        if not endpoint or not api_key:
            raise ValueError(
                "Azure Search endpoint and API key are required. "
                "Please set AZURE_SEARCH_ENDPOINT and AZURE_SEARCH_API_KEY."
            )

        self.endpoint = endpoint
        self.index_name = index_name
        self._credential = AzureKeyCredential(api_key)

        # 初始化客户端
        self._index_client = SearchIndexClient(
            endpoint=endpoint,
            credential=self._credential,
        )
        self._search_client = SearchClient(
            endpoint=endpoint,
            index_name=index_name,
            credential=self._credential,
        )

    async def ensure_index_exists(self) -> bool:
        """
        确保索引存在，不存在则创建

        Returns:
            bool: 是否成功
        """
        try:
            self._index_client.get_index(self.index_name)
            return True
        except ResourceNotFoundError:
            return await self.create_index()

    async def create_index(self) -> bool:
        """
        创建搜索索引

        Returns:
            bool: 是否成功创建
        """
        try:
            # 配置向量搜索
            vector_search = VectorSearch(
                algorithms=[
                    HnswAlgorithmConfiguration(
                        name="default-algorithm",
                    ),
                ],
                profiles=[
                    VectorSearchProfile(
                        name="default-profile",
                        algorithm_configuration_name="default-algorithm",
                    ),
                ],
            )

            # 创建索引
            index = SearchIndex(
                name=self.index_name,
                fields=self.INDEX_FIELDS,
                vector_search=vector_search,
            )

            self._index_client.create_or_update_index(index)
            return True
        except Exception as e:
            raise AzureSearchError(f"Failed to create index: {str(e)}") from e

    async def index_document(
        self,
        doc_id: str,
        title: str,
        content: str,
        content_vector: List[float],
        source: str,
        document_id: str,
        page_number: int = 0,
        chunk_index: int = 0,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        索引单个文档块

        Args:
            doc_id: 唯一标识符
            title: 文档标题
            content: 文本内容
            content_vector: 向量嵌入 (1536维)
            source: 来源
            document_id: 原始文档 ID
            page_number: 页码
            chunk_index: 块索引
            metadata: 额外元数据

        Returns:
            索引结果
        """
        try:
            document = {
                "id": doc_id,
                "title": title,
                "content": content,
                "content_vector": content_vector,
                "source": source,
                "document_id": document_id,
                "page_number": page_number,
                "chunk_index": chunk_index,
                "created_at": datetime.utcnow().isoformat() + "Z",
            }

            result = self._search_client.upload_documents([document])
            return {
                "id": doc_id,
                "success": result[0].succeeded,
            }
        except Exception as e:
            raise AzureSearchError(f"Failed to index document: {str(e)}") from e

    async def index_documents_batch(
        self,
        documents: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        批量索引文档

        Args:
            documents: 文档列表

        Returns:
            批量索引结果
        """
        try:
            # 添加时间戳
            for doc in documents:
                if "created_at" not in doc:
                    doc["created_at"] = datetime.utcnow().isoformat() + "Z"

            result = self._search_client.upload_documents(documents)
            succeeded = sum(1 for r in result if r.succeeded)
            return {
                "total": len(documents),
                "succeeded": succeeded,
                "failed": len(documents) - succeeded,
            }
        except Exception as e:
            raise AzureSearchError(f"Failed to batch index documents: {str(e)}") from e

    async def search(
        self,
        query: str,
        query_vector: Optional[List[float]] = None,
        top_k: int = 5,
        filters: Optional[str] = None,
        select: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        """
        执行混合搜索 (向量 + 关键词)

        Args:
            query: 搜索查询文本
            query_vector: 查询向量 (可选，用于向量搜索)
            top_k: 返回结果数量
            filters: OData 过滤表达式
            select: 返回字段列表

        Returns:
            搜索结果列表
        """
        try:
            search_kwargs: Dict[str, Any] = {
                "search_text": query,
                "top": top_k,
                "include_total_count": True,
            }

            if filters:
                search_kwargs["filter"] = filters

            if select:
                search_kwargs["select"] = select
            else:
                search_kwargs["select"] = [
                    "id", "title", "content", "source",
                    "document_id", "page_number", "chunk_index",
                ]

            # 如果提供了向量，启用混合搜索
            if query_vector:
                vector_query = VectorizedQuery(
                    vector=query_vector,
                    k_nearest_neighbors=top_k,
                    fields="content_vector",
                )
                search_kwargs["vector_queries"] = [vector_query]

            results = self._search_client.search(**search_kwargs)

            search_results = []
            for result in results:
                search_results.append({
                    "id": result["id"],
                    "title": result.get("title", ""),
                    "content": result.get("content", ""),
                    "source": result.get("source", ""),
                    "document_id": result.get("document_id", ""),
                    "page_number": result.get("page_number", 0),
                    "chunk_index": result.get("chunk_index", 0),
                    "score": result["@search.score"],
                })

            return search_results
        except Exception as e:
            raise AzureSearchError(f"Search failed: {str(e)}") from e

    async def delete_document(self, doc_id: str) -> bool:
        """
        删除单个文档

        Args:
            doc_id: 文档 ID

        Returns:
            是否成功
        """
        try:
            result = self._search_client.delete_documents([{"id": doc_id}])
            return result[0].succeeded
        except Exception as e:
            raise AzureSearchError(f"Failed to delete document: {str(e)}") from e

    async def delete_by_document_id(self, document_id: str) -> int:
        """
        删除指定文档的所有块

        Args:
            document_id: 原始文档 ID

        Returns:
            删除的文档数量
        """
        try:
            # 搜索所有相关文档
            results = self._search_client.search(
                search_text="*",
                filter=f"document_id eq '{document_id}'",
                select=["id"],
            )

            doc_ids = [{"id": r["id"]} for r in results]
            if not doc_ids:
                return 0

            result = self._search_client.delete_documents(doc_ids)
            return sum(1 for r in result if r.succeeded)
        except Exception as e:
            raise AzureSearchError(f"Failed to delete documents: {str(e)}") from e

    async def get_document_count(self) -> int:
        """
        获取索引中的文档数量

        Returns:
            文档数量
        """
        try:
            results = self._search_client.search(
                search_text="*",
                include_total_count=True,
                top=0,
            )
            return results.get_count() or 0
        except Exception as e:
            raise AzureSearchError(f"Failed to get document count: {str(e)}") from e

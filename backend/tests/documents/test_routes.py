"""
文档路由集成测试

遵循 dev-tdd_workflow skill 的测试模式。
测试 RESTful API 端点。
"""

import pytest
from httpx import AsyncClient


class TestDocumentRoutes:
    """DocumentRoutes 测试类"""

    @pytest.mark.asyncio
    async def test_list_documents_empty(self, client: AsyncClient) -> None:
        """测试初始列表为空"""
        response = await client.get("/api/v1/documents")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["data"]["items"]) == 0

    @pytest.mark.asyncio
    async def test_upload_document_success(self, client: AsyncClient) -> None:
        """测试模拟上传请求"""
        # 注意：这里模拟的是 JSON 请求，实际文件上传可能用 multipart/form-data
        payload = {
            "title": "Ottawa Stats",
            "file_name": "stats.pdf",
            "file_size": 500000,
            "tags": ["stats"]
        }
        response = await client.post("/api/v1/documents", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["title"] == "Ottawa Stats"
        assert data["data"]["id"] is not None

    @pytest.mark.asyncio
    async def test_get_document_success(self, client: AsyncClient) -> None:
        """测试获取单个文档"""
        # 先创建一个
        create_res = await client.post("/api/v1/documents", json={
            "title": "To Get", "file_name": "x.pdf", "file_size": 10
        })
        doc_id = create_res.json()["data"]["id"]

        # 获取
        response = await client.get(f"/api/v1/documents/{doc_id}")
        assert response.status_code == 200
        assert response.json()["data"]["id"] == doc_id

    @pytest.mark.asyncio
    async def test_get_document_not_found(self, client: AsyncClient) -> None:
        """测试获取不存在的文档"""
        response = await client.get("/api/v1/documents/missing-id")
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_document_success(self, client: AsyncClient) -> None:
        """测试删除文档"""
        # 先创建一个
        create_res = await client.post("/api/v1/documents", json={
            "title": "To Delete", "file_name": "x.pdf", "file_size": 10
        })
        doc_id = create_res.json()["data"]["id"]

        # 删除
        response = await client.delete(f"/api/v1/documents/{doc_id}")
        assert response.status_code == 200
        assert response.json()["success"] is True

        # 验证已删除
        get_res = await client.get(f"/api/v1/documents/{doc_id}")
        assert get_res.status_code == 404

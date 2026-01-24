"""
分析路由集成测试

遵循 dev-tdd_workflow skill 的 API 集成测试模式。
遵循 dev-terminology skill 的命名规范。
"""

import pytest
from httpx import AsyncClient


class TestAnalysisRoutes:
    """分析路由测试类"""

    # ==================== POST /visualize 测试 ====================

    @pytest.mark.asyncio
    async def test_visualize_success(self, client: AsyncClient) -> None:
        """测试成功生成图表"""
        # Arrange
        request_data = {
            "query": "Ottawa employment trends",
            "analysis_type": "chart",
        }

        # Act
        response = await client.post("/api/v1/analysis/visualize", json=request_data)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "labels" in data["data"]
        assert "datasets" in data["data"]

    @pytest.mark.asyncio
    async def test_visualize_with_document_ids(self, client: AsyncClient) -> None:
        """测试带文档 ID 的图表生成"""
        # Arrange
        request_data = {
            "query": "analyze these documents",
            "document_ids": ["doc-1", "doc-2"],
            "analysis_type": "chart",
        }

        # Act
        response = await client.post("/api/v1/analysis/visualize", json=request_data)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_visualize_missing_query(self, client: AsyncClient) -> None:
        """测试缺少查询字段"""
        # Arrange
        request_data = {
            "analysis_type": "chart",
        }

        # Act
        response = await client.post("/api/v1/analysis/visualize", json=request_data)

        # Assert
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_visualize_missing_analysis_type(self, client: AsyncClient) -> None:
        """测试缺少分析类型"""
        # Arrange
        request_data = {
            "query": "test query",
        }

        # Act
        response = await client.post("/api/v1/analysis/visualize", json=request_data)

        # Assert
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_visualize_invalid_analysis_type(self, client: AsyncClient) -> None:
        """测试无效的分析类型"""
        # Arrange
        request_data = {
            "query": "test",
            "analysis_type": "invalid_type",
        }

        # Act
        response = await client.post("/api/v1/analysis/visualize", json=request_data)

        # Assert
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_visualize_response_structure(self, client: AsyncClient) -> None:
        """测试图表响应结构"""
        # Arrange
        request_data = {
            "query": "test",
            "analysis_type": "chart",
        }

        # Act
        response = await client.post("/api/v1/analysis/visualize", json=request_data)

        # Assert
        assert response.status_code == 200
        data = response.json()
        
        # 验证 ApiResponse 结构
        assert "success" in data
        assert "data" in data
        
        # 验证 ChartData 结构
        chart_data = data["data"]
        assert "labels" in chart_data
        assert "datasets" in chart_data
        assert "chart_type" in chart_data

    # ==================== POST /speaking-notes 测试 ====================

    @pytest.mark.asyncio
    async def test_speaking_notes_success(self, client: AsyncClient) -> None:
        """测试成功生成发言稿"""
        # Arrange
        request_data = {
            "query": "Ottawa economic update",
            "analysis_type": "speaking_notes",
        }

        # Act
        response = await client.post("/api/v1/analysis/speaking-notes", json=request_data)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "title" in data["data"]
        assert "key_points" in data["data"]
        assert "statistics" in data["data"]
        assert "conclusion" in data["data"]

    @pytest.mark.asyncio
    async def test_speaking_notes_with_documents(self, client: AsyncClient) -> None:
        """测试带文档 ID 的发言稿生成"""
        # Arrange
        request_data = {
            "query": "summarize reports",
            "document_ids": ["doc-1"],
            "analysis_type": "speaking_notes",
        }

        # Act
        response = await client.post("/api/v1/analysis/speaking-notes", json=request_data)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_speaking_notes_missing_query(self, client: AsyncClient) -> None:
        """测试缺少查询字段"""
        # Arrange
        request_data = {
            "analysis_type": "speaking_notes",
        }

        # Act
        response = await client.post("/api/v1/analysis/speaking-notes", json=request_data)

        # Assert
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_speaking_notes_response_structure(self, client: AsyncClient) -> None:
        """测试发言稿响应结构"""
        # Arrange
        request_data = {
            "query": "quarterly update",
            "analysis_type": "speaking_notes",
        }

        # Act
        response = await client.post("/api/v1/analysis/speaking-notes", json=request_data)

        # Assert
        assert response.status_code == 200
        data = response.json()
        
        # 验证 SpeakingNotes 结构
        notes = data["data"]
        assert isinstance(notes["title"], str)
        assert isinstance(notes["key_points"], list)
        assert isinstance(notes["statistics"], list)
        assert isinstance(notes["conclusion"], str)

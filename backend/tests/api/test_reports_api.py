"""
📊 Report Generation API Tests

报告生成API测试套件 - 符合编码规范
- 使用 monk/ 目录的真实数据
- 通过 Repository 模式访问数据
- 禁止硬编码数据和Mock数据

测试端点:
- POST /reports/generate
- GET /reports/list
- GET /reports/{report_id}
- DELETE /reports/{report_id}
- GET /reports/{report_id}/download
"""

import datetime
import json
import os
from pathlib import Path

import pytest
from app.repositories.document_repository import DocumentRepository
from app.repositories.user_repository import UserRepository
from fastapi import status
from fastapi.testclient import TestClient


class TestReportsAPI:
    """报告生成API测试 - 使用真实数据"""

    @pytest.fixture
    def real_user_id(self):
        """从 monk/users/users.json 获取真实用户ID"""
        # 使用相对路径指向monk目录，避免在tests目录创建文件
        monk_path = "monk/users/users.json"
        user_repo = UserRepository(data_file=monk_path)
        users = user_repo.find_all()
        if not users:
            pytest.skip("No users found in monk/users/users.json")
        return users[0].id

    @pytest.fixture
    def real_user(self):
        """从 monk/users/users.json 获取真实用户对象"""
        monk_path = "monk/users/users.json"
        user_repo = UserRepository(data_file=monk_path)
        users = user_repo.find_all()
        if not users:
            pytest.skip("No users found in monk/users/users.json")
        return users[0]

    @pytest.fixture
    def real_document_ids(self):
        """从 monk/documents/documents.json 获取真实文档ID列表"""
        # 使用相对路径指向monk目录，避免在tests目录创建文件
        monk_path = "monk/documents/documents.json"
        doc_repo = DocumentRepository(data_file=monk_path)
        documents = doc_repo.find_all()
        if not documents:
            pytest.skip("No documents found in monk/documents/documents.json")
        return [doc.id for doc in documents[:2]]  # 取前两个文档ID

    @pytest.fixture
    def authenticated_client(self, real_user):
        """创建已认证的测试客户端"""
        from app.api.auth import get_current_user
        from app.main import app
        
        app.dependency_overrides[get_current_user] = lambda: real_user
        
        with TestClient(app) as test_client:
            yield test_client
        
        # 清理依赖覆盖
        app.dependency_overrides.clear()

    @pytest.mark.api
    def test_generate_report_success(self, authenticated_client: TestClient, real_document_ids):
        """测试生成报告成功 - 使用真实文档ID"""
        report_request = {
            "query": "What are the latest trends in economic development for Ottawa?",
            "language": "en",
            "include_charts": True,
            "format": "html",
            "document_ids": real_document_ids
        }
        
        response = authenticated_client.post(
            "/api/v1/reports/generate",
            json=report_request
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # 验证报告生成响应结构
        assert "id" in data
        assert "title" in data
        assert "sections" in data
        assert "language" in data
        assert "format" in data
        assert "status" in data
        
        # 验证报告内容
        assert data["language"] == "en"
        assert data["format"] == "html"
        assert isinstance(data["sections"], list)
        assert len(data["sections"]) > 0
        
        # 验证使用了指定的文档
        if "document_sources" in data:
            for doc_id in real_document_ids:
                assert doc_id in data["document_sources"]

    @pytest.mark.api
    def test_generate_report_french_language(self, authenticated_client: TestClient, real_document_ids):
        """测试生成法语报告"""
        report_request = {
            "query": "Quelles sont les dernières tendances du développement économique à Ottawa?",
            "language": "fr",
            "include_charts": False,
            "format": "pdf",
            "document_ids": real_document_ids
        }
        
        response = authenticated_client.post(
            "/api/v1/reports/generate",
            json=report_request
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # 验证法语报告
        assert data["language"] == "fr"
        assert data["format"] == "pdf"
        assert "sections" in data

    @pytest.mark.api
    def test_generate_report_without_auth(self, client: TestClient, real_document_ids):
        """测试未认证生成报告"""
        report_request = {
            "query": "Test query",
            "language": "en",
            "document_ids": real_document_ids
        }
        
        response = client.post("/api/v1/reports/generate", json=report_request)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.api
    def test_generate_report_invalid_data(self, authenticated_client: TestClient):
        """测试生成报告无效数据"""
        invalid_request = {
            "language": "en"  # 缺少必需的query字段
        }
        
        response = authenticated_client.post(
            "/api/v1/reports/generate",
            json=invalid_request
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.api
    def test_generate_report_invalid_language(self, authenticated_client: TestClient, real_document_ids):
        """测试生成报告使用无效语言"""
        report_request = {
            "query": "Test query",
            "language": "invalid_lang",  # 无效语言
            "document_ids": real_document_ids
        }
        
        response = authenticated_client.post(
            "/api/v1/reports/generate",
            json=report_request
        )
        
        # 根据API实现，可能返回400或422
        assert response.status_code in [status.HTTP_400_BAD_REQUEST, status.HTTP_422_UNPROCESSABLE_ENTITY]

    @pytest.mark.api
    def test_generate_report_invalid_format(self, authenticated_client: TestClient, real_document_ids):
        """测试生成报告使用无效格式"""
        report_request = {
            "query": "Test query",
            "language": "en",
            "format": "invalid_format",  # 无效格式
            "document_ids": real_document_ids
        }
        
        response = authenticated_client.post(
            "/api/v1/reports/generate",
            json=report_request
        )
        
        # 根据API实现，可能返回400或422
        assert response.status_code in [status.HTTP_400_BAD_REQUEST, status.HTTP_422_UNPROCESSABLE_ENTITY]

    @pytest.mark.api
    def test_generate_report_nonexistent_documents(self, authenticated_client: TestClient):
        """测试使用不存在的文档ID生成报告"""
        report_request = {
            "query": "Test query",
            "language": "en",
            "document_ids": ["nonexistent_doc_1", "nonexistent_doc_2"]
        }
        
        response = authenticated_client.post(
            "/api/v1/reports/generate",
            json=report_request
        )
        
        # 根据API实现，可能返回400或404
        assert response.status_code in [status.HTTP_400_BAD_REQUEST, status.HTTP_404_NOT_FOUND]

    @pytest.mark.api
    def test_list_reports_success(self, authenticated_client: TestClient):
        """测试获取报告列表成功"""
        response = authenticated_client.get(
            "/api/v1/reports/list"
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # 验证报告列表结构
        assert "reports" in data
        assert "total" in data
        assert isinstance(data["reports"], list)
        assert isinstance(data["total"], int)
        
        # 验证报告数据结构
        if data["reports"]:
            report = data["reports"][0]
            assert "id" in report
            assert "title" in report
            assert "query" in report
            assert "language" in report
            assert "format" in report
            assert "generated_at" in report  # API returns generated_at, not created_at
            assert "status" in report

    @pytest.mark.api
    def test_list_reports_with_pagination(self, authenticated_client: TestClient):
        """测试带分页的报告列表"""
        response = authenticated_client.get(
            "/api/v1/reports/list?limit=5&offset=0"
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["reports"]) <= 5

    @pytest.mark.api
    def test_list_reports_filter_by_language(self, authenticated_client: TestClient):
        """测试按语言过滤报告列表"""
        response = authenticated_client.get(
            "/api/v1/reports/list?language=en"
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # 验证所有报告都是指定语言
        for report in data["reports"]:
            assert report["language"] == "en"

    @pytest.mark.api
    def test_list_reports_filter_by_format(self, authenticated_client: TestClient):
        """测试按格式过滤报告列表"""
        response = authenticated_client.get(
            "/api/v1/reports/list?format=html"
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # 验证所有报告都是指定格式
        for report in data["reports"]:
            assert report["format"] == "html"

    @pytest.mark.api
    def test_list_reports_without_auth(self, client: TestClient):
        """测试未认证获取报告列表"""
        response = client.get("/api/v1/reports/list")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.api
    def test_get_report_by_id_success(self, authenticated_client: TestClient, real_document_ids):
        """测试通过ID获取报告成功"""
        # 首先生成一个报告
        monk_path = "monk/documents/documents.json"
        doc_repo = DocumentRepository(data_file=monk_path)
        documents = doc_repo.find_all()
        if not documents:
            pytest.skip("No documents found for report generation")
        
        report_request = {
            "query": "Test report for retrieval",
            "language": "en",
            "format": "html",
            "document_ids": [documents[0].id]
        }
        
        create_response = authenticated_client.post(
            "/api/v1/reports/generate",
            json=report_request
        )
        
        assert create_response.status_code == status.HTTP_200_OK
        created_report = create_response.json()
        report_id = created_report["id"]
        
        # 获取报告详情
        get_response = authenticated_client.get(
            f"/api/v1/reports/{report_id}"
        )
        
        assert get_response.status_code == status.HTTP_200_OK
        data = get_response.json()
        
        # 验证报告详情
        assert data["id"] == report_id
        assert "title" in data
        assert "sections" in data
        assert "language" in data
        assert "format" in data
        assert "generated_at" in data  # API uses generated_at, not created_at
        assert "status" in data

    @pytest.mark.api
    def test_get_report_by_id_not_found(self, authenticated_client: TestClient):
        """测试获取不存在的报告"""
        response = authenticated_client.get(
            "/api/v1/reports/nonexistent_report_id"
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.api
    def test_get_report_by_id_without_auth(self, client: TestClient):
        """测试未认证获取报告详情"""
        response = client.get("/api/v1/reports/some_report_id")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.api
    def test_delete_report_success(self, authenticated_client: TestClient, real_document_ids):
        """测试删除报告成功"""
        # 首先生成一个报告
        monk_path = "monk/documents/documents.json"
        doc_repo = DocumentRepository(data_file=monk_path)
        documents = doc_repo.find_all()
        if not documents:
            pytest.skip("No documents found for report generation")
        
        report_request = {
            "query": "Test report for deletion",
            "language": "en",
            "format": "html",
            "document_ids": [documents[0].id]
        }
        
        create_response = authenticated_client.post(
            "/api/v1/reports/generate",
            json=report_request
        )
        
        assert create_response.status_code == status.HTTP_200_OK
        created_report = create_response.json()
        report_id = created_report["id"]
        
        # 删除报告
        delete_response = authenticated_client.delete(
            f"/api/v1/reports/{report_id}"
        )
        
        assert delete_response.status_code == status.HTTP_200_OK
        result = delete_response.json()
        assert "message" in result
        assert "successfully" in result["message"].lower()

    @pytest.mark.api
    def test_delete_report_not_found(self, authenticated_client: TestClient):
        """测试删除不存在的报告"""
        response = authenticated_client.delete(
            "/api/v1/reports/nonexistent_report_id"
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.api
    def test_delete_report_without_auth(self, client: TestClient):
        """测试未认证删除报告"""
        response = client.delete("/api/v1/reports/some_report_id")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.api
    def test_download_report_success(self, authenticated_client: TestClient, real_document_ids):
        """测试下载报告成功"""
        # 首先生成一个报告
        monk_path = "monk/documents/documents.json"
        doc_repo = DocumentRepository(data_file=monk_path)
        documents = doc_repo.find_all()
        if not documents:
            pytest.skip("No documents found for report generation")
        
        report_request = {
            "query": "Test report for download",
            "language": "en",
            "format": "html",
            "document_ids": [documents[0].id]
        }
        
        create_response = authenticated_client.post(
            "/api/v1/reports/generate",
            json=report_request
        )
        
        assert create_response.status_code == status.HTTP_200_OK
        created_report = create_response.json()
        report_id = created_report["id"]
        
        # 下载报告
        download_response = authenticated_client.get(
            f"/api/v1/reports/{report_id}/download"
        )
        
        # 根据报告状态，可能返回200（成功）或400（未就绪）
        assert download_response.status_code in [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST]
        
        if download_response.status_code == status.HTTP_200_OK:
            # 验证下载响应头
            assert "content-type" in download_response.headers
            assert "content-disposition" in download_response.headers

    @pytest.mark.api
    def test_download_report_not_found(self, authenticated_client: TestClient):
        """测试下载不存在的报告"""
        response = authenticated_client.get(
            "/api/v1/reports/nonexistent_report_id/download"
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.api
    def test_download_report_without_auth(self, client: TestClient):
        """测试未认证下载报告"""
        response = client.get("/api/v1/reports/some_report_id/download")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.api
    def test_generate_report_different_formats(self, authenticated_client: TestClient, real_document_ids):
        """测试生成不同格式的报告"""
        formats = ["html", "pdf", "word"]
        
        for report_format in formats:
            report_request = {
                "query": f"Test report in {report_format} format",
                "language": "en",
                "format": report_format,
                "document_ids": real_document_ids[:1]  # 使用一个文档
            }
            
            response = authenticated_client.post(
                "/api/v1/reports/generate",
                json=report_request
            )
            
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["format"] == report_format

    @pytest.mark.api
    def test_generate_report_without_documents(self, authenticated_client: TestClient):
        """测试不指定文档生成报告（使用所有文档）"""
        report_request = {
            "query": "General report without specific documents",
            "language": "en",
            "format": "html"
            # 不指定document_ids，应该使用所有可用文档
        }
        
        response = authenticated_client.post(
            "/api/v1/reports/generate",
            json=report_request
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "sections" in data

    @pytest.mark.api
    def test_repository_integration(self):
        """测试Repository集成 - 验证数据来自monk/目录"""
        # 测试用户Repository
        monk_user_path = "monk/users/users.json"
        user_repo = UserRepository(data_file=monk_user_path)
        users = user_repo.find_all()
        assert isinstance(users, list)
        
        if users:
            user = users[0]
            assert hasattr(user, 'id')
            assert hasattr(user, 'username')
            assert hasattr(user, 'email')
            assert hasattr(user, 'role')
        
        # 测试文档Repository
        monk_doc_path = "monk/documents/documents.json"
        doc_repo = DocumentRepository(data_file=monk_doc_path)
        documents = doc_repo.find_all()
        assert isinstance(documents, list)
        
        if documents:
            doc = documents[0]
            assert hasattr(doc, 'id')
            assert hasattr(doc, 'filename')
            assert hasattr(doc, 'title')
            assert hasattr(doc, 'description')

    @pytest.mark.api
    def test_report_generation_with_charts(self, authenticated_client: TestClient, real_document_ids):
        """测试生成包含图表的报告"""
        report_request = {
            "query": "Economic analysis with charts",
            "language": "en",
            "format": "html",
            "include_charts": True,
            "document_ids": real_document_ids
        }
        
        response = authenticated_client.post(
            "/api/v1/reports/generate",
            json=report_request
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # 验证图表选项被正确处理
        assert "sections" in data
        # 根据API实现，可能在sections中包含图表信息

    @pytest.mark.api
    def test_report_generation_without_charts(self, authenticated_client: TestClient, real_document_ids):
        """测试生成不包含图表的报告"""
        report_request = {
            "query": "Simple text report without charts",
            "language": "en",
            "format": "html",
            "include_charts": False,
            "document_ids": real_document_ids
        }
        
        response = authenticated_client.post(
            "/api/v1/reports/generate",
            json=report_request
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "sections" in data 
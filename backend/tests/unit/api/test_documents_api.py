"""
📄 Document Management API Tests

文档管理API测试套件 - 符合编码规范
- 使用 monk/ 目录的真实数据
- 通过 Repository 模式访问数据
- 禁止硬编码数据和Mock数据

测试端点:
- POST /documents/upload
- GET /documents/list
- GET /documents/{document_id}
- DELETE /documents/{document_id}
"""

import json
import tempfile
from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path
from unittest.mock import AsyncMock, patch

import pytest
from app.api.auth import get_current_user
from app.repositories.document_repository import DocumentRepository
from app.repositories.user_repository import UserRepository
from fastapi import status
from fastapi.testclient import TestClient


class TestDocumentsAPI:
    """文档管理API测试 - 使用真实数据"""

    @pytest.fixture
    def real_user(self):
        """从 monk/users/users.json 获取真实用户对象"""
        # 使用相对路径指向monk目录，避免在tests目录创建文件
        monk_path = "monk/users/users.json"
        user_repo = UserRepository(data_file=monk_path)
        users = user_repo.find_all()
        if not users:
            pytest.skip("No users found in monk/users/users.json")
        return users[0]

    @pytest.fixture
    def real_user_id(self, real_user):
        """获取真实用户ID"""
        return real_user.id

    @pytest.fixture
    def real_document_id(self):
        """从 monk/documents/documents.json 获取真实文档ID"""
        # 使用相对路径指向monk目录，避免在tests目录创建文件
        monk_path = "monk/documents/documents.json"
        doc_repo = DocumentRepository(data_file=monk_path)
        documents = doc_repo.find_all()
        if not documents:
            pytest.skip("No documents found in monk/documents/documents.json")
        return documents[0].id

    @pytest.fixture
    def auth_headers(self, real_user_id):
        """使用真实用户生成认证头部"""
        from app.core.auth import create_access_token
        valid_token = create_access_token({"sub": real_user_id})
        return {"Authorization": f"Bearer {valid_token}"}

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
    def test_get_documents_list_success(self, authenticated_client: TestClient):
        """测试获取文档列表成功 - 使用真实数据"""
        response = authenticated_client.get("/api/v1/documents/list")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "documents" in data
        assert "total" in data
        assert isinstance(data["documents"], list)
        assert isinstance(data["total"], int)
        
        # 验证返回的文档数据结构（DocumentInfo模型）
        if data["documents"]:
            doc = data["documents"][0]
            assert "id" in doc
            assert "filename" in doc
            assert "size" in doc
            assert "upload_date" in doc
            assert "processed" in doc
            assert "page_count" in doc
            assert "language" in doc

    @pytest.mark.api
    def test_get_documents_list_with_pagination(self, client: TestClient, auth_headers, mock_auth):
        """测试带分页的文档列表"""
        response = client.get(
            "/api/v1/documents/list?limit=2&offset=0",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["documents"]) <= 2

    @pytest.mark.api
    def test_get_documents_list_with_search(self, client: TestClient, auth_headers, mock_auth):
        """测试带搜索的文档列表"""
        response = client.get(
            "/api/v1/documents/list?search=economic",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # 验证搜索结果包含关键词
        if data["documents"]:
            for doc in data["documents"]:
                contains_keyword = (
                    "economic" in doc["title"].lower() or
                    "economic" in doc["description"].lower() or
                    "economic" in [tag.lower() for tag in doc["tags"]]
                )
                assert contains_keyword

    @pytest.mark.api
    def test_get_document_by_id_success(self, authenticated_client: TestClient, real_document_id):
        """测试通过ID获取文档成功 - 使用真实文档ID"""
        response = authenticated_client.get(
            f"/api/v1/documents/{real_document_id}"
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # 验证返回的文档数据 (DocumentInfo格式)
        assert data["id"] == real_document_id
        assert "filename" in data
        assert "size" in data
        assert "upload_date" in data
        assert "processed" in data
        assert "page_count" in data
        assert "language" in data

    @pytest.mark.api
    def test_get_document_by_id_not_found(self, authenticated_client: TestClient):
        """测试获取不存在的文档"""
        response = authenticated_client.get(
            "/api/v1/documents/nonexistent_doc_id"
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.api
    def test_get_documents_list_without_auth(self, client: TestClient):
        """测试未认证获取文档列表"""
        response = client.get("/api/v1/documents/list")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.api
    def test_upload_document_success(self, authenticated_client: TestClient):
        """测试上传文档成功"""
        # 创建测试文件
        test_content = b"This is a test document content for API testing."
        test_file = BytesIO(test_content)
        
        files = {
            "file": ("test_document.pdf", test_file, "application/pdf")
        }
        
        data = {
            "language": "en"
        }
        
        response = authenticated_client.post(
            "/api/v1/documents/upload",
            files=files,
            data=data
        )
        
        assert response.status_code == status.HTTP_200_OK
        result = response.json()
        
        # 验证上传结果
        assert "id" in result
        assert result["filename"] == "test_document.pdf"
        assert "message" in result
        assert "processing_status" in result
        # Language is set during processing, not immediately returned
        assert result["status"] == "uploaded"

    @pytest.mark.api
    def test_upload_document_invalid_file_type(self, authenticated_client: TestClient):
        """测试上传无效文件类型"""
        # 创建不支持的文件类型
        test_content = b"This is an executable file"
        test_file = BytesIO(test_content)
        
        files = {
            "file": ("malicious.exe", test_file, "application/x-executable")
        }
        
        data = {
            "title": "Invalid File",
            "description": "This should be rejected",
            "language": "en"
        }
        
        response = authenticated_client.post(
            "/api/v1/documents/upload",
            files=files,
            data=data
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.api
    def test_upload_document_too_large(self, authenticated_client: TestClient):
        """测试上传文件过大"""
        # 创建超大文件 (模拟)
        large_content = b"x" * (51 * 1024 * 1024)  # 51MB，超过50MB限制
        test_file = BytesIO(large_content)
        
        files = {
            "file": ("large_file.pdf", test_file, "application/pdf")
        }
        
        data = {
            "title": "Large File",
            "description": "This file is too large",
            "language": "en"
        }
        
        response = authenticated_client.post(
            "/api/v1/documents/upload",
            files=files,
            data=data
        )
        
        assert response.status_code == status.HTTP_413_REQUEST_ENTITY_TOO_LARGE

    @pytest.mark.api
    def test_upload_document_without_auth(self, client: TestClient):
        """测试未认证上传文档"""
        test_content = b"Test content"
        test_file = BytesIO(test_content)
        
        files = {
            "file": ("test.txt", test_file, "text/plain")
        }
        
        data = {
            "title": "Test Document",
            "description": "Test description",
            "language": "en"
        }
        
        response = client.post(
            "/api/v1/documents/upload",
            files=files,
            data=data
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.api
    def test_delete_document_success(self, client: TestClient, auth_headers, mock_auth):
        """测试删除文档成功"""
        # 首先上传一个文档用于删除
        # 创建一个最小的PDF内容 (实际应用中可以使用真实的PDF文件)
        # 这里我们创建一个简单的文本，假设能通过PDF处理
        test_content = b"""
        %PDF-1.4
        1 0 obj
        <<
        /Type /Catalog
        /Pages 2 0 R
        >>
        endobj
        2 0 obj
        <<
        /Type /Pages
        /Kids [3 0 R]
        /Count 1
        >>
        endobj
        3 0 obj
        <<
        /Type /Page
        /Parent 2 0 R
        /MediaBox [0 0 612 792]
        /Contents 4 0 R
        >>
        endobj
        4 0 obj
        <<
        /Length 44
        >>
        stream
        BT
        /F1 12 Tf
        100 700 Td
        (Document to be deleted) Tj
        ET
        endstream
        endobj
        xref
        0 5
        0000000000 65535 f 
        0000000009 00000 n 
        0000000058 00000 n 
        0000000115 00000 n 
        0000000204 00000 n 
        trailer
        <<
        /Size 5
        /Root 1 0 R
        >>
        startxref
        302
        %%EOF
        """
        test_file = BytesIO(test_content)
        
        files = {
            "file": ("delete_test.pdf", test_file, "application/pdf")
        }
        
        data = {
            "language": "en"
        }
        
        upload_response = client.post(
            "/api/v1/documents/upload",
            files=files,
            data=data,
            headers=auth_headers
        )
        
        assert upload_response.status_code == status.HTTP_200_OK
        uploaded_doc = upload_response.json()
        doc_id = uploaded_doc["id"]
        
        # 删除文档
        delete_response = client.delete(
            f"/api/v1/documents/{doc_id}",
            headers=auth_headers
        )
        
        assert delete_response.status_code == status.HTTP_200_OK
        result = delete_response.json()
        assert result["message"] == f"Document {doc_id} deleted successfully"

    @pytest.mark.api
    def test_delete_document_not_found(self, client: TestClient, auth_headers, mock_auth):
        """测试删除不存在的文档"""
        response = client.delete(
            "/api/v1/documents/nonexistent_doc_id",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.api
    def test_delete_document_without_auth(self, client: TestClient, real_document_id):
        """测试未认证删除文档"""
        response = client.delete(f"/api/v1/documents/{real_document_id}")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.api
    def test_documents_list_filter_by_language(self, client: TestClient, auth_headers, mock_auth):
        """测试按语言过滤文档列表"""
        response = client.get(
            "/api/v1/documents/list?language=en",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # 验证所有返回的文档都是英语
        for doc in data["documents"]:
            assert doc["language"] == "en"

    @pytest.mark.api
    def test_documents_list_filter_by_tags(self, client: TestClient, auth_headers, mock_auth):
        """测试按标签过滤文档列表"""
        response = client.get(
            "/api/v1/documents/list?tags=business",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # 验证所有返回的文档都包含指定标签
        for doc in data["documents"]:
            assert "business" in doc["tags"]

    @pytest.mark.api
    def test_documents_list_filter_by_status(self, client: TestClient, auth_headers, mock_auth):
        """测试按状态过滤文档列表"""
        response = client.get(
            "/api/v1/documents/list?status=processed",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # 验证所有返回的文档都是已处理状态
        for doc in data["documents"]:
            assert doc["status"] == "processed"

    @pytest.mark.api
    def test_documents_repository_integration(self):
        """测试文档Repository集成 - 验证数据来自monk/目录"""
        # 使用相对路径指向monk目录，避免在tests目录创建文件
        monk_path = "monk/documents/documents.json"
        doc_repo = DocumentRepository(data_file=monk_path)
        documents = doc_repo.find_all()
        
        # 验证数据确实来自monk/documents/documents.json
        assert isinstance(documents, list)
        
        if documents:
            # 验证文档数据结构符合预期
            doc = documents[0]
            assert hasattr(doc, 'id')
            assert hasattr(doc, 'filename')
            assert hasattr(doc, 'title')
            assert hasattr(doc, 'description')
            assert hasattr(doc, 'file_path')
            assert hasattr(doc, 'file_size')
            assert hasattr(doc, 'mime_type')
            assert hasattr(doc, 'upload_date')
            assert hasattr(doc, 'status')
            assert hasattr(doc, 'language')
            assert hasattr(doc, 'tags')

    @pytest.mark.api
    def test_user_repository_integration(self):
        """测试用户Repository集成 - 验证数据来自monk/目录"""
        # 使用相对路径指向monk目录，避免在tests目录创建文件
        monk_path = "monk/users/users.json"
        user_repo = UserRepository(data_file=monk_path)
        users = user_repo.find_all()
        
        # 验证数据确实来自monk/users/users.json
        assert isinstance(users, list)
        
        if users:
            # 验证用户数据结构符合预期
            user = users[0]
            assert hasattr(user, 'id')
            assert hasattr(user, 'username')
            assert hasattr(user, 'email')
            assert hasattr(user, 'role')
            assert hasattr(user, 'status')
            assert hasattr(user, 'created_at')
            assert hasattr(user, 'preferences')
            assert hasattr(user, 'metadata') 
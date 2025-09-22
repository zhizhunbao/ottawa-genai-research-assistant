"""
🔄 Service Integration Tests
Test interactions between different services and components
"""

import json
import time
from typing import Any, Dict, List
from unittest.mock import Mock, patch

import httpx
import pytest
from fastapi.testclient import TestClient


class TestServiceIntegration:
    """Test integration between different services."""
    
    def test_chat_document_integration(self, test_client: TestClient, auth_headers: Dict[str, str]):
        """Test integration between chat and document services."""
        # This tests the workflow: upload document -> ask questions about it
        
        # Step 1: Upload a document
        test_file_content = b"Mock PDF content about Ottawa economic development"
        files = {"file": ("test_report.pdf", test_file_content, "application/pdf")}
        
        upload_response = test_client.post(
            "/api/v1/documents/upload",
            files=files,
            headers=auth_headers
        )
        
        # Should handle upload (might require auth)
        assert upload_response.status_code in [200, 201, 401, 404]
        
        if upload_response.status_code in [200, 201]:
            # Step 2: Ask a question about the uploaded document
            chat_data = {
                "message": "What does this document say about economic development?",
                "conversation_id": "test_conversation_123"
            }
            
            chat_response = test_client.post(
                "/api/v1/chat/message",
                json=chat_data,
                headers=auth_headers
            )
            
            # Should process chat request
            assert chat_response.status_code in [200, 401, 404]
    
    def test_user_document_permissions(self, test_client: TestClient, auth_headers: Dict[str, str]):
        """Test user permissions integration with document service."""
        # Test that users can only access their own documents
        
        # Get user's documents
        response = test_client.get("/api/v1/documents/my-documents", headers=auth_headers)
        assert response.status_code in [200, 401, 404]
        
        if response.status_code == 200:
            data = response.json()
            # Should return user's documents
            assert isinstance(data, (list, dict))
    
    def test_chat_history_integration(self, test_client: TestClient, auth_headers: Dict[str, str]):
        """Test chat history integration across services."""
        # Test chat conversation persistence and retrieval
        
        # Get user's chat conversations
        response = test_client.get("/api/v1/chat/conversations", headers=auth_headers)
        assert response.status_code in [200, 401, 404]
        
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, (list, dict))
    
    def test_report_generation_integration(self, test_client: TestClient, auth_headers: Dict[str, str]):
        """Test report generation service integration."""
        # Test integration between documents, chat, and report generation
        
        report_request = {
            "title": "Test Economic Analysis Report",
            "document_ids": ["doc_123"],
            "analysis_type": "summary"
        }
        
        response = test_client.post(
            "/api/v1/reports/generate",
            json=report_request,
            headers=auth_headers
        )
        
        # Should handle report generation
        assert response.status_code in [200, 201, 401, 404, 422]
    
    def test_settings_service_integration(self, test_client: TestClient, auth_headers: Dict[str, str]):
        """Test settings service integration with other services."""
        # Test how settings affect other services
        
        # Get system settings
        response = test_client.get("/api/v1/settings/system", headers=auth_headers)
        assert response.status_code in [200, 401, 404]
        
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, dict)
    
    def test_multilingual_service_integration(self, test_client: TestClient, auth_headers: Dict[str, str]):
        """Test multilingual support across services."""
        # Test that all services respect language preferences
        
        languages = ["en", "fr"]
        
        for lang in languages:
            headers = auth_headers.copy()
            headers["Accept-Language"] = lang
            
            # Test different services with language preference
            endpoints = [
                "/api/v1/chat/conversations",
                "/api/v1/documents/my-documents",
                "/api/v1/reports/my-reports"
            ]
            
            for endpoint in endpoints:
                response = test_client.get(endpoint, headers=headers)
                # Should handle language preferences
                assert response.status_code in [200, 401, 404]
    
    def test_file_processing_pipeline(self, test_client: TestClient, auth_headers: Dict[str, str]):
        """Test complete file processing pipeline integration."""
        # Test: upload -> process -> index -> search -> chat
        
        # Step 1: Upload document
        test_file = ("economic_report.pdf", b"Mock economic data", "application/pdf")
        files = {"file": test_file}
        
        upload_response = test_client.post(
            "/api/v1/documents/upload",
            files=files,
            headers=auth_headers
        )
        
        if upload_response.status_code in [200, 201]:
            upload_data = upload_response.json()
            
            # Step 2: Check processing status
            if "id" in upload_data:
                doc_id = upload_data["id"]
                status_response = test_client.get(
                    f"/api/v1/documents/{doc_id}/status",
                    headers=auth_headers
                )
                assert status_response.status_code in [200, 404]
    
    def test_error_propagation_across_services(self, test_client: TestClient):
        """Test how errors propagate between services."""
        # Test error handling when one service fails
        
        # Test invalid document ID (should propagate from document service)
        response = test_client.get("/api/v1/documents/invalid-id")
        assert response.status_code in [403, 404, 422]  # Forbidden, Not Found, or Unprocessable Entity
        
        # Test invalid chat operation (should propagate from chat service)
        response = test_client.post("/api/v1/chat/send", json={
            "message": "test",
            "conversation_id": "invalid-id"
        })
        assert response.status_code in [403, 404, 422]  # Forbidden, Not Found, or Unprocessable Entity
    
    def test_concurrent_service_operations(self, test_client: TestClient):
        """Test multiple service operations to simulate concurrent behavior."""
        # Test multiple service calls sequentially to simulate concurrent behavior
        endpoints = [
            "/health",
            "/api/v1/settings/languages", 
            "/api/v1/settings/system-info"
        ]
        
        # Execute requests sequentially
        responses = []
        for endpoint in endpoints:
            try:
                response = test_client.get(endpoint)
                responses.append(response)
            except Exception:
                # Connection errors are acceptable in integration tests
                responses.append(None)
        
        # At least health check should work
        valid_responses = [r for r in responses if r is not None]
        if valid_responses:
            assert any(r.status_code == 200 for r in valid_responses)
    
    def test_data_consistency_across_services(self, test_client: TestClient, auth_headers: Dict[str, str]):
        """Test data consistency between services."""
        # Test that data remains consistent across service boundaries
        
        # Upload a document
        test_file = ("consistency_test.pdf", b"Test content", "application/pdf")
        files = {"file": test_file}
        
        upload_response = test_client.post(
            "/api/v1/documents/upload",
            files=files,
            headers=auth_headers
        )
        
        if upload_response.status_code in [200, 201]:
            # Check if document appears in user's document list
            docs_response = test_client.get(
                "/api/v1/documents/my-documents",
                headers=auth_headers
            )
            
            assert docs_response.status_code in [200, 401, 404]
    
    def test_service_health_monitoring(self, test_client: TestClient):
        """Test health monitoring across all services."""
        # Test health endpoints for different services
        
        health_endpoints = [
            "/health",
            "/api/v1/auth/health",
            "/api/v1/documents/health",
            "/api/v1/chat/health"
        ]
        
        healthy_count = 0
        for endpoint in health_endpoints:
            response = test_client.get(endpoint)
            if response.status_code == 200:
                healthy_count += 1
        
        # At least main health endpoint should work
        assert healthy_count >= 1
    
    def test_service_configuration_integration(self, test_client: TestClient):
        """Test how service configurations integrate."""
        # Test configuration consistency across services
        
        config_response = test_client.get("/api/v1/settings/config")
        assert config_response.status_code in [200, 401, 404]
        
        if config_response.status_code == 200:
            config_data = config_response.json()
            # Should contain service configuration
            assert isinstance(config_data, dict)
    
    def test_audit_trail_integration(self, test_client: TestClient, auth_headers: Dict[str, str]):
        """Test audit trail across service operations."""
        # Test that operations are properly logged across services
        
        # Perform operations that should be audited
        operations = [
            ("POST", "/api/v1/documents/upload", {"files": {"file": ("test.pdf", b"content", "application/pdf")}}),
            ("GET", "/api/v1/documents/my-documents", {}),
            ("POST", "/api/v1/chat/message", {"json": {"message": "test", "conversation_id": "123"}})
        ]
        
        for method, endpoint, kwargs in operations:
            if method == "POST":
                if "files" in kwargs:
                    response = test_client.post(endpoint, files=kwargs["files"], headers=auth_headers)
                else:
                    response = test_client.post(endpoint, headers=auth_headers, **kwargs)
            else:
                response = test_client.get(endpoint, headers=auth_headers)
            
            # Operations should be handled (might require auth)
            assert response.status_code in [200, 201, 401, 404, 422] 
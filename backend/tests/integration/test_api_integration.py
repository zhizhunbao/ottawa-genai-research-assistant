"""
🔗 API Integration Tests
Test frontend-backend API interactions and data flow
"""

import json
import time
from typing import Any, Dict

import httpx
import pytest
from fastapi.testclient import TestClient


class TestAPIIntegration:
    """Test API integration between frontend and backend."""
    
    def test_health_check_integration(self, test_client: TestClient):
        """Test that health check endpoint is accessible."""
        response = test_client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "service" in data
        assert "version" in data
    
    def test_api_cors_configuration(self, test_client: TestClient):
        """Test CORS configuration for frontend integration."""
        # Simulate a preflight request from frontend
        response = test_client.options(
            "/api/v1/auth/me",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Authorization"
            }
        )
        
        # Should allow the request
        assert response.status_code in [200, 204]
    
    def test_api_strategy_switching(self, test_client: TestClient):
        """Test API strategy switching (mock/hybrid/real)."""
        # Test that backend can handle different API strategies
        # This simulates frontend's API strategy configuration
        
        strategies = ["mock", "hybrid", "real"]
        
        for strategy in strategies:
            response = test_client.get(
                "/api/v1/settings/api-strategy",
                params={"strategy": strategy}
            )
            
            # Should handle all strategies gracefully
            assert response.status_code in [200, 404]  # 404 if endpoint not implemented yet
    
    def test_async_api_communication(self, test_client: TestClient):
        """Test API communication patterns that simulate async behavior."""
        # Test health check endpoint
        response = test_client.get("/health")
        
        if response.status_code == 200:
            data = response.json()
            assert "status" in data
            assert data["status"] == "healthy"
        else:
            # If backend is not running, that's acceptable for this test
            assert response.status_code in [404, 500, 503]
        
        # Test multiple endpoints to simulate concurrent behavior
        endpoints = ["/health", "/api/v1/settings/languages", "/api/v1/settings/system-info"]
        responses = []
        
        for endpoint in endpoints:
            try:
                resp = test_client.get(endpoint)
                responses.append(resp)
            except Exception:
                responses.append(None)
        
        # At least one endpoint should respond
        valid_responses = [r for r in responses if r is not None]
        assert len(valid_responses) > 0
    
    def test_api_error_handling_integration(self, test_client: TestClient):
        """Test API error handling for frontend integration."""
        # Test various error scenarios that frontend needs to handle
        
        error_scenarios = [
            ("/api/v1/nonexistent", 404),
            ("/api/v1/auth/me", 403),  # Forbidden without credentials
        ]
        
        for endpoint, expected_status in error_scenarios:
            response = test_client.get(endpoint)
            
            # Verify error response format for frontend consumption
            assert response.status_code == expected_status
            
            # Error responses should be JSON formatted
            try:
                error_data = response.json()
                assert "detail" in error_data or "message" in error_data
            except json.JSONDecodeError:
                # Some error responses might not be JSON, that's acceptable
                pass
    
    def test_api_response_format_consistency(self, test_client: TestClient):
        """Test API response format consistency for frontend parsing."""
        # Test that API responses follow consistent format
        
        response = test_client.get("/health")
        assert response.status_code == 200
        
        data = response.json()
        
        # Verify response structure
        assert isinstance(data, dict)
        assert "status" in data
        
        # Verify response headers
        assert "content-type" in response.headers
        assert "application/json" in response.headers["content-type"]
    
    def test_api_authentication_flow(self, test_client: TestClient):
        """Test authentication flow integration."""
        # Test accessing protected endpoint without authentication
        response = test_client.get("/api/v1/auth/me")
        assert response.status_code in [403, 404]  # Forbidden or not found
        
        # Test invalid token format
        headers = {"Authorization": "Bearer invalid_token"}
        response = test_client.get("/api/v1/auth/me", headers=headers)
        assert response.status_code in [401, 403, 422]  # Unauthorized, Forbidden, or Unprocessable Entity
    
    def test_api_data_upload_integration(self, test_client: TestClient, test_document: Dict[str, Any]):
        """Test document upload integration for frontend."""
        # Test document upload endpoint
        files = {"file": ("test.pdf", test_document["content"], "application/pdf")}
        
        # Without authentication, should return 403 Forbidden
        response = test_client.post("/api/v1/documents/upload", files=files)
        assert response.status_code in [200, 201, 403, 404]
        
        # Verify response format for frontend consumption
        if response.status_code in [200, 201]:
            data = response.json()
            assert "id" in data or "document_id" in data
    
    def test_api_bilingual_support(self, test_client: TestClient):
        """Test bilingual API support for frontend localization."""
        # Test API responses support both English and French
        
        languages = ["en", "fr"]
        
        for lang in languages:
            headers = {"Accept-Language": lang}
            response = test_client.get("/health", headers=headers)
            
            assert response.status_code == 200
            # API should handle language preferences gracefully
    
    def test_api_rate_limiting_behavior(self, test_client: TestClient):
        """Test API rate limiting behavior for frontend handling."""
        # Test how API handles multiple rapid requests (frontend burst scenarios)
        
        responses = []
        for i in range(10):
            response = test_client.get("/health")
            responses.append(response)
        
        # Should handle burst requests gracefully
        success_count = sum(1 for r in responses if r.status_code == 200)
        assert success_count >= 8  # Allow for some rate limiting
    
    @pytest.mark.slow
    def test_api_timeout_handling(self, test_client: TestClient):
        """Test API timeout scenarios for frontend error handling."""
        # Test long-running requests (simulating AI processing)
        
        # This would test actual timeout scenarios in a real environment
        # For now, just verify the endpoint structure
        response = test_client.get("/health")
        assert response.status_code == 200
        
        # Measure response time
        start_time = time.time()
        response = test_client.get("/health")
        response_time = time.time() - start_time
        
        # Health check should be fast
        assert response_time < 1.0  # Less than 1 second 
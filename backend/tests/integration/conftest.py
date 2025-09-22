"""
🔧 Integration Tests Configuration
Shared fixtures and configuration for integration tests
"""

import asyncio
import os
import sys
import time
from pathlib import Path
from typing import AsyncGenerator, Generator
from unittest.mock import Mock

import httpx
import pytest
import pytest_asyncio
from fastapi.testclient import TestClient

# Add backend directory to Python path
backend_path = Path(__file__).parent.parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.core.config import get_settings
# Import the FastAPI app
from app.main import app

# Test configuration
settings = get_settings()
TEST_BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def test_client() -> Generator[TestClient, None, None]:
    """Create a test client for the FastAPI app."""
    with TestClient(app) as client:
        yield client


@pytest_asyncio.fixture
async def async_client() -> AsyncGenerator[httpx.AsyncClient, None]:
    """Create an async HTTP client for integration tests."""
    async with httpx.AsyncClient(base_url=TEST_BASE_URL, timeout=10.0) as client:
        yield client


@pytest.fixture(scope="session")
def backend_url() -> str:
    """Backend API base URL."""
    return TEST_BASE_URL


@pytest.fixture(scope="session")
def frontend_url() -> str:
    """Frontend application URL."""
    return FRONTEND_URL


@pytest.fixture
def mock_google_oauth():
    """Mock Google OAuth responses for testing."""
    return {
        "access_token": "mock_access_token",
        "token_type": "Bearer",
        "expires_in": 3600,
        "refresh_token": "mock_refresh_token",
        "scope": "openid email profile",
        "id_token": "mock_id_token"
    }


@pytest.fixture
def mock_user_info():
    """Mock user information from Google OAuth."""
    return {
        "id": "123456789",
        "email": "test.user@ottawa.ca",
        "name": "Test User",
        "given_name": "Test",
        "family_name": "User",
        "picture": "https://example.com/avatar.jpg",
        "locale": "en",
        "verified_email": True
    }


@pytest.fixture
def test_headers():
    """Common headers for API requests."""
    return {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "OttawaGenAI-IntegrationTest/1.0"
    }


@pytest.fixture
def auth_headers(test_headers):
    """Headers with mock authentication token."""
    headers = test_headers.copy()
    headers["Authorization"] = "Bearer mock_jwt_token"
    return headers


@pytest.fixture
def test_document():
    """Mock document for testing file uploads."""
    return {
        "filename": "test_report.pdf",
        "content": b"Mock PDF content for testing",
        "content_type": "application/pdf",
        "size": 1024
    }


@pytest.fixture
def integration_test_timeout():
    """Default timeout for integration tests (in seconds)."""
    return 30


@pytest.fixture(autouse=True)
def setup_test_environment():
    """Set up test environment variables."""
    os.environ["TESTING"] = "1"
    os.environ["LOG_LEVEL"] = "DEBUG"
    yield
    # Cleanup after tests
    if "TESTING" in os.environ:
        del os.environ["TESTING"]


class IntegrationTestHelper:
    """Helper class for common integration test operations."""
    
    @staticmethod
    def wait_for_service(url: str, timeout: int = 30) -> bool:
        """Wait for a service to become available."""
        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                response = httpx.get(f"{url}/health", timeout=5)
                if response.status_code == 200:
                    return True
            except:
                pass
            time.sleep(1)
        return False
    
    @staticmethod
    def create_test_session(client: TestClient, user_info: dict) -> dict:
        """Create a test user session."""
        # Mock session creation logic
        return {
            "session_id": "test_session_123",
            "user_id": user_info["id"],
            "email": user_info["email"],
            "expires_at": int(time.time()) + 3600
        }


@pytest.fixture
def integration_helper():
    """Integration test helper instance."""
    return IntegrationTestHelper() 
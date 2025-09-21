"""
Pytest configuration and shared fixtures
"""

import asyncio
from typing import AsyncGenerator, Generator

import pytest
import pytest_asyncio
from app.core.config import Settings, get_settings
from app.main import app
from fastapi.testclient import TestClient
from httpx import AsyncClient


# Test settings
class TestSettings(Settings):
    """Test-specific settings"""
    
    # Use in-memory database for tests
    database_url: str = "sqlite:///:memory:"
    
    # Disable external API calls during testing
    openai_api_key: str = "test-key"
    
    # Test environment
    environment: str = "test"
    
    # Disable authentication for testing
    secret_key: str = "test-secret-key-for-testing-only"


@pytest.fixture(scope="session")
def test_settings() -> TestSettings:
    """Provide test settings"""
    return TestSettings()


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def override_get_settings(test_settings: TestSettings):
    """Override the settings dependency for testing"""
    app.dependency_overrides[get_settings] = lambda: test_settings
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def client(override_get_settings) -> TestClient:
    """Create a test client"""
    return TestClient(app)


@pytest_asyncio.fixture
async def async_client(override_get_settings) -> AsyncGenerator[AsyncClient, None]:
    """Create an async test client"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def mock_user():
    """Mock user for testing"""
    from datetime import datetime

    from app.models.user import User
    
    return User(
        id="test-user-id",
        username="testuser",
        email="test@example.com",
        full_name="Test User",
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )


@pytest.fixture
def auth_headers(mock_user):
    """Create authentication headers for testing"""
    # In a real implementation, you'd create a valid JWT token here
    # For now, we'll use a simple mock token
    return {"Authorization": "Bearer test-token"} 
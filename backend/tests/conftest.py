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
    from datetime import datetime, timezone

    from app.models.user import User, UserMetadata, UserPreferences
    
    return User(
        id="test-user-id",
        username="testuser",
        email="test@example.com",
        full_name="Test User",
        hashed_password="$2b$12$test.hashed.password",  # Mock hashed password
        role="researcher",
        status="active",
        is_active=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        last_login=None,
        preferences=UserPreferences(),
        metadata=UserMetadata(),
    )


@pytest.fixture
def auth_headers(mock_user):
    """Create authentication headers for testing"""
    from app.core.auth import create_access_token

    # Create a real JWT token for testing
    token = create_access_token(data={"sub": mock_user.email})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def mock_auth(monkeypatch, mock_user):
    """Mock authentication for testing"""
    from app.api.auth import get_current_user
    from app.repositories.user_repository import UserRepository

    # Ensure the test user exists in the repository
    user_repo = UserRepository()
    existing_user = user_repo.find_by_email(mock_user.email)
    if not existing_user:
        user_repo.create(mock_user)
    
    async def mock_get_current_user(credentials=None):
        """Mock function that returns the test user regardless of credentials"""
        return mock_user
    
    # Override the get_current_user dependency at the app level
    app.dependency_overrides[get_current_user] = mock_get_current_user
    
    yield mock_user
    
    # Clean up
    if get_current_user in app.dependency_overrides:
        del app.dependency_overrides[get_current_user]


@pytest.fixture
def authenticated_client(client, mock_auth, auth_headers):
    """Create an authenticated test client"""
    client.headers.update(auth_headers)
    return client 
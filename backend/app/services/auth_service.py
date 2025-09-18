"""
🔐 Authentication Service

Handles user authentication, registration, and token management.
"""

import uuid
from datetime import datetime, timedelta

from app.core.auth import (
    create_access_token,
    get_password_hash,
    verify_password,
    verify_token,
)
from app.core.config import get_settings
from app.models.user import Token, User, UserCreate, UserLogin
from app.repositories.user_repository import UserRepository
from fastapi import HTTPException, status


class AuthService:
    """Service for handling authentication operations."""

    def __init__(self):
        self.user_repo = UserRepository()
        self.settings = get_settings()

    async def register_user(self, user_data: UserCreate) -> User:
        """Register a new user."""

        # Check if username already exists
        existing_user = self.user_repo.find_by_username(user_data.username)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered",
            )

        # Check if email already exists
        existing_email = self.user_repo.find_by_email(user_data.email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        # Hash the password
        hashed_password = get_password_hash(user_data.password)

        # Create new user
        user = User(
            id=str(uuid.uuid4()),
            username=user_data.username,
            email=user_data.email,
            hashed_password=hashed_password,
            role=user_data.role,
            status="active",
            created_at=datetime.utcnow(),
            preferences=user_data.preferences or {},
            metadata=user_data.metadata or {},
        )

        # Save user
        created_user = self.user_repo.create(user)
        return created_user

    async def authenticate_user(self, login_data: UserLogin) -> User:
        """Authenticate user with username and password."""

        # Find user by username
        user = self.user_repo.find_by_username(login_data.username)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Check if user is active
        if user.status != "active":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Verify password
        if not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Update last login
        user.last_login = datetime.utcnow()
        self.user_repo.update(user.id, user)

        return user

    async def create_user_token(self, user: User) -> Token:
        """Create access token for user."""

        access_token_expires = timedelta(
            minutes=self.settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

        access_token = create_access_token(
            data={"sub": user.username, "user_id": user.id, "role": user.role},
            expires_delta=access_token_expires,
        )

        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=self.settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def get_current_user(self, token: str) -> User:
        """Get current user from JWT token."""

        # Verify token
        payload = verify_token(token)

        # Extract username from token
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Get user from database
        user = self.user_repo.find_by_username(username)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Check if user is active
        if user.status != "active":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user

    async def refresh_token(self, token: str) -> Token:
        """Refresh an access token."""

        # Get current user from token
        user = await self.get_current_user(token)

        # Create new token
        return await self.create_user_token(user)

"""
🔐 Authentication Service

Handles user authentication, registration, and token management.
"""

import uuid
from datetime import datetime, timedelta

from fastapi import HTTPException, status

from app.core.auth import (
    create_access_token,
    get_password_hash,
    verify_password,
    verify_token,
)
from app.core.config import get_settings
from app.models.user import Token, User, UserCreate, UserLogin
from app.repositories.user_repository import UserRepository


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
        """Authenticate user with email and password."""

        # Find user by email
        user = self.user_repo.find_by_email(login_data.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
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
                detail="Incorrect email or password",
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
            data={"sub": user.email, "user_id": user.id, "role": user.role},
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

        # Extract email from token
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Get user from database
        user = self.user_repo.find_by_email(email)
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

    async def get_or_create_google_user(self, google_info: dict) -> User:
        """Get existing user or create new user from Google OAuth info."""

        # Try to find existing user by email
        existing_user = self.user_repo.find_by_email(google_info["email"])

        if existing_user:
            # Update last login
            existing_user.last_login = datetime.utcnow()
            self.user_repo.update(existing_user.id, existing_user)
            return existing_user

        # Create new user from Google info
        # Generate username from email or name
        username = google_info.get("name", "").replace(" ", "_").lower()
        if not username or len(username) < 3:
            username = google_info["email"].split("@")[0]

        # Ensure username is unique
        base_username = username
        counter = 1
        while self.user_repo.find_by_username(username):
            username = f"{base_username}_{counter}"
            counter += 1

        # Create user data
        user_data = UserCreate(
            username=username,
            email=google_info["email"],
            password="google_oauth",  # Placeholder, won't be used
            role="researcher",  # Default role for Google users
        )

        # Create and return new user
        new_user = await self.register_user(user_data)
        return new_user

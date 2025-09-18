"""
🔐 Authentication API Endpoints

Handles user authentication operations like login, register, and user info.
"""

from app.models.user import Token, User, UserCreate, UserLogin, UserSummary
from app.services.auth_service import AuthService
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

# Create router
router = APIRouter()

# Security scheme
security = HTTPBearer()

# Initialize service
auth_service = AuthService()


@router.post("/register", response_model=UserSummary)
async def register(user_data: UserCreate):
    """
    Register a new user.

    - **username**: Unique username (3-50 characters)
    - **email**: Valid email address
    - **password**: Password (minimum 8 characters)
    - **role**: User role (researcher, analyst, admin)
    """
    try:
        user = await auth_service.register_user(user_data)
        return UserSummary(
            id=user.id,
            username=user.username,
            email=user.email,
            role=user.role,
            status=user.status,
            last_login=user.last_login,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error registering user: {str(e)}",
        )


@router.post("/login", response_model=Token)
async def login(login_data: UserLogin):
    """
    Authenticate user and return access token.

    - **username**: User's username
    - **password**: User's password

    Returns JWT access token for authenticated requests.
    """
    try:
        # Authenticate user
        user = await auth_service.authenticate_user(login_data)

        # Create access token
        token = await auth_service.create_user_token(user)

        return token

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during login: {str(e)}",
        )


@router.get("/me", response_model=UserSummary)
async def get_current_user_info(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """
    Get current user information.

    Requires valid JWT token in Authorization header.
    Returns user profile information.
    """
    try:
        # Get current user from token
        user = await auth_service.get_current_user(credentials.credentials)

        return UserSummary(
            id=user.id,
            username=user.username,
            email=user.email,
            role=user.role,
            status=user.status,
            last_login=user.last_login,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting user info: {str(e)}",
        )


@router.post("/refresh", response_model=Token)
async def refresh_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Refresh access token.

    Requires valid JWT token in Authorization header.
    Returns new access token.
    """
    try:
        # Refresh token
        new_token = await auth_service.refresh_token(credentials.credentials)

        return new_token

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error refreshing token: {str(e)}",
        )


@router.post("/logout")
async def logout():
    """
    Logout user.

    Note: JWT tokens are stateless, so logout is handled client-side
    by removing the token. This endpoint exists for API completeness.
    """
    return {"message": "Successfully logged out"}


# Dependency for protected routes
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> User:
    """
    Dependency to get current authenticated user.

    Use this dependency in protected routes that require authentication.
    """
    return await auth_service.get_current_user(credentials.credentials)


# Dependency for admin-only routes
async def get_current_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency to ensure current user is an admin.

    Use this dependency in admin-only routes.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Operation not permitted"
        )
    return current_user

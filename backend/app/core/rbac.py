"""
RBAC (Role-Based Access Control) Module

Defines roles, permissions, and FastAPI dependencies for authorization.

@template A4 backend/core/security.py — JWT + bcrypt Authentication
"""

from enum import StrEnum
from typing import Annotated

from fastapi import Depends, HTTPException, status

from app.core.exceptions import ForbiddenError
from app.core.security import decode_access_token, security


# ─── Role Definitions ─────────────────────────────────────────────────


class Role(StrEnum):
    """用户角色"""
    ADMIN = "admin"
    RESEARCHER = "researcher"
    VIEWER = "viewer"
    API_USER = "api_user"


# ─── Permission Definitions ───────────────────────────────────────────


class Permission(StrEnum):
    """系统权限"""
    # Documents
    DOCUMENTS_READ = "documents:read"
    DOCUMENTS_WRITE = "documents:write"
    DOCUMENTS_DELETE = "documents:delete"

    # Research
    RESEARCH_QUERY = "research:query"
    RESEARCH_EXPORT = "research:export"

    # Admin
    ADMIN_USERS = "admin:users"
    ADMIN_SETTINGS = "admin:settings"
    ADMIN_MODELS = "admin:models"

    # Evaluation
    EVALUATION_VIEW = "evaluation:view"
    EVALUATION_RUN = "evaluation:run"


# ─── Role → Permission Mapping ────────────────────────────────────────

ROLE_PERMISSIONS: dict[Role, set[Permission]] = {
    Role.ADMIN: set(Permission),  # All permissions
    Role.RESEARCHER: {
        Permission.DOCUMENTS_READ,
        Permission.DOCUMENTS_WRITE,
        Permission.RESEARCH_QUERY,
        Permission.RESEARCH_EXPORT,
        Permission.EVALUATION_VIEW,
        Permission.EVALUATION_RUN,
    },
    Role.VIEWER: {
        Permission.DOCUMENTS_READ,
        Permission.RESEARCH_QUERY,
        Permission.EVALUATION_VIEW,
    },
    Role.API_USER: {
        Permission.DOCUMENTS_READ,
        Permission.RESEARCH_QUERY,
    },
}


def role_has_permission(role: Role, permission: Permission) -> bool:
    """Check if a role has a specific permission."""
    return permission in ROLE_PERMISSIONS.get(role, set())


# ─── JWT Role Extraction ──────────────────────────────────────────────


async def get_current_user_role(
    credentials=Depends(security),
) -> tuple[str, Role]:
    """Extract user_id and role from JWT token.

    Returns:
        Tuple of (user_id, role)
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="缺失认证令牌",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证令牌",
        )
    role_str = payload.get("role", Role.VIEWER)
    try:
        role = Role(role_str)
    except ValueError:
        role = Role.VIEWER
    return user_id, role


# ─── Dependency Factories ─────────────────────────────────────────────


def require_role(*allowed_roles: Role):
    """FastAPI dependency that checks if the current user has one of the allowed roles.

    Usage:
        @router.get("/admin", dependencies=[Depends(require_role(Role.ADMIN))])
    """
    async def _check_role(
        user_info: tuple[str, Role] = Depends(get_current_user_role),
    ) -> tuple[str, Role]:
        user_id, role = user_info
        if role not in allowed_roles:
            raise ForbiddenError(
                f"需要角色: {', '.join(r.value for r in allowed_roles)}"
            )
        return user_id, role
    return _check_role


def require_permission(*required_permissions: Permission):
    """FastAPI dependency that checks if the current user has all required permissions.

    Usage:
        @router.delete("/doc/{id}", dependencies=[Depends(require_permission(Permission.DOCUMENTS_DELETE))])
    """
    async def _check_permission(
        user_info: tuple[str, Role] = Depends(get_current_user_role),
    ) -> tuple[str, Role]:
        user_id, role = user_info
        for perm in required_permissions:
            if not role_has_permission(role, perm):
                raise ForbiddenError(f"缺少权限: {perm.value}")
        return user_id, role
    return _check_permission


# ─── Annotated Types ──────────────────────────────────────────────────

CurrentUserRole = Annotated[tuple[str, Role], Depends(get_current_user_role)]

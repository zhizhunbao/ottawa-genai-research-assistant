"""
Azure AD Authentication Module

Provides JWT validation for Azure AD tokens (Entra ID).
Supports both cloud-based Azure AD tokens and legacy local auth tokens.

@template F4 backend/azure/auth_decorator.py — Entra ID Token Validation
@reference azure-search-openai-demo/app/backend/decorators.py
@reference azure-search-openai-demo/app/backend/authentication.py
"""

import logging

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwk, jwt
from jose.exceptions import JWKError

from app.core.config import settings

logger = logging.getLogger(__name__)

# Bearer token security scheme
security = HTTPBearer(auto_error=False)


class AzureADTokenValidator:
    """Azure AD JWT Token Validator"""

    def __init__(
        self,
        tenant_id: str,
        client_id: str,
    ):
        """
        Initialize Azure AD token validator.

        Args:
            tenant_id: Azure AD tenant ID
            client_id: Azure AD application (client) ID
        """
        self.tenant_id = tenant_id
        self.client_id = client_id
        self.issuer = f"https://login.microsoftonline.com/{tenant_id}/v2.0"
        self.jwks_uri = f"https://login.microsoftonline.com/{tenant_id}/discovery/v2.0/keys"
        self._jwks_cache: dict | None = None

    async def _get_jwks(self) -> dict:
        """Fetch JWKS (JSON Web Key Set) from Azure AD."""
        if self._jwks_cache:
            return self._jwks_cache

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(self.jwks_uri)
                response.raise_for_status()
                self._jwks_cache = response.json()
                return self._jwks_cache
        except httpx.HTTPError as e:
            logger.error(f"Failed to fetch JWKS from Azure AD: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Unable to validate token: Azure AD unavailable",
            )

    def _get_public_key(self, token: str, jwks: dict) -> str | None:
        """Get the public key for the token from JWKS."""
        try:
            # Decode token header to get kid
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get("kid")

            if not kid:
                return None

            # Find matching key in JWKS
            for key in jwks.get("keys", []):
                if key.get("kid") == kid:
                    return jwk.construct(key).to_pem().decode("utf-8")

            return None
        except (JWTError, JWKError) as e:
            logger.warning(f"Failed to get public key: {e}")
            return None

    async def validate_token(self, token: str) -> dict:
        """
        Validate Azure AD JWT token.

        Args:
            token: JWT token string

        Returns:
            dict: Token payload (claims)

        Raises:
            HTTPException: If token is invalid
        """
        jwks = await self._get_jwks()
        public_key = self._get_public_key(token, jwks)

        if not public_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: Unable to find signing key",
                headers={"WWW-Authenticate": "Bearer"},
            )

        try:
            payload = jwt.decode(
                token,
                public_key,
                algorithms=["RS256"],
                audience=self.client_id,
                issuer=self.issuer,
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.JWTClaimsError as e:
            logger.warning(f"JWT claims error: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token claims",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except JWTError as e:
            logger.warning(f"JWT validation error: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )


# Singleton instance
_azure_ad_validator: AzureADTokenValidator | None = None


def get_azure_ad_validator() -> AzureADTokenValidator | None:
    """Get Azure AD validator instance (singleton)."""
    global _azure_ad_validator

    if _azure_ad_validator is None:
        if settings.azure_ad_tenant_id and settings.azure_ad_client_id:
            _azure_ad_validator = AzureADTokenValidator(
                tenant_id=settings.azure_ad_tenant_id,
                client_id=settings.azure_ad_client_id,
            )
        else:
            logger.warning(
                "Azure AD not configured. "
                "Set AZURE_AD_TENANT_ID and AZURE_AD_CLIENT_ID to enable Azure AD auth."
            )

    return _azure_ad_validator


async def get_current_user_azure_ad(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict:
    """
    Get current user from Azure AD token.

    Returns user info from token claims.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    validator = get_azure_ad_validator()
    if not validator:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Azure AD authentication not configured",
        )

    token = credentials.credentials
    payload = await validator.validate_token(token)

    # Extract user info from claims
    return {
        "id": payload.get("oid") or payload.get("sub"),  # Object ID or Subject
        "email": payload.get("preferred_username") or payload.get("email"),
        "name": payload.get("name"),
        "roles": payload.get("roles", []),
    }


async def get_current_user_id_azure_ad(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> str:
    """Get current user ID from Azure AD token."""
    user = await get_current_user_azure_ad(credentials)
    user_id = user.get("id")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing user ID",
        )

    return user_id


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict | None:
    """
    Get current user if authenticated, None otherwise.

    Useful for endpoints that support both authenticated and anonymous access.
    """
    if not credentials:
        return None

    try:
        return await get_current_user_azure_ad(credentials)
    except HTTPException:
        return None

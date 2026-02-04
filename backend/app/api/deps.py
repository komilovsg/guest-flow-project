"""FastAPI dependencies: DB session, current user."""
from typing import Annotated, Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User, UserRole

security = HTTPBearer(auto_error=False)


async def get_current_user_optional(
    db: Annotated[AsyncSession, Depends(get_db)],
    credentials: Annotated[
        Optional[HTTPAuthorizationCredentials], Depends(security)
    ] = None,
) -> Optional[User]:
    """Return current user if valid token, else None."""
    if not credentials:
        return None
    payload = decode_token(credentials.credentials)
    if not payload or payload.get("type") != "access":
        return None
    sub = payload.get("sub")
    if not sub:
        return None
    result = await db.execute(select(User).where(User.id == UUID(sub)))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        return None
    return user


async def get_current_user(
    user: Annotated[Optional[User], Depends(get_current_user_optional)],
) -> User:
    """Require authenticated user."""
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def require_role(*allowed: UserRole):
    """Dependency factory: require user to have one of the roles."""

    async def _require_role(
        user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        if user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return user

    return _require_role


async def get_restaurant_id(
    user: Annotated[User, Depends(get_current_user)],
) -> Optional[UUID]:
    """Current user's restaurant_id (None for super_admin)."""
    return user.restaurant_id


async def require_restaurant(
    user: Annotated[User, Depends(get_current_user)],
) -> UUID:
    """Require current user's restaurant_id (for tenant-scoped endpoints). Super_admin has no restaurant → 403."""
    if user.restaurant_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Restaurant context required",
        )
    return user.restaurant_id

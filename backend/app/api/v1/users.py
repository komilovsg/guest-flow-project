"""Users (staff): list, create, get, update."""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, require_restaurant, require_role
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserRead, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserRead])
async def list_users(
    db: Annotated[AsyncSession, Depends(get_db)],
    restaurant_id: Annotated[UUID, Depends(require_restaurant)],
    user: Annotated[User, Depends(require_role(UserRole.owner, UserRole.admin))],
    skip: int = 0,
    limit: int = 50,
) -> list[UserRead]:
    """List users of current restaurant (Owner/Admin)."""
    result = await db.execute(
        select(User)
        .where(User.restaurant_id == restaurant_id)
        .order_by(User.email)
        .offset(skip)
        .limit(limit)
    )
    rows = result.scalars().all()
    return [UserRead.model_validate(r) for r in rows]


@router.get("/{user_id}", response_model=UserRead)
async def get_user(
    user_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    restaurant_id: Annotated[UUID, Depends(require_restaurant)],
    user: Annotated[User, Depends(require_role(UserRole.owner, UserRole.admin))],
) -> UserRead:
    """Get user by id (same restaurant)."""
    result = await db.execute(
        select(User).where(User.id == user_id, User.restaurant_id == restaurant_id)
    )
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserRead.model_validate(row)


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(
    body: UserCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    restaurant_id: Annotated[UUID, Depends(require_restaurant)],
    current_user: Annotated[User, Depends(require_role(UserRole.owner, UserRole.admin))],
) -> UserRead:
    """Create user for current restaurant (Owner/Admin)."""
    if body.role == UserRole.super_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create super_admin for restaurant",
        )
    existing = await db.execute(
        select(User).where(User.restaurant_id == restaurant_id, User.email == body.email)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")
    new_user = User(
        email=body.email,
        password_hash=get_password_hash(body.password),
        role=body.role,
        restaurant_id=restaurant_id,
        is_active=True,
    )
    db.add(new_user)
    await db.flush()
    await db.refresh(new_user)
    return UserRead.model_validate(new_user)


@router.patch("/{user_id}", response_model=UserRead)
async def update_user(
    user_id: UUID,
    body: UserUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    restaurant_id: Annotated[UUID, Depends(require_restaurant)],
    current_user: Annotated[User, Depends(require_role(UserRole.owner, UserRole.admin))],
) -> UserRead:
    """Update user (Owner/Admin)."""
    result = await db.execute(
        select(User).where(User.id == user_id, User.restaurant_id == restaurant_id)
    )
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if body.email is not None:
        row.email = body.email
    if body.role is not None:
        row.role = body.role
    if body.is_active is not None:
        row.is_active = body.is_active
    await db.flush()
    await db.refresh(row)
    return UserRead.model_validate(row)

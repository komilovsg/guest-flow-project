"""Tenants (Super Admin): list, create, get, update restaurants."""
from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, require_role
from app.models.restaurant import Restaurant
from app.models.user import User, UserRole
from app.schemas.restaurant import RestaurantCreate, RestaurantList, RestaurantRead, RestaurantUpdate

router = APIRouter(prefix="/tenants", tags=["tenants"])


@router.get("", response_model=list[RestaurantList])
async def list_tenants(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(require_role(UserRole.super_admin))],
    skip: int = 0,
    limit: int = 50,
) -> list[RestaurantList]:
    """List all restaurants (Super Admin only)."""
    result = await db.execute(
        select(Restaurant).order_by(Restaurant.name).offset(skip).limit(limit)
    )
    rows = result.scalars().all()
    return [RestaurantList.model_validate(r) for r in rows]


@router.get("/{tenant_id}", response_model=RestaurantRead)
async def get_tenant(
    tenant_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(require_role(UserRole.super_admin))],
) -> RestaurantRead:
    """Get restaurant by id (Super Admin only)."""
    result = await db.execute(select(Restaurant).where(Restaurant.id == tenant_id))
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")
    return RestaurantRead.model_validate(row)


@router.post("", response_model=RestaurantRead, status_code=status.HTTP_201_CREATED)
async def create_tenant(
    body: RestaurantCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(require_role(UserRole.super_admin))],
) -> RestaurantRead:
    """Create restaurant (Super Admin only)."""
    restaurant = Restaurant(
        name=body.name,
        timezone=body.timezone,
        contacts=body.contacts,
    )
    db.add(restaurant)
    await db.flush()
    await db.refresh(restaurant)
    return RestaurantRead.model_validate(restaurant)


@router.patch("/{tenant_id}", response_model=RestaurantRead)
async def update_tenant(
    tenant_id: UUID,
    body: RestaurantUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(require_role(UserRole.super_admin))],
) -> RestaurantRead:
    """Update restaurant (Super Admin only)."""
    result = await db.execute(select(Restaurant).where(Restaurant.id == tenant_id))
    restaurant = result.scalar_one_or_none()
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")
    if body.name is not None:
        restaurant.name = body.name
    if body.timezone is not None:
        restaurant.timezone = body.timezone
    if body.contacts is not None:
        restaurant.contacts = body.contacts
    await db.flush()
    await db.refresh(restaurant)
    return RestaurantRead.model_validate(restaurant)

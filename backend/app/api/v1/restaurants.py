"""Restaurant (current tenant): get/update current restaurant."""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_restaurant, get_current_user
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.restaurant import RestaurantRead, RestaurantUpdate

router = APIRouter(prefix="/restaurants", tags=["restaurants"])


@router.get("/current", response_model=RestaurantRead)
async def get_current_restaurant(
    db: Annotated[AsyncSession, Depends(get_db)],
    restaurant_id: Annotated[UUID, Depends(require_restaurant)],
) -> RestaurantRead:
    """Get current user's restaurant settings."""
    result = await db.execute(select(Restaurant).where(Restaurant.id == restaurant_id))
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")
    return RestaurantRead.model_validate(row)


@router.patch("/current", response_model=RestaurantRead)
async def update_current_restaurant(
    body: RestaurantUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    restaurant_id: Annotated[UUID, Depends(require_restaurant)],
) -> RestaurantRead:
    """Update current user's restaurant settings."""
    result = await db.execute(select(Restaurant).where(Restaurant.id == restaurant_id))
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

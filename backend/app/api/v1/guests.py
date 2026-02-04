"""Guests: list, create, get, update."""
from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, require_restaurant
from app.models.guest import Guest
from app.models.user import User
from app.schemas.guest import GuestCreate, GuestRead, GuestUpdate

router = APIRouter(prefix="/guests", tags=["guests"])


@router.get("", response_model=list[GuestRead])
async def list_guests(
    db: Annotated[AsyncSession, Depends(get_db)],
    restaurant_id: Annotated[UUID, Depends(require_restaurant)],
    user: Annotated[User, Depends(get_current_user)],
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
) -> list[GuestRead]:
    """List guests of current restaurant. Optional search by phone/name."""
    q = select(Guest).where(Guest.restaurant_id == restaurant_id).order_by(Guest.created_at.desc())
    if search and search.strip():
        term = f"%{search.strip()}%"
        q = q.where(or_(Guest.phone.ilike(term), Guest.name.ilike(term)))
    q = q.offset(skip).limit(limit)
    result = await db.execute(q)
    rows = result.scalars().all()
    return [GuestRead.model_validate(r) for r in rows]


@router.get("/{guest_id}", response_model=GuestRead)
async def get_guest(
    guest_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    restaurant_id: Annotated[UUID, Depends(require_restaurant)],
    user: Annotated[User, Depends(get_current_user)],
) -> GuestRead:
    """Get guest by id."""
    result = await db.execute(
        select(Guest).where(Guest.id == guest_id, Guest.restaurant_id == restaurant_id)
    )
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Guest not found")
    return GuestRead.model_validate(row)


@router.post("", response_model=GuestRead, status_code=status.HTTP_201_CREATED)
async def create_guest(
    body: GuestCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    restaurant_id: Annotated[UUID, Depends(require_restaurant)],
    user: Annotated[User, Depends(get_current_user)],
) -> GuestRead:
    """Create guest (manual entry). Phone must be unique per restaurant."""
    existing = await db.execute(
        select(Guest).where(Guest.restaurant_id == restaurant_id, Guest.phone == body.phone)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Phone already exists")
    guest = Guest(
        restaurant_id=restaurant_id,
        phone=body.phone,
        name=body.name,
        birthday=body.birthday,
        preferences=body.preferences,
    )
    db.add(guest)
    await db.flush()
    await db.refresh(guest)
    return GuestRead.model_validate(guest)


@router.patch("/{guest_id}", response_model=GuestRead)
async def update_guest(
    guest_id: UUID,
    body: GuestUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    restaurant_id: Annotated[UUID, Depends(require_restaurant)],
    user: Annotated[User, Depends(get_current_user)],
) -> GuestRead:
    """Update guest."""
    result = await db.execute(
        select(Guest).where(Guest.id == guest_id, Guest.restaurant_id == restaurant_id)
    )
    guest = result.scalar_one_or_none()
    if not guest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Guest not found")
    if body.phone is not None:
        guest.phone = body.phone
    if body.name is not None:
        guest.name = body.name
    if body.birthday is not None:
        guest.birthday = body.birthday
    if body.preferences is not None:
        guest.preferences = body.preferences
    await db.flush()
    await db.refresh(guest)
    return GuestRead.model_validate(guest)

"""Bookings: list, create, get, update, confirm, arrived, complete, cancel."""
from datetime import datetime
from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, require_restaurant
from app.models.booking import Booking, BookingSource, BookingStatus
from app.models.guest import Guest
from app.models.restaurant_table import RestaurantTable
from app.models.user import User
from app.schemas.booking import BookingConfirm, BookingCreate, BookingRead, BookingUpdate

router = APIRouter(prefix="/bookings", tags=["bookings"])


async def _get_booking_or_404(
    db: AsyncSession, booking_id: UUID, restaurant_id: UUID
) -> Booking:
    result = await db.execute(
        select(Booking).where(
            Booking.id == booking_id,
            Booking.restaurant_id == restaurant_id,
        )
    )
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    return row


@router.get("", response_model=list[BookingRead])
async def list_bookings(
    db: Annotated[AsyncSession, Depends(get_db)],
    restaurant_id: Annotated[UUID, Depends(require_restaurant)],
    user: Annotated[User, Depends(get_current_user)],
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    status_filter: Optional[BookingStatus] = None,
    table_id: Optional[UUID] = None,
    guest_id: Optional[UUID] = None,
    skip: int = 0,
    limit: int = 100,
) -> list[BookingRead]:
    """List bookings. Filter by date range, status, table, guest."""
    q = select(Booking).where(Booking.restaurant_id == restaurant_id).order_by(Booking.booked_at)
    if date_from is not None:
        q = q.where(Booking.booked_at >= date_from)
    if date_to is not None:
        q = q.where(Booking.booked_at <= date_to)
    if status_filter is not None:
        q = q.where(Booking.status == status_filter)
    if table_id is not None:
        q = q.where(Booking.table_id == table_id)
    if guest_id is not None:
        q = q.where(Booking.guest_id == guest_id)
    q = q.offset(skip).limit(limit)
    result = await db.execute(q)
    rows = result.scalars().all()
    return [BookingRead.model_validate(r) for r in rows]


@router.get("/{booking_id}", response_model=BookingRead)
async def get_booking(
    booking_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    restaurant_id: Annotated[UUID, Depends(require_restaurant)],
    user: Annotated[User, Depends(get_current_user)],
) -> BookingRead:
    """Get booking by id."""
    booking = await _get_booking_or_404(db, booking_id, restaurant_id)
    return BookingRead.model_validate(booking)


@router.post("", response_model=BookingRead, status_code=status.HTTP_201_CREATED)
async def create_booking(
    body: BookingCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    restaurant_id: Annotated[UUID, Depends(require_restaurant)],
    user: Annotated[User, Depends(get_current_user)],
) -> BookingRead:
    """Create booking (manual/walk-in). Guest and table must belong to restaurant."""
    guest_result = await db.execute(
        select(Guest).where(Guest.id == body.guest_id, Guest.restaurant_id == restaurant_id)
    )
    if not guest_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Guest not found")
    if body.table_id:
        table_result = await db.execute(
            select(RestaurantTable).where(
                RestaurantTable.id == body.table_id,
                RestaurantTable.restaurant_id == restaurant_id,
            )
        )
        if not table_result.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Table not found")
    booking = Booking(
        restaurant_id=restaurant_id,
        guest_id=body.guest_id,
        table_id=body.table_id,
        booked_at=body.booked_at,
        duration_minutes=body.duration_minutes,
        buffer_minutes=body.buffer_minutes,
        guests_count=body.guests_count,
        status=BookingStatus.new,
        source=body.source,
        created_by_user_id=user.id,
    )
    db.add(booking)
    await db.flush()
    await db.refresh(booking)
    return BookingRead.model_validate(booking)


@router.patch("/{booking_id}", response_model=BookingRead)
async def update_booking(
    booking_id: UUID,
    body: BookingUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    restaurant_id: Annotated[UUID, Depends(require_restaurant)],
    user: Annotated[User, Depends(get_current_user)],
) -> BookingRead:
    """Update booking (time, table, etc.)."""
    booking = await _get_booking_or_404(db, booking_id, restaurant_id)
    if body.table_id is not None:
        booking.table_id = body.table_id
    if body.booked_at is not None:
        booking.booked_at = body.booked_at
    if body.duration_minutes is not None:
        booking.duration_minutes = body.duration_minutes
    if body.buffer_minutes is not None:
        booking.buffer_minutes = body.buffer_minutes
    if body.guests_count is not None:
        booking.guests_count = body.guests_count
    await db.flush()
    await db.refresh(booking)
    return BookingRead.model_validate(booking)


@router.post("/{booking_id}/confirm", response_model=BookingRead)
async def confirm_booking(
    booking_id: UUID,
    body: BookingConfirm,
    db: Annotated[AsyncSession, Depends(get_db)],
    restaurant_id: Annotated[UUID, Depends(require_restaurant)],
    user: Annotated[User, Depends(get_current_user)],
) -> BookingRead:
    """Confirm booking (set table)."""
    booking = await _get_booking_or_404(db, booking_id, restaurant_id)
    if booking.status != BookingStatus.new:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Booking already confirmed or closed")
    table_result = await db.execute(
        select(RestaurantTable).where(
            RestaurantTable.id == body.table_id,
            RestaurantTable.restaurant_id == restaurant_id,
        )
    )
    if not table_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Table not found")
    from datetime import timezone
    booking.table_id = body.table_id
    booking.status = BookingStatus.confirmed
    booking.confirmed_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(booking)
    return BookingRead.model_validate(booking)


@router.post("/{booking_id}/arrived", response_model=BookingRead)
async def booking_arrived(
    booking_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    restaurant_id: Annotated[UUID, Depends(require_restaurant)],
    user: Annotated[User, Depends(get_current_user)],
) -> BookingRead:
    """Mark guest arrived (check-in)."""
    booking = await _get_booking_or_404(db, booking_id, restaurant_id)
    if booking.status not in (BookingStatus.new, BookingStatus.confirmed):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Booking already arrived or closed")
    from datetime import timezone
    booking.status = BookingStatus.arrived
    booking.arrived_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(booking)
    return BookingRead.model_validate(booking)


@router.post("/{booking_id}/complete", response_model=BookingRead)
async def booking_complete(
    booking_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    restaurant_id: Annotated[UUID, Depends(require_restaurant)],
    user: Annotated[User, Depends(get_current_user)],
) -> BookingRead:
    """Mark visit complete (free table)."""
    booking = await _get_booking_or_404(db, booking_id, restaurant_id)
    if booking.status != BookingStatus.arrived:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Guest must be arrived first")
    from datetime import timezone
    booking.status = BookingStatus.completed
    booking.completed_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(booking)
    return BookingRead.model_validate(booking)


@router.post("/{booking_id}/cancel", response_model=BookingRead)
async def cancel_booking(
    booking_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    restaurant_id: Annotated[UUID, Depends(require_restaurant)],
    user: Annotated[User, Depends(get_current_user)],
) -> BookingRead:
    """Cancel booking."""
    booking = await _get_booking_or_404(db, booking_id, restaurant_id)
    if booking.status in (BookingStatus.completed, BookingStatus.cancelled, BookingStatus.no_show):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Booking cannot be cancelled")
    booking.status = BookingStatus.cancelled
    await db.flush()
    await db.refresh(booking)
    return BookingRead.model_validate(booking)

"""Booking schemas."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from app.models.booking import BookingSource, BookingStatus


class BookingBase(BaseModel):
    guest_id: UUID
    table_id: Optional[UUID] = None
    booked_at: datetime
    duration_minutes: int = 90
    buffer_minutes: int = 15
    guests_count: int = 2
    source: BookingSource = BookingSource.manual


class BookingCreate(BookingBase):
    pass


class BookingUpdate(BaseModel):
    table_id: Optional[UUID] = None
    booked_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    buffer_minutes: Optional[int] = None
    guests_count: Optional[int] = None


class BookingRead(BaseModel):
    id: UUID
    restaurant_id: UUID
    guest_id: UUID
    table_id: Optional[UUID] = None
    booked_at: datetime
    duration_minutes: int
    buffer_minutes: int
    guests_count: int
    status: str
    source: str
    confirmed_at: Optional[datetime] = None
    arrived_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_by_user_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BookingConfirm(BaseModel):
    table_id: UUID

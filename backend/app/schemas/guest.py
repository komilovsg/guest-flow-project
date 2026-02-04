"""Guest schemas."""
from datetime import date, datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel


class GuestBase(BaseModel):
    phone: str
    name: Optional[str] = None
    birthday: Optional[date] = None
    preferences: Optional[dict[str, Any]] = None


class GuestCreate(GuestBase):
    pass


class GuestUpdate(BaseModel):
    phone: Optional[str] = None
    name: Optional[str] = None
    birthday: Optional[date] = None
    preferences: Optional[dict[str, Any]] = None


class GuestRead(GuestBase):
    id: UUID
    restaurant_id: UUID
    telegram_id: Optional[int] = None
    visit_count: int = 0
    first_visit_at: Optional[datetime] = None
    last_visit_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

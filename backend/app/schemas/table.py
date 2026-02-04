"""Restaurant table schemas."""
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class TableBase(BaseModel):
    name: str
    capacity: Optional[int] = None
    sort_order: int = 0


class TableCreate(TableBase):
    pass


class TableUpdate(BaseModel):
    name: Optional[str] = None
    capacity: Optional[int] = None
    sort_order: Optional[int] = None


class TableRead(TableBase):
    id: UUID
    restaurant_id: UUID

    class Config:
        from_attributes = True

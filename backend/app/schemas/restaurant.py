"""Restaurant (tenant) schemas."""
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class RestaurantBase(BaseModel):
    name: str
    timezone: str = "Asia/Dushanbe"
    contacts: Optional[dict[str, Any]] = None


class RestaurantCreate(RestaurantBase):
    pass


class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    timezone: Optional[str] = None
    contacts: Optional[dict[str, Any]] = None


class RestaurantRead(RestaurantBase):
    id: UUID
    timezone: str
    contacts: Optional[dict[str, Any]] = None

    class Config:
        from_attributes = True


class RestaurantList(BaseModel):
    id: UUID
    name: str
    timezone: str

    class Config:
        from_attributes = True

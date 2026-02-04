"""Auth request/response schemas."""
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserMe(BaseModel):
    id: UUID
    email: str
    role: str
    restaurant_id: Optional[UUID]
    is_active: bool

    class Config:
        from_attributes = True

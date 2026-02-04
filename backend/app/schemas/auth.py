"""Auth request/response schemas."""
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, field_validator


class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def email_format(cls, v: str) -> str:
        v = (v or "").strip().lower()
        if not v or "@" not in v or v.count("@") != 1:
            raise ValueError("Invalid email format")
        local, domain = v.rsplit("@", 1)
        if not local or not domain or "." not in domain:
            raise ValueError("Invalid email format")
        return v


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

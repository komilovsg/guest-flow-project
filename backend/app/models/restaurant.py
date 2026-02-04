"""Restaurant (tenant) model."""
from typing import Optional

from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin


class Restaurant(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "restaurants"

    name: Mapped[str] = mapped_column(nullable=False)
    timezone: Mapped[str] = mapped_column(nullable=False, default="Asia/Dushanbe")
    contacts: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True, default=dict)

    # Relationships (imports avoid circular deps; add as needed)
    # users: Mapped[list["User"]] = relationship("User", back_populates="restaurant")

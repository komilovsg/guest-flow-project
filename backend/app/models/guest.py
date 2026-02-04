"""Guest model — единая база гостей по ресторану, ключ слияния — телефон."""
from datetime import date, datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class Guest(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "guests"

    restaurant_id: Mapped[UUID] = mapped_column(
        ForeignKey("restaurants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    phone: Mapped[str] = mapped_column(nullable=False, index=True)
    name: Mapped[Optional[str]] = mapped_column(nullable=True)
    birthday: Mapped[Optional[date]] = mapped_column(nullable=True)
    preferences: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True, default=dict)
    telegram_id: Mapped[Optional[int]] = mapped_column(nullable=True, index=True)
    visit_count: Mapped[int] = mapped_column(nullable=False, default=0)
    first_visit_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    last_visit_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)

    __table_args__ = (
        UniqueConstraint("restaurant_id", "phone", name="uq_guests_restaurant_phone"),
    )

    restaurant: Mapped["Restaurant"] = relationship("Restaurant", backref="guests", foreign_keys=[restaurant_id])

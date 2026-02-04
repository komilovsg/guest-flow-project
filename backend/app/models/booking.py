"""Booking model — журнал броней."""
import enum
from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class BookingStatus(str, enum.Enum):
    new = "new"
    confirmed = "confirmed"
    arrived = "arrived"
    completed = "completed"
    cancelled = "cancelled"
    no_show = "no_show"


class BookingSource(str, enum.Enum):
    bot = "bot"
    manual = "manual"
    walk_in = "walk_in"


class Booking(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "bookings"

    restaurant_id: Mapped[UUID] = mapped_column(
        ForeignKey("restaurants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    guest_id: Mapped[UUID] = mapped_column(
        ForeignKey("guests.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    table_id: Mapped[Optional[UUID]] = mapped_column(
        ForeignKey("tables.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    booked_at: Mapped[datetime] = mapped_column(nullable=False, index=True)
    duration_minutes: Mapped[int] = mapped_column(nullable=False, default=90)
    buffer_minutes: Mapped[int] = mapped_column(nullable=False, default=15)
    guests_count: Mapped[int] = mapped_column(nullable=False, default=2)
    status: Mapped[BookingStatus] = mapped_column(
        SQLEnum(BookingStatus, name="bookingstatus", create_type=False),
        nullable=False,
        default=BookingStatus.new,
        index=True,
    )
    source: Mapped[BookingSource] = mapped_column(
        SQLEnum(BookingSource, name="bookingsource", create_type=False),
        nullable=False,
        default=BookingSource.manual,
    )
    confirmed_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    arrived_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    created_by_user_id: Mapped[Optional[UUID]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    restaurant: Mapped["Restaurant"] = relationship(
        "Restaurant", backref="bookings", foreign_keys=[restaurant_id]
    )
    guest: Mapped["Guest"] = relationship(
        "Guest", backref="bookings", foreign_keys=[guest_id]
    )
    table: Mapped[Optional["RestaurantTable"]] = relationship(
        "RestaurantTable", backref="bookings", foreign_keys=[table_id]
    )
    created_by_user: Mapped[Optional["User"]] = relationship(
        "User", backref="bookings_created", foreign_keys=[created_by_user_id]
    )

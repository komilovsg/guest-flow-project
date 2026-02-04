"""Restaurant table (стол) model — столы ресторана."""
from typing import Optional
from uuid import UUID

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class RestaurantTable(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "tables"

    restaurant_id: Mapped[UUID] = mapped_column(
        ForeignKey("restaurants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(nullable=False)
    capacity: Mapped[Optional[int]] = mapped_column(nullable=True)
    sort_order: Mapped[int] = mapped_column(nullable=False, default=0)

    restaurant: Mapped["Restaurant"] = relationship(
        "Restaurant", backref="tables", foreign_keys=[restaurant_id]
    )

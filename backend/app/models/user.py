"""User (staff) model."""
import enum
from typing import Optional
from uuid import UUID

from sqlalchemy import Enum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class UserRole(str, enum.Enum):
    super_admin = "super_admin"
    owner = "owner"
    admin = "admin"
    manager = "manager"


class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(unique=False, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole),
        nullable=False,
        default=UserRole.manager,
    )
    restaurant_id: Mapped[Optional[UUID]] = mapped_column(
        ForeignKey("restaurants.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(nullable=False, default=True)

    __table_args__ = (
        UniqueConstraint("restaurant_id", "email", name="uq_users_restaurant_email"),
    )

    restaurant: Mapped[Optional["Restaurant"]] = relationship(
        "Restaurant",
        backref="users",
        foreign_keys=[restaurant_id],
    )

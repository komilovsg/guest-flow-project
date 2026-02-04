"""guests, tables, bookings

Revision ID: 002
Revises: 001
Create Date: 2025-02-04

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "guests",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("restaurant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("phone", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("birthday", sa.Date(), nullable=True),
        sa.Column("preferences", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("telegram_id", sa.BigInteger(), nullable=True),
        sa.Column("visit_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("first_visit_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_visit_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["restaurant_id"],
            ["restaurants.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("restaurant_id", "phone", name="uq_guests_restaurant_phone"),
    )
    op.create_index(op.f("ix_guests_restaurant_id"), "guests", ["restaurant_id"], unique=False)
    op.create_index(op.f("ix_guests_phone"), "guests", ["phone"], unique=False)
    op.create_index(op.f("ix_guests_telegram_id"), "guests", ["telegram_id"], unique=False)

    op.create_table(
        "tables",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("restaurant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("capacity", sa.Integer(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["restaurant_id"],
            ["restaurants.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_tables_restaurant_id"), "tables", ["restaurant_id"], unique=False)

    booking_status_enum = postgresql.ENUM(
        "new",
        "confirmed",
        "arrived",
        "completed",
        "cancelled",
        "no_show",
        name="bookingstatus",
        create_type=True,
    )
    booking_status_enum.create(op.get_bind(), checkfirst=True)
    booking_source_enum = postgresql.ENUM(
        "bot",
        "manual",
        "walk_in",
        name="bookingsource",
        create_type=True,
    )
    booking_source_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "bookings",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("restaurant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("guest_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("table_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("booked_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=False, server_default="90"),
        sa.Column("buffer_minutes", sa.Integer(), nullable=False, server_default="15"),
        sa.Column("guests_count", sa.Integer(), nullable=False, server_default="2"),
        sa.Column(
            "status",
            postgresql.ENUM(
                "new",
                "confirmed",
                "arrived",
                "completed",
                "cancelled",
                "no_show",
                name="bookingstatus",
                create_type=False,
            ),
            nullable=False,
        ),
        sa.Column(
            "source",
            postgresql.ENUM(
                "bot",
                "manual",
                "walk_in",
                name="bookingsource",
                create_type=False,
            ),
            nullable=False,
        ),
        sa.Column("confirmed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("arrived_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["restaurant_id"],
            ["restaurants.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["guest_id"],
            ["guests.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["table_id"],
            ["tables.id"],
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["created_by_user_id"],
            ["users.id"],
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_bookings_restaurant_id"), "bookings", ["restaurant_id"], unique=False)
    op.create_index(op.f("ix_bookings_booked_at"), "bookings", ["booked_at"], unique=False)
    op.create_index(op.f("ix_bookings_guest_id"), "bookings", ["guest_id"], unique=False)
    op.create_index(op.f("ix_bookings_table_id"), "bookings", ["table_id"], unique=False)
    op.create_index(op.f("ix_bookings_status"), "bookings", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_bookings_status"), table_name="bookings")
    op.drop_index(op.f("ix_bookings_table_id"), table_name="bookings")
    op.drop_index(op.f("ix_bookings_guest_id"), table_name="bookings")
    op.drop_index(op.f("ix_bookings_booked_at"), table_name="bookings")
    op.drop_index(op.f("ix_bookings_restaurant_id"), table_name="bookings")
    op.drop_table("bookings")
    op.execute("DROP TYPE bookingsource")
    op.execute("DROP TYPE bookingstatus")
    op.drop_index(op.f("ix_tables_restaurant_id"), table_name="tables")
    op.drop_table("tables")
    op.drop_index(op.f("ix_guests_telegram_id"), table_name="guests")
    op.drop_index(op.f("ix_guests_phone"), table_name="guests")
    op.drop_index(op.f("ix_guests_restaurant_id"), table_name="guests")
    op.drop_table("guests")

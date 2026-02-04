"""Alembic env: run migrations with sync engine (postgresql://)."""
from logging.config import fileConfig

from alembic import context
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool

from app.core.config import get_settings
from app.models.base import Base
from app.models.booking import Booking
from app.models.guest import Guest
from app.models.restaurant import Restaurant
from app.models.restaurant_table import RestaurantTable
from app.models.user import User

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata
settings = get_settings()
# Sync URL for Alembic (psycopg v3 — не требует pg_config на macOS)
sync_url = settings.database_url.replace("postgresql+asyncpg", "postgresql+psycopg")
config.set_main_option("sqlalchemy.url", sync_url)


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (SQL only, no DB connection)."""
    context.configure(
        url=sync_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode (with DB)."""
    connectable = create_engine(sync_url, poolclass=NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

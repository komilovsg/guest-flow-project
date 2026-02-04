"""Application configuration from environment."""
from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # App
    app_name: str = "GuestFlow API"
    debug: bool = False
    environment: Literal["development", "staging", "production"] = "development"

    # API
    api_v1_prefix: str = "/api/v1"

    # Database
    database_url: str = "postgresql+asyncpg://guestflow:guestflow@localhost:5432/guestflow"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # JWT
    secret_key: str = "change-me-in-production-use-env"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # CORS (comma-separated origins; фронт может быть на 3000 или 3001)
    cors_origins: str = "http://localhost:3000,http://localhost:3001"

    # Default timezone for new restaurants (IANA, e.g. Asia/Dushanbe for Dushanbe)
    default_timezone: str = "Asia/Dushanbe"


@lru_cache
def get_settings() -> Settings:
    return Settings()

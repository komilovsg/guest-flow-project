"""GuestFlow API entrypoint."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import auth, bookings, guests, health, restaurants, tables, tenants, users
from app.core.config import get_settings

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: e.g. init Redis pool
    yield
    # Shutdown: close pools
    pass


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix=settings.api_v1_prefix)
app.include_router(auth.router, prefix=settings.api_v1_prefix)
app.include_router(tenants.router, prefix=settings.api_v1_prefix)
app.include_router(restaurants.router, prefix=settings.api_v1_prefix)
app.include_router(users.router, prefix=settings.api_v1_prefix)
app.include_router(guests.router, prefix=settings.api_v1_prefix)
app.include_router(tables.router, prefix=settings.api_v1_prefix)
app.include_router(bookings.router, prefix=settings.api_v1_prefix)


@app.get("/")
async def root() -> dict:
    return {"message": "GuestFlow API", "docs": "/docs"}

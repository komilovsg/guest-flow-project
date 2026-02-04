"""Health check."""
from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict:
    """Liveness/readiness probe."""
    return {"status": "ok", "service": "guestflow-api"}

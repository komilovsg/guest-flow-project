#!/usr/bin/env python3
"""Create first super_admin user. Run from backend/ with venv active:
   python scripts/seed_super_admin.py
"""
import asyncio
import os
import sys

# Add parent to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import async_session_factory
from app.core.security import get_password_hash
from app.models.user import User, UserRole


async def main() -> None:
    email = os.environ.get("SEED_EMAIL", "admin@guestflow.local")
    password = os.environ.get("SEED_PASSWORD", "admin")
    async with async_session_factory() as session:
        from sqlalchemy import select
        result = await session.execute(select(User).where(User.email == email, User.restaurant_id.is_(None)))
        if result.scalar_one_or_none():
            print(f"User {email} already exists")
            return
        user = User(
            email=email,
            password_hash=get_password_hash(password),
            role=UserRole.super_admin,
            restaurant_id=None,
            is_active=True,
        )
        session.add(user)
        await session.commit()
        print(f"Created super_admin: {email}")


if __name__ == "__main__":
    asyncio.run(main())

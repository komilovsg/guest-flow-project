#!/usr/bin/env python3
"""Create one restaurant and an owner user for testing guests/tables/bookings.
   Run from backend/ with venv active: python scripts/seed_restaurant_and_owner.py
"""
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import async_session_factory
from app.core.security import get_password_hash
from app.models.restaurant import Restaurant
from app.models.user import User, UserRole


async def main() -> None:
    email = os.environ.get("SEED_OWNER_EMAIL", "owner@guestflow.local")
    password = os.environ.get("SEED_OWNER_PASSWORD", "owner")
    restaurant_name = os.environ.get("SEED_RESTAURANT_NAME", "Тестовый ресторан")

    async with async_session_factory() as session:
        from sqlalchemy import select

        # Check if owner already exists
        result = await session.execute(select(User).where(User.email == email))
        if result.scalar_one_or_none():
            print(f"User {email} already exists")
            return

        restaurant = Restaurant(
            name=restaurant_name,
            timezone="Asia/Dushanbe",
            contacts={"phone": "", "email": "", "address": ""},
        )
        session.add(restaurant)
        await session.flush()

        user = User(
            email=email,
            password_hash=get_password_hash(password),
            role=UserRole.owner,
            restaurant_id=restaurant.id,
            is_active=True,
        )
        session.add(user)
        await session.commit()
        print(f"Created restaurant: {restaurant.name} (id={restaurant.id})")
        print(f"Created owner: {email}")


if __name__ == "__main__":
    asyncio.run(main())

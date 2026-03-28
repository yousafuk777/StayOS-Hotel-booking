"""
Seed script: creates the initial StayOS super-admin user.

Usage (from the backend/ directory):
    python scripts/seed_super_admin.py

Environment variables are read from backend/.env automatically.
"""

import asyncio
import sys
import os

# Make sure the app package is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.core.config import settings
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.core.database import Base


SUPER_ADMIN_EMAIL = "admin@stayos.com"
SUPER_ADMIN_PASSWORD = "StayOS@Admin1"   # <-- change after first login
SUPER_ADMIN_FIRST_NAME = "Super"
SUPER_ADMIN_LAST_NAME = "Admin"


async def seed():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)

    # Create all tables if they don't exist yet
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as db:
        from sqlalchemy import select

        # Check if a super-admin already exists
        result = await db.execute(
            select(User).where(
                User.email == SUPER_ADMIN_EMAIL,
                User.tenant_id == None,
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            print(f"[SKIP] Super-admin already exists: {existing.email}")
        else:
            user = User(
                email=SUPER_ADMIN_EMAIL,
                hashed_password=hash_password(SUPER_ADMIN_PASSWORD),
                first_name=SUPER_ADMIN_FIRST_NAME,
                last_name=SUPER_ADMIN_LAST_NAME,
                role=UserRole.super_admin,
                tenant_id=None,
                is_active=True,
                is_verified=True,
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
            print(f"[OK] Super-admin created!")
            print(f"     Email   : {SUPER_ADMIN_EMAIL}")
            print(f"     Password: {SUPER_ADMIN_PASSWORD}")
            print(f"     ⚠️  Change the password after first login!")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())

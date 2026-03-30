"""
Force Reset Script: Ensures the Super Admin (admin@stayos.com) has the correct password.
Usage:
    ..\env\Scripts\python.exe scripts/force_reset_sa.py
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


async def reset():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as db:
        from sqlalchemy import select

        # Targeting the problematic global admin
        EMAIL = "admin@stayos.com"
        PASSWORD = "StayOS@Admin1"

        result = await db.execute(select(User).where(User.email == EMAIL, User.tenant_id == None))
        user = result.scalar_one_or_none()

        if not user:
            print(f"[ERROR] Global Super Admin not found for {EMAIL}")
            # Try to find ANY user with this email to fix it
            result = await db.execute(select(User).where(User.email == EMAIL))
            user = result.scalar_one_or_none()
            
        if user:
            user.hashed_password = hash_password(PASSWORD)
            user.role = UserRole.super_admin
            user.tenant_id = None
            user.is_active = True
            user.is_verified = True
            await db.commit()
            print(f"[OK] Super Admin credentials force-reset successfully!")
            print(f"     Email: {EMAIL}")
            print(f"     New Password: {PASSWORD}")
        else:
            print("[ERROR] No user found with this email to reset.")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(reset())

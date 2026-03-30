"""
Seed script: creates the initial StayOS dev tenant (ID: 1).

Usage (from the backend/ directory):
    python scripts/seed_tenant.py

Environment variables are read from backend/.env automatically.
"""

import asyncio
import sys
import os

# Make sure the app package is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.core.config import settings
from app.models.tenant import Tenant, TenantStatus, TenantPlan
from app.core.database import Base


async def seed():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)

    # Create all tables if they don't exist yet
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as db:
        from sqlalchemy import select

        # Check if tenant with ID 1 already exists
        result = await db.execute(
            select(Tenant).where(
                Tenant.id == 1
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            print(f"[SKIP] Tenant ID 1 already exists: {existing.name} ({existing.slug})")
        else:
            tenant = Tenant(
                id=1,
                name="StayOS Dev",
                slug="stayos-dev",
                plan=TenantPlan.enterprise,
                status=TenantStatus.active
            )
            db.add(tenant)
            await db.commit()
            await db.refresh(tenant)
            print(f"[OK] Dev Tenant created!")
            print(f"     ID    : {tenant.id}")
            print(f"     Name  : {tenant.name}")
            print(f"     Slug  : {tenant.slug}")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())

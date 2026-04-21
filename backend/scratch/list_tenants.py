import asyncio
import os
import sys

# Add current directory to path so we can import app
sys.path.append(os.getcwd())

from app.core.database import async_session_maker
from sqlalchemy import select
from app.models.tenant import Tenant

async def check():
    print("Listing all tenants:")
    async with async_session_maker() as session:
        result = await session.execute(select(Tenant))
        tenants = result.scalars().all()
        if not tenants:
            print("No tenants found")
        else:
            for t in tenants:
                print(f"Tenant: ID={t.id}, Name={t.name}, Slug={t.slug}")

if __name__ == "__main__":
    asyncio.run(check())

import asyncio
import sys
import os

# Add parent directory to path to allow imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import async_session_maker
from app.models.tenant import Tenant
from app.models.hotel import Hotel
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

async def backfill_hotels():
    print("🚀 Starting Hotel Backfill Synchronization...")
    async with async_session_maker() as session:
        # Fetch all tenants with their hotels loaded
        query = select(Tenant).options(selectinload(Tenant.hotels)).where(Tenant.is_deleted == False)
        result = await session.execute(query)
        tenants = result.scalars().all()
        
        counts = 0
        for tenant in tenants:
            if not tenant.hotels:
                print(f"📦 Found missing property for tenant: {tenant.name} (Slug: {tenant.slug})")
                
                # Create default hotel
                new_hotel = Hotel(
                    tenant_id=tenant.id,
                    name=tenant.name,
                    star_rating=3,
                    is_active=True
                )
                session.add(new_hotel)
                counts += 1
        
        if counts > 0:
            await session.commit()
            print(f"✅ Successfully synchronized {counts} property records!")
        else:
            print("✨ All tenants already have associated property records. No sync needed.")

if __name__ == "__main__":
    asyncio.run(backfill_hotels())

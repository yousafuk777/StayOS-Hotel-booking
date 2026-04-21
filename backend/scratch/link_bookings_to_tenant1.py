import asyncio
import os
import sys

# Add current directory to path so we can import app
sys.path.append(os.getcwd())

from app.core.database import async_session_maker
from sqlalchemy import select, update
from app.models.user import User
from app.models.booking import Booking

async def migrate_bookings():
    email = 'bushubalti@gmail.com'
    target_tenant_id = 1
    
    async with async_session_maker() as session:
        # 1. Find the target guest ID in Tenant 1
        result = await session.execute(
            select(User.id).where(User.email == email, User.tenant_id == target_tenant_id)
        )
        target_guest_id = result.scalar_one_or_none()
        
        if not target_guest_id:
            print(f"Error: Target guest for {email} in Tenant {target_tenant_id} not found.")
            return

        print(f"Target Guest ID: {target_guest_id} (Tenant {target_tenant_id})")

        # 2. Find all user IDs for this email
        user_result = await session.execute(
            select(User.id).where(User.email == email)
        )
        all_user_ids = [row[0] for row in user_result.all()]
        other_user_ids = [uid for uid in all_user_ids if uid != target_guest_id]
        
        if not other_user_ids:
            print("No other accounts found to migrate bookings from.")
            return

        print(f"Migrating bookings from user IDs: {other_user_ids}")

        # 3. Update bookings to point to the target guest ID and target tenant ID
        # Note: In a real system, you'd also need to ensure hotel_id and room_id are valid for Tenant 1.
        # But for development visualization, linking guest_id is enough to show them in the portal.
        
        stmt = (
            update(Booking)
            .where(Booking.guest_id.in_(other_user_ids))
            .values(guest_id=target_guest_id, tenant_id=target_tenant_id)
        )
        
        result = await session.execute(stmt)
        await session.commit()
        
        print(f"Successfully migrated {result.rowcount} bookings to Guest ID {target_guest_id} (Tenant 1).")

if __name__ == "__main__":
    asyncio.run(migrate_bookings())

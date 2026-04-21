import asyncio
import os
import sys

# Add current directory to path so we can import app
sys.path.append(os.getcwd())

from app.core.database import async_session_maker
from sqlalchemy import select
from app.models.user import User
from app.models.booking import Booking

async def check():
    email = 'bushubalti@gmail.com'
    print(f"Checking bookings for email: {email}")
    async with async_session_maker() as session:
        # Get all guest IDs for this email
        user_result = await session.execute(
            select(User.id, User.tenant_id).where(User.email == email)
        )
        user_info = user_result.all()
        user_ids = [u.id for u in user_info]
        tenant_map = {u.id: u.tenant_id for u in user_info}
        
        print(f"User IDs for this email: {user_ids}")
        
        if not user_ids:
            print("No users found.")
            return

        # Get all bookings for these user IDs
        booking_result = await session.execute(
            select(Booking).where(Booking.guest_id.in_(user_ids))
        )
        bookings = booking_result.scalars().all()
        
        if not bookings:
            print("No bookings found for any of these user IDs.")
        else:
            print(f"Found {len(bookings)} bookings:")
            for b in bookings:
                print(f"Booking: ID={b.id}, Ref={b.reference_number}, GuestID={b.guest_id}, TenantID={tenant_map.get(b.guest_id)}, Status={b.status}")

if __name__ == "__main__":
    asyncio.run(check())

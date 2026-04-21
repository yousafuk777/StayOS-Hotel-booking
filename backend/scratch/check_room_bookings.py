import asyncio
import os
import sys

# Add current directory to path so we can import app
sys.path.append(os.getcwd())

from app.core.database import async_session_maker
from sqlalchemy import select
from app.models.booking import Booking

async def check():
    room_id = 6
    print(f"Checking all active bookings for room ID: {room_id}")
    async with async_session_maker() as session:
        result = await session.execute(
            select(Booking).where(
                Booking.room_id == room_id,
                Booking.status.not_in(['cancelled', 'expired'])
            )
        )
        bookings = result.scalars().all()
        if not bookings:
            print(f"No active bookings found for room {room_id}")
        else:
            print(f"Found {len(bookings)} active bookings:")
            for b in bookings:
                print(f"Booking: ID={b.id}, Ref={b.reference_number}, Dates={b.check_in_date} to {b.check_out_date}, Status={b.status}")

if __name__ == "__main__":
    asyncio.run(check())

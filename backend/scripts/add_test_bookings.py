#!/usr/bin/env python3
"""
Quick script to add test bookings to the database
Run this from the backend directory: python3 scripts/add_test_bookings.py
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.models.booking import Booking
from app.models.guest import Guest
from app.models.hotel import Hotel
from app.models.room import Room
from datetime import datetime, timedelta
import random

from app.core.config import settings

async def add_test_data():
    # Create engine and session
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Get or create a hotel
        hotel = await session.execute(
            select(Hotel).where(Hotel.name == "Grand Plaza Hotel")
        )
        hotel = hotel.scalar_one_or_none()
        
        if not hotel:
            print("No hotel found. Please create a hotel first.")
            return
        
        # Get rooms
        rooms = await session.execute(select(Room).where(Room.hotel_id == hotel.id))
        rooms = rooms.scalars().all()
        
        if not rooms:
            print("No rooms found. Please create rooms first.")
            return
        
        # Create test guests
        guest_names = [
            ("John", "Doe"),
            ("Jane", "Smith"),
            ("Michael", "Johnson"),
            ("Emma", "Williams"),
            ("Sarah", "Brown"),
        ]
        
        for first_name, last_name in guest_names:
            guest = Guest(
                first_name=first_name,
                last_name=last_name,
                email=f"{first_name.lower()}.{last_name.lower()}@example.com",
                phone="+1-555-0123"
            )
            session.add(guest)
        
        await session.commit()
        
        # Get created guests
        guests = await session.execute(select(Guest))
        guests = guests.scalars().all()
        
        # Create test bookings
        statuses = ["pending", "confirmed", "checked_in", "checked_out"]
        
        for i, guest in enumerate(guests[:4]):
            checkin = datetime.now() + timedelta(days=i)
            checkout = checkin + timedelta(days=random.randint(2, 5))
            nights = (checkout - checkin).days
            
            booking = Booking(
                tenant_id=hotel.tenant_id,
                hotel_id=hotel.id,
                guest_id=guest.id,
                check_in_date=checkin,
                check_out_date=checkout,
                nights=nights,
                num_guests=random.randint(1, 4),
                status=random.choice(statuses),
                room_total=random.randint(400, 800) * nights,
                addon_total=0,
                discount_amount=0,
                total_amount=random.randint(400, 800) * nights,
                special_requests="Test booking"
            )
            session.add(booking)
            
            # Add room assignment
            from app.models.booking import BookingRoom
            booking_room = BookingRoom(
                booking_id=booking.id,
                room_id=rooms[i % len(rooms)].id
            )
            session.add(booking_room)
        
        await session.commit()
        print(f"✅ Created {len(guests[:4])} test bookings successfully!")

if __name__ == "__main__":
    from sqlalchemy import select
    asyncio.run(add_test_data())

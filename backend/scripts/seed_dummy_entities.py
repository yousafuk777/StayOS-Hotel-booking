import asyncio
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.core.config import settings
from app.models.tenant import Tenant
from app.models.hotel import Hotel
from app.models.room import Room, RoomCategory
from app.models.user import User, UserRole
from app.core.security import hash_password

async def seed_all():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Create Tenant
        tenant = await session.execute(select(Tenant).where(Tenant.name == "Demo Tenant"))
        tenant = tenant.scalar_one_or_none()
        if not tenant:
            tenant = Tenant(name="Demo Tenant", slug="demo")
            session.add(tenant)
            await session.commit()
        
        # Create Hotel
        hotel = await session.execute(select(Hotel).where(Hotel.name == "Grand Plaza Hotel"))
        hotel = hotel.scalar_one_or_none()
        if not hotel:
            hotel = Hotel(tenant_id=tenant.id, name="Grand Plaza Hotel", email="info@grandplaza.com", phone="555-0100")
            session.add(hotel)
            await session.commit()
            
        # Create Room Category
        category = await session.execute(select(RoomCategory).where(RoomCategory.name == "Deluxe"))
        category = category.scalars().first()
        if not category:
            category = RoomCategory(tenant_id=tenant.id, hotel_id=hotel.id, name="Deluxe", base_price=150, capacity=2)
            session.add(category)
            await session.commit()
            
        # Create Room
        room = await session.execute(select(Room).where(Room.hotel_id == hotel.id))
        room = room.scalars().first()
        if not room:
            room = Room(hotel_id=hotel.id, tenant_id=tenant.id, category_id=category.id, room_number="101", status="available")
            session.add(room)
            await session.commit()

        # Create Guest
        guest = await session.execute(select(User).where(User.email == "guest@example.com"))
        guest = guest.scalar_one_or_none()
        if not guest:
            guest = User(
                first_name="Test", 
                last_name="Guest", 
                email="guest@example.com", 
                phone="555-0199",
                hashed_password=hash_password("guest123"),
                role=UserRole.guest,
                tenant_id=tenant.id,
                is_active=True,
                is_verified=True
            )
            session.add(guest)
            await session.commit()
            
        print("✅ Successfully seeded dummy Tenant, Hotel, Room, and Guest!")
        print(f"Tenant ID: {tenant.id}")
        print(f"Hotel ID: {hotel.id}")
        print(f"Guest ID: {guest.id}")

if __name__ == "__main__":
    asyncio.run(seed_all())

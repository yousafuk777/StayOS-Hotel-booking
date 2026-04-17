"""
Seed attractive rooms for all hotels with beautiful room images
"""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import async_session_maker
from app.models.hotel import Hotel
from app.models.room import Room, RoomCategory, RoomImage
from app.models.tenant import Tenant

# Beautiful room images from Unsplash
ROOM_IMAGES = {
    "deluxe": [
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80",
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80"
    ],
    "suite": [
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80",
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&q=80",
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f4ac?w=1200&q=80"
    ],
    "standard": [
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&q=80",
        "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=1200&q=80",
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80"
    ],
    "presidential": [
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200&q=80",
        "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1200&q=80",
        "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&q=80"
    ]
}

ROOM_CATEGORIES = [
    {
        "name": "Standard Room",
        "description": "Comfortable room with essential amenities, perfect for budget-conscious travelers. Features a cozy bed, modern bathroom, and complimentary Wi-Fi.",
        "base_price": 99.99,
        "capacity": 2,
        "bed_type": "Queen Bed",
        "size_sqm": 25.0,
        "images": ROOM_IMAGES["standard"]
    },
    {
        "name": "Deluxe Room",
        "description": "Spacious and elegantly designed room with premium amenities, city views, and a luxurious bathroom with rain shower. Ideal for couples and business travelers.",
        "base_price": 179.99,
        "capacity": 2,
        "bed_type": "King Bed",
        "size_sqm": 35.0,
        "images": ROOM_IMAGES["deluxe"]
    },
    {
        "name": "Executive Suite",
        "description": "Premium suite with separate living area, premium minibar, and panoramic views. Features luxury furnishings, workspace, and exclusive lounge access.",
        "base_price": 299.99,
        "capacity": 3,
        "bed_type": "King Bed + Sofa Bed",
        "size_sqm": 55.0,
        "images": ROOM_IMAGES["suite"]
    },
    {
        "name": "Presidential Suite",
        "description": "Our finest accommodation with multiple rooms, private terrace, jacuzzi, and butler service. The ultimate luxury experience for discerning guests.",
        "base_price": 599.99,
        "capacity": 4,
        "bed_type": "Super King Bed",
        "size_sqm": 120.0,
        "images": ROOM_IMAGES["presidential"]
    }
]


async def seed_rooms():
    """Seed attractive rooms for all hotels"""
    async with async_session_maker() as session:
        # Get all hotels
        result = await session.execute(select(Hotel))
        hotels = result.scalars().all()
        
        if not hotels:
            print("❌ No hotels found in database. Please seed hotels first.")
            return
        
        print(f"✅ Found {len(hotels)} hotel(s). Seeding rooms...")
        
        for hotel in hotels:
            print(f"\n🏨 Processing: {hotel.name}")
            
            # Check if rooms already exist
            existing = await session.execute(
                select(RoomCategory).where(RoomCategory.hotel_id == hotel.id)
            )
            if existing.scalars().first():
                print(f"   ⏭️  Rooms already exist for {hotel.name}, skipping...")
                continue
            
            tenant = await session.execute(
                select(Tenant).where(Tenant.id == hotel.tenant_id)
            )
            tenant = tenant.scalars().first()
            
            # Create room categories and rooms
            for category_data in ROOM_CATEGORIES:
                # Create room category
                category = RoomCategory(
                    tenant_id=hotel.tenant_id,
                    hotel_id=hotel.id,
                    name=category_data["name"],
                    description=category_data["description"],
                    base_price=category_data["base_price"],
                    capacity=category_data["capacity"],
                    bed_type=category_data["bed_type"],
                    size_sqm=category_data["size_sqm"],
                    is_active=True
                )
                session.add(category)
                await session.flush()
                
                print(f"   📋 Created category: {category_data['name']} - ${category_data['base_price']}/night")
                
                # Create 3-5 rooms per category
                num_rooms = 4
                for room_num in range(1, num_rooms + 1):
                    room_number = f"{category_data['name'][0]}{room_num:02d}"
                    
                    room = Room(
                        tenant_id=hotel.tenant_id,
                        hotel_id=hotel.id,
                        category_id=category.id,
                        room_number=room_number,
                        floor=int(category_data['base_price'] / 100),
                        status="available",
                        housekeeping_status="clean",
                        housekeeping_progress=100
                    )
                    session.add(room)
                    await session.flush()
                    
                    # Add images to room
                    for idx, image_url in enumerate(category_data["images"]):
                        room_image = RoomImage(
                            tenant_id=hotel.tenant_id,
                            room_id=room.id,
                            hotel_id=hotel.id,
                            url=image_url,
                            is_primary=(idx == 0),
                            caption=f"{category_data['name']} - Image {idx + 1}"
                        )
                        session.add(room_image)
                    
                    print(f"      🚪 Created room: {room_number}")
            
            await session.commit()
            print(f"   ✅ Completed: {hotel.name}")
        
        print(f"\n🎉 Successfully seeded rooms for all hotels!")


if __name__ == "__main__":
    asyncio.run(seed_rooms())

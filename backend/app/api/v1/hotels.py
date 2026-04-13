from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.api.deps import get_db, get_current_super_admin, get_current_user
from app.dependencies.role_guard import require_module_access
from app.models.user import User
from app.models.hotel import Hotel
from app.models.tenant import Tenant
from app.models.room import RoomCategory, Room
from app.repositories.hotel_repo import HotelRepository
from typing import List, Optional
from app.schemas.hotel import HotelDiscoveryResponse, HotelDetailResponse
import os
import uuid

router = APIRouter()

@router.get("/", response_model=List[HotelDiscoveryResponse])
async def list_public_hotels(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
):
    """List all active hotels for public discovery."""
    # Fetch hotels with their tenant slugs
    query = (
        select(Hotel, Tenant.slug)
        .join(Tenant, Hotel.tenant_id == Tenant.id)
        .where(Hotel.is_active == True, Tenant.is_deleted == False)
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    hotels_data = result.all()

    response = []
    for hotel, slug in hotels_data:
        # Get starting price from room categories
        price_query = select(func.min(RoomCategory.base_price)).where(RoomCategory.hotel_id == hotel.id)
        price_result = await db.execute(price_query)
        min_price = price_result.scalar() or 0.0

        response.append({
            "id": hotel.id,
            "name": hotel.name,
            "slug": slug,
            "city": hotel.city,
            "country": hotel.country,
            "star_rating": hotel.star_rating,
            "description": hotel.description,
            "image_url": hotel.image_url,
            "starting_price": float(min_price)
        })
    
    return response

@router.get("/{slug}", response_model=HotelDetailResponse)
async def get_public_hotel_details(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """Get detailed information for a specific hotel by its slug."""
    # First, get the tenant to verify the slug exists
    tenant_query = select(Tenant).where(Tenant.slug == slug)
    tenant_result = await db.execute(tenant_query)
    tenant = tenant_result.scalar_one_or_none()
    
    if not tenant:
        raise HTTPException(status_code=404, detail="Hotel not found")
    
    # Now get the first active hotel for this tenant with all its associations
    query = (
        select(Hotel)
        .where(Hotel.tenant_id == tenant.id, Hotel.is_active == True)
        .options(
            selectinload(Hotel.room_categories)
            .selectinload(RoomCategory.rooms)
            .selectinload(Room.images)
        )
        .limit(1)
    )
    result = await db.execute(query)
    hotel = result.unique().scalar_one_or_none()

    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")

    # Get starting price
    min_price = min([rc.base_price for rc in hotel.room_categories] or [0.0])

    return {
        "id": hotel.id,
        "name": hotel.name,
        "slug": slug,
        "city": hotel.city,
        "country": hotel.country,
        "star_rating": hotel.star_rating,
        "description": hotel.description,
        "image_url": hotel.image_url,
        "starting_price": float(min_price),
        "address_line1": hotel.address_line1,
        "phone": hotel.phone,
        "email": hotel.email,
        "website": hotel.website,
        "room_categories": [
            {
                "id": rc.id,
                "name": rc.name,
                "description": rc.description,
                "base_price": float(rc.base_price),
                "max_occupancy": rc.capacity,
                "rooms": [
                    {
                        "id": room.id,
                        "room_number": room.room_number,
                        "status": room.status,
                        "images": [
                            {
                                "id": img.id,
                                "image_url": img.url,
                                "is_primary": idx == 0
                            }
                            for idx, img in enumerate(room.images)
                        ]
                    }
                    for room in rc.rooms
                ]
            }
            for rc in hotel.room_categories if rc.is_active
        ]
    }

@router.post("/{id}/image", response_model=HotelDiscoveryResponse)
async def upload_hotel_image(
    id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_admin=Depends(get_current_super_admin)
):
    """Upload a primary image for a hotel (Super-Admin only)."""
    hotel = await db.get(Hotel, id)
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
        
    # Read file content
    content = await file.read()
    
    # Generate unique filename
    ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    filename = f"{uuid.uuid4()}.{ext}"
    
    # Save file
    filepath = os.path.join("uploads", "hotels", filename)
    print(f"DEBUG: Saving hotel image to {filepath}")
    with open(filepath, "wb") as f:
        f.write(content)
        
    # Update hotel record
    hotel.image_url = f"/uploads/hotels/{filename}"
    db.add(hotel)
    await db.commit()
    await db.refresh(hotel)
    print(f"DEBUG: Hotel {id} updated with image_url: {hotel.image_url}")
    
    # Get slug for response
    result = await db.execute(select(Tenant.slug).where(Tenant.id == hotel.tenant_id))
    slug = result.scalar()
    
    # Get starting price
    price_query = select(func.min(RoomCategory.base_price)).where(RoomCategory.hotel_id == hotel.id)
    price_result = await db.execute(price_query)
    min_price = price_result.scalar() or 0.0

    return {
        "id": hotel.id,
        "name": hotel.name,
        "slug": slug,
        "city": hotel.city,
        "country": hotel.country,
        "star_rating": hotel.star_rating,
        "description": hotel.description,
        "image_url": hotel.image_url,
        "starting_price": float(min_price)
    }

@router.get("/mine", response_model=HotelDetailResponse, dependencies=[Depends(require_module_access("hotel_settings"))])
async def get_my_hotel_details(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve the current user's hotel details (Hotel-Admin only)."""
    if not current_user.tenant_id:
        raise HTTPException(status_code=403, detail="Super-admins do not have a dedicated hotel profile.")
        
    hotel = await HotelRepository.get_by_tenant_id(db, current_user.tenant_id)
    if not hotel:
        # Auto-create if missing (best practice for consistency)
        hotel = Hotel(tenant_id=current_user.tenant_id, name="My Hotel")
        db.add(hotel)
        await db.commit()
        await db.refresh(hotel)

    # Return details (using the same logic as public but for the specific property)
    # Actually, let's reuse a helper for detail fetching if we had one.
    # For now, just return direct data.
    return {
        "id": hotel.id,
        "name": hotel.name,
        "slug": (await db.get(Tenant, hotel.tenant_id)).slug,
        "city": hotel.city,
        "country": hotel.country,
        "star_rating": hotel.star_rating,
        "description": hotel.description,
        "image_url": hotel.image_url,
        "starting_price": 0.0, # Will be calculated on detail if needed
        "address_line1": hotel.address_line1,
        "phone": hotel.phone,
        "email": hotel.email,
        "website": hotel.website,
        "room_categories": [] # To be populated if needed
    }

@router.patch("/mine", response_model=HotelDiscoveryResponse, dependencies=[Depends(require_module_access("hotel_settings", require_write=True))])
async def update_my_hotel(
    data: dict, # Simplified update for now
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update the current user's hotel details."""
    if not current_user.tenant_id:
        raise HTTPException(status_code=403, detail="Unauthorized.")
        
    hotel = await HotelRepository.get_by_tenant_id(db, current_user.tenant_id)
    if not hotel:
         raise HTTPException(status_code=404, detail="Hotel not found.")
         
    updated = await HotelRepository.update(db, hotel.id, data)
    
    # Get slug for response
    tenant = await db.get(Tenant, hotel.tenant_id)
    
    return {
        "id": updated.id,
        "name": updated.name,
        "slug": tenant.slug,
        "city": updated.city,
        "country": updated.country,
        "star_rating": updated.star_rating,
        "description": updated.description,
        "image_url": updated.image_url,
        "starting_price": 0.0
    }

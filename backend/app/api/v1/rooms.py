from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
import json
import os
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
import json

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.room import RoomCreate, RoomUpdate, RoomResponse, RoomCategoryResponse, RoomCategoryUpdate
from app.repositories.room_repo import RoomRepository, RoomCategoryRepository
from sqlalchemy import select
from app.models.hotel import Hotel
from app.models.room import RoomImage

async def get_user_hotel_id(db: AsyncSession, tenant_id: int) -> int:
    result = await db.execute(select(Hotel).where(Hotel.tenant_id == tenant_id))
    hotel = result.scalars().first()
    if not hotel:
        hotel = Hotel(tenant_id=tenant_id, name="Default Hotel")
        db.add(hotel)
        await db.commit()
        await db.refresh(hotel)
    return hotel.id


router = APIRouter()

@router.get("/", response_model=List[RoomResponse])
async def read_rooms(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve rooms.
    """
    hotel_id = await get_user_hotel_id(db, current_user.tenant_id)
        
    rooms = await RoomRepository.get_multi_by_hotel(
        db, 
        tenant_id=current_user.tenant_id, 
        hotel_id=hotel_id,
        skip=skip,
        limit=limit
    )
    return rooms

@router.post("/", response_model=RoomResponse)
async def create_room(
    *,
    db: AsyncSession = Depends(get_db),
    room_in: RoomCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new room.
    """
    hotel_id = await get_user_hotel_id(db, current_user.tenant_id)

    category_id = room_in.category_id
    if not category_id and room_in.type:
        category = await RoomCategoryRepository.get_by_name(
            db, tenant_id=current_user.tenant_id, hotel_id=hotel_id, name=room_in.type
        )
        if not category:
            cat_data = {
                "hotel_id": hotel_id,
                "name": room_in.type,
                "base_price": room_in.price or 100,
                "capacity": room_in.capacity or 2
            }
            category = await RoomCategoryRepository.create(db, tenant_id=current_user.tenant_id, data=cat_data)
        category_id = category.id

    if not category_id:
        raise HTTPException(status_code=400, detail="category_id or type is required")

    notes = room_in.notes
    if room_in.amenities:
        notes_dict = {}
        if notes:
            try:
                notes_dict = json.loads(notes)
            except:
                notes_dict = {"original_note": notes}
        notes_dict["amenities"] = room_in.amenities
        notes = json.dumps(notes_dict)

    room_data = {
        "hotel_id": hotel_id,
        "category_id": category_id,
        "room_number": room_in.room_number,
        "floor": room_in.floor,
        "status": room_in.status,
        "custom_price": room_in.price,
        "notes": notes
    }
    
    room = await RoomRepository.create_with_relations(db, tenant_id=current_user.tenant_id, data=room_data)
    return room

@router.put("/{id}", response_model=RoomResponse)
async def update_room(
    *,
    db: AsyncSession = Depends(get_db),
    id: int,
    room_in: RoomUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a room.
    """
    room = await RoomRepository.get_with_relations(db, tenant_id=current_user.tenant_id, room_id=id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    update_data = room_in.dict(exclude_unset=True)
    
    hotel_id = await get_user_hotel_id(db, current_user.tenant_id)
    
    if "type" in update_data:
        category = await RoomCategoryRepository.get_by_name(
            db, tenant_id=current_user.tenant_id, hotel_id=hotel_id, name=update_data["type"]
        )
        if not category:
            cat_data = {
                "hotel_id": hotel_id,
                "name": update_data["type"],
                "base_price": update_data.get("price", room.effective_price),
                "capacity": update_data.get("capacity", room.category.capacity)
            }
            category = await RoomCategoryRepository.create(db, tenant_id=current_user.tenant_id, data=cat_data)
        update_data["category_id"] = category.id

    if "price" in update_data:
        update_data["custom_price"] = update_data.pop("price")

    if "amenities" in update_data:
        amenities = update_data.pop("amenities")
        notes = room.notes
        notes_dict = {}
        if notes:
            try:
                notes_dict = json.loads(notes)
            except:
                notes_dict = {"original_note": notes}
        notes_dict["amenities"] = amenities
        update_data["notes"] = json.dumps(notes_dict)

    update_data.pop("type", None)
    update_data.pop("capacity", None)

    room = await RoomRepository.update_with_relations(db, tenant_id=current_user.tenant_id, room_id=id, data=update_data)
    return room

@router.delete("/{id}", response_model=RoomResponse)
async def delete_room(
    *,
    db: AsyncSession = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a room.
    """
    room = await RoomRepository.get_with_relations(db, tenant_id=current_user.tenant_id, room_id=id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
        
    await RoomRepository.delete(db, tenant_id=current_user.tenant_id, record_id=id)
    return room

@router.post("/{id}/image", response_model=RoomResponse)
async def upload_room_image(
    *,
    db: AsyncSession = Depends(get_db),
    id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Upload an image for a room.
    """
    room = await RoomRepository.get_with_relations(db, tenant_id=current_user.tenant_id, room_id=id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
        
    content = await file.read()
    ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join("uploads", "rooms", filename)
    
    with open(filepath, "wb") as f:
        f.write(content)
        
    hotel_id = await get_user_hotel_id(db, current_user.tenant_id)
    url = f"http://localhost:8000/uploads/rooms/{filename}"

    # Mark as primary and un-mark any current primary images
    for img in room.images:
        if img.is_primary:
            img.is_primary = False
    
    new_img = RoomImage(
        tenant_id=current_user.tenant_id,
        room_id=id,
        hotel_id=hotel_id,
        url=url,
        is_primary=True
    )
    db.add(new_img)
    await db.commit()
    
    # Return updated room
    return await RoomRepository.get_with_relations(db, tenant_id=current_user.tenant_id, room_id=id)

@router.get("/categories", response_model=List[RoomCategoryResponse])
async def read_categories(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve room categories.
    """
    hotel_id = await get_user_hotel_id(db, current_user.tenant_id)
    categories = await RoomCategoryRepository.get_all(
        db, tenant_id=current_user.tenant_id
    )
    # Filter by hotel_id manually if repository doesn't support hotel_id in get_multi
    return [c for c in categories if c.hotel_id == hotel_id]

@router.put("/categories/{id}", response_model=RoomCategoryResponse)
async def update_category(
    *,
    db: AsyncSession = Depends(get_db),
    id: int,
    category_in: RoomCategoryUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a room category.
    """
    category = await RoomCategoryRepository.get_by_id(db, tenant_id=current_user.tenant_id, record_id=id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = category_in.dict(exclude_unset=True)
    category = await RoomCategoryRepository.update(db, tenant_id=current_user.tenant_id, record_id=id, data=update_data)
    return category

from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal

# --- Room Category Schemas ---

class RoomCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    base_price: Decimal
    capacity: int = 2
    bed_type: Optional[str] = None
    size_sqm: Optional[Decimal] = None
    is_active: bool = True

class RoomCategoryCreate(RoomCategoryBase):
    pass

class RoomCategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    base_price: Optional[Decimal] = None
    capacity: Optional[int] = None
    bed_type: Optional[str] = None
    size_sqm: Optional[Decimal] = None
    is_active: Optional[bool] = None

class RoomCategoryResponse(RoomCategoryBase):
    id: int
    tenant_id: int
    hotel_id: int

    class Config:
        from_attributes = True


# --- Room Image Schemas ---

class RoomImageBase(BaseModel):
    url: str
    caption: Optional[str] = None
    sort_order: int = 0
    is_primary: bool = False

class RoomImageResponse(RoomImageBase):
    id: int

    class Config:
        from_attributes = True


# --- Room Schemas ---

class RoomBase(BaseModel):
    room_number: str
    floor: Optional[int] = None
    status: str = "available"
    custom_price: Optional[Decimal] = None
    notes: Optional[str] = None

class RoomCreate(RoomBase):
    category_id: Optional[int] = None
    # For frontend convenience
    type: Optional[str] = None
    price: Optional[Decimal] = None
    capacity: Optional[int] = None
    amenities: Optional[List[str]] = None

class RoomUpdate(BaseModel):
    room_number: Optional[str] = None
    floor: Optional[int] = None
    status: Optional[str] = None
    custom_price: Optional[Decimal] = None
    notes: Optional[str] = None
    type: Optional[str] = None
    price: Optional[Decimal] = None
    capacity: Optional[int] = None
    amenities: Optional[List[str]] = None

class RoomResponse(RoomBase):
    id: int
    tenant_id: int
    hotel_id: int
    category_id: int
    
    category: RoomCategoryResponse
    images: List[RoomImageResponse] = []
    
    class Config:
        from_attributes = True

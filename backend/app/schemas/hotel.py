from pydantic import BaseModel
from typing import List, Optional

class HotelBase(BaseModel):
    name: str
    city: Optional[str] = None
    country: Optional[str] = None
    star_rating: Optional[int] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

class HotelMinimalResponse(HotelBase):
    id: int

    class Config:
        from_attributes = True

class HotelDiscoveryResponse(HotelBase):
    id: int
    slug: str
    starting_price: float = 0.0

    class Config:
        from_attributes = True

class HotelDetailResponse(HotelDiscoveryResponse):
    address_line1: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    room_categories: List[dict] = []

    class Config:
        from_attributes = True

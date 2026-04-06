from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from app.models.user import UserRole
from app.schemas.user import UserResponse

class GuestBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    is_vip: bool = False
    is_active: bool = True

class GuestCreate(GuestBase):
    password: str

class GuestUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    is_vip: Optional[bool] = None
    is_active: Optional[bool] = None

class GuestResponse(UserResponse):
    phone: Optional[str] = None
    is_vip: bool
    stays: int = 0
    total_spent: Decimal = Decimal("0.00")
    last_visit: Optional[datetime] = None

    class Config:
        from_attributes = True

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from app.models.user import UserRole


class StaffBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole
    phone: Optional[str] = None
    is_active: bool = True


class StaffCreate(StaffBase):
    password: str = Field(..., min_length=8)


class StaffUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[UserRole] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None
    email: Optional[EmailStr] = None


class StaffResponse(StaffBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

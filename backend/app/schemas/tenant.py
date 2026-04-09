from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from enum import Enum
from app.schemas.hotel import HotelDiscoveryResponse, HotelMinimalResponse


class TenantPlan(str, Enum):
    starter = "starter"
    professional = "professional"
    enterprise = "enterprise"


class TenantStatus(str, Enum):
    pending = "pending"
    active = "active"
    suspended = "suspended"
    terminated = "terminated"


class TenantBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    slug: str = Field(..., min_length=2, max_length=100, pattern=r"^[a-z0-9-]+$")
    plan: TenantPlan = TenantPlan.starter
    status: TenantStatus = TenantStatus.pending
    commission_rate: Decimal = Field(default=Decimal("0.0300"), ge=0, le=1)


class TenantCreate(TenantBase):
    pass


class TenantUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    plan: Optional[TenantPlan] = None
    status: Optional[TenantStatus] = None
    commission_rate: Optional[Decimal] = None
    hotel_name: Optional[str] = Field(None, min_length=2, max_length=200)
    star_rating: Optional[int] = Field(None, ge=1, le=5)


class TenantResponse(TenantBase):
    id: int
    created_at: datetime
    updated_at: datetime
    is_deleted: bool
    hotels: List[HotelMinimalResponse] = []

    class Config:
        from_attributes = True


class TenantListResponse(BaseModel):
    tenants: List[TenantResponse]
    total: int

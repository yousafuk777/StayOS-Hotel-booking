from pydantic import BaseModel
from typing import Optional, Union
from datetime import datetime, date
from decimal import Decimal


class BookingBase(BaseModel):
    guest_id: int
    hotel_id: int
    check_in_date: Union[date, datetime]
    check_out_date: Union[date, datetime]
    nights: int
    num_guests: int = 1
    room_total: Decimal = 0
    addon_total: Decimal = 0
    discount_amount: Decimal = 0
    tax_amount: Decimal = 0
    total_amount: Decimal = 0
    status: str = "pending"
    special_requests: Optional[str] = None


class BookingCreate(BookingBase):
    room_id: Optional[int] = None
    guest_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    room_type: Optional[str] = None
    guest_id: Optional[int] = None


class BookingUpdate(BaseModel):
    status: Optional[str] = None
    special_requests: Optional[str] = None
    cancellation_reason: Optional[str] = None


class BookingResponse(BaseModel):
    id: int
    tenant_id: int
    hotel_id: int
    guest_id: int
    reference_number: str
    check_in_date: datetime
    check_out_date: datetime
    nights: int
    num_guests: int
    status: str
    room_total: Decimal
    addon_total: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    total_amount: Decimal
    special_requests: Optional[str] = None
    cancellation_reason: Optional[str] = None
    cancelled_at: Optional[datetime] = None
    confirmed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    # Include guest info for display
    guest_name: Optional[str] = None
    room_type: Optional[str] = None

    model_config = {"from_attributes": True}


class BookingListResponse(BaseModel):
    bookings: list[BookingResponse]
    total: int


class BookingStats(BaseModel):
    revenue_this_month: float
    bookings_this_month: int
    pending_count: int
    checked_in_count: int
    occupancy_rate: float
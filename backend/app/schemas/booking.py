from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal


class BookingBase(BaseModel):
    guest_id: int
    hotel_id: int
    check_in_date: datetime
    check_out_date: datetime
    nights: int
    num_guests: int
    room_total: Decimal
    addon_total: Optional[Decimal] = 0
    discount_amount: Optional[Decimal] = 0
    tax_amount: Optional[Decimal] = 0
    total_amount: Decimal
    special_requests: Optional[str] = None


class BookingCreate(BookingBase):
    pass


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
    special_requests: Optional[str]
    cancellation_reason: Optional[str]
    cancelled_at: Optional[datetime]
    confirmed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    # Include guest info for display
    guest_name: Optional[str] = None
    room_type: Optional[str] = None

    model_config = {"from_attributes": True}


class BookingListResponse(BaseModel):
    bookings: list[BookingResponse]
    total: int
    check_out_date: datetime
    nights: int
    num_guests: int
    room_total: Decimal
    addon_total: Optional[Decimal] = 0
    discount_amount: Optional[Decimal] = 0
    tax_amount: Optional[Decimal] = 0
    total_amount: Decimal
    special_requests: Optional[str] = None


class BookingCreate(BookingBase):
    pass


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
    special_requests: Optional[str]
    cancellation_reason: Optional[str]
    cancelled_at: Optional[datetime]
    confirmed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    # Include guest info for display
    guest_name: Optional[str] = None
    room_type: Optional[str] = None

    model_config = {"from_attributes": True}


class BookingListResponse(BaseModel):
    bookings: list[BookingResponse]
    total: int
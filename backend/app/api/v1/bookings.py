from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db
from app.repositories.booking_repo import BookingRepository
from app.schemas.booking import BookingResponse, BookingListResponse, BookingStats, BookingCreate
from app.core.permissions import RequireHotelAdmin
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=BookingListResponse)
async def get_bookings(
    request: Request,
    status: str = None,
    search: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RequireHotelAdmin)
):
    """Get all bookings for the current tenant with optional filtering."""
    tenant_id = request.state.tenant_id or current_user.tenant_id
    bookings = await BookingRepository.get_bookings(
        db, 
        tenant_id=tenant_id, 
        status=status,
        search=search
    )
    # Map to include guest name and room type for simpler frontend consumption
    # In a real app, this mapping would be done in the repository or via a more complex query
    formatted_bookings = []
    for b in bookings:
        # Assuming guest relationship is loaded
        guest_name = f"{b.guest.first_name} {b.guest.last_name}" if b.guest else "Unknown"
        room_type = b.rooms[0].room.category.name if b.rooms and b.rooms[0].room and b.rooms[0].room.category else "Unknown"
        
        # Create response dict to match schema
        b_dict = {
            "id": b.id,
            "tenant_id": b.tenant_id,
            "hotel_id": b.hotel_id,
            "guest_id": b.guest_id,
            "reference_number": b.reference_number,
            "check_in_date": b.check_in_date,
            "check_out_date": b.check_out_date,
            "nights": b.nights,
            "num_guests": b.num_guests,
            "status": b.status,
            "room_total": b.room_total,
            "addon_total": b.addon_total,
            "discount_amount": b.discount_amount,
            "tax_amount": b.tax_amount,
            "total_amount": b.total_amount,
            "special_requests": b.special_requests,
            "cancellation_reason": b.cancellation_reason,
            "cancelled_at": b.cancelled_at,
            "confirmed_at": b.confirmed_at,
            "created_at": b.created_at,
            "updated_at": b.updated_at,
            "guest_name": guest_name,
            "room_type": room_type
        }
        formatted_bookings.append(b_dict)
        
    return {"bookings": formatted_bookings, "total": len(formatted_bookings)}


@router.get("/pending", response_model=BookingListResponse)
async def get_pending_bookings(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RequireHotelAdmin)
):
    """Get all pending bookings for the current tenant."""
    tenant_id = request.state.tenant_id or current_user.tenant_id
    bookings = await BookingRepository.get_pending_bookings(db, tenant_id=tenant_id)
    
    formatted_bookings = []
    for b in bookings:
        guest_name = f"{b.guest.first_name} {b.guest.last_name}" if b.guest else "Unknown"
        room_type = b.rooms[0].room.category.name if b.rooms and b.rooms[0].room and b.rooms[0].room.category else "Unknown"
        
        b_dict = {
            "id": b.id,
            "tenant_id": b.tenant_id,
            "hotel_id": b.hotel_id,
            "guest_id": b.guest_id,
            "reference_number": b.reference_number,
            "check_in_date": b.check_in_date,
            "check_out_date": b.check_out_date,
            "nights": b.nights,
            "num_guests": b.num_guests,
            "status": b.status,
            "room_total": b.room_total,
            "addon_total": b.addon_total,
            "discount_amount": b.discount_amount,
            "tax_amount": b.tax_amount,
            "total_amount": b.total_amount,
            "special_requests": b.special_requests,
            "created_at": b.created_at,
            "updated_at": b.updated_at,
            "guest_name": guest_name,
            "room_type": room_type
        }
        formatted_bookings.append(b_dict)
        
    return {"bookings": formatted_bookings, "total": len(formatted_bookings)}


@router.get("/stats", response_model=BookingStats)
async def get_dashboard_stats(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RequireHotelAdmin)
):
    """Get dashboard statistics for the current tenant."""
    tenant_id = request.state.tenant_id or current_user.tenant_id
    return await BookingRepository.get_dashboard_stats(db, tenant_id=tenant_id)


@router.post("/", response_model=BookingResponse)
async def create_booking(
    request: Request,
    booking_in: BookingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RequireHotelAdmin)
):
    """Create a new booking manually from the admin panel."""
    tenant_id = request.state.tenant_id or current_user.tenant_id
    
    # If still no tenant_id and we have a hotel_id, we can fallback to finding it
    if tenant_id is None and booking_in.hotel_id:
        from app.models.hotel import Hotel
        hotel = await db.get(Hotel, booking_in.hotel_id)
        if hotel:
            tenant_id = hotel.tenant_id

    if tenant_id is None:
        raise HTTPException(status_code=400, detail="Tenant context missing")

    booking = await BookingRepository.create_booking(
        db, 
        tenant_id=tenant_id, 
        booking_data=booking_in.model_dump()
    )
    return booking


@router.put("/{booking_id}/confirm")
async def confirm_booking(
    request: Request,
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RequireHotelAdmin)
):
    """Confirm a pending booking."""
    tenant_id = request.state.tenant_id or current_user.tenant_id
    success = await BookingRepository.confirm_booking(
        db, 
        tenant_id=tenant_id, 
        booking_id=booking_id
    )
    if not success:
        raise HTTPException(status_code=404, detail="Booking not found or cannot be confirmed")
    return {"message": "Booking confirmed successfully"}


@router.delete("/{booking_id}")
async def decline_booking(
    request: Request,
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RequireHotelAdmin)
):
    """Decline and delete a pending booking."""
    tenant_id = request.state.tenant_id or current_user.tenant_id
    success = await BookingRepository.decline_booking(
        db, 
        tenant_id=tenant_id, 
        booking_id=booking_id
    )
    if not success:
        raise HTTPException(status_code=404, detail="Booking not found or cannot be declined")
    return {"message": "Booking declined and removed successfully"}
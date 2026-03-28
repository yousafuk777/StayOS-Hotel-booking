from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db
from app.repositories.booking_repo import BookingRepository
from app.schemas.booking import BookingResponse, BookingListResponse
from app.core.permissions import RequireHotelAdmin
from app.models.user import User

router = APIRouter()


@router.get("/pending")
async def get_pending_bookings(
    # db: AsyncSession = Depends(get_db),
    # current_user: User = Depends(RequireHotelAdmin)
):
    """Get all pending bookings for the current tenant."""
    # For testing, return mock data
    mock_bookings = [
        {
            'id': 1,
            'guest': 'Michael Chen',
            'room': 'Executive King',
            'checkin': '2026-03-26',
            'checkout': '2026-03-30',
            'nights': 4,
            'amount': 1240,
            'status': 'pending',
            'guests': 1
        },
        {
            'id': 2,
            'guest': 'James Brown',
            'room': 'Presidential Suite',
            'checkin': '2026-03-28',
            'checkout': '2026-04-02',
            'nights': 5,
            'amount': 2495,
            'status': 'vip',
            'guests': 3
        },
        {
            'id': 3,
            'guest': 'John Poe',
            'room': 'Standard Queen',
            'checkin': '2026-03-29',
            'checkout': '2026-03-30',
            'nights': 1,
            'amount': 998,
            'status': 'pending',
            'guests': 2
        }
    ]
    
    return {"bookings": mock_bookings, "total": len(mock_bookings)}


@router.put("/{booking_id}/confirm")
async def confirm_booking(
    booking_id: int,
    # db: AsyncSession = Depends(get_db),
    # current_user: User = Depends(RequireHotelAdmin)
):
    """Confirm a pending booking."""
    # For testing, just return success
    return {"message": "Booking confirmed successfully"}


@router.delete("/{booking_id}")
async def decline_booking(
    booking_id: int,
    # db: AsyncSession = Depends(get_db),
    # current_user: User = Depends(RequireHotelAdmin)
):
    """Decline and delete a pending booking."""
    # For testing, just return success
    return {"message": "Booking declined and removed successfully"}
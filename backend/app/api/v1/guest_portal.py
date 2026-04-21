from fastapi import APIRouter, HTTPException, Depends, Header
from app.api.deps import get_db
from app.models.booking import Booking, BookingRoom
from app.models.room import Room
from app.models.user import User, UserRole
from app.services.stripe_service import stripe_service
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.utils.jwt import decode_guest_token
from pydantic import BaseModel

router = APIRouter(prefix="/guest", tags=["Guest Portal"])


async def get_current_guest(
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Dependency to get the current authenticated guest from the JWT token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.split(" ")[1]
    payload = decode_guest_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    result = await db.execute(
        select(User).where(
            User.id == int(payload["sub"]),
            User.role == UserRole.guest,
            User.is_active == True
        )
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=401, detail="Guest account not found")

    return user


class GuestProfileUpdateSchema(BaseModel):
    first_name: str = None
    last_name: str = None


@router.get("/me")
async def get_guest_profile(
    current_guest: User = Depends(get_current_guest)
):
    """Returns the logged-in guest's profile."""
    return {
        "id": current_guest.id,
        "first_name": current_guest.first_name,
        "last_name": current_guest.last_name,
        "email": current_guest.email,
        "is_vip": current_guest.is_vip,
    }


@router.get("/bookings")
async def get_guest_bookings(
    current_guest: User = Depends(get_current_guest),
    db: AsyncSession = Depends(get_db)
):
    """Returns all bookings for the logged-in guest."""
    result = await db.execute(
        select(Booking)
        .options(
            selectinload(Booking.hotel),
            selectinload(Booking.rooms).selectinload(BookingRoom.room).selectinload(Room.category)
        )
        .where(Booking.guest_id == current_guest.id)
        .order_by(Booking.created_at.desc())
    )
    bookings = result.scalars().all()

    return [
        {
            "id": b.id,
            "reference_number": b.reference_number,
            "hotel_name": b.hotel.name if b.hotel else "N/A",
            "room_name": b.rooms[0].room.category.name if b.rooms and b.rooms[0].room and b.rooms[0].room.category else "N/A",
            "check_in_date": b.check_in_date,
            "check_out_date": b.check_out_date,
            "status": b.status,
            "payment_status": b.payment_status,
            "total_amount": float(b.total_amount) if b.total_amount else None,
            "currency": b.currency,
            "created_at": b.created_at,
            "nights": b.nights,
        }
        for b in bookings
    ]


@router.get("/bookings/{reference}")
async def get_guest_booking_detail(
    reference: str,
    current_guest: User = Depends(get_current_guest),
    db: AsyncSession = Depends(get_db)
):
    """Returns detail for a single booking — must belong to this guest."""
    result = await db.execute(
        select(Booking)
        .options(
            selectinload(Booking.hotel),
            selectinload(Booking.rooms).selectinload(BookingRoom.room).selectinload(Room.category)
        )
        .where(
            Booking.reference_number == reference,
            Booking.guest_id == current_guest.id
        )
    )
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    return {
        "reference_number": booking.reference_number,
        "hotel_name": booking.hotel.name if booking.hotel else "N/A",
        "hotel_address": booking.hotel.address_line1 if booking.hotel else None,
        "room_name": booking.rooms[0].room.category.name if booking.rooms and booking.rooms[0].room and booking.rooms[0].room.category else "N/A",
        "check_in_date": booking.check_in_date,
        "check_out_date": booking.check_out_date,
        "nights": booking.nights,
        "status": booking.status,
        "payment_status": booking.payment_status,
        "total_amount": float(booking.total_amount) if booking.total_amount else None,
        "currency": booking.currency,
        "special_requests": booking.special_requests,
        "created_at": booking.created_at,
        "can_cancel": booking.status in ["pending", "confirmed"],
    }


@router.post("/bookings/{reference}/cancel")
async def cancel_guest_booking(
    reference: str,
    current_guest: User = Depends(get_current_guest),
    db: AsyncSession = Depends(get_db)
):
    """
    Guest cancels their own booking.
    Triggers Stripe refund if payment was made.
    """
    result = await db.execute(
        select(Booking).where(
            Booking.reference_number == reference,
            Booking.guest_id == current_guest.id
        )
    )
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status not in ["pending", "confirmed"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel a booking with status '{booking.status}'"
        )

    # Process Stripe refund if payment was made
    if booking.stripe_payment_intent_id and booking.payment_status in ["paid", "captured", "authorized"]:
        try:
            refunded = await stripe_service.refund_payment(
                payment_intent_id=booking.stripe_payment_intent_id,
                reason="requested_by_customer"
            )
            if refunded:
                booking.payment_status = "refunded"
        except Exception as e:
            print(f"Refund failed: {e}")

    booking.status = "cancelled"
    booking.cancelled_at = datetime.utcnow()
    await db.commit()

    return {
        "success": True,
        "reference": reference,
        "message": "Your booking has been cancelled."
                   + (" A refund has been initiated." if booking.payment_status == "refunded" else "")
    }


@router.patch("/me")
async def update_guest_profile(
    payload: GuestProfileUpdateSchema,
    current_guest: User = Depends(get_current_guest),
    db: AsyncSession = Depends(get_db)
):
    """Guest updates their own profile — name only."""
    if payload.first_name:
        current_guest.first_name = payload.first_name
    if payload.last_name:
        current_guest.last_name = payload.last_name
    await db.commit()

    return {"success": True, "message": "Profile updated successfully"}

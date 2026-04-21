from datetime import date
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.booking import Booking

async def check_room_availability(
    room_id: int,
    check_in: date,
    check_out: date,
    db: AsyncSession,
    exclude_booking_id: int = None  # used when modifying existing booking
) -> bool:
    """
    Returns True if room is available, False if there is an overlap.
    Overlap condition: existing booking's check_in < new check_out 
                       AND existing booking's check_out > new check_in
    """
    query = select(Booking).where(
        Booking.room_id == room_id,
        Booking.status.not_in(["cancelled", "expired"]),
        Booking.check_in_date < check_out,
        Booking.check_out_date > check_in,
    )
    if exclude_booking_id:
        query = query.where(Booking.id != exclude_booking_id)

    result = await db.execute(query)
    conflicting = result.first()
    return conflicting is None

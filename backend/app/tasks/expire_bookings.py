from datetime import datetime
from sqlalchemy import update
from app.core.database import async_session_maker as AsyncSessionLocal
from app.models.booking import Booking

async def expire_pending_bookings():
    """
    Marks pending bookings as 'expired' if they have passed their expires_at time.
    This runs as a background task on a schedule.
    """
    async with AsyncSessionLocal() as db:
        try:
            print(f"[EXPIRY TASK] Checking for stale bookings at {datetime.utcnow()}")
            result = await db.execute(
                update(Booking)
                .where(
                    Booking.status == "pending",
                    Booking.expires_at <= datetime.utcnow(),
                    Booking.expires_at.isnot(None)
                )
                .values(status="expired")
                .returning(Booking.id, Booking.reference_number)
            )
            expired = result.fetchall()
            await db.commit()

            if expired:
                print(f"[EXPIRY TASK] Expired {len(expired)} pending bookings: "
                      f"{[r.reference_number for r in expired]}")
            else:
                print("[EXPIRY TASK] No bookings to expire.")
        except Exception as e:
            print(f"[EXPIRY TASK ERROR] {str(e)}")
            await db.rollback()

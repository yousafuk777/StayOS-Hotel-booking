from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload
from app.models.booking import Booking, BookingRoom
from app.repositories.base import TenantScopedRepository


class BookingRepository(TenantScopedRepository):
    """Repository for Booking model operations."""

    model = Booking

    @classmethod
    async def get_bookings(
        cls, 
        db: AsyncSession, 
        tenant_id: int, 
        status: str = None, 
        search: str = None,
        limit: int = 100,
        offset: int = 0
    ):
        """Get all bookings for a tenant with filtering."""
        stmt = (
            select(Booking)
            .where(Booking.tenant_id == tenant_id, Booking.is_deleted == False)
            .options(
                selectinload(Booking.guest),
                selectinload(Booking.rooms).selectinload(BookingRoom.room)
            )
        )
        
        if status and status != 'all':
            stmt = stmt.where(Booking.status == status)
            
        # Search filter (simplistic)
        # Note: In a real app, you'd join with the User model to search by guest name
        # but let's stick to reference number or basic guest_id for now if we don't join.
        # Let's add the join for better search.
        from app.models.user import User
        if search:
            stmt = stmt.join(Booking.guest).where(
                (Booking.reference_number.ilike(f"%{search}%")) |
                (User.email.ilike(f"%{search}%")) |
                (User.first_name.ilike(f"%{search}%")) |
                (User.last_name.ilike(f"%{search}%"))
            )

        stmt = stmt.order_by(Booking.created_at.desc()).limit(limit).offset(offset)
        result = await db.execute(stmt)
        return result.scalars().unique().all()

    @classmethod
    async def get_pending_bookings(cls, db: AsyncSession, tenant_id: int):
        """Get all pending bookings for a tenant."""
        stmt = (
            select(Booking)
            .where(
                Booking.tenant_id == tenant_id,
                Booking.status.in_(['pending', 'vip']),
                Booking.is_deleted == False
            )
            .options(
                selectinload(Booking.guest),
                selectinload(Booking.rooms).selectinload(BookingRoom.room)
            )
        )
        result = await db.execute(stmt)
        return result.scalars().unique().all()

    @classmethod
    async def get_dashboard_stats(cls, db: AsyncSession, tenant_id: int):
        """Calculate dashboard statistics for a tenant."""
        from sqlalchemy import func
        from datetime import datetime, timedelta
        
        now = datetime.utcnow()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Revenue this month
        revenue_stmt = select(func.sum(Booking.total_amount)).where(
            Booking.tenant_id == tenant_id,
            Booking.status != 'cancelled',
            Booking.created_at >= start_of_month,
            Booking.is_deleted == False
        )
        revenue_res = await db.execute(revenue_stmt)
        revenue_this_month = revenue_res.scalar() or 0
        
        # New bookings this month
        count_stmt = select(func.count(Booking.id)).where(
            Booking.tenant_id == tenant_id,
            Booking.created_at >= start_of_month,
            Booking.is_deleted == False
        )
        count_res = await db.execute(count_stmt)
        bookings_this_month = count_res.scalar() or 0
        
        # Pending count
        pending_stmt = select(func.count(Booking.id)).where(
            Booking.tenant_id == tenant_id,
            Booking.status == 'pending',
            Booking.is_deleted == False
        )
        pending_res = await db.execute(pending_stmt)
        pending_count = pending_res.scalar() or 0

        # Checked-in count
        checked_in_stmt = select(func.count(Booking.id)).where(
            Booking.tenant_id == tenant_id,
            Booking.status == 'checked_in',
            Booking.is_deleted == False
        )
        checked_in_res = await db.execute(checked_in_stmt)
        checked_in_count = checked_in_res.scalar() or 0
        
        return {
            "revenue_this_month": float(revenue_this_month),
            "bookings_this_month": bookings_this_month,
            "pending_count": pending_count,
            "checked_in_count": checked_in_count,
            "occupancy_rate": 78, # Hardcoded for now until Room availability logic is added
        }

    @classmethod
    async def confirm_booking(cls, db: AsyncSession, tenant_id: int, booking_id: int):
        """Confirm a booking by changing status to confirmed."""
        from datetime import datetime
        stmt = (
            update(Booking)
            .where(
                Booking.id == booking_id,
                Booking.tenant_id == tenant_id,
                Booking.status.in_(['pending', 'vip']),
                Booking.is_deleted == False
            )
            .values(status='confirmed', confirmed_at=datetime.utcnow())
        )
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount > 0

    @classmethod
    async def decline_booking(cls, db: AsyncSession, tenant_id: int, booking_id: int):
        """Decline a booking by deleting it permanently."""
        stmt = (
            delete(Booking)
            .where(
                Booking.id == booking_id,
                Booking.tenant_id == tenant_id,
                Booking.status.in_(['pending', 'vip']),
                Booking.is_deleted == False
            )
        )
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount > 0

    @classmethod
    async def create_booking(cls, db: AsyncSession, tenant_id: int, booking_data: dict):
        """Create a new booking and associate a room if provided."""
        import uuid
        # Generate a unique reference number
        ref = f"BKG-{uuid.uuid4().hex[:8].upper()}"
        
        # Extract room_id from data if present
        room_id = booking_data.pop("room_id", None)
        
        booking = Booking(
            tenant_id=tenant_id,
            reference_number=ref,
            **booking_data
        )
        db.add(booking)
        
        # If room_id is provided, create the BookingRoom link
        if room_id:
            # We flush to get booking.id
            await db.flush()
            booking_room = BookingRoom(
                booking_id=booking.id,
                room_id=room_id,
                nightly_rate=booking.room_total / booking.nights if booking.nights > 0 else booking.room_total
            )
            db.add(booking_room)
            
        await db.commit()
        await db.refresh(booking)
        return booking

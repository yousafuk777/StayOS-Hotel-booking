from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload
from app.models.booking import Booking, BookingRoom
from app.models.room import Room
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
                selectinload(Booking.rooms).selectinload(BookingRoom.room).selectinload(Room.category)
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
                selectinload(Booking.rooms).selectinload(BookingRoom.room).selectinload(Room.category)
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
        
        # Extract dynamic guest data
        guest_name = booking_data.pop("guest_name", None)
        email = booking_data.pop("email", None)
        phone = booking_data.pop("phone", None)
        room_type = booking_data.pop("room_type", None)
        
        # If guest_id is missing but we have a name, create a dummy guest account
        if not booking_data.get("guest_id") and guest_name:
            from app.models.user import User, UserRole
            from app.core.security import hash_password
            
            parts = guest_name.strip().split(" ", 1)
            first_name = parts[0]
            last_name = parts[1] if len(parts) > 1 else ""
            
            guest = User(
                tenant_id=tenant_id,
                first_name=first_name,
                last_name=last_name,
                email=email or f"guest_{uuid.uuid4().hex[:6]}@example.com",
                phone=phone or "",
                hashed_password=hash_password("guest_auto_pass_123"),
                role=UserRole.guest,
                is_active=True,
                is_verified=True
            )
            db.add(guest)
            await db.flush()
            booking_data["guest_id"] = guest.id
        elif not booking_data.get("guest_id"):
            # Fallback for completely empty guest
            booking_data["guest_id"] = 1
        
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

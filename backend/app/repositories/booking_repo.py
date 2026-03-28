from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload
from app.models.booking import Booking
from app.repositories.base import TenantScopedRepository


class BookingRepository(TenantScopedRepository):
    """Repository for Booking model operations."""

    model = Booking

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
                selectinload(Booking.rooms).selectinload('room')
            )
        )
        result = await db.execute(stmt)
        return result.scalars().unique().all()

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

    model = Booking

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
                selectinload(Booking.rooms).selectinload('room')
            )
        )
        result = await db.execute(stmt)
        return result.scalars().unique().all()

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
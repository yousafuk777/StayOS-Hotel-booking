from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, and_, func
from sqlalchemy.orm import selectinload
from datetime import datetime
from app.models.booking import Booking, BookingRoom
from app.models.room import Room
from app.repositories.base import TenantScopedRepository
from app.services.stripe_service import stripe_service
import asyncio


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
    async def get_today_arrivals(cls, db: AsyncSession, tenant_id: int):
        """Get bookings checking in today for the dashboard."""
        from datetime import datetime
        today = datetime.utcnow().date()
        
        stmt = (
            select(cls.model)
            .where(
                cls.model.tenant_id == tenant_id,
                func.date(cls.model.check_in_date) == today,
                cls.model.status.in_(['confirmed', 'pending', 'vip']),
                cls.model.is_deleted == False
            )
            .options(
                selectinload(cls.model.guest),
                selectinload(cls.model.rooms).selectinload(BookingRoom.room).selectinload(Room.category)
            )
            .order_by(cls.model.check_in_date.asc())
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
        
        # Calculate dynamic occupancy rate
        from app.models.room import Room
        total_rooms_stmt = select(func.count(Room.id)).where(
            Room.tenant_id == tenant_id,
            Room.is_deleted == False
        )
        total_rooms_res = await db.execute(total_rooms_stmt)
        total_rooms = total_rooms_res.scalar() or 1 # Avoid division by zero
        
        occupancy_rate = (checked_in_count / total_rooms) * 100
        
        return {
            "revenue_this_month": float(revenue_this_month),
            "bookings_this_month": bookings_this_month,
            "pending_count": pending_count,
            "checked_in_count": checked_in_count,
            "occupancy_rate": min(100.0, float(occupancy_rate)), 
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
    async def update_booking(cls, db: AsyncSession, tenant_id: int, booking_id: int, update_data: dict):
        """Update an existing booking."""
        if not update_data:
            raise ValueError("No update fields provided")

        # Load existing booking to verify tenant and support date/nights handling.
        existing_booking = await db.get(Booking, booking_id)
        if not existing_booking or existing_booking.tenant_id != tenant_id or existing_booking.is_deleted:
            return None

        if 'check_in_date' in update_data or 'check_out_date' in update_data:
            check_in_date = update_data.get('check_in_date', existing_booking.check_in_date)
            check_out_date = update_data.get('check_out_date', existing_booking.check_out_date)

            if isinstance(check_in_date, str):
                check_in_date = datetime.fromisoformat(check_in_date)
            if isinstance(check_out_date, str):
                check_out_date = datetime.fromisoformat(check_out_date)

            if check_out_date <= check_in_date:
                raise ValueError("check_out_date must be after check_in_date")

            update_data['nights'] = (check_out_date - check_in_date).days

        # Handle Payment Capture/Refund if status changed
        if 'status' in update_data:
            new_status = update_data['status']
            old_status = existing_booking.status
            
            if new_status != old_status:
                if new_status == 'checked_in' and existing_booking.payment_status == 'authorized':
                    if existing_booking.stripe_payment_intent_id:
                        # Capture payment asynchronously
                        asyncio.create_task(stripe_service.capture_payment(existing_booking.stripe_payment_intent_id))
                
                elif new_status == 'cancelled' and existing_booking.payment_status == 'authorized':
                    if existing_booking.stripe_payment_intent_id:
                        # Refund/Cancel payment asynchronously
                        asyncio.create_task(stripe_service.refund_payment(existing_booking.stripe_payment_intent_id))

        stmt = (
            update(Booking)
            .where(
                Booking.id == booking_id,
                Booking.tenant_id == tenant_id,
                Booking.is_deleted == False
            )
            .values(**update_data)
        )
        result = await db.execute(stmt)
        if result.rowcount == 0:
            await db.rollback()
            return None

        await db.commit()

        stmt = (
            select(Booking)
            .options(
                selectinload(Booking.guest),
                selectinload(Booking.rooms).selectinload(BookingRoom.room).selectinload(Room.category)
            )
            .where(Booking.id == booking_id)
        )
        refreshed = await db.execute(stmt)
        return refreshed.scalar_one_or_none()

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
        from datetime import datetime
        import sys
        from app.utils.availability import check_room_availability
        
        print('🔥 [BookingRepo] create_booking method called!', flush=True)
        sys.stdout.flush()
        try:
            print(f'💾 [BookingRepo] Starting create_booking for tenant {tenant_id}', flush=True)
            sys.stdout.flush()
            print(f'💾 [BookingRepo] Input booking_data keys: {list(booking_data.keys())}', flush=True)
            sys.stdout.flush()
            
            # Generate a unique reference number
            ref = f"BKG-{uuid.uuid4().hex[:8].upper()}"
            
            # Extract room_id from data if present
            room_id = booking_data.pop("room_id", None)
            
            # Extract dynamic guest data
            guest_name = booking_data.pop("guest_name", None)
            email = booking_data.pop("email", None)
            phone = booking_data.pop("phone", None)
            room_type = booking_data.pop("room_type", None)
            
            print(f'💾 [BookingRepo] Guest info: name={guest_name}, email={email}, phone={phone}')
            
            # Validate required fields
            if not booking_data.get('check_in_date'):
                raise ValueError("check_in_date is required")
            if not booking_data.get('check_out_date'):
                raise ValueError("check_out_date is required")
            if not booking_data.get('hotel_id'):
                raise ValueError("hotel_id is required")
            
            # 1. Overlap Check & Fetch Room for Pricing
            room = None
            if room_id:
                # Fetch room with category for pricing
                stmt = select(Room).options(selectinload(Room.category)).where(Room.id == room_id)
                res = await db.execute(stmt)
                room = res.scalar_one_or_none()
                
                if not room:
                    raise ValueError(f"Room with ID {room_id} not found")

                is_available = await check_room_availability(
                    room_id=room_id,
                    check_in=booking_data.get('check_in_date'),
                    check_out=booking_data.get('check_out_date'),
                    db=db
                )
                if not is_available:
                    raise ValueError("This room is no longer available for the selected dates.")
            
            # If guest_id is missing but we have a name, create a dummy guest account
            if not booking_data.get("guest_id") and guest_name:
                from app.models.user import User, UserRole
                from app.core.security import hash_password
                
                print(f'� [BookingRepo] About to check for existing user: tenant_id={tenant_id}, email="{email}"', flush=True)
                import sys
                sys.stdout.flush()
                
                # Check if a user with this email already exists (case-insensitive)
                existing_user = await db.execute(
                    select(User).where(
                        User.tenant_id == tenant_id,
                        User.email.ilike(email)  # Case-insensitive search
                    )
                )
                existing_user = existing_user.scalar_one_or_none()
                
                print(f'🔍 [BookingRepo] Query result: {existing_user is not None}', flush=True)
                sys.stdout.flush()
                
                if existing_user:
                    print(f'✅ [BookingRepo] Reusing existing user ID: {existing_user.id} (role: {existing_user.role})', flush=True)
                    sys.stdout.flush()
                    # Use existing user
                    booking_data["guest_id"] = existing_user.id
                else:
                    print(f'🆕 [BookingRepo] Creating new user for email: {email}', flush=True)
                    sys.stdout.flush()
                    # Create new guest user
                    parts = guest_name.strip().split(" ", 1)
                    first_name = parts[0]
                    last_name = parts[1] if len(parts) > 1 else ""
                    
                    print(f'💾 [BookingRepo] Creating new guest user: {first_name} {last_name} with email: {email}')
                    
                    guest = User(
                        tenant_id=tenant_id,
                        first_name=first_name,
                        last_name=last_name,
                        email=email or f"guest_{uuid.uuid4().hex[:6]}@example.com",
                        phone=phone or "",
                        hashed_password=None,  # No password for auto-created guests
                        role=UserRole.guest,
                        is_active=True,
                        is_verified=False  # Verified via email link later
                    )
                    db.add(guest)
                    await db.flush()
                    booking_data["guest_id"] = guest.id
                    print(f'💾 [BookingRepo] Created new guest with ID: {guest.id}')
            elif not booking_data.get("guest_id"):
                # Fallback for completely empty guest
                print(f'💾 [BookingRepo] No guest provided, using fallback ID 1')
                booking_data["guest_id"] = 1
            
            # 2. Calculate Pricing if missing
            from decimal import Decimal
            check_in_date = booking_data.get('check_in_date')
            check_out_date = booking_data.get('check_out_date')
            
            # Ensure dates are datetime objects for calculation
            if isinstance(check_in_date, str):
                check_in_date = datetime.fromisoformat(check_in_date.replace('Z', '+00:00'))
            if isinstance(check_out_date, str):
                check_out_date = datetime.fromisoformat(check_out_date.replace('Z', '+00:00'))

            if 'nights' not in booking_data or not booking_data['nights']:
                booking_data['nights'] = (check_out_date - check_in_date).days
            
            if 'room_total' not in booking_data or booking_data['room_total'] is None:
                if room:
                    price_per_night = Decimal(str(room.effective_price))
                    booking_data['room_total'] = price_per_night * Decimal(str(booking_data['nights']))
                else:
                    booking_data['room_total'] = Decimal('0.00')

            # Ensure totals are present with default values
            booking_data['addon_total'] = Decimal(str(booking_data.get('addon_total') or '0.00'))
            booking_data['tax_amount'] = Decimal(str(booking_data.get('tax_amount') or '0.00'))
            booking_data['discount_amount'] = Decimal(str(booking_data.get('discount_amount') or '0.00'))
            
            if 'total_amount' not in booking_data or booking_data['total_amount'] is None:
                booking_data['total_amount'] = (
                    booking_data['room_total'] + 
                    booking_data['addon_total'] + 
                    booking_data['tax_amount'] - 
                    booking_data['discount_amount']
                )

            print(f'💾 [BookingRepo] Creating booking with data: {booking_data}')
            
            booking = Booking(
                tenant_id=tenant_id,
                reference_number=ref,
                room_id=room_id,
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

            # Eagerly load relationships needed by the API response to avoid async lazy-loading
            stmt = (
                select(Booking)
                .options(
                    selectinload(Booking.guest),
                    selectinload(Booking.rooms).selectinload(BookingRoom.room).selectinload(Room.category)
                )
                .where(Booking.id == booking.id)
            )
            result = await db.execute(stmt)
            booking = result.scalar_one()

            print(f'✅ [BookingRepo] Successfully created booking ID: {booking.id} with ref: {ref}')
            return booking
        except ValueError as ve:
            print(f'❌ [BookingRepo] Validation error: {str(ve)}')
            await db.rollback()
            raise
        except Exception as e:
            print(f'❌ [BookingRepo] Unexpected error: {type(e).__name__}: {str(e)}')
            import traceback
            traceback.print_exc()
            await db.rollback()
            raise


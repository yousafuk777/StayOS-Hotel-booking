from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.api.deps import get_db
from app.repositories.booking_repo import BookingRepository
from app.schemas.booking import BookingResponse, BookingListResponse, BookingStats, BookingCreate, BookingUpdate
from app.dependencies.role_guard import require_module_access
from app.models.user import User
from app.models.hotel import Hotel
from datetime import datetime

router = APIRouter()

def format_booking_response(b):
    """Helper to format a Booking ORM object into a BookingResponse compatible dict."""
    guest_name = f"{b.guest.first_name} {b.guest.last_name}" if b.guest else "Unknown"
    room_type = b.rooms[0].room.category.name if b.rooms and b.rooms[0].room and b.rooms[0].room.category else "Unknown"
    room_number = b.rooms[0].room.room_number if b.rooms and b.rooms[0].room else "TBD"
    
    return {
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
        "addon_total": b.addon_total or 0,
        "discount_amount": b.discount_amount or 0,
        "tax_amount": b.tax_amount or 0,
        "total_amount": b.total_amount,
        "special_requests": b.special_requests,
        "cancellation_reason": b.cancellation_reason,
        "cancelled_at": b.cancelled_at,
        "confirmed_at": b.confirmed_at,
        "created_at": b.created_at,
        "updated_at": b.updated_at,
        "guest_name": guest_name,
        "room_type": room_type,
        "room_number": room_number
    }

@router.get("/", response_model=BookingListResponse)
async def get_bookings(
    request: Request,
    status: str = None,
    search: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_module_access("bookings"))
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
    formatted_bookings = [format_booking_response(b) for b in bookings]
    return {"bookings": formatted_bookings, "total": len(formatted_bookings)}


@router.get("/pending", response_model=BookingListResponse)
async def get_pending_bookings(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_module_access("bookings"))
):
    """Get all pending bookings for the current tenant."""
    tenant_id = request.state.tenant_id or current_user.tenant_id
    bookings = await BookingRepository.get_pending_bookings(db, tenant_id=tenant_id)
    
    formatted_bookings = [format_booking_response(b) for b in bookings]
    return {"bookings": formatted_bookings, "total": len(formatted_bookings)}


@router.get("/arrivals", response_model=BookingListResponse)
async def get_today_arrivals(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_module_access("bookings"))
):
    """Get all bookings checking in today for the current tenant."""
    tenant_id = request.state.tenant_id or current_user.tenant_id
    bookings = await BookingRepository.get_today_arrivals(db, tenant_id=tenant_id)
    
    formatted_bookings = [format_booking_response(b) for b in bookings]
    return {"bookings": formatted_bookings, "total": len(formatted_bookings)}


@router.get("/stats", response_model=BookingStats)
async def get_dashboard_stats(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_module_access("bookings"))
):
    """Get dashboard statistics for the current tenant."""
    tenant_id = request.state.tenant_id or current_user.tenant_id
    return await BookingRepository.get_dashboard_stats(db, tenant_id=tenant_id)


@router.post("/", response_model=BookingResponse)
async def create_booking(
    request: Request,
    booking_in: BookingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_module_access("bookings", require_write=True))
):
    """Create a new booking manually from the admin panel."""
    print('🚀 [API] create_booking endpoint called!')
    try:
        print('📤 [Booking Creation] Starting...')
        print(f'📤 [Booking Creation] Input data: {booking_in.model_dump()}')
        print(f'📤 [Booking Creation] Current user: {current_user.id}, Tenant: {current_user.tenant_id}')
        
        tenant_id = request.state.tenant_id or current_user.tenant_id
        print(f'📤 [Booking Creation] Using tenant_id: {tenant_id}')
        
        # If still no tenant_id and we have a hotel_id, we can fallback to finding it
        if tenant_id is None and booking_in.hotel_id:
            from app.models.hotel import Hotel
            hotel = await db.get(Hotel, booking_in.hotel_id)
            if hotel:
                tenant_id = hotel.tenant_id
                print(f'📤 [Booking Creation] Found tenant_id from hotel: {tenant_id}')

        if tenant_id is None:
            print('❌ [Booking Creation] No tenant context found')
            raise HTTPException(status_code=400, detail="Tenant context missing - unable to determine hotel/tenant")

        print(f'📤 [Booking Creation] Calling repository...')
        booking = await BookingRepository.create_booking(
            db, 
            tenant_id=tenant_id, 
            booking_data=booking_in.model_dump()
        )
        print(f'✅ [Booking Creation] Created booking ID: {booking.id}')
        
        # Format response with guest and room details for frontend consumption
        formatted = format_booking_response(booking)
        print(f'✅ [Booking Creation] Returning formatted response')
        return formatted
    except HTTPException as http_err:
        print(f'❌ [Booking Creation] HTTP Error: {http_err.detail}')
        raise
    except ValueError as val_err:
        print(f'❌ [Booking Creation] Validation Error: {val_err}')
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as e:
        print(f'❌ [Booking Creation] Unexpected error: {type(e).__name__}: {str(e)}')
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to create booking: {str(e)}")


@router.put("/{booking_id}", response_model=BookingResponse)
async def update_booking(
    request: Request,
    booking_id: int,
    booking_in: BookingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_module_access("bookings", require_write=True))
):
    """Update a booking's details."""
    tenant_id = request.state.tenant_id or current_user.tenant_id
    booking = await BookingRepository.update_booking(
        db,
        tenant_id=tenant_id,
        booking_id=booking_id,
        update_data=booking_in.model_dump(exclude_unset=True)
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found or not updatable")
    return format_booking_response(booking)


@router.put("/{booking_id}/confirm")
async def confirm_booking(
    request: Request,
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_module_access("bookings", require_write=True))
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
    current_user: User = Depends(require_module_access("bookings", require_write=True))
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


@router.post("/public/bookings")
async def create_public_booking(
    booking_data: dict,
    db: AsyncSession = Depends(get_db)
):
    """Create a booking from the public website (no authentication required)."""
    try:
        print('🌐 [Public Booking] Creating booking from public website...')
        print(f'📥 [Public Booking] Data: {booking_data}')
        
        # Extract data
        hotel_id = booking_data.get('hotel_id')
        guest_name = booking_data.get('guest_name')
        email = booking_data.get('email')
        phone = booking_data.get('phone')
        check_in = booking_data.get('check_in_date')
        check_out = booking_data.get('check_out_date')
        nights = booking_data.get('nights', 1)
        num_guests = booking_data.get('num_guests', 1)
        special_requests = booking_data.get('special_requests', '')
        
        print(f'🔍 [Public Booking] Extracted - hotel_id: {hotel_id}, guest_name: {guest_name}, email: {email}')
        
        # Validate required fields
        if not all([hotel_id, guest_name, email, phone, check_in, check_out]):
            missing = []
            if not hotel_id: missing.append('hotel_id')
            if not guest_name: missing.append('guest_name')
            if not email: missing.append('email')
            if not phone: missing.append('phone')
            if not check_in: missing.append('check_in_date')
            if not check_out: missing.append('check_out_date')
            raise HTTPException(status_code=400, detail=f"Missing required fields: {', '.join(missing)}")
        
        # Get hotel to find tenant_id
        print(f'🔍 [Public Booking] Fetching hotel with ID: {hotel_id}')
        hotel = await db.get(Hotel, hotel_id)
        print(f'🔍 [Public Booking] Hotel found: {hotel is not None}')
        
        if not hotel:
            raise HTTPException(status_code=404, detail=f"Hotel with ID {hotel_id} not found")
        
        if not hotel.is_active:
            raise HTTPException(status_code=400, detail="Hotel is not active")
        
        tenant_id = hotel.tenant_id
        print(f'✅ [Public Booking] Found tenant_id: {tenant_id} from hotel')
        
        if not tenant_id:
            raise HTTPException(status_code=400, detail="Hotel has no tenant_id associated")
        
        # Create or find guest user
        # Split name into first and last
        name_parts = guest_name.strip().split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        print(f'🔍 [Public Booking] Looking for user with email: {email}')
        
        # Check if user/guest exists by email
        user_query = select(User).where(User.email == email)
        user_result = await db.execute(user_query)
        guest = user_result.scalar_one_or_none()
        
        if not guest:
            print(f'🆕 [Public Booking] Creating new guest user...')
            # Create new guest user with minimal info
            from app.core.security import get_password_hash
            guest = User(
                tenant_id=tenant_id,
                email=email,
                first_name=first_name,
                last_name=last_name,
                phone=phone,
                hashed_password=get_password_hash("guest_temp_123"),  # Temporary password
                is_active=True
            )
            db.add(guest)
            await db.flush()
            print(f'✅ [Public Booking] Created new guest user ID: {guest.id}')
        else:
            print(f'✅ [Public Booking] Found existing guest user ID: {guest.id}')
        
        # Verify guest was created/found
        if not guest or not guest.id:
            print(f'❌ [Public Booking] Guest creation failed! guest={guest}')
            raise HTTPException(status_code=500, detail="Failed to create guest user")
        
        # Prepare booking data
        booking_create = BookingCreate(
            guest_id=guest.id,
            hotel_id=hotel_id,
            check_in_date=datetime.fromisoformat(check_in.replace('Z', '+00:00')) if isinstance(check_in, str) else check_in,
            check_out_date=datetime.fromisoformat(check_out.replace('Z', '+00:00')) if isinstance(check_out, str) else check_out,
            nights=nights,
            num_guests=num_guests,
            room_total=0,  # Will be calculated later
            addon_total=0,
            discount_amount=0,
            tax_amount=0,
            total_amount=0,
            status='pending',
            special_requests=special_requests,
            guest_name=guest_name,
            email=email,
            phone=phone
        )
        
        print(f'📤 [Public Booking] Calling BookingRepository.create_booking...')
        
        # Create booking
        booking = await BookingRepository.create_booking(
            db,
            tenant_id=tenant_id,
            booking_data=booking_create.model_dump()
        )
        
        await db.commit()
        
        print(f'✅ [Public Booking] Booking created successfully! ID: {booking.id}')
        print(f'✅ [Public Booking] Reference: {booking.reference_number}')
        
        return {
            "success": True,
            "message": "Booking created successfully",
            "booking_id": booking.id,
            "reference_number": booking.reference_number
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f'❌ [Public Booking] Error: {str(e)}')
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to create booking: {str(e)}")

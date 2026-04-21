from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.api.deps import get_db
from app.repositories.booking_repo import BookingRepository
from app.schemas.booking import (
    BookingResponse, BookingListResponse, BookingStats, 
    BookingCreate, BookingUpdate, StripePaymentIntentResponse, PaymentConfirmRequest
)
from app.dependencies.role_guard import require_module_access
from app.models.user import User
from app.models.hotel import Hotel
from app.models.booking import Booking, BookingRoom
from app.utils.booking_tokens import generate_guest_access_token, generate_pending_expiry
from app.services.email_service import email_service
from app.services.stripe_service import stripe_service
from app.services.email_templates import (
    booking_confirmation_guest,
    booking_notification_hotel
)
from datetime import datetime
import os
import asyncio

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
        "payment_status": b.payment_status or "unpaid",
        "stripe_payment_intent_id": b.stripe_payment_intent_id,
        "stripe_charge_id": b.stripe_charge_id,
        "currency": b.currency or "usd",
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
    tenant_id = current_user.tenant_id if current_user.tenant_id is not None else request.state.tenant_id
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
    tenant_id = current_user.tenant_id if current_user.tenant_id is not None else request.state.tenant_id
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
    tenant_id = current_user.tenant_id if current_user.tenant_id is not None else request.state.tenant_id
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
    tenant_id = current_user.tenant_id if current_user.tenant_id is not None else request.state.tenant_id
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
        
        tenant_id = current_user.tenant_id if current_user.tenant_id is not None else request.state.tenant_id
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
    tenant_id = current_user.tenant_id if current_user.tenant_id is not None else request.state.tenant_id
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
    tenant_id = current_user.tenant_id if current_user.tenant_id is not None else request.state.tenant_id
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
    tenant_id = current_user.tenant_id if current_user.tenant_id is not None else request.state.tenant_id
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
    background_tasks: BackgroundTasks,
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
        room_id = booking_data.get('room_id')  # Ensure room_id is extracted
        
        # Validate required fields
        if not all([hotel_id, guest_name, email, phone, check_in, check_out]):
            raise HTTPException(status_code=400, detail="Missing required fields")
        
        # Get hotel to find tenant_id
        hotel = await db.get(Hotel, hotel_id)
        if not hotel or not hotel.is_active:
            raise HTTPException(status_code=404, detail="Hotel not found or inactive")
        
        tenant_id = hotel.tenant_id
        
        # Note: The BookingRepository.create_booking will handle finding/creating
        # the guest user and enforcing the "no password" guest account policy.
        # We just need to pass the raw data.
        pass

        
        # Prepare booking metadata (the repo handles the rest)
        # We don't need to define every field here as create_booking accepts a dict
        final_booking_data = {
            "hotel_id": hotel_id,
            "check_in_date": datetime.fromisoformat(check_in.replace('Z', '+00:00')) if isinstance(check_in, str) else check_in,
            "check_out_date": datetime.fromisoformat(check_out.replace('Z', '+00:00')) if isinstance(check_out, str) else check_out,
            "nights": nights,
            "num_guests": num_guests,
            "status": 'pending',
            "special_requests": special_requests,
            "guest_name": guest_name,
            "email": email,
            "phone": phone
        }
        
        # Generate access token and expiry
        raw_token, hashed_token, token_expiry = generate_guest_access_token()
        pending_expiry = generate_pending_expiry()

        # Create booking via repository (handles everything including user creation)
        booking = await BookingRepository.create_booking(
            db,
            tenant_id=tenant_id,
            booking_data={
                **final_booking_data,
                "room_id": room_id,
                "guest_access_token": hashed_token,
                "guest_access_token_expires_at": token_expiry,
                "expires_at": pending_expiry,
                "payment_status": "unpaid"
            }
        )
        
        await db.commit()
        
        # EXTREMELY IMPORTANT: Prefetch relations for the email template
        # while the database session is still active.
        result = await db.execute(
            select(Booking)
            .options(
                selectinload(Booking.rooms).selectinload(BookingRoom.room),
                selectinload(Booking.hotel)
            )
            .where(Booking.id == booking.id)
        )
        booking = result.scalar_one()
        
        print('[Public Booking] Booking created successfully! ID: ' + str(booking.id))
        print('[Public Booking] Reference: ' + str(booking.reference_number))
        
        # --- Email Notifications (Fire and Forget) ---
        try:
            frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
            booking_url = f"{frontend_url}/my-booking/{booking.reference_number}?token={raw_token}"
            
            # 1. Guest confirmation
            guest_subject, guest_html = booking_confirmation_guest(
                guest_name=guest_name,
                hotel_name=hotel.name,
                room_name=booking.rooms[0].room.name if booking.rooms and booking.rooms[0].room else "Standard Room",
                check_in=booking.check_in_date.strftime("%d %B %Y"),
                check_out=booking.check_out_date.strftime("%d %B %Y"),
                reference=booking.reference_number,
                booking_url=booking_url,
                nights=nights,
            )
            background_tasks.add_task(email_service.send_email, email, guest_subject, guest_html)
            
            # 2. Hotel admin notification
            admin_result = await db.execute(
                select(User).where(
                    User.tenant_id == tenant_id,
                    User.role == "hotel_admin",
                    User.is_active == True
                ).limit(1)
            )
            hotel_admin = admin_result.scalar_one_or_none()
            
            if hotel_admin:
                admin_subject, admin_html = booking_notification_hotel(
                    hotel_name=hotel.name,
                    guest_name=guest_name,
                    guest_email=email,
                    guest_phone=phone,
                    room_name=booking.rooms[0].room.name if booking.rooms and booking.rooms[0].room else "Standard Room",
                    check_in=booking.check_in_date.strftime("%d %B %Y"),
                    check_out=booking.check_out_date.strftime("%d %B %Y"),
                    reference=booking.reference_number,
                    special_requests=special_requests,
                    admin_dashboard_url=f"{frontend_url}/admin/bookings",
                )
                background_tasks.add_task(email_service.send_email, hotel_admin.email, admin_subject, admin_html)
        except Exception as email_err:
            print("[Public Booking] Email queuing failed: " + str(email_err))
        
        return {
            "success": True,
            "message": "Booking created successfully! Check your email for confirmation.",
            "booking_id": booking.id,
            "reference_number": booking.reference_number,
            "raw_token": raw_token  # For email generation in the next step
        }
        
    except HTTPException as head_err:
        raise head_err
    except ValueError as val_err:
        print('[Public Booking] Availability/Validation Error: ' + str(val_err))
        raise HTTPException(status_code=409, detail=str(val_err))
    except Exception as e:
        print('[Public Booking] Error: ' + str(e))
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to create booking: {str(e)}")


@router.get("/public/lookup/{reference}")
async def get_booking_by_reference(
    reference: str,
    token: str,   # query param: ?token=xxx
    db: AsyncSession = Depends(get_db)
):
    """
    Public endpoint — no authentication required.
    Guest accesses their booking via reference + signed token.
    """
    import hashlib
    # Hash the incoming token to compare with stored hash
    hashed_token = hashlib.sha256(token.encode()).hexdigest()

    # Join with room and hotel (tenant/hotel relations)
    from app.models.booking import BookingRoom
    from app.models.room import Room
    
    result = await db.execute(
        select(Booking)
        .options(
            selectinload(Booking.guest),
            selectinload(Booking.rooms).selectinload(BookingRoom.room).selectinload(Room.category),
            selectinload(Booking.hotel)
        )
        .where(
            Booking.reference_number == reference,
            Booking.guest_access_token == hashed_token,
            Booking.guest_access_token_expires_at > datetime.utcnow()
        )
    )
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found or access link has expired."
        )

    return {
        "reference_number": booking.reference_number,
        "status": booking.status,
        "check_in_date": booking.check_in_date,
        "check_out_date": booking.check_out_date,
        "room_name": booking.rooms[0].room.name if booking.rooms and booking.rooms[0].room else "Standard Room",
        "hotel_name": booking.hotel.name if booking.hotel else "StayOS Hotel",
        "guest_name": f"{booking.guest.first_name} {booking.guest.last_name}" if booking.guest else "Guest",
        "special_requests": booking.special_requests,
        "created_at": booking.created_at,
        "nights": booking.nights,
        "total_amount": float(booking.total_amount),
        "payment_status": booking.payment_status,
        "stripe_payment_intent_id": booking.stripe_payment_intent_id
    }


@router.post("/public/bookings/{reference}/create-payment-intent", response_model=StripePaymentIntentResponse)
async def create_payment_intent(
    reference: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a Stripe PaymentIntent for a public booking.
    The booking must be in 'pending' status and 'unpaid'.
    """
    result = await db.execute(select(Booking).where(Booking.reference_number == reference))
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.payment_status == "paid":
        raise HTTPException(status_code=400, detail="Booking is already paid")

    # Create PaymentIntent via service
    amount_cents = int(booking.total_amount * 100)
    intent = await stripe_service.create_payment_intent(
        amount=amount_cents,
        currency=booking.currency or "usd",
        metadata={
            "booking_reference": reference,
            "tenant_id": str(booking.tenant_id),
            "hotel_id": str(booking.hotel_id)
        },
        description=f"StayOS Booking {reference}"
    )
    
    # Update booking with intent ID
    booking.stripe_payment_intent_id = intent.id
    await db.commit()
    
    return {
        "client_secret": intent.client_secret,
        "payment_intent_id": intent.id,
        "amount": float(booking.total_amount),
        "currency": booking.currency or "usd"
    }


@router.post("/public/bookings/{reference}/confirm-payment")
async def confirm_payment(
    reference: str,
    confirm_data: PaymentConfirmRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Update booking status after frontend confirms Stripe payment.
    The real verification happens via Webhook, but this allows immediate UI update.
    """
    result = await db.execute(select(Booking).where(Booking.reference_number == reference))
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.stripe_payment_intent_id != confirm_data.payment_intent_id:
        raise HTTPException(status_code=400, detail="Payment Intent ID mismatch")

    # We update status to 'authorized' (meaning held)
    # The webhook will set payment_status to 'authorized' as well
    booking.payment_status = "authorized"
    await db.commit()
    
    return {"success": True, "message": "Payment authorized successfully"}

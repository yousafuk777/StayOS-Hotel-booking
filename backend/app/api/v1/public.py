from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.api.deps import get_db
from app.repositories.booking_repo import BookingRepository
from app.schemas.booking import BookingCreate, BookingResponse
from app.models.user import User
from app.models.hotel import Hotel
from app.models.tenant import Tenant
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/bookings")
async def create_public_booking(
    booking_data: dict,
    db: AsyncSession = Depends(get_db)
):
    """Create a booking from the public website (no authentication required)."""
    try:
        print('🌐 [Public API] Creating booking from public website...')
        print(f'📥 [Public API] Data: {booking_data}')
        
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
        
        print(f'🔍 [Public API] Extracted - hotel_id: {hotel_id}, guest_name: {guest_name}, email: {email}')
        
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
        print(f'🔍 [Public API] Fetching hotel with ID: {hotel_id}')
        hotel = await db.get(Hotel, hotel_id)
        
        if not hotel:
            raise HTTPException(status_code=404, detail=f"Hotel with ID {hotel_id} not found")
        
        if not hotel.is_active:
            raise HTTPException(status_code=400, detail="Hotel is not active")
        
        tenant_id = hotel.tenant_id
        print(f'✅ [Public API] Found tenant_id: {tenant_id} from hotel')
        
        # Create or find guest user
        name_parts = guest_name.strip().split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        # Check if user/guest exists by email
        user_query = select(User).where(User.email == email)
        user_result = await db.execute(user_query)
        guest = user_result.scalar_one_or_none()
        
        if not guest:
            print(f'🆕 [Public API] Creating new guest user...')
            from app.core.security import hash_password
            guest = User(
                tenant_id=tenant_id,
                email=email,
                first_name=first_name,
                last_name=last_name,
                phone=phone,
                hashed_password=hash_password("guest_temp_123"),
                is_active=True
            )
            db.add(guest)
            await db.flush()
            print(f'✅ [Public API] Created new guest user ID: {guest.id}')
        
        # Prepare booking data
        # Note: We use a simplified dict for the repository create_booking method
        booking_payload = {
            "guest_id": guest.id,
            "hotel_id": hotel_id,
            "check_in_date": datetime.fromisoformat(check_in.replace('Z', '+00:00')) if isinstance(check_in, str) else check_in,
            "check_out_date": datetime.fromisoformat(check_out.replace('Z', '+00:00')) if isinstance(check_out, str) else check_out,
            "nights": nights,
            "num_guests": num_guests,
            "room_total": booking_data.get('room_total', 0),
            "addon_total": 0,
            "discount_amount": 0,
            "tax_amount": 0,
            "total_amount": booking_data.get('total_amount', 0),
            "status": 'pending',
            "special_requests": special_requests
        }
        
        print(f'📤 [Public API] Calling BookingRepository.create_booking...')
        booking = await BookingRepository.create_booking(
            db,
            tenant_id=tenant_id,
            booking_data=booking_payload
        )
        
        await db.commit()
        print(f'✅ [Public API] Booking created successfully! ID: {booking.id}')
        
        return {
            "success": True,
            "message": "Booking created successfully",
            "booking_id": booking.id,
            "reference_number": booking.reference_number
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f'❌ [Public API] Error: {str(e)}')
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to create booking: {str(e)}")

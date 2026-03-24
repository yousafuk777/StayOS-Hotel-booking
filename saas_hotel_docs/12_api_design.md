# 12 — API Design

## API Conventions

| Convention | Value |
|-----------|-------|
| Base URL | `https://api.stayos.com/api/v1` |
| Protocol | HTTPS only |
| Format | JSON |
| Authentication | Bearer JWT in `Authorization` header |
| Versioning | URL path (`/api/v1/`) |
| Pagination | `?page=1&page_size=20` |
| Errors | RFC 7807 Problem Details format |

### Standard Response Envelope
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "page_size": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

### Error Response Format
```json
{
  "error": {
    "code": "ROOM_NOT_AVAILABLE",
    "message": "The selected room is not available for the chosen dates.",
    "details": { "room_id": 42, "dates": "2025-12-01 to 2025-12-05" }
  }
}
```

---

## Authentication Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register new guest account |
| POST | `/auth/login` | Login and get tokens |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Invalidate refresh token |
| POST | `/auth/forgot-password` | Send reset email |
| POST | `/auth/reset-password` | Reset password with token |
| POST | `/auth/verify-email` | Verify email with token |

### POST /auth/login
```
Request:
{
  "email": "guest@example.com",
  "password": "securepassword"
}

Response 200:
{
  "data": {
    "access_token": "eyJ...",
    "token_type": "bearer",
    "user": {
      "id": 42,
      "email": "guest@example.com",
      "first_name": "John",
      "role": "guest",
      "tenant_id": 1
    }
  }
}
// refresh_token set as httpOnly cookie
```

---

## Hotel Endpoints (Public)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/hotels/search` | Search hotels with filters |
| GET | `/hotels/{hotel_id}` | Get hotel details |
| GET | `/hotels/{hotel_id}/rooms` | Get available rooms |
| GET | `/hotels/{hotel_id}/reviews` | Get hotel reviews |
| GET | `/hotels/{hotel_id}/amenities` | Get hotel amenities |

### GET /hotels/search
```
Query Parameters:
  destination   string    required  e.g., "New York"
  check_in      date      required  YYYY-MM-DD
  check_out     date      required  YYYY-MM-DD
  guests        int       default=1
  rooms         int       default=1
  min_price     float     optional
  max_price     float     optional
  star_rating   int[]     optional  e.g., [4,5]
  amenities     int[]     optional  amenity IDs
  page          int       default=1
  page_size     int       default=20
  sort_by       string    price_asc|price_desc|rating_desc

Response 200:
{
  "data": [
    {
      "id": 1,
      "name": "Grand Hotel",
      "city": "New York",
      "star_rating": 5,
      "overall_rating": 8.9,
      "review_count": 234,
      "lowest_price": 199.00,
      "thumbnail": "https://cdn.stayos.com/grand-hotel/thumb.jpg",
      "amenities": ["wifi", "pool", "gym"]
    }
  ],
  "meta": { "page": 1, "total": 45 }
}
```

---

## Booking Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/bookings` | Create a new booking | Guest |
| GET | `/bookings` | List user's bookings | Guest |
| GET | `/bookings/{id}` | Get booking details | Guest |
| PUT | `/bookings/{id}/cancel` | Cancel booking | Guest |
| GET | `/bookings/{id}/invoice` | Download invoice PDF | Guest |

### POST /bookings
```
Request:
{
  "hotel_id": 1,
  "room_ids": [5],
  "check_in_date": "2025-12-01",
  "check_out_date": "2025-12-05",
  "num_guests": 2,
  "guest_details": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "addon_ids": [1, 3],
  "promo_code": "WINTER20",
  "special_requests": "High floor preferred"
}

Response 201:
{
  "data": {
    "id": 999,
    "reference_number": "SOS-A7B2C",
    "hotel": { "id": 1, "name": "Grand Hotel" },
    "check_in_date": "2025-12-01",
    "check_out_date": "2025-12-05",
    "nights": 4,
    "status": "pending",
    "room_total": 796.00,
    "addon_total": 50.00,
    "discount_amount": 79.60,
    "tax_amount": 76.64,
    "total_amount": 843.04,
    "payment_intent_client_secret": "pi_xxx_secret_yyy"
  }
}
```

---

## Payment Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/payments/intent` | Create payment intent | Guest |
| POST | `/payments/confirm` | Confirm payment | Guest |
| POST | `/payments/webhook` | Stripe webhook handler | System |
| GET | `/payments/{booking_id}` | Get payment details | Guest |
| POST | `/payments/{id}/refund` | Request refund | Guest |

---

## Review Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/reviews` | Submit a review | Guest |
| GET | `/reviews/hotel/{hotel_id}` | List hotel reviews | Public |
| PUT | `/reviews/{id}` | Update own review | Guest |
| PUT | `/reviews/{id}/respond` | Hotel response | Hotel Admin |
| PUT | `/reviews/{id}/flag` | Flag a review | Hotel Admin |

---

## Admin Endpoints (Hotel Admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/dashboard` | Admin dashboard stats |
| GET/PUT | `/admin/hotel` | Get/update hotel profile |
| GET/POST | `/admin/rooms` | List/create rooms |
| GET/PUT/DELETE | `/admin/rooms/{id}` | Room CRUD |
| POST | `/admin/rooms/{id}/images` | Upload room images |
| GET | `/admin/bookings` | List all bookings |
| PUT | `/admin/bookings/{id}/confirm` | Confirm booking |
| PUT | `/admin/bookings/{id}/reject` | Reject booking |
| GET | `/admin/bookings/calendar` | Calendar view |
| GET/POST | `/admin/staff` | List/create staff |
| GET | `/admin/analytics/revenue` | Revenue stats |
| GET | `/admin/analytics/occupancy` | Occupancy stats |
| GET/POST | `/admin/promotions` | Promotions management |
| GET/PUT | `/admin/settings/theme` | Theme settings |

### GET /admin/analytics/revenue
```
Query Parameters:
  period    week|month|year|custom
  start     YYYY-MM-DD (for custom)
  end       YYYY-MM-DD (for custom)

Response 200:
{
  "data": {
    "total_revenue": 48250.00,
    "room_revenue": 42000.00,
    "addon_revenue": 6250.00,
    "bookings_count": 87,
    "avg_booking_value": 554.60,
    "by_period": [
      { "date": "2025-11-01", "revenue": 1520.00, "bookings": 3 },
      ...
    ],
    "by_room_category": [
      { "category": "Suite", "revenue": 18000.00, "percentage": 37.3 },
      ...
    ]
  }
}
```

---

## Super Admin Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/super-admin/tenants` | List all tenants |
| POST | `/super-admin/tenants` | Create new tenant |
| GET | `/super-admin/tenants/{id}` | Tenant details |
| PUT | `/super-admin/tenants/{id}/status` | Activate/suspend |
| GET | `/super-admin/users` | All platform users |
| GET | `/super-admin/analytics` | Platform analytics |
| GET | `/super-admin/transactions` | All transactions |
| POST | `/super-admin/transactions/{id}/refund` | Issue refund |
| GET | `/super-admin/health` | System health |
| GET | `/super-admin/logs` | Audit logs |

---

## FastAPI Router Setup

```python
# app/api/v1/router.py

from fastapi import APIRouter
from app.api.v1 import (
    auth, hotels, rooms, bookings,
    payments, reviews, users, notifications
)
from app.api.v1.admin import hotel_admin, staff, analytics, housekeeping
from app.api.v1.super_admin import tenants, platform

api_router = APIRouter()

# Public routes
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(hotels.router, prefix="/hotels", tags=["Hotels"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["Bookings"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])

# Hotel admin routes
api_router.include_router(hotel_admin.router, prefix="/admin", tags=["Hotel Admin"])
api_router.include_router(staff.router, prefix="/admin/staff", tags=["Staff"])
api_router.include_router(analytics.router, prefix="/admin/analytics", tags=["Analytics"])
api_router.include_router(housekeeping.router, prefix="/admin/housekeeping", tags=["Housekeeping"])

# Super admin routes (no tenant middleware)
api_router.include_router(tenants.router, prefix="/super-admin", tags=["Super Admin"])
api_router.include_router(platform.router, prefix="/super-admin", tags=["Platform"])
```

---

## Sample Route Handler: Hotel Search

```python
# app/api/v1/hotels.py

from fastapi import APIRouter, Depends, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db
from app.services.hotel_service import HotelService
from app.schemas.hotel import HotelSearchResponse
from datetime import date
from typing import Optional, List

router = APIRouter()

@router.get("/search", response_model=HotelSearchResponse)
async def search_hotels(
    request: Request,
    db: AsyncSession = Depends(get_db),
    destination: str = Query(..., min_length=2),
    check_in: date = Query(...),
    check_out: date = Query(...),
    guests: int = Query(default=1, ge=1, le=20),
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    star_rating: Optional[List[int]] = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    if check_out <= check_in:
        raise HTTPException(status_code=400, detail="check_out must be after check_in")

    tenant_id = request.state.tenant_id
    results = await HotelService.search(
        db=db,
        tenant_id=tenant_id,
        destination=destination,
        check_in=check_in,
        check_out=check_out,
        guests=guests,
        min_price=min_price,
        max_price=max_price,
        star_rating=star_rating,
        page=page,
        page_size=page_size,
    )
    return results
```

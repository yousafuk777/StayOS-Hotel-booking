# 10 — Backend FastAPI Structure

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app entry point
│   │
│   ├── api/                       # Route handlers
│   │   ├── __init__.py
│   │   ├── deps.py                # Shared dependencies (get_db, get_current_user)
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py          # Aggregates all routers
│   │       ├── auth.py            # Login, register, refresh, reset
│   │       ├── hotels.py          # Hotel CRUD + search
│   │       ├── rooms.py           # Room management
│   │       ├── bookings.py        # Booking flow
│   │       ├── payments.py        # Payment processing
│   │       ├── reviews.py         # Reviews and ratings
│   │       ├── users.py           # User profile management
│   │       ├── notifications.py   # Notification endpoints
│   │       ├── messages.py        # Guest-hotel messaging
│   │       ├── admin/
│   │       │   ├── hotel_admin.py # Hotel admin routes
│   │       │   ├── staff.py       # Staff management
│   │       │   ├── housekeeping.py
│   │       │   └── analytics.py
│   │       └── super_admin/
│   │           ├── tenants.py
│   │           ├── users.py
│   │           ├── subscriptions.py
│   │           └── platform.py
│   │
│   ├── core/
│   │   ├── config.py              # Settings from environment
│   │   ├── security.py            # JWT + password hashing
│   │   ├── database.py            # SQLAlchemy async engine + session
│   │   ├── cache.py               # Redis client
│   │   └── exceptions.py          # Custom exception handlers
│   │
│   ├── middleware/
│   │   ├── tenant.py              # Tenant resolution middleware
│   │   ├── logging.py             # Request/response logging
│   │   └── cors.py                # CORS configuration
│   │
│   ├── models/                    # SQLAlchemy models
│   │   ├── base.py
│   │   ├── tenant.py
│   │   ├── user.py
│   │   ├── hotel.py
│   │   ├── room.py
│   │   ├── booking.py
│   │   ├── payment.py
│   │   ├── review.py
│   │   ├── notification.py
│   │   └── theme.py
│   │
│   ├── schemas/                   # Pydantic schemas (request/response)
│   │   ├── auth.py
│   │   ├── hotel.py
│   │   ├── room.py
│   │   ├── booking.py
│   │   ├── payment.py
│   │   ├── review.py
│   │   └── user.py
│   │
│   ├── services/                  # Business logic layer
│   │   ├── auth_service.py
│   │   ├── hotel_service.py
│   │   ├── room_service.py
│   │   ├── booking_service.py
│   │   ├── payment_service.py
│   │   ├── review_service.py
│   │   ├── notification_service.py
│   │   └── theme_service.py
│   │
│   ├── repositories/              # Data access layer
│   │   ├── base.py
│   │   ├── tenant_repo.py
│   │   ├── user_repo.py
│   │   ├── hotel_repo.py
│   │   ├── room_repo.py
│   │   ├── booking_repo.py
│   │   └── review_repo.py
│   │
│   ├── tasks/                     # Celery async tasks
│   │   ├── celery_app.py
│   │   ├── email_tasks.py
│   │   ├── invoice_tasks.py
│   │   └── notification_tasks.py
│   │
│   └── utils/
│       ├── email.py               # Email templates + sending
│       ├── storage.py             # S3 file upload
│       ├── pdf.py                 # Invoice PDF generation
│       └── helpers.py             # Utility functions
│
├── alembic/                       # Database migrations
│   ├── env.py
│   └── versions/
│
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_bookings.py
│   └── test_hotels.py
│
├── requirements.txt
├── Dockerfile
└── .env.example
```

---

## main.py — App Entry Point

```python
# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.middleware.tenant import TenantMiddleware
from app.middleware.logging import LoggingMiddleware
from app.core.config import settings
from app.core.exceptions import register_exception_handlers

app = FastAPI(
    title="StayOS API",
    version="1.0.0",
    docs_url="/docs" if settings.APP_ENV != "production" else None,
    redoc_url=None,
)

# Middlewares (order matters — outermost first)
app.add_middleware(LoggingMiddleware)
app.add_middleware(TenantMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(api_router, prefix="/api/v1")

# Exception handlers
register_exception_handlers(app)

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}
```

---

## core/config.py

```python
# app/core/config.py

from pydantic_settings import BaseSettings
from typing import list

class Settings(BaseSettings):
    APP_ENV: str = "development"
    APP_SECRET_KEY: str

    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 20

    REDIS_URL: str = "redis://localhost:6379/0"

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    AWS_BUCKET_NAME: str
    CDN_BASE_URL: str

    SENDGRID_API_KEY: str
    EMAIL_FROM: str

    STRIPE_SECRET_KEY: str
    STRIPE_WEBHOOK_SECRET: str
    STRIPE_PLATFORM_COMMISSION_PERCENT: float = 3.0

    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"

settings = Settings()
```

---

## core/security.py

```python
# app/core/security.py

from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(
        minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload["type"] = "access"
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def create_refresh_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(
        days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS
    )
    payload["type"] = "refresh"
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY,
                          algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        raise ValueError("Invalid token")
```

---

## api/deps.py — Shared Dependencies

```python
# app/api/deps.py

from fastapi import Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db_session
from app.core.security import decode_token
from app.repositories.user_repo import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_db() -> AsyncSession:
    async with get_db_session() as session:
        yield session

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    try:
        payload = decode_token(token)
        user_id = int(payload["sub"])
        if payload.get("type") != "access":
            raise ValueError("Wrong token type")
    except (ValueError, KeyError):
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    user = await UserRepository.get_by_id(db, user_id)
    if not user or not user.is_active or user.is_deleted:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    return user

async def get_current_active_user(current_user = Depends(get_current_user)):
    if not current_user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified")
    return current_user
```

---

## services/booking_service.py

```python
# app/services/booking_service.py

from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.booking_repo import BookingRepository
from app.repositories.room_repo import RoomRepository
from app.schemas.booking import BookingCreate, BookingResponse
from app.tasks.email_tasks import send_booking_confirmation
from app.services.payment_service import PaymentService
import random, string

class BookingService:

    @staticmethod
    def generate_reference() -> str:
        """Generate unique booking reference like SOS-A7B2C."""
        chars = string.ascii_uppercase + string.digits
        suffix = ''.join(random.choices(chars, k=5))
        return f"SOS-{suffix}"

    @staticmethod
    async def create_booking(
        db: AsyncSession,
        tenant_id: int,
        guest_id: int,
        data: BookingCreate
    ) -> BookingResponse:
        # 1. Verify rooms are available
        available = await RoomRepository.check_availability(
            db, tenant_id, data.room_ids,
            data.check_in_date, data.check_out_date
        )
        if not available:
            raise ValueError("One or more rooms are no longer available")

        # 2. Calculate pricing
        nights = (data.check_out_date - data.check_in_date).days
        rooms = await RoomRepository.get_by_ids(db, tenant_id, data.room_ids)
        room_total = sum(r.effective_price for r in rooms) * nights

        addon_total = 0.0  # Calculate based on selected addons

        discount = 0.0
        if data.promo_code:
            discount = await BookingService._apply_promo(db, tenant_id, data.promo_code, room_total)

        # 3. Create booking record
        booking = await BookingRepository.create(db, tenant_id, {
            "hotel_id": data.hotel_id,
            "guest_id": guest_id,
            "reference_number": BookingService.generate_reference(),
            "check_in_date": data.check_in_date,
            "check_out_date": data.check_out_date,
            "nights": nights,
            "num_guests": data.num_guests,
            "status": "pending",
            "room_total": room_total,
            "addon_total": addon_total,
            "discount_amount": discount,
            "tax_amount": (room_total - discount) * 0.10,
            "total_amount": room_total + addon_total - discount + ((room_total - discount) * 0.10),
            "special_requests": data.special_requests,
        })

        # 4. Link rooms to booking
        for room in rooms:
            await BookingRepository.add_room(db, booking.id, room.id, room.effective_price)

        # 5. Send confirmation email async
        send_booking_confirmation.delay(booking.id)

        return BookingResponse.model_validate(booking)
```

---

## Pydantic Schemas Example

```python
# app/schemas/booking.py

from pydantic import BaseModel, Field
from datetime import date
from typing import Optional, List

class BookingCreate(BaseModel):
    hotel_id: int
    room_ids: List[int]
    check_in_date: date
    check_out_date: date
    num_guests: int = Field(ge=1, le=20)
    special_requests: Optional[str] = None
    promo_code: Optional[str] = None
    addon_ids: Optional[List[int]] = []

    class Config:
        json_schema_extra = {
            "example": {
                "hotel_id": 1,
                "room_ids": [5, 6],
                "check_in_date": "2025-12-01",
                "check_out_date": "2025-12-05",
                "num_guests": 2,
            }
        }

class BookingResponse(BaseModel):
    id: int
    reference_number: str
    hotel_id: int
    check_in_date: date
    check_out_date: date
    nights: int
    status: str
    room_total: float
    total_amount: float
    created_at: str

    model_config = {"from_attributes": True}
```

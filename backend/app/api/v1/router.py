from fastapi import APIRouter
from app.api.v1 import (
    auth, super_admin, rooms, staff, 
    bookings, guests, hotels, notifications, tenants, stripe_webhook,
    guest_auth, guest_portal
)

# Create main API router
api_router = APIRouter()

# Include authentication routes
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["Bookings"])
api_router.include_router(rooms.router, prefix="/rooms", tags=["Rooms"])
api_router.include_router(staff.router, prefix="/staff", tags=["Staff"])
api_router.include_router(guests.router, prefix="/guests", tags=["Guests"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(tenants.router, prefix="/tenants", tags=["Tenants"])
api_router.include_router(stripe_webhook.router, prefix="/payments", tags=["Payments"])

# Guest Portal routes
api_router.include_router(guest_auth.router, tags=["Guest Auth"])
api_router.include_router(guest_portal.router, tags=["Guest Portal"])

# TODO: Apply require_feature("analytics") when analytics router is implemented
# TODO: Apply require_feature("promotions") when promotions router is implemented
# TODO: Apply require_feature("reviews") when reviews router is implemented
# TODO: Apply require_feature("theme_branding") when theme/branding router is implemented

# Include platform management and discovery routes
api_router.include_router(super_admin.router, prefix="/super-admin", tags=["Super Admin"])
api_router.include_router(hotels.router, prefix="/hotels", tags=["Hotels Discovery"])

from fastapi import APIRouter
from app.api.v1 import auth, super_admin, rooms
from app.api.v1 import bookings

# Create main API router
api_router = APIRouter()

# Include authentication routes
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["Bookings"])
api_router.include_router(rooms.router, prefix="/rooms", tags=["Rooms"])

# Include platform management routes
api_router.include_router(super_admin.router, prefix="/super-admin", tags=["Super Admin"])

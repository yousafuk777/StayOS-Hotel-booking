from fastapi import APIRouter
from app.api.v1 import auth

# Create main API router
api_router = APIRouter()

# Include authentication routes
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# More routes will be added here as we build out the platform:
# - hotels.py (hotel search and details)
# - bookings.py (booking management)
# - payments.py (payment processing)
# - reviews.py (review system)
# - admin/ (hotel admin endpoints)
# - super-admin/ (platform management)

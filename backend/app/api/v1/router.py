from fastapi import APIRouter
from app.api.v1 import auth, super_admin

# Create main API router
api_router = APIRouter()

# Include authentication routes
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# Include platform management routes
api_router.include_router(super_admin.router, prefix="/super-admin", tags=["Super Admin"])

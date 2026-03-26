from functools import wraps
from fastapi import HTTPException, Depends
from app.api.deps import get_current_active_user

# Role constants
SUPER_ADMIN = "super_admin"
HOTEL_ADMIN = "hotel_admin"
HOTEL_MANAGER = "hotel_manager"
FRONT_DESK = "front_desk"
HOUSEKEEPING = "housekeeping"
GUEST = "guest"


def require_roles(*allowed_roles: str):
    """Dependency factory that checks user has one of the allowed roles."""
    async def _check(current_user=Depends(get_current_active_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Required roles: {list(allowed_roles)}"
            )
        return current_user
    return _check


def require_tenant_match():
    """Ensures the user belongs to the same tenant as the resource."""
    async def _check(
        tenant_id: int,
        current_user=Depends(get_current_active_user)
    ):
        if current_user.role == SUPER_ADMIN:
            return current_user  # Super admin bypasses tenant check
        if current_user.tenant_id != tenant_id:
            raise HTTPException(status_code=403, detail="Cross-tenant access denied")
        return current_user
    return _check


# Named permission checks for clarity
RequireGuest = require_roles(GUEST, HOTEL_ADMIN, SUPER_ADMIN)
RequireHotelAdmin = require_roles(HOTEL_ADMIN, SUPER_ADMIN)
RequireStaff = require_roles(HOTEL_ADMIN, HOTEL_MANAGER, FRONT_DESK)
RequireSuperAdmin = require_roles(SUPER_ADMIN)

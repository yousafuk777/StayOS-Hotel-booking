# backend/app/dependencies/role_guard.py

from fastapi import HTTPException, Depends
from app.config.permissions import can_access, can_write
from app.api.deps import get_current_user

def require_module_access(module: str, require_write: bool = False):
    """
    Dependency factory. Use on any route to enforce role-based access.
    
    Usage:
        @router.delete("/staff/{id}", dependencies=[require_module_access("staff_management", require_write=True)])
        @router.get("/analytics", dependencies=[require_module_access("analytics")])
    """
    async def guard(current_user = Depends(get_current_user)):
        # Ensure role is compared as a string to avoid Enum vs Raw String issues
        role = str(current_user.role.value) if hasattr(current_user.role, 'value') else str(current_user.role)

        # Super admin bypasses all checks
        if role == "super_admin":
            return current_user

        # Guest is blocked from all admin endpoints
        if role == "guest":
            raise HTTPException(
                status_code=403,
                detail="Guests do not have access to the admin dashboard."
            )

        check = can_write(role, module) if require_write else can_access(role, module)

        if not check:
            raise HTTPException(
                status_code=403,
                detail=f"Your role '{role}' does not have {'write' if require_write else 'read'} access to '{module}'."
            )
            
        return current_user

    return guard

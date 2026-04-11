from fastapi import Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db_session
from app.core.security import decode_token
from app.repositories.user_repo import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_db() -> AsyncSession:
    """Dependency for getting async database sessions."""
    async for session in get_db_session():
        yield session


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    """Get current authenticated user from JWT token."""
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


from app.models.user import UserRole

# ... existing code ...

async def get_current_active_user(current_user=Depends(get_current_user)):
    """Get current active and verified user."""
    if not current_user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified")
    return current_user


async def get_current_super_admin(current_user=Depends(get_current_active_user)):
    """Verify that the current user is a super admin with robust string comparison."""
    # Ensure role is compared as a string to avoid Enum vs Raw String issues
    user_role = str(current_user.role.value) if hasattr(current_user.role, 'value') else str(current_user.role)
    
    if user_role != "super_admin":
        raise HTTPException(
            status_code=403, 
            detail="The user does not have enough privileges"
        )
    return current_user


from app.models.tenant import Tenant

async def get_current_tenant(request: Request) -> Tenant:
    """
    Get current tenant from request state (set by TenantMiddleware).
    """
    tenant = getattr(request.state, "tenant", None)
    if not tenant:
        raise HTTPException(
            status_code=400, 
            detail="Tenant context not found. X-Tenant-ID header or subdomain required."
        )
    return tenant

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr
from app.api.deps import get_db, get_current_super_admin
from app.schemas.tenant import TenantCreate, TenantResponse, TenantListResponse
from app.schemas.user import UserCreate, UserUpdate
from app.repositories.tenant_repo import TenantRepository
from app.repositories.user_repo import UserRepository
from app.core.security import verify_password, create_access_token, create_refresh_token, hash_password
from app.models.user import UserRole
from typing import List

router = APIRouter()


# ── Super-Admin Auth ────────────────────────────────────────────────────────

class SuperAdminLoginRequest(BaseModel):
    email: EmailStr
    password: str


class SuperAdminLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/login", response_model=SuperAdminLoginResponse, tags=["Super Admin Auth"])
async def super_admin_login(
    body: SuperAdminLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Super-Admin login. Does NOT require a tenant subdomain.
    Returns a JWT access token to use as: Authorization: Bearer <token>
    """
    # Look up user by email with no tenant_id filter (super-admin has tenant_id=None)
    user = await UserRepository.get_by_email(db, tenant_id=None, email=body.email)
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if user.role != UserRole.super_admin:
        raise HTTPException(status_code=403, detail="Access denied: not a super admin")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "tenant_id": user.tenant_id,
    }
    return {
        "access_token": create_access_token(payload),
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
        },
    }


# ── Tenant Management ───────────────────────────────────────────────────────

@router.post("/tenants", response_model=TenantResponse, status_code=201)
async def create_tenant(
    data: TenantCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_super_admin),
):
    """Onboard a new tenant."""
    existing = await TenantRepository.get_by_slug(db, data.slug)
    if existing:
        raise HTTPException(status_code=400, detail="Subdomain already in use")

    tenant = await TenantRepository.create(db, data.model_dump())
    return tenant


@router.get("/tenants", response_model=TenantListResponse)
async def list_tenants(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_super_admin),
):
    """List all tenants on the platform."""
    tenants = await TenantRepository.get_all(db, skip=skip, limit=limit)
    total = await TenantRepository.get_count(db)
    return {"tenants": tenants, "total": total}


# ── Users ───────────────────────────────────────────────────────────────────

@router.get("/users")
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_super_admin),
):
    """List all users across all tenants."""
    users = await UserRepository.get_all(db, skip=skip, limit=limit)
    total = await UserRepository.get_count(db)
    return {
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "role": u.role,
                "tenant_id": u.tenant_id,
                "is_active": u.is_active,
                "is_verified": u.is_verified,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ],
        "total": total,
    }


@router.post("/users", status_code=201)
async def create_user(
    data: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_super_admin),
):
    """Create a new user globally."""
    existing = await UserRepository.get_by_email(db, tenant_id=data.tenant_id, email=data.email)
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    user_data = data.model_dump()
    user_data["hashed_password"] = hash_password(user_data.pop("password"))
    
    user = await UserRepository.create(db, tenant_id=data.tenant_id, data=user_data)
    return user


@router.patch("/users/{user_id}")
async def update_user(
    user_id: int,
    data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_super_admin),
):
    """Update user details globally."""
    user_data = data.model_dump(exclude_unset=True)
    if "password" in user_data and user_data["password"]:
        user_data["hashed_password"] = hash_password(user_data.pop("password"))
    elif "password" in user_data:
        user_data.pop("password")

    user = await UserRepository.update_global(db, user_id, user_data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/users/{user_id}/toggle-status")
async def toggle_user_status(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_super_admin),
):
    """Toggle user active/inactive status."""
    user = await UserRepository.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated_user = await UserRepository.update_global(db, user_id, {"is_active": not user.is_active})
    return {"is_active": updated_user.is_active}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_super_admin),
):
    """Soft delete a user record."""
    success = await UserRepository.delete_global(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}


# ── Platform Stats ──────────────────────────────────────────────────────────

@router.get("/stats")
async def platform_stats(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_super_admin),
):
    """Return real platform-level counts for the overview dashboard."""
    from sqlalchemy import select, func
    from app.models.user import User, UserRole

    total_tenants = await TenantRepository.get_count(db)
    total_users = await UserRepository.get_count(db)

    # Count by role
    role_counts_result = await db.execute(
        select(User.role, func.count(User.id))
        .where(User.is_deleted == False)
        .group_by(User.role)
    )
    role_counts = {str(role): count for role, count in role_counts_result.all()}

    # Tenant status breakdown
    from app.models.tenant import Tenant
    status_result = await db.execute(
        select(Tenant.status, func.count(Tenant.id))
        .where(Tenant.is_deleted == False)
        .group_by(Tenant.status)
    )
    tenant_status = {str(s): c for s, c in status_result.all()}

    return {
        "total_tenants": total_tenants,
        "total_users": total_users,
        "role_counts": role_counts,
        "tenant_status": tenant_status,
    }

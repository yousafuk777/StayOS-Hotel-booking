from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr
from app.api.deps import get_db, get_current_super_admin
from app.schemas.tenant import TenantCreate, TenantResponse, TenantListResponse, TenantUpdate
from app.schemas.user import UserCreate, UserUpdate
from app.repositories.tenant_repo import TenantRepository
from app.repositories.user_repo import UserRepository
from app.core.security import verify_password, create_access_token, create_refresh_token, hash_password
from app.models.user import UserRole
from app.config.plans import PLAN_CONFIG
from app.schemas.plan import PlanUpgradeRequest
from datetime import datetime
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


# ── Analytics Schemas ────────────────────────────────────────────────────────

class AnalyticsKPI(BaseModel):
    label: str
    value: str
    change: str
    trend: str
    icon: str


class TimeSeriesPoint(BaseModel):
    date: str
    revenue: float
    bookings: int


class RevenueBreakdown(BaseModel):
    category: str
    amount: float
    percentage: int


class TopPerformer(BaseModel):
    rank: int
    hotel: str
    revenue: float
    occupancy: float
    rating: float


class AnalyticsResponse(BaseModel):
    kpis: List[AnalyticsKPI]
    revenue_trend: List[TimeSeriesPoint]
    breakdown: List[RevenueBreakdown]
    performers: List[TopPerformer]


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
            "tenant_name": None,
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


@router.get("/tenants/{tenant_id}", response_model=TenantResponse)
async def get_tenant(
    tenant_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_super_admin),
):
    """Get tenant details."""
    tenant = await TenantRepository.get_by_id(db, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


@router.patch("/tenants/{tenant_id}", response_model=TenantResponse)
async def update_tenant(
    tenant_id: int,
    data: TenantUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_super_admin),
):
    """Update tenant detail."""
    tenant = await TenantRepository.update(db, tenant_id, data.model_dump(exclude_unset=True))
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


@router.delete("/tenants/{tenant_id}")
async def delete_tenant(
    tenant_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_super_admin),
):
    """Soft delete a tenant."""
    success = await TenantRepository.delete(db, tenant_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {"message": "Tenant deleted successfully"}


@router.patch("/tenants/{tenant_id}/plan")
async def upgrade_tenant_plan(
    tenant_id: int,
    payload: PlanUpgradeRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_super_admin),
):
    """
    Manually upgrade/downgrade a tenant's plan (Super-Admin only).
    Currently simulated — updates the DB enum immediately.
    """
    tenant = await TenantRepository.get_by_id(db, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    if payload.plan not in PLAN_CONFIG:
        raise HTTPException(status_code=400, detail="Invalid plan key")
    
    # Update plan directly
    updated_tenant = await TenantRepository.update(
        db, 
        tenant_id, 
        {"plan": payload.plan, "updated_at": datetime.utcnow()}
    )
    
    return {
        "success": True, 
        "tenant_id": tenant_id, 
        "new_plan": payload.plan,
        "tenant_name": updated_tenant.name
    }


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
                "tenant_name": u.tenant.name if u.tenant else None,
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
    """Create a new user globally with auto-verification."""
    # 1. Validation: Non-SuperAdmins MUST have a tenant_id
    if data.role != UserRole.super_admin and data.tenant_id is None:
        raise HTTPException(
            status_code=400, 
            detail=f"Please assigned a Hotel! Tenant ID is required for role: {data.role}"
        )

    existing = await UserRepository.get_by_email(db, tenant_id=data.tenant_id, email=data.email)
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    user_data = data.model_dump()
    user_data["hashed_password"] = hash_password(user_data.pop("password"))
    
    # 2. Auto-verify all users created by Super Admin
    user_data["is_verified"] = True
    
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
    # FIX: Guard against Super Admin assignment through UI/API
    if data.role == UserRole.super_admin:
        raise HTTPException(
            status_code=403,
            detail="Super Admin role cannot be assigned through the UI. This must be done directly at the database level."
        )

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

@router.get("/analytics", response_model=AnalyticsResponse)
async def get_platform_analytics(
    days: int = Query(30, ge=7, le=365),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_super_admin),
):
    """Get comprehensive platform analytics with time-series trends."""
    from app.services.analytics_service import AnalyticsService
    
    summary = await AnalyticsService.get_summary(db, days)
    trends = await AnalyticsService.get_trends(db, days)
    performers = await AnalyticsService.get_top_performers(db)
    
    # Mocking breakdown for now (will be implemented as actual revenue by room category in future)
    breakdown = [
        {"category": "Room Bookings", "amount": sum(t["revenue"] for t in trends) * 0.75, "percentage": 75},
        {"category": "Services", "amount": sum(t["revenue"] for t in trends) * 0.25, "percentage": 25},
    ]

    return {
        "kpis": summary["kpis"],
        "revenue_trend": trends,
        "breakdown": breakdown,
        "performers": performers,
    }


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
